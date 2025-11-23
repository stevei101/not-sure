/**
 * RAG-enabled Cloudflare Worker.
 *
 * POST /query { "prompt": "your question" }
 *   • Looks up a cached context in KV (key = SHA‑256 of prompt).
 *   • Calls the Cloudflare AI model @cf/meta/llama-2-7b-chat-fp16.
 *   • Returns the model's answer and stores it for future identical prompts.
 */

import { Ai } from "@cloudflare/ai";

export interface Env {
	AI: Ai;
	RAG_KV: KVNamespace;
}

/** Helper: SHA‑256 hash of a string, hex‑encoded */
async function hashPrompt(prompt: string): Promise<string> {
	const digest = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(prompt)
	);
	return Array.from(new Uint8Array(digest))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

export default {
	async fetch(request: Request, env: Env) {
		const url = new URL(request.url);

		// Health-check endpoint
		if (request.method === "GET" && url.pathname === "/status") {
			return new Response(
				JSON.stringify({ ok: true, version: "1.0.0", timestamp: new Date().toISOString() }),
				{ headers: { "Content-Type": "application/json" } }
			);
		}

		// RAG query endpoint
		if (request.method !== "POST" || url.pathname !== "/query") {
			return new Response("Only POST /query is supported", { status: 404 });
		}

		let body: any;
		try {
			body = await request.json();
		} catch {
			return new Response("Invalid JSON body", { status: 400 });
		}
		const prompt: string = body.prompt;
		if (!prompt) {
			return new Response('Missing "prompt" field', { status: 400 });
		}

		try {
			// 1️⃣ Try cached context from KV
			const key = await hashPrompt(prompt);
			const cached = await env.RAG_KV.get(key);

			// If cached, return immediately
			if (cached) {
				return new Response(JSON.stringify({ answer: cached, cached: true }), {
					headers: { "Content-Type": "application/json" },
				});
			}

			// 2️⃣ Build messages for the model
			const messages = [
				{ role: "system", content: "You are a helpful AI assistant." },
				{ role: "user", content: prompt },
			];

			// 3️⃣ Call the AI model
			const result = await env.AI.run("@cf/meta/llama-2-7b-chat-fp16", { messages });
			const answer = (result as any)?.response ?? "";

			// 4️⃣ Cache the answer for future identical prompts (1‑week TTL)
			await env.RAG_KV.put(key, answer, { expirationTtl: 60 * 60 * 24 * 7 });

			return new Response(JSON.stringify({ answer, cached: false }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (error: any) {
			return new Response(
				JSON.stringify({ error: error.message || "Internal server error" }),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}
	},
} satisfies ExportedHandler<Env>;
