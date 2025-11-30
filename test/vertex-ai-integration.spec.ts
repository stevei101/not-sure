/**
 * Integration tests for Vertex AI functions through the worker
 * 
 * Tests the actual functions as they work in the worker context,
 * using mocks for external dependencies (fetch, KV).
 */

import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from '../src';

describe('Vertex AI Integration - Endpoint Tests', () => {
	const mockEnv = {
		...env,
		GCP_PROJECT_ID: 'test-project',
		VERTEX_AI_LOCATION: 'us-central1',
		VERTEX_AI_MODEL: 'gemini-pro',
		VERTEX_AI_SERVICE_ACCOUNT_JSON: JSON.stringify({
			private_key: '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----',
			client_email: 'test@test-project.iam.gserviceaccount.com'
		}),
	};

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();
	});

	describe('/status endpoint - Vertex AI configuration', () => {
		it('should include gemini in models when Vertex AI config is present', async () => {
			const request = new Request('http://example.com/status');
			const response = await worker.fetch(request, mockEnv as any);
			const data = await response.json() as any;

			expect(response.status).toBe(200);
			expect(data.ok).toBe(true);
			expect(data.models).toContain('gemini');
			expect(data.models).toContain('cloudflare');
			// Security: Sensitive fields (vertexAiConfigured, vertexAiAuthConfigured) removed
			expect(data).not.toHaveProperty('vertexAiConfigured');
			expect(data).not.toHaveProperty('vertexAiAuthConfigured');
		});

		it('should not include gemini in models when config is missing', async () => {
			const envWithoutConfig = {
				...env,
				// Missing Vertex AI config
			};
			
			const request = new Request('http://example.com/status');
			const response = await worker.fetch(request, envWithoutConfig as any);
			const data = await response.json() as any;

			expect(response.status).toBe(200);
			expect(data.ok).toBe(true);
			expect(data.models).not.toContain('gemini');
			expect(data.models).toContain('cloudflare');
			// Security: Sensitive fields removed
			expect(data).not.toHaveProperty('vertexAiConfigured');
			expect(data).not.toHaveProperty('vertexAiAuthConfigured');
		});

		it('should return minimal status information (security: no sensitive IDs)', async () => {
			const request = new Request('http://example.com/status');
			const response = await worker.fetch(request, mockEnv as any);
			const data = await response.json() as any;

			expect(response.status).toBe(200);
			expect(data).toHaveProperty('ok');
			expect(data).toHaveProperty('version');
			expect(data).toHaveProperty('timestamp');
			expect(data).toHaveProperty('models');
			// Security: These fields should not be exposed
			expect(data).not.toHaveProperty('gatewayId');
			expect(data).not.toHaveProperty('gatewayUrl');
			expect(data).not.toHaveProperty('vertexAiConfigured');
			expect(data).not.toHaveProperty('vertexAiAuthConfigured');
			expect(data).not.toHaveProperty('vertexAiTokenCached');
		});
	});

	describe('/query endpoint - Vertex AI error handling', () => {
		it('should return structured error with config_missing code', async () => {
			const envWithoutConfig = {
				...env,
				// Missing Vertex AI config
			};

			const request = new Request('http://example.com/query', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt: 'test', model: 'gemini' })
			});

			const response = await worker.fetch(request, envWithoutConfig as any);
			const data = await response.json() as any;

			expect(response.status).toBe(500);
			expect(data.code).toBe('config_missing');
			expect(data.error).toContain('Vertex AI configuration missing');
		});

		it('should return structured error for invalid JSON body', async () => {
			const request = new Request('http://example.com/query', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: '{ invalid json }'
			});

			const response = await worker.fetch(request, env as any);
			const data = await response.json() as any;

			expect(response.status).toBe(400);
			expect(data.code).toBe('invalid_request');
			expect(data.error).toContain('Invalid JSON body');
		});

		it('should validate gemini model is accepted', async () => {
			const request = new Request('http://example.com/query', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt: 'test', model: 'gemini' })
			});

			// This will fail due to missing config, but model validation should pass
			const response = await worker.fetch(request, env as any);
			const data = await response.json() as any;

			// Should not be an invalid model error
			expect(data.code).not.toBe('invalid_request');
			expect(data.error).not.toContain('Invalid model');
		});
	});

	describe('Error response structure', () => {
		it('should return ErrorResponse format with code field', async () => {
			const request = new Request('http://example.com/query', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({}) // Missing prompt
			});

			const response = await worker.fetch(request, env as any);
			const data = await response.json() as any;

			expect(response.status).toBe(400);
			expect(data).toHaveProperty('error');
			expect(data).toHaveProperty('code');
			expect(data.code).toBe('invalid_request');
		});

		it('should include model in error response when model is specified', async () => {
			const request = new Request('http://example.com/query', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt: 'test', model: 'gemini' })
			});

			const envWithoutConfig = { ...env };
			const response = await worker.fetch(request, envWithoutConfig as any);
			const data = await response.json() as any;

			expect(data).toHaveProperty('model');
			expect(data.model).toBe('gemini');
		});
	});
});

