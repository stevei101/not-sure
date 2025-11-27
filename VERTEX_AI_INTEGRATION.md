# Vertex AI Integration via Cloudflare AI Gateway

## Overview

We're switching from Google AI Studio to **Vertex AI** for Gemini model access. Vertex AI provides enterprise-grade Gemini models with better control, usage tracking, and integration options.

## Architecture

- **Cloudflare AI Gateway** routes requests to Vertex AI
- **Vertex AI** provides Gemini models (not full RAG Engine - that's a separate service)
- **Service Account** authentication (OAuth2 with JSON key)

## Differences from Google AI Studio

| Aspect | Google AI Studio | Vertex AI |
|--------|------------------|-----------|
| **Authentication** | API Key (`x-goog-api-key`) | Service Account (OAuth2 Bearer token) |
| **Endpoint** | `/default/google-ai-studio/v1/models/{model}:generateContent` | `/google-vertex-ai/{project}/{location}/publishers/google/models/{model}:predict` |
| **Request Format** | `{contents: [...]}` | `{instances: [{contents: [...]}], parameters: {...}}` |
| **Response Format** | `{candidates: [...]}` | `{predictions: [{candidates: [...]}]}` |

## Configuration

### Required Environment Variables

1. **VERTEX_AI_PROJECT_ID** - Your GCP Project ID
2. **VERTEX_AI_LOCATION** - Region (e.g., `us-central1`, `europe-west3`)
3. **VERTEX_AI_MODEL** - Model name (e.g., `gemini-1.5-flash`, `gemini-2.5-flash`)
4. **VERTEX_AI_SERVICE_ACCOUNT_JSON** - Service account JSON key (secret)

### Cloudflare AI Gateway Setup

The gateway must be configured with Vertex AI credentials. According to Cloudflare documentation, you can configure the `google-vertex-ai` provider in the AI Gateway dashboard.

## Next Steps

1. **Configure AI Gateway**: Add Vertex AI as a provider in Cloudflare AI Gateway dashboard
2. **Set Worker Secrets**: Configure the environment variables above
3. **Test Integration**: Verify the endpoint works correctly

## Vertex AI RAG Engine (Future)

The [Vertex AI RAG Engine](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/rag-overview) is a **separate service** that provides:
- Data ingestion from various sources
- Automatic chunking and embedding
- Retrieval-augmented generation
- Integration with Vertex AI Gemini models

This is a more advanced feature that could be added later. For now, we're implementing basic Vertex AI Gemini API access.

