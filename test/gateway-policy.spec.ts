import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src';

describe('Gateway-first policy', () => {
  it('returns policy_violation for direct provider when gateway-first enforced', async () => {
    env.GATEWAY_FIRST = 'true';
    env.ALLOW_DIRECT_PROVIDER = 'false';
    // Pretend Vertex AI is configured so the code attempts to use it
    env.GCP_PROJECT_ID = 'proj';
    env.VERTEX_AI_LOCATION = 'us-central1';
    env.VERTEX_AI_MODEL = 'gemini-pro';
    env.ALLOWED_ORIGINS = '';

    const req = new Request('http://example.com/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'hello', model: 'gemini' }),
    });
    const ctx = createExecutionContext();
    const res = await worker.fetch(req, env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(501);
    const data = await res.json() as any;
    expect(data.code).toBe('policy_violation');
  });
});
