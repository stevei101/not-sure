/**
 * Multi-Model RAG-enabled Cloudflare Worker
 * 
 * Supports:
 * - Google AI Studio (Gemini Flash) via AI Gateway
 * - Google Vertex AI (Gemini models) - direct API
 * 
 * POST /query
 * {
 *   "prompt": "your question",
 *   "model": "cloudflare" | "gemini"
 * }
 */

import { Ai } from "@cloudflare/ai";

type AIModel = "cloudflare" | "gemini";

/** Structured error codes for better error differentiation */
export type ErrorCode = 
	| "auth_error"           // Authentication/OAuth2 errors
	| "config_missing"       // Missing required configuration
	| "provider_error"       // AI provider API errors
	| "invalid_request"      // Invalid request format
	| "internal_error";      // Internal server errors

/** Structured error response */
export interface ErrorResponse {
	error: string;
	code: ErrorCode;
	model?: string;
	details?: unknown;
}

export interface Env {
	AI: Ai;
	RAG_KV: KVNamespace;
	CLOUDFLARE_API_TOKEN?: string; // Cloudflare API token (from CF_API_TOKEN GitHub secret)
	AI_GATEWAY_AUTH_TOKEN?: string; // Gateway-specific authentication token (created in dashboard) - prioritized if set
	GEMINI_API_KEY?: string; // Google AI Studio/Gemini API key for provider authentication (from GEMINI_API_KEY GitHub secret, optional if configured in gateway)
	API_KEY?: string; // API key for authenticating requests to /query endpoint (set as Worker secret)
	ACCOUNT_ID: string;
	AI_GATEWAY_ID: string; // Gateway ID (for provider-specific paths)
	AI_GATEWAY_NAME?: string; // Gateway name (for /compat endpoint) - defaults to "not-sure-ai-gateway"
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

/** Helper: Construct Gateway URL (Provider-Specific Path) */
function getGatewayUrl(provider: string, env: Env): string {
	// If the user has a custom domain that already includes the account/gateway mapping,
	// they can set AI_GATEWAY_SKIP_PATH_CONSTRUCTION to "true".
	if (env.AI_GATEWAY_SKIP_PATH_CONSTRUCTION === "true") {
		return `${env.AI_GATEWAY_URL}/${provider}`;
	}

	return `${env.AI_GATEWAY_URL}/${env.ACCOUNT_ID}/${env.AI_GATEWAY_ID}/${provider}`;
}

/** Helper: Construct Gateway Compat Endpoint URL (OpenAI-Compatible) */
function getGatewayCompatUrl(env: Env): string {
	const gatewayName = env.AI_GATEWAY_NAME || "not-sure-ai-gateway";
	return `${env.AI_GATEWAY_URL}/${env.ACCOUNT_ID}/${gatewayName}/compat`;
}

/** Call Cloudflare AI (via Gateway) */
async function callCloudflareAI(prompt: string, env: Env, modelName?: string): Promise<string> {
	const messages = [
		{ role: "system", content: "You are a helpful AI assistant." },
		{ role: "user", content: prompt },
	];

	// Use OpenAI-compatible /compat endpoint (simpler, uses gateway name)
	const gatewayEndpoint = `${getGatewayCompatUrl(env)}/chat/completions`;

	// Build headers for gateway request
	// Gateway auth header is optional:
	// - If authentication is ENABLED: Include 'cf-aig-authorization' header with token
	// - If authentication is DISABLED: Header not required (can work without it)
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	// Add gateway auth header only if token is available (optional when auth disabled)
	// Priority: AI_GATEWAY_AUTH_TOKEN (gateway-specific) → CLOUDFLARE_API_TOKEN (general API token)
	const gatewayAuthToken = env.AI_GATEWAY_AUTH_TOKEN || env.CLOUDFLARE_API_TOKEN;
	if (gatewayAuthToken) {
		headers["cf-aig-authorization"] = `Bearer ${gatewayAuthToken}`;
	}

	// Add provider Authorization header for Google AI Studio (if API key provided)
	// Note: If provider auth is configured in gateway dashboard, this header may not be needed
	// GEMINI_API_KEY is the same as Google AI Studio API key
	if (env.GEMINI_API_KEY) {
		headers["Authorization"] = `Bearer ${env.GEMINI_API_KEY}`;
	}

	// Determine model to use: provided model name, or default to google-ai-studio/gemini-flash-latest
	// Supported formats:
	// - google-ai-studio/gemini-flash-latest (Google AI Studio)
	// - workers-ai/@cf/meta/llama-2-7b-chat-fp16 (Workers AI)
	// - Any other gateway-supported model identifier
	const model = modelName || "google-ai-studio/gemini-flash-latest";

	// For gateway compat endpoint, use OpenAI-compatible format
	const requestBody = {
		model: model,
		messages: messages,
	};

	const response = await fetch(gatewayEndpoint, {
		method: "POST",
		headers,
		body: JSON.stringify(requestBody)
	});

	if (!response.ok) {
		const errorText = await response.text();
		
		// Check for error 2001 (Gateway configuration required)
		try {
			const errorData = JSON.parse(errorText);
			if (errorData.error && Array.isArray(errorData.error)) {
				const gatewayError = errorData.error.find((e: any) => e.code === 2001);
				if (gatewayError) {
					// Security: Don't expose account ID in error message
					const error = new Error(
						`AI Gateway configuration required (error 2001): ${gatewayError.message}. ` +
						`Please check the gateway configuration in the Cloudflare dashboard.`
					);
					(error as any).code = "config_missing" as ErrorCode;
					// Security: Don't include sensitive details in error response
					(error as any).details = {
						gatewayError: { code: gatewayError.code, message: gatewayError.message },
						// Removed: helpUrl with account ID, sensitive hints
					};
					throw error;
				}
			}
		} catch {
			// If error parsing fails, continue with generic error handling
		}
		
		const error = new Error(`Cloudflare AI error (${response.status}): ${errorText}`);
		(error as any).code = "provider_error" as ErrorCode;
		(error as any).details = errorText;
		throw error;
	}

	const data: any = await response.json();
	
	// Handle OpenAI-compatible response format (from /compat endpoint)
	// Response format: { choices: [{ message: { content: "..." } }] }
	if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
		return data.choices[0].message.content;
	}
	
	// Fallback to original format (provider-specific endpoint)
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
 * Note: We use KV storage for token caching instead of in-memory Maps because
 * Cloudflare Workers are stateless - each request runs in isolation. KV provides
 * persistent caching across requests, which is essential for OAuth2 token reuse.
 * 
 * @param serviceAccountJson - Service account JSON key string
 * @param env - Worker environment with KV access for token caching
 * @returns OAuth2 access token for Google APIs
 * 
 * TODO: Add unit tests for JWT signing and error handling branches
 */
async function getGoogleAccessToken(serviceAccountJson: string, env: Env): Promise<string> {
	// Check KV cache first (tokens are valid for ~1 hour)
	// KV is used instead of in-memory cache because Cloudflare Workers are stateless
	const cacheKey = "vertex-ai-access-token";
	const cachedToken = await env.RAG_KV.get(cacheKey);
	if (cachedToken) {
		return cachedToken;
	}

	// Parse service account JSON
	let serviceAccount: ServiceAccount;
	try {
		serviceAccount = JSON.parse(serviceAccountJson);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "unknown error";
		throw new Error(`Invalid service account JSON format: ${errorMessage}`);
	}

	if (!serviceAccount.private_key || !serviceAccount.client_email) {
		const missingFields = [
			!serviceAccount.private_key && "private_key",
			!serviceAccount.client_email && "client_email",
		].filter(Boolean);
		throw new Error(`Service account JSON missing required fields: ${missingFields.join(", ")}`);
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
		const error = new Error(`Failed to get access token (${tokenResponse.status}): ${errorText}`);
		(error as any).code = "auth_error" as ErrorCode;
		throw error;
	}

	const tokenData: GoogleTokenResponse = await tokenResponse.json();
	if (!tokenData.access_token) {
		const error = new Error("No access token in response");
		(error as any).code = "auth_error" as ErrorCode;
		throw error;
	}

	// Cache the token (use expires_in if provided, otherwise default to 50 minutes to be safe)
	const cacheTtl = tokenData.expires_in ? Math.max(tokenData.expires_in - 600, 3000) : 3000; // Subtract 10 min buffer, min 50 min
	await env.RAG_KV.put(cacheKey, tokenData.access_token, { expirationTtl: cacheTtl });

	return tokenData.access_token;
}

/** Call Google Vertex AI (Gemini) */
async function callGeminiAI(prompt: string, env: Env, modelName?: string): Promise<string> {
	// Validate required Vertex AI configuration
	const projectId = env.GCP_PROJECT_ID;
	const location = env.VERTEX_AI_LOCATION;
	
	if (!projectId || !location) {
		const missing = [
			!projectId && "GCP_PROJECT_ID",
			!location && "VERTEX_AI_LOCATION",
		].filter(Boolean);
		const error = new Error(`Vertex AI configuration missing. Required: ${missing.join(", ")}`);
		(error as any).code = "config_missing" as ErrorCode;
		throw error;
	}

	if (!env.VERTEX_AI_SERVICE_ACCOUNT_JSON) {
		const error = new Error("Vertex AI service account JSON not configured. Set VERTEX_AI_SERVICE_ACCOUNT_JSON secret.");
		(error as any).code = "config_missing" as ErrorCode;
		throw error;
	}

	// Use provided model name, or fall back to configured model, or default
	const model = modelName || env.VERTEX_AI_MODEL || "gemini-1.5-flash";

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
		const error = new Error(`Vertex AI error (${response.status}): ${errorText}`);
		(error as any).code = "provider_error" as ErrorCode;
		throw error;
	}

	const data: VertexAIResponse = await response.json();

	// Extract text from Vertex AI response
	// Handle multiple candidates and parts for robustness
	if (!data.candidates || data.candidates.length === 0) {
		const error = new Error(`No candidates in Vertex AI response. Response structure: ${JSON.stringify(data)}`);
		(error as any).code = "provider_error" as ErrorCode;
		(error as any).details = data;
		throw error;
	}

	// Try first candidate
	const firstCandidate = data.candidates[0];
	if (!firstCandidate?.content?.parts || firstCandidate.content.parts.length === 0) {
		const error = new Error(`No content parts in Vertex AI response candidate. Response structure: ${JSON.stringify(data)}`);
		(error as any).code = "provider_error" as ErrorCode;
		(error as any).details = data;
		throw error;
	}

	// Concatenate all text parts (in case of multi-part responses)
	const textParts = firstCandidate.content.parts
		.map((part) => part.text)
		.filter((text): text is string => typeof text === "string" && text.length > 0);

	if (textParts.length === 0) {
		const error = new Error(`No text content in Vertex AI response. Response structure: ${JSON.stringify(data)}`);
		(error as any).code = "provider_error" as ErrorCode;
		(error as any).details = data;
		throw error;
	}

	// Join multiple parts if present, otherwise return single part
	return textParts.join("\n\n");
}

/** Route to the appropriate AI model */
async function callAI(prompt: string, model: AIModel, env: Env, modelName?: string): Promise<string> {
	switch (model) {
		case "cloudflare":
			return callCloudflareAI(prompt, env, modelName);
		case "gemini":
			return callGeminiAI(prompt, env, modelName);
		default:
			const error = new Error(`Unknown model: ${model}`);
			(error as any).code = "invalid_request" as ErrorCode;
			throw error;
	}
}

/** Helper: Get client IP address from request (anonymized for privacy) */
function getClientIP(request: Request): string {
	// Cloudflare provides IP in CF-Connecting-IP header
	const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "unknown";
	// Anonymize last octet for privacy (e.g., 192.168.1.123 -> 192.168.1.0)
	const parts = ip.split(".");
	if (parts.length === 4) {
		parts[3] = "0";
		return parts.join(".");
	}
	return ip;
}

/** Helper: Build CORS headers based on request origin */
function getCorsHeaders(request: Request): Record<string, string> {
	// Allowed origins for CORS (restrictive for security)
	const allowedOrigins = [
		"https://lornu.ai",
		"https://www.lornu.ai",
		// Add staging environment if needed:
		// "https://staging.lornu.ai",
	];

	const origin = request.headers.get("Origin");
	const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : "null";

	return {
		"Access-Control-Allow-Origin": allowOrigin,
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, X-API-Key",
		"Access-Control-Max-Age": "86400", // 24 hours
	};
}

/** Helper: Check API key authentication */
function checkApiKey(request: Request, env: Env): boolean {
	// If API_KEY is not configured, allow requests (backward compatibility during migration)
	if (!env.API_KEY) {
		return true;
	}

	// Security: Allow same-origin requests (frontend from lornu.ai) without API key
	// API key is only required for external API calls (cross-origin)
	const url = new URL(request.url);
	const hostname = url.hostname;
	
	// Check if request is from lornu.ai (same-origin)
	// Same-origin requests often don't have Origin header, so check hostname and Referer
	const origin = request.headers.get("Origin");
	const referer = request.headers.get("Referer");
	
	const isSameOrigin = 
		// Hostname matches lornu.ai
		(hostname === "lornu.ai" || hostname === "www.lornu.ai") ||
		// Origin header matches (for cross-origin same-site)
		(origin && (origin === "https://lornu.ai" || origin === "https://www.lornu.ai")) ||
		// Referer indicates it's from lornu.ai (same-origin requests often use Referer instead of Origin)
		(referer && (referer.startsWith("https://lornu.ai/") || referer.startsWith("https://www.lornu.ai/"))) ||
		// No Origin header often means same-origin request (browsers omit it for same-origin)
		(!origin && hostname && hostname.includes("lornu.ai"));
	
	if (isSameOrigin) {
		// Same-origin requests don't need API key (frontend is served from same Worker)
		return true;
	}

	// External API calls require API key
	const providedKey = request.headers.get("X-API-Key");
	return providedKey === env.API_KEY;
}

/** Helper: Log user query for analytics */
function logUserQuery(request: Request, prompt: string, model: string, modelName?: string, cf?: IncomingRequestCfProperties) {
	try {
		const logData = {
			timestamp: new Date().toISOString(),
			endpoint: "/query",
			prompt: prompt.substring(0, 500), // Truncate for logs (first 500 chars)
			promptLength: prompt.length,
			model: model,
			modelName: modelName || null,
			clientIP: getClientIP(request),
			country: cf?.country || null,
			city: cf?.city || null,
			userAgent: request.headers.get("User-Agent")?.substring(0, 100) || null, // Truncate
		};
		
		// Log as structured JSON for easy parsing
		console.log(JSON.stringify({
			type: "user_query",
			...logData
		}));
	} catch (error) {
		// Don't fail requests if logging fails
		console.error("Failed to log user query:", error);
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext, cf?: IncomingRequestCfProperties) {
		const url = new URL(request.url);
		const corsHeaders = getCorsHeaders(request);

		// Handle CORS preflight
		if (request.method === "OPTIONS") {
			return new Response(null, {
				headers: corsHeaders,
			});
		}

		// Health-check endpoint (public, no auth required)
		if (request.method === "GET" && url.pathname === "/status") {
			const models: AIModel[] = ["cloudflare"];
			const vertexAiConfigured = !!(env.GCP_PROJECT_ID && env.VERTEX_AI_LOCATION && env.VERTEX_AI_MODEL);
			
			// Add gemini if Vertex AI is configured
			if (vertexAiConfigured) {
				models.push("gemini");
			}

			// Public status endpoint - minimal information only (security: no sensitive IDs)
			return new Response(
				JSON.stringify({
					ok: true,
					version: "2.2.1",
					timestamp: new Date().toISOString(),
					models,
					// Removed: gatewayId, gatewayUrl, vertexAiConfigured, vertexAiAuthConfigured, vertexAiTokenCached
					// These expose sensitive configuration details
				}),
				{ headers: { "Content-Type": "application/json", ...corsHeaders } }
			);
		}

		// RAG query endpoint (requires authentication)
		if (url.pathname === "/query") {
			if (request.method !== "POST") {
				const errorResponse: ErrorResponse = {
					error: "Method not allowed. Only POST is supported.",
					code: "invalid_request",
				};
				return new Response(JSON.stringify(errorResponse), { 
					status: 405, 
					headers: { "Content-Type": "application/json", ...corsHeaders }
				});
			}

			// Security: Check API key authentication
			if (!checkApiKey(request, env)) {
				const errorResponse: ErrorResponse = {
					error: "Unauthorized. Valid API key required in X-API-Key header.",
					code: "auth_error",
				};
				return new Response(JSON.stringify(errorResponse), {
					status: 401,
					headers: { "Content-Type": "application/json", ...corsHeaders },
				});
			}

			// Security: Validate request size (prevent resource exhaustion)
			const contentLength = request.headers.get("Content-Length");
			if (contentLength && parseInt(contentLength) > 100000) { // 100KB limit
				const errorResponse: ErrorResponse = {
					error: "Request body too large. Maximum size: 100KB",
					code: "invalid_request",
				};
				return new Response(JSON.stringify(errorResponse), {
					status: 413,
					headers: { "Content-Type": "application/json", ...corsHeaders },
				});
			}

			let body: any;
			try {
				body = await request.json();
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "unknown error";
				const errorResponse: ErrorResponse = {
					error: `Invalid JSON body: ${errorMessage}`,
					code: "invalid_request",
				};
				return new Response(JSON.stringify(errorResponse), {
					status: 400,
					headers: { "Content-Type": "application/json", ...corsHeaders },
				});
			}

			// Security: Validate and sanitize inputs
			const prompt: string = body.prompt;
			const model: AIModel = body.model || "cloudflare";
			const modelName: string | undefined = body.modelName;

			// Validate prompt
			if (!prompt || typeof prompt !== "string") {
				const errorResponse: ErrorResponse = {
					error: 'Missing or invalid "prompt" field. Must be a non-empty string.',
					code: "invalid_request",
				};
				return new Response(JSON.stringify(errorResponse), {
					status: 400,
					headers: { "Content-Type": "application/json", ...corsHeaders },
				});
			}

			// Security: Limit prompt length (prevent resource exhaustion)
			if (prompt.length > 10000) {
				const errorResponse: ErrorResponse = {
					error: `Prompt too long. Maximum length: 10,000 characters. Received: ${prompt.length}`,
					code: "invalid_request",
				};
				return new Response(JSON.stringify(errorResponse), {
					status: 400,
					headers: { "Content-Type": "application/json", ...corsHeaders },
				});
			}

			// Security: Validate model name format (if provided)
			if (modelName && typeof modelName === "string") {
				// Allow alphanumeric, hyphens, slashes, underscores, dots, and @ symbol
				if (!/^[a-z0-9\-/@_.]+$/i.test(modelName) || modelName.length > 200) {
					const errorResponse: ErrorResponse = {
						error: "Invalid model name format. Use alphanumeric characters, hyphens, slashes, underscores, dots, and @ only. Maximum length: 200 characters.",
						code: "invalid_request",
					};
					return new Response(JSON.stringify(errorResponse), {
						status: 400,
						headers: { "Content-Type": "application/json", ...corsHeaders },
					});
				}
			}

			// Validate model
			const validModels: AIModel[] = ["cloudflare", "gemini"];
			if (!validModels.includes(model)) {
				const errorResponse: ErrorResponse = {
					error: `Invalid model. Choose from: ${validModels.join(", ")}`,
					code: "invalid_request",
					model,
				};
				return new Response(JSON.stringify(errorResponse), {
					status: 400,
					headers: { "Content-Type": "application/json", ...corsHeaders },
				});
			}

			try {
				// Log user query for analytics
				logUserQuery(request, prompt, model, modelName, cf);

				// 1️⃣ Try cached context from KV (cache per model+modelName+prompt combination)
				const cacheKey = modelName ? `${model}:${modelName}:${prompt}` : `${model}:${prompt}`;
				const key = await hashPrompt(cacheKey, model);
				const cached = await env.RAG_KV.get(key);

				// If cached, return immediately
				if (cached) {
					// Log cache hit
					console.log(JSON.stringify({
						type: "query_result",
						timestamp: new Date().toISOString(),
						cached: true,
						model: model,
						promptLength: prompt.length,
					}));
					
					return new Response(JSON.stringify({ answer: cached, cached: true, model, modelName: modelName || undefined }), {
						headers: { "Content-Type": "application/json", ...corsHeaders },
					});
				}

				// 2️⃣ Call the selected AI model with optional model name
				const answer = await callAI(prompt, model, env, modelName);
				
				// Log successful query
				console.log(JSON.stringify({
					type: "query_result",
					timestamp: new Date().toISOString(),
					cached: false,
					model: model,
					promptLength: prompt.length,
					answerLength: answer.length,
				}));

				//️ 3️⃣ Cache the answer for future identical prompts (1‑week TTL)
				// Only cache non-empty answers
				if (answer && answer.trim().length > 0) {
					await env.RAG_KV.put(key, answer, { expirationTtl: 60 * 60 * 24 * 7 });
				}

				return new Response(JSON.stringify({ answer, cached: false, model, modelName: modelName || undefined }), {
					headers: { "Content-Type": "application/json", ...corsHeaders },
				});
			} catch (error: any) {
				// Log errors
				console.error(JSON.stringify({
					type: "query_error",
					timestamp: new Date().toISOString(),
					model: model,
					promptLength: prompt.length,
					errorCode: error.code || "internal_error",
					errorMessage: error.message || "Internal server error",
				}));
				
				// Extract error code if available, default to internal_error
				const errorCode: ErrorCode = error.code || "internal_error";
				const errorResponse: ErrorResponse = {
					error: error.message || "Internal server error",
					code: errorCode,
					model,
					details: error.details,
				};
				return new Response(JSON.stringify(errorResponse), {
					status: 500,
					headers: { "Content-Type": "application/json", ...corsHeaders },
				});
			}
		}

		// For static assets (React app), delegate to ASSETS fetcher
		// This will serve files from the dist directory
		return env.ASSETS.fetch(request);
	},
} satisfies ExportedHandler<Env>;
