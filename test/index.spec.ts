import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect, vi } from 'vitest';
import worker from '../src';

describe('AI Worker', () => {
	describe('request for /status', () => {
		it('responds with JSON status (unit style)', async () => {
			const request = new Request<unknown, IncomingRequestCfProperties>('http://example.com/status');
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			const data = await response.json() as any;
			expect(response.status).toBe(200);
			expect(data.ok).toBe(true);
			expect(data.version).toBeDefined();
		});

		it('includes Vertex AI configuration fields', async () => {
			const request = new Request<unknown, IncomingRequestCfProperties>('http://example.com/status');
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			const data = await response.json() as any;
			expect(response.status).toBe(200);
			// New fields should be present (may be false if not configured)
			expect(data).toHaveProperty('vertexAiConfigured');
			expect(data).toHaveProperty('vertexAiAuthConfigured');
			expect(data).toHaveProperty('vertexAiTokenCached');
		});
	});

	describe('request for /query', () => {
		it('rejects GET requests', async () => {
			const request = new Request('http://example.com/query', { method: 'GET' });
			const response = await SELF.fetch(request);
			expect(response.status).toBe(404);
			expect(await response.text()).toBe("Only POST /query is supported");
		});

		it('validates missing prompt', async () => {
			const request = new Request('http://example.com/query', {
				method: 'POST',
				body: JSON.stringify({}),
				headers: { 'Content-Type': 'application/json' }
			});
			const response = await SELF.fetch(request);
			const data = await response.json() as any;
			expect(response.status).toBe(400);
			expect(data.error).toContain('Missing "prompt" field');
			expect(data.code).toBe('invalid_request');
		});

		// To test success, we would need to mock env.AI and env.RAG_KV properly.
		// Since cloudflare:test sets up bindings from wrangler.jsonc, they exist but might fail if not mocked or authenticated.
		// For now, we verify that invalid models are rejected, which doesn't touch the bindings.

		it('validates invalid model', async () => {
			const request = new Request('http://example.com/query', {
				method: 'POST',
				body: JSON.stringify({ prompt: 'hello', model: 'invalid' }),
				headers: { 'Content-Type': 'application/json' }
			});
			const response = await SELF.fetch(request);
			expect(response.status).toBe(400);
			const data = await response.json() as any;
			expect(data.error).toContain('Invalid model');
			expect(data.code).toBe('invalid_request');
			expect(data.model).toBe('invalid');
		});
	});
});
