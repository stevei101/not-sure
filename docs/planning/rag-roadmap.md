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
- Extend AIModel union to include Vertex AI (`gemini`) and future models.
- Add routing and optional UI model picker; default auto.

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
- M1: Embeddings + Vectorize wiring + ingest endpoint.
- M2: `/api/v1/search` with sources.
- M3: Model routing + UI sources + tests.
