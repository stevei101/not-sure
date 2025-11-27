import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src';

describe('CORS allowlist', () => {
  it('allows allowed origin', async () => {
    // Ensure allowlist is set for this test
    env.ALLOWED_ORIGINS = 'https://lornu.ai,https://www.lornu.ai';
    const req = new Request('http://example.com/status', {
      headers: { Origin: 'https://lornu.ai' },
    });
    const ctx = createExecutionContext();
    const res = await worker.fetch(req, env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://lornu.ai');
  });

  it('blocks disallowed origin', async () => {
    env.ALLOWED_ORIGINS = 'https://lornu.ai,https://www.lornu.ai';
    const req = new Request('http://example.com/status', {
      headers: { Origin: 'https://evil.example' },
    });
    const ctx = createExecutionContext();
    const res = await worker.fetch(req, env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(403);
  });
});
