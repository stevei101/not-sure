/**
 * API Client for Not Sure Worker endpoints
 */

export interface QueryRequest {
  prompt: string;
  model?: "cloudflare" | "gemini";
  modelName?: string; // Optional: specific model identifier (e.g., "google-ai-studio/gemini-flash-latest", "workers-ai/@cf/meta/llama-2-7b-chat-fp16")
}

export interface QueryResponse {
  answer: string;
  cached: boolean;
  model: string;
  modelName?: string; // Specific model identifier used (if provided)
}

export interface StatusResponse {
  ok: boolean;
  version: string;
  timestamp: string;
  models: string[];
  // Security: Sensitive fields removed (gatewayId, gatewayUrl, vertexAiConfigured, etc.)
}

/** Structured error response from API */
export interface ErrorResponse {
  error: string;
  code: "auth_error" | "config_missing" | "provider_error" | "invalid_request" | "internal_error";
  model?: string;
  details?: unknown;
}

/**
 * Get the base URL for API requests
 * In production, this will be the same origin (Worker serves both frontend and API)
 * In development, you may need to configure a proxy or use the Worker dev URL
 */
function getApiBaseUrl(): string {
  // Use relative URLs - Worker serves both frontend and API
  return "";
}

/**
 * Query the RAG-enabled AI endpoint
 */
export async function queryAI(request: QueryRequest, apiKey?: string): Promise<QueryResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add API key if provided (for authenticated requests)
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }

  const response = await fetch(`${getApiBaseUrl()}/query`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt: request.prompt,
      model: request.model || "cloudflare",
      ...(request.modelName && { modelName: request.modelName }),
    }),
  });

  if (!response.ok) {
    // Try to parse structured error response
    let errorData: ErrorResponse | { error?: string };
    try {
      errorData = await response.json() as ErrorResponse;
    } catch {
      errorData = { error: response.statusText };
    }
    
    // Preserve structured error code if available
    const error = new Error(errorData.error || `API error: ${response.status}`);
    if ('code' in errorData && errorData.code) {
      (error as any).code = errorData.code;
    }
    if ('details' in errorData && errorData.details) {
      (error as any).details = errorData.details;
    }
    throw error;
  }

  return response.json();
}

/**
 * Get worker status
 */
export async function getStatus(): Promise<StatusResponse> {
  const response = await fetch(`${getApiBaseUrl()}/status`);

  if (!response.ok) {
    throw new Error(`Status check failed: ${response.status}`);
  }

  return response.json();
}

