/**
 * Multi-Model RAG-enabled Cloudflare Worker
 * 
 * Supports:
 * - Cloudflare AI (Llama 2 7B)
 * - OpenAI (GPT-4o-mini, GPT-4)
 * - Google Gemini (Pro, Flash)
 * 
 * POST /query
 * {
 *   "prompt": "your question",
 *   "model": "cloudflare" | "openai" | "gemini-pro" | "gemini-flash"
 * }
 */

import { Ai } from "@cloudflare/ai";

type AIModel = "cloudflare" | "openai" | "gemini-pro" | "gemini-flash";

export interface Env {
	AI: Ai;
	RAG_KV: KVNamespace;
	OPENAI_API_KEY?: string;
	GEMINI_API_KEY?: string;
	CLOUDFLARE_API_TOKEN?: string;
	ACCOUNT_ID: string;
	AI_GATEWAY_ID: string;
	AI_GATEWAY_URL: string;
	AI_GATEWAY_SKIP_PATH_CONSTRUCTION?: string; // "true" or "false"
}

/** Helper: SHA‑256 hash of a string, hex‑encoded */
async function hashPrompt(prompt: string, model: string): Promise<string> {
	const digest = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(`${model}:${prompt}`)
	);
	return Array.from(new Uint8Array(digest))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

/** Helper: Construct Gateway URL */
function getGatewayUrl(provider: string, env: Env): string {
	// If the user has a custom domain that already includes the account/gateway mapping,
	// they can set AI_GATEWAY_SKIP_PATH_CONSTRUCTION to "true".
	if (env.AI_GATEWAY_SKIP_PATH_CONSTRUCTION === "true") {
		return `${env.AI_GATEWAY_URL}/${provider}`;
	}
	return `${env.AI_GATEWAY_URL}/${env.ACCOUNT_ID}/${env.AI_GATEWAY_ID}/${provider}`;
}

/** Call Cloudflare AI */
async function callCloudflareAI(prompt: string, env: Env): Promise<string> {
	const messages = [
		{ role: "system", content: "You are a helpful AI assistant." },
		{ role: "user", content: prompt },
	];

	// Using REST API via Gateway as per requirements
	const gatewayEndpoint = `${getGatewayUrl("workers-ai", env)}/@cf/meta/llama-2-7b-chat-fp16`;

	const response = await fetch(gatewayEndpoint, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ messages })
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Cloudflare AI error (${response.status}): ${errorText}`);
	}

	const data: any = await response.json();
	return data.result?.response ?? data.response ?? "";
}

/** Call OpenAI API */
async function callOpenAI(prompt: string, env: Env): Promise<string> {
	if (!env.OPENAI_API_KEY) {
		throw new Error("OpenAI API key not configured");
	}

	// OpenAI via Gateway
	const gatewayUrl = getGatewayUrl("openai", env);
	const url = `${gatewayUrl}/chat/completions`;

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${env.OPENAI_API_KEY}`,
		},
		body: JSON.stringify({
			model: "gpt-4o-mini",
			messages: [
				{ role: "system", content: "You are a helpful AI assistant." },
				{ role: "user", content: prompt },
			],
		}),
	});

	if (!response.ok) {
		throw new Error(`OpenAI API error: ${response.statusText}`);
	}

	const data: any = await response.json();
	return data.choices?.[0]?.message?.content ?? "";
}

/** Call Google Gemini API */
async function callGemini(prompt: string, model: "gemini-pro" | "gemini-flash", env: Env): Promise<string> {
	if (!env.GEMINI_API_KEY) {
		throw new Error("Gemini API key not configured");
	}

	const modelName = model === "gemini-pro" ? "gemini-1.5-pro-latest" : "gemini-1.5-flash-latest";

	// Use v1 endpoint (not v1beta) for API key authentication
	const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${env.GEMINI_API_KEY}`;

	const response = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			contents: [{
				parts: [{ text: prompt }]
			}],
		}),
	});

	if (!response.ok) {
		const errorText = await response.text();
		// Provide helpful error message
		if (response.status === 401 || response.status === 403) {
			throw new Error(
				`Gemini API authentication failed. ` +
				`Please ensure you're using an API key from https://aistudio.google.com/app/apikey ` +
				`(not a service account key). Error: ${errorText}`
			);
		}
		throw new Error(`Gemini API error (${response.status}): ${errorText}`);
	}

	const data: any = await response.json();
	return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

/** Route to the appropriate AI model */
async function callAI(prompt: string, model: AIModel, env: Env): Promise<string> {
	switch (model) {
		case "cloudflare":
			return callCloudflareAI(prompt, env);
		case "openai":
			return callOpenAI(prompt, env);
		case "gemini-pro":
			return callGemini(prompt, "gemini-pro", env);
		case "gemini-flash":
			return callGemini(prompt, "gemini-flash", env);
		default:
			throw new Error(`Unknown model: ${model}`);
	}
}

export default {
	async fetch(request: Request, env: Env) {
		const url = new URL(request.url);

		// Health-check endpoint
		if (request.method === "GET" && url.pathname === "/status") {
			return new Response(
				JSON.stringify({
					ok: true,
					version: "2.0.0",
					timestamp: new Date().toISOString(),
					models: ["cloudflare", "openai", "gemini-pro", "gemini-flash"],
					gatewayId: env.AI_GATEWAY_ID,
					gatewayUrl: getGatewayUrl("test", env) // return constructed URL for verification
				}),
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
		const model: AIModel = body.model || "cloudflare";

		if (!prompt) {
			return new Response('Missing "prompt" field', { status: 400 });
		}

		// Validate model
		const validModels: AIModel[] = ["cloudflare", "openai", "gemini-pro", "gemini-flash"];
		if (!validModels.includes(model)) {
			return new Response(
				JSON.stringify({ error: `Invalid model. Choose from: ${validModels.join(", ")}` }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		try {
			// 1️⃣ Try cached context from KV (cache per model+prompt combination)
			const key = await hashPrompt(prompt, model);
			const cached = await env.RAG_KV.get(key);

			// If cached, return immediately
			if (cached) {
				return new Response(JSON.stringify({ answer: cached, cached: true, model }), {
					headers: { "Content-Type": "application/json" },
				});
			}

			// 2️⃣ Call the selected AI model
			const answer = await callAI(prompt, model, env);

			//️ 3️⃣ Cache the answer for future identical prompts (1‑week TTL)
			await env.RAG_KV.put(key, answer, { expirationTtl: 60 * 60 * 24 * 7 });

			return new Response(JSON.stringify({ answer, cached: false, model }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (error: any) {
			return new Response(
				JSON.stringify({ error: error.message || "Internal server error", model }),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}
	},
} satisfies ExportedHandler<Env>;
