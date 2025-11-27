# RAG Roadmap — Implementation Plan

## 1) Vector Store
- Prefer Cloudflare Vectorize. Alternative: Pinecone/Weaviate (env‑configurable).
- Index schema: id, embedding, text, metadata (source, chunk, uri).

## 2) Embeddings Pipeline
- Use Cloudflare Workers AI text embeddings model.
- Chunk strategy: 500–1,000 tokens with overlap; store chunk id + source.
- Ingestion endpoint: `POST /api/v1/ingest` → embeds and upserts to vector store.

## 3) Retrieval API
- Endpoint: `POST /api/v1/search` { query, topK?, model? } →
  - Embed query → vector search (topK) → assemble context → call model via Gateway → return { answer, sources }.
- Cache: KV cache post‑answer; invalidate on ingestion updates.

## 4) Gateway + Models
- ✅ **COMPLETE**: Extended AIModel union to include Vertex AI (`gemini`) and future models (PR 2.2).
- ✅ **COMPLETE**: Model routing implemented (`cloudflare` and `gemini` models).
- ⚠️ **NOTE**: Vertex AI calls are direct (not through Cloudflare AI Gateway) because Gateway does not currently support Vertex AI/Gemini models. This is a temporary deviation from Gateway-first policy.
- **PENDING**: Add optional UI model picker; default auto.
- **PENDING**: Gateway unification milestone - migrate Vertex AI to Gateway if/when supported.

## 5) UI Enhancements
- Display sources/citations beneath answer.
- Streaming responses with graceful fallback.

## 6) Testing & Quality
- Unit: retrieval, chunking, embeddings, routing.
- Integration: ingest → search → answer.
- Target coverage: ≥70% for new RAG modules.

## 7) Security & Ops
- Secrets via Wrangler + GitHub Secrets; no keys in repo.
- Observability: Gateway analytics; Workers logs; error telemetry.

## Milestones

### M0: Multi-Model Foundation ✅ (PR 2.2)
- ✅ Vertex AI (Gemini) integration complete
- ✅ OAuth2 authentication with token caching
- ✅ Structured error handling
- ✅ Enhanced status endpoint
- ⏳ Unit tests for new functionality (target: ≥70% coverage)

### M1: Embeddings + Vectorize wiring + ingest endpoint.
- Vector store setup (Cloudflare Vectorize)
- Embeddings pipeline
- Ingestion endpoint `POST /api/v1/ingest`

### M2: `/api/v1/search` with sources.
- Retrieval API implementation
- Vector search integration
- Source attribution in responses

### M3: Model routing + UI sources + tests.
- UI model picker
- Source citations in UI
- Comprehensive test coverage (target: ≥70%)

### Future: Gateway Unification
- Migrate Vertex AI calls to Cloudflare AI Gateway when support is available
- Unified analytics and rate limiting across all providers
