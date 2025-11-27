import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, vi } from 'vitest';
import worker from '../src';

describe('Cloudflare AI path selection', () => {
  it('uses AI binding when no CLOUDFLARE_API_TOKEN', async () => {
    // Ensure token absent
    delete (env as any).CLOUDFLARE_API_TOKEN;
    env.ALLOWED_ORIGINS = '';

    // Spy on AI.run
    const runSpy = vi.spyOn(env.AI as any, 'run').mockResolvedValue({ response: 'ok' });
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const req = new Request('http://example.com/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'hi', model: 'cloudflare' }),
    });
    const ctx = createExecutionContext();
    const res = await worker.fetch(req, env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.answer).toBe('ok');
    expect(runSpy).toHaveBeenCalled();
    // gateway fetch not necessarily called
    expect(fetchSpy).not.toHaveBeenCalledWith(expect.stringContaining('gateway.ai.cloudflare.com'), expect.anything());

    runSpy.mockRestore();
    fetchSpy.mockRestore();
  });

  it('uses Gateway when CLOUDFLARE_API_TOKEN is present', async () => {
    (env as any).CLOUDFLARE_API_TOKEN = 'token';
    env.ACCOUNT_ID = env.ACCOUNT_ID || 'acct';
    env.AI_GATEWAY_ID = env.AI_GATEWAY_ID || 'gw';
    env.AI_GATEWAY_URL = env.AI_GATEWAY_URL || 'https://gateway.ai.cloudflare.com/v1';
    env.ALLOWED_ORIGINS = '';

    // AI.run should not be used in this branch
    const runSpy = vi.spyOn(env.AI as any, 'run').mockResolvedValue({ response: 'ok' });
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ result: { response: 'gateway-ok' } }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );

    const req = new Request('http://example.com/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'hi', model: 'cloudflare' }),
    });
    const ctx = createExecutionContext();
    const res = await worker.fetch(req, env, ctx);
    await waitOnExecutionContext(ctx);
    const data = await res.json() as any;
    expect(data.answer).toBe('gateway-ok');
    expect(fetchSpy).toHaveBeenCalled();
    // AI binding not needed
    expect(runSpy).not.toHaveBeenCalled();

    runSpy.mockRestore();
    fetchSpy.mockRestore();
  });
});
