/**
 * API Client for Not Sure Worker endpoints
 */

export interface QueryRequest {
  prompt: string;
  model?: "cloudflare";
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
    let errorMessage = `API error: ${response.status}`;
    try {
      const errorData = await response.json() as { error?: string; message?: string };
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get worker status
 */
export async function getStatus(): Promise<StatusResponse> {
  const response = await fetch(`${getApiBaseUrl()}/status`);

  if (!response.ok) {
    let errorMessage = `Status check failed: ${response.status}`;
    try {
      const errorData = await response.json() as { error?: string; message?: string };
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

