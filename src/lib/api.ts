/**
 * API Client for Not Sure Worker endpoints
 */

export interface QueryRequest {
  prompt: string;
  model?: "cloudflare" | "gemini";
}

export interface QueryResponse {
  answer: string;
  cached: boolean;
  model: string;
}

export interface StatusResponse {
  ok: boolean;
  version: string;
  timestamp: string;
  models: string[];
  gatewayId: string;
  gatewayUrl: string;
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
export async function queryAI(request: QueryRequest): Promise<QueryResponse> {
  const response = await fetch(`${getApiBaseUrl()}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: request.prompt,
      model: request.model || "cloudflare",
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText })) as { error?: string };
    throw new Error(error.error || `API error: ${response.status}`);
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

