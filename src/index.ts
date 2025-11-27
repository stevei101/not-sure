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
 *   "model": "cloudflare" | "gemini"
 * }
 */

import { Ai } from "@cloudflare/ai";

type AIModel = "cloudflare" | "gemini";

export interface Env {
	AI: Ai;
	RAG_KV: KVNamespace;
	CLOUDFLARE_API_TOKEN?: string;
	ACCOUNT_ID: string;
	AI_GATEWAY_ID: string;
	AI_GATEWAY_URL: string;
	AI_GATEWAY_SKIP_PATH_CONSTRUCTION?: string; // "true" or "false"
	// Vertex AI configuration
	GCP_PROJECT_ID?: string;
	VERTEX_AI_LOCATION?: string;
	VERTEX_AI_MODEL?: string;
	VERTEX_AI_SERVICE_ACCOUNT_JSON?: string; // Service account JSON key (secret)
	ASSETS: Fetcher;
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

/** Service account JSON structure */
interface ServiceAccount {
	private_key: string;
	client_email: string;
}

/** Google OAuth2 token response structure */
interface GoogleTokenResponse {
	access_token: string;
	token_type?: string;
	expires_in?: number;
}

/** Vertex AI response structure */
interface VertexAIResponse {
	candidates?: Array<{
		content?: {
			parts?: Array<{
				text: string;
			}>;
		};
	}>;
}

/** Convert PEM private key to ArrayBuffer for Web Crypto API */
function pemToArrayBuffer(pem: string): ArrayBuffer {
	const base64 = pem
		.replace(/-----BEGIN PRIVATE KEY-----/, "")
		.replace(/-----END PRIVATE KEY-----/, "")
		.replace(/\s/g, "");
	const binaryString = atob(base64);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes.buffer;
}

/**
 * Generate Google OAuth2 access token from service account JSON
 * 
 * Implements JWT signing using Web Crypto API for Google OAuth2 authentication.
 * Tokens are cached in KV to reduce authentication overhead (tokens valid for ~1 hour).
 * 
 * @param serviceAccountJson - Service account JSON key string
 * @param env - Worker environment with KV access for token caching
 * @returns OAuth2 access token for Google APIs
 * 
 * TODO: Add unit tests for JWT signing and error handling branches
 */
async function getGoogleAccessToken(serviceAccountJson: string, env: Env): Promise<string> {
	// Check cache first (tokens are valid for ~1 hour)
	const cacheKey = "vertex-ai-access-token";
	const cachedToken = await env.RAG_KV.get(cacheKey);
	if (cachedToken) {
		return cachedToken;
	}

	// Parse service account JSON
	let serviceAccount: ServiceAccount;
	try {
		serviceAccount = JSON.parse(serviceAccountJson);
	} catch {
		throw new Error("Invalid service account JSON format");
	}

	if (!serviceAccount.private_key || !serviceAccount.client_email) {
		throw new Error("Service account JSON missing required fields (private_key, client_email)");
	}

	// Create JWT for Google OAuth2 token exchange
	const now = Math.floor(Date.now() / 1000);
	const TOKEN_LIFETIME_SECONDS = 3600; // 1 hour, max for Google OAuth2 JWTs
	const jwtHeader = { alg: "RS256", typ: "JWT" };
	const jwtPayload = {
		iss: serviceAccount.client_email,
		sub: serviceAccount.client_email,
		aud: "https://oauth2.googleapis.com/token",
		exp: now + TOKEN_LIFETIME_SECONDS,
		iat: now,
		scope: "https://www.googleapis.com/auth/cloud-platform",
	};

	// Base64URL encode header and payload
	const base64UrlEncode = (str: string): string => {
		return btoa(str)
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=/g, "");
	};

	const encodedHeader = base64UrlEncode(JSON.stringify(jwtHeader));
	const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));
	const signatureInput = `${encodedHeader}.${encodedPayload}`;

	// Import private key and sign JWT
	const privateKeyPem = serviceAccount.private_key.replace(/\\n/g, "\n");
	const privateKeyBuffer = pemToArrayBuffer(privateKeyPem);

	// Import the private key in PKCS#8 format
	const cryptoKey = await crypto.subtle.importKey(
		"pkcs8",
		privateKeyBuffer,
		{
			name: "RSASSA-PKCS1-v1_5",
			hash: "SHA-256",
		},
		false,
		["sign"]
	);

	// Sign the JWT
	const signature = await crypto.subtle.sign(
		{ name: "RSASSA-PKCS1-v1_5" },
		cryptoKey,
		new TextEncoder().encode(signatureInput)
	);

	// Base64URL encode the signature
	const signatureBase64 = base64UrlEncode(
		String.fromCharCode(...new Uint8Array(signature))
	);

	const jwt = `${signatureInput}.${signatureBase64}`;

	// Exchange JWT for access token
	const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
			assertion: jwt,
		}),
	});

	if (!tokenResponse.ok) {
		const errorText = await tokenResponse.text();
		throw new Error(`Failed to get access token (${tokenResponse.status}): ${errorText}`);
	}

	const tokenData: GoogleTokenResponse = await tokenResponse.json();
	if (!tokenData.access_token) {
		throw new Error("No access token in response");
	}

	// Cache the token (use expires_in if provided, otherwise default to 50 minutes to be safe)
	const cacheTtl = tokenData.expires_in ? Math.max(tokenData.expires_in - 600, 3000) : 3000; // Subtract 10 min buffer, min 50 min
	await env.RAG_KV.put(cacheKey, tokenData.access_token, { expirationTtl: cacheTtl });

	return tokenData.access_token;
}

/** Call Google Vertex AI (Gemini) */
async function callGeminiAI(prompt: string, env: Env): Promise<string> {
	// Validate required Vertex AI configuration
	if (!env.GCP_PROJECT_ID || !env.VERTEX_AI_LOCATION || !env.VERTEX_AI_MODEL) {
		throw new Error("Vertex AI configuration missing. Required: GCP_PROJECT_ID, VERTEX_AI_LOCATION, VERTEX_AI_MODEL");
	}

	if (!env.VERTEX_AI_SERVICE_ACCOUNT_JSON) {
		throw new Error("Vertex AI service account JSON not configured. Set VERTEX_AI_SERVICE_ACCOUNT_JSON secret.");
	}

	const projectId = env.GCP_PROJECT_ID;
	const location = env.VERTEX_AI_LOCATION;
	const model = env.VERTEX_AI_MODEL;

	// Vertex AI REST API endpoint for Gemini models
	// Note: Vertex AI calls go directly to Google's API (not through Cloudflare AI Gateway)
	// as Cloudflare AI Gateway does not currently support Vertex AI/Gemini models.
	// This is an architectural deviation from the Cloudflare AI routing pattern.
	const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

	// Format request for Vertex AI
	const requestBody = {
		contents: [
			{
				parts: [
					{
						text: prompt,
					},
				],
			},
		],
	};

	// Get access token using service account (JWT signing implemented, with caching)
	const accessToken = await getGoogleAccessToken(env.VERTEX_AI_SERVICE_ACCOUNT_JSON, env);

	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(requestBody),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Vertex AI error (${response.status}): ${errorText}`);
	}

	const data: VertexAIResponse = await response.json();

	// Extract text from Vertex AI response
	// Handle multiple candidates and parts for robustness
	if (!data.candidates || data.candidates.length === 0) {
		throw new Error("No candidates in Vertex AI response");
	}

	// Try first candidate
	const firstCandidate = data.candidates[0];
	if (!firstCandidate?.content?.parts || firstCandidate.content.parts.length === 0) {
		throw new Error("No content parts in Vertex AI response candidate");
	}

	// Concatenate all text parts (in case of multi-part responses)
	const textParts = firstCandidate.content.parts
		.map((part) => part.text)
		.filter((text): text is string => typeof text === "string" && text.length > 0);

	if (textParts.length === 0) {
		throw new Error("No text content in Vertex AI response");
	}

	// Join multiple parts if present, otherwise return single part
	return textParts.join("\n\n");
}

/** Route to the appropriate AI model */
async function callAI(prompt: string, model: AIModel, env: Env): Promise<string> {
	switch (model) {
		case "cloudflare":
			return callCloudflareAI(prompt, env);
		case "gemini":
			return callGeminiAI(prompt, env);
		default:
			throw new Error(`Unknown model: ${model}`);
	}
}

export default {
	async fetch(request: Request, env: Env) {
		const url = new URL(request.url);

		// Handle CORS preflight
		if (request.method === "OPTIONS") {
			return new Response(null, {
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type",
				},
			});
		}

		// CORS headers for all responses
		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		};

		// Health-check endpoint
		if (request.method === "GET" && url.pathname === "/status") {
			const models: AIModel[] = ["cloudflare"];
			// Add gemini if Vertex AI is configured
			if (env.GCP_PROJECT_ID && env.VERTEX_AI_LOCATION && env.VERTEX_AI_MODEL) {
				models.push("gemini");
			}

			return new Response(
				JSON.stringify({
					ok: true,
					version: "2.1.0",
					timestamp: new Date().toISOString(),
					models,
					gatewayId: env.AI_GATEWAY_ID,
					gatewayUrl: getGatewayUrl("test", env), // return constructed URL for verification
					vertexAiConfigured: !!(env.GCP_PROJECT_ID && env.VERTEX_AI_LOCATION && env.VERTEX_AI_MODEL),

				}),
				{ headers: { "Content-Type": "application/json", ...corsHeaders } }
			);
		}

		// RAG query endpoint
		if (url.pathname === "/query") {
			if (request.method !== "POST") {
				return new Response("Only POST /query is supported", { 
					status: 404, 
					headers: corsHeaders 
				});
			}
			let body: any;
			try {
				body = await request.json();
			} catch {
				return new Response("Invalid JSON body", { status: 400, headers: corsHeaders });
			}

			const prompt: string = body.prompt;
			const model: AIModel = body.model || "cloudflare";

			if (!prompt) {
				return new Response('Missing "prompt" field', { status: 400, headers: corsHeaders });
			}

			// Validate model
			const validModels: AIModel[] = ["cloudflare", "gemini"];
			if (!validModels.includes(model)) {
				return new Response(
					JSON.stringify({ error: `Invalid model. Choose from: ${validModels.join(", ")}` }),
					{ status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
				);
			}

			try {
				// 1️⃣ Try cached context from KV (cache per model+prompt combination)
				const key = await hashPrompt(prompt, model);
				const cached = await env.RAG_KV.get(key);

				// If cached, return immediately
				if (cached) {
					return new Response(JSON.stringify({ answer: cached, cached: true, model }), {
						headers: { "Content-Type": "application/json", ...corsHeaders },
					});
				}

				// 2️⃣ Call the selected AI model
				const answer = await callAI(prompt, model, env);

				//️ 3️⃣ Cache the answer for future identical prompts (1‑week TTL)
				// Only cache non-empty answers
				if (answer && answer.trim().length > 0) {
					await env.RAG_KV.put(key, answer, { expirationTtl: 60 * 60 * 24 * 7 });
				}

				return new Response(JSON.stringify({ answer, cached: false, model }), {
					headers: { "Content-Type": "application/json", ...corsHeaders },
				});
			} catch (error: any) {
				return new Response(
					JSON.stringify({ error: error.message || "Internal server error", model }),
					{ status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
				);
			}
		}

		// For static assets (React app), delegate to ASSETS fetcher
		// This will serve files from the dist directory
		return env.ASSETS.fetch(request);
	},
} satisfies ExportedHandler<Env>;
