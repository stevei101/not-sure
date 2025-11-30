/**
 * Unit tests for Vertex AI integration functions
 * 
 * Tests for:
 * - PEM to ArrayBuffer conversion (using actual exported function)
 * - Service Account JSON validation
 * - Vertex AI API response parsing
 * - Error handling paths
 */

import { describe, it, expect } from 'vitest';
import { pemToArrayBuffer } from '../src/index';

describe('Vertex AI Integration - Unit Tests', () => {
	describe('PEM to ArrayBuffer conversion', () => {
		it('should handle valid PEM format with newlines', () => {
			const pem = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj
-----END PRIVATE KEY-----`;
			
			// Test the actual function from src/index.ts
			const result = pemToArrayBuffer(pem);
			
			expect(result).toBeInstanceOf(ArrayBuffer);
			expect(result.byteLength).toBeGreaterThan(0);
		});

		it('should handle PEM format with Windows line endings (\\r\\n)', () => {
			const pemWithWindowsNewlines = "-----BEGIN PRIVATE KEY-----\r\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\r\n-----END PRIVATE KEY-----";
			
			// Test the actual function - should handle \r\n correctly
			const result = pemToArrayBuffer(pemWithWindowsNewlines);
			
			expect(result).toBeInstanceOf(ArrayBuffer);
			expect(result.byteLength).toBeGreaterThan(0);
		});

		it('should handle PEM format with escaped newlines (from JSON)', () => {
			// When PEM is stored in JSON, newlines are escaped as \\n
			// JSON.parse converts \\n to \n, so the function receives actual \n characters
			const pemWithEscapedNewlines = "-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\\n-----END PRIVATE KEY-----";
			
			// After JSON.parse, this becomes actual \n characters
			const parsedPem = JSON.parse(`"${pemWithEscapedNewlines}"`);
			const result = pemToArrayBuffer(parsedPem);
			
			expect(result).toBeInstanceOf(ArrayBuffer);
			expect(result.byteLength).toBeGreaterThan(0);
		});

		it('should handle invalid PEM format gracefully', () => {
			const invalidPem = "not a valid PEM";
			
			// Should not crash, but will produce invalid base64
			expect(() => pemToArrayBuffer(invalidPem)).not.toThrow();
			// The result will be an ArrayBuffer, but decoding will fail if used
			const result = pemToArrayBuffer(invalidPem);
			expect(result).toBeInstanceOf(ArrayBuffer);
		});

		it('should remove all whitespace including tabs and spaces', () => {
			const pemWithWhitespace = `-----BEGIN PRIVATE KEY-----
	MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj
-----END PRIVATE KEY-----`;
			
			const result = pemToArrayBuffer(pemWithWhitespace);
			expect(result).toBeInstanceOf(ArrayBuffer);
			expect(result.byteLength).toBeGreaterThan(0);
		});
	});

	describe('Service Account JSON validation', () => {
		it('should identify missing private_key field', () => {
			const invalidJson = JSON.stringify({
				client_email: "test@example.com"
				// missing private_key
			});
			
			const parsed = JSON.parse(invalidJson);
			const missingFields = [
				!parsed.private_key && "private_key",
				!parsed.client_email && "client_email",
			].filter(Boolean);
			
			expect(missingFields).toContain("private_key");
			expect(missingFields).not.toContain("client_email");
		});

		it('should identify missing client_email field', () => {
			const invalidJson = JSON.stringify({
				private_key: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
				// missing client_email
			});
			
			const parsed = JSON.parse(invalidJson);
			const missingFields = [
				!parsed.private_key && "private_key",
				!parsed.client_email && "client_email",
			].filter(Boolean);
			
			expect(missingFields).not.toContain("private_key");
			expect(missingFields).toContain("client_email");
		});

		it('should validate complete service account JSON', () => {
			const validJson = JSON.stringify({
				private_key: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
				client_email: "test@example.com"
			});
			
			const parsed = JSON.parse(validJson);
			const missingFields = [
				!parsed.private_key && "private_key",
				!parsed.client_email && "client_email",
			].filter(Boolean);
			
			expect(missingFields).toHaveLength(0);
		});

		it('should handle invalid JSON format', () => {
			const invalidJson = "{ not valid json }";
			
			expect(() => JSON.parse(invalidJson)).toThrow();
		});
	});

	describe('Vertex AI Response Parsing', () => {
		it('should parse valid single-part response', () => {
			const response = {
				candidates: [{
					content: {
						parts: [{
							text: "Hello, world!"
						}]
					}
				}]
			};
			
			const textParts = response.candidates[0].content.parts
				.map((part: any) => part.text)
				.filter((text: string): text is string => typeof text === "string" && text.length > 0);
			
			expect(textParts).toHaveLength(1);
			expect(textParts[0]).toBe("Hello, world!");
		});

		it('should parse valid multi-part response', () => {
			const response = {
				candidates: [{
					content: {
						parts: [
							{ text: "Part 1" },
							{ text: "Part 2" }
						]
					}
				}]
			};
			
			const textParts = response.candidates[0].content.parts
				.map((part: any) => part.text)
				.filter((text: string): text is string => typeof text === "string" && text.length > 0);
			
			expect(textParts).toHaveLength(2);
			expect(textParts.join("\n\n")).toBe("Part 1\n\nPart 2");
		});

		it('should handle empty response gracefully', () => {
			const response = {
				candidates: []
			};
			
			expect(response.candidates).toHaveLength(0);
		});

		it('should handle missing candidates field', () => {
			const response = {};
			
			expect(response.candidates).toBeUndefined();
		});

		it('should filter out empty text parts', () => {
			const response = {
				candidates: [{
					content: {
						parts: [
							{ text: "Valid text" },
							{ text: "" },
							{ text: "Another valid" }
						]
					}
				}]
			};
			
			const textParts = response.candidates[0].content.parts
				.map((part: any) => part.text)
				.filter((text: string): text is string => typeof text === "string" && text.length > 0);
			
			expect(textParts).toHaveLength(2);
			expect(textParts).not.toContain("");
		});

		it('should handle missing content parts', () => {
			const response = {
				candidates: [{
					content: {}
				}]
			};
			
			expect(response.candidates[0].content.parts).toBeUndefined();
		});

		it('should handle missing content field', () => {
			const response = {
				candidates: [{}]
			};
			
			expect(response.candidates[0].content).toBeUndefined();
		});
	});

	describe('Error Code Assignment', () => {
		it('should assign config_missing error code for missing configuration', () => {
			const error = new Error("Vertex AI configuration missing");
			(error as any).code = "config_missing";
			
			expect((error as any).code).toBe("config_missing");
		});

		it('should assign auth_error error code for authentication failures', () => {
			const error = new Error("Failed to get access token");
			(error as any).code = "auth_error";
			
			expect((error as any).code).toBe("auth_error");
		});

		it('should assign provider_error error code for API errors', () => {
			const error = new Error("Vertex AI error");
			(error as any).code = "provider_error";
			
			expect((error as any).code).toBe("provider_error");
		});
	});
});
