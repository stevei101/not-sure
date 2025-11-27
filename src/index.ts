/**
 * Multi-Model RAG-enabled Cloudflare Worker
 * 
 * Supports:
 * - Cloudflare AI (Llama 2 7B)
 * - Google Vertex AI (Gemini models)
 * 
 * POST /query
 * {
 *   "prompt": "your question",
 *   "model": "cloudflare" | "vertex-ai"
 * }
 */

import { Ai } from "@cloudflare/ai";
import { GoogleGenerativeAI } from "@google/generative-ai";

type AIModel = "cloudflare" | "vertex-ai";

export interface Env {
	AI: Ai;
	RAG_KV: KVNamespace;
	CLOUDFLARE_API_TOKEN?: string;
	ACCOUNT_ID: string;
	AI_GATEWAY_ID: string;
	AI_GATEWAY_URL: string;
	AI_GATEWAY_SKIP_PATH_CONSTRUCTION?: string; // "true" or "false"
	// Gemini API Configuration (via Cloudflare AI Gateway)
	GOOGLE_AI_STUDIO_TOKEN?: string; // Google AI Studio API key (configured in Cloudflare AI Gateway)
	GEMINI_MODEL?: string; // e.g., "gemini-1.5-flash" or "gemini-1.5-pro"
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

	// Prepare headers - API token is optional for Workers AI via Gateway when called from within a Worker
	const headers: Record<string, string> = {
		"Content-Type": "application/json"
	};
	
	// Add Authorization header only if token is provided
	if (env.CLOUDFLARE_API_TOKEN) {
		headers["Authorization"] = `Bearer ${env.CLOUDFLARE_API_TOKEN}`;
	}

	const response = await fetch(gatewayEndpoint, {
		method: "POST",
		headers,
		body: JSON.stringify({ messages })
	});

	if (!response.ok) {
		let errorText: string;
		try {
			errorText = await response.text();
		} catch {
			errorText = `HTTP ${response.status} ${response.statusText}`;
		}
		throw new Error(`Cloudflare AI error (${response.status}): ${errorText}`);
	}

	const data: any = await response.json();
	
	// Extract response from various possible formats
	if (data.result?.response) {
		return data.result.response;
	}
	if (data.response) {
		return typeof data.response === "string" ? data.response : data.response.text || JSON.stringify(data.response);
	}
	if (data.text) {
		return data.text;
	}
	
	throw new Error("Unable to extract response from Cloudflare AI: unexpected response format");
}

/** Call Google Gemini via Cloudflare AI Gateway using native SDK */
async function callVertexAI(prompt: string, env: Env): Promise<string> {
	if (!env.GOOGLE_AI_STUDIO_TOKEN) {
		throw new Error("Gemini API configuration missing: GOOGLE_AI_STUDIO_TOKEN must be set");
	}

	const modelName = env.GEMINI_MODEL || "gemini-1.5-flash";
	
	// Initialize Google Generative AI SDK with custom baseUrl pointing to Cloudflare AI Gateway
	// The gateway endpoint format: /v1/{account_id}/default/google-ai-studio
	const gatewayBaseUrl = `${env.AI_GATEWAY_URL}/${env.ACCOUNT_ID}/default/google-ai-studio`;
	
	const genAI = new GoogleGenerativeAI(env.GOOGLE_AI_STUDIO_TOKEN);
	const model = genAI.getGenerativeModel(
		{ model: modelName },
		{ baseUrl: gatewayBaseUrl }
	);

	try {
		const result = await model.generateContent([prompt]);
		const response = await result.response;
		return response.text();
	} catch (error: any) {
		throw new Error(`Gemini API error: ${error.message || error.toString()}`);
	}
}

/** Route to the appropriate AI model */
async function callAI(prompt: string, model: AIModel, env: Env): Promise<string> {
	switch (model) {
		case "cloudflare":
			return callCloudflareAI(prompt, env);
		case "vertex-ai":
			return callVertexAI(prompt, env);
		default:
			throw new Error(`Unknown model: ${model}`);
	}
}

export default {
	async fetch(request: Request, env: Env) {
		const url = new URL(request.url);

		// Health-check endpoint
		if (request.method === "GET" && url.pathname === "/status") {
			const models = ["cloudflare"];
			// Add vertex-ai if configured
			if (env.GOOGLE_AI_STUDIO_TOKEN) {
				models.push("vertex-ai");
			}

			return new Response(
				JSON.stringify({
					ok: true,
					version: "2.2.0",
					timestamp: new Date().toISOString(),
					models,
					gatewayId: env.AI_GATEWAY_ID,
					gatewayUrl: getGatewayUrl("test", env), // return constructed URL for verification
					vertexAI: env.GOOGLE_AI_STUDIO_TOKEN ? {
						model: env.GEMINI_MODEL || "gemini-1.5-flash",
						configured: true
					} : { configured: false }
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

		// Validate model - build list dynamically based on configuration
		const validModels: AIModel[] = ["cloudflare"];
		if (env.GOOGLE_AI_STUDIO_TOKEN) {
			validModels.push("vertex-ai");
		}
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
			const errorMessage = error?.message || error?.toString() || "Internal server error";
			console.error("Error in /query endpoint:", errorMessage, error);
			return new Response(
				JSON.stringify({ error: errorMessage, model }),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}
	},
} satisfies ExportedHandler<Env>;
