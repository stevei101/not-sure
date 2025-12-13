# Issue #25 — Not Sure V2: Spark UI + RAG/Gateway Integration (Planning)

This document preserves the updated feature request and acceptance criteria for Not Sure V2.

## Summary
- Replatform the application using Spark UI design (React/Vite/Tailwind/Bun).
- Maintain and extend backend to support RAG (retrieval over vector index) and AI Gateway multi-model routing.

## Acceptance Criteria
- Visual Parity: Spark design system (Slate/Electric Blue, glassmorphism, Inter).
- RAG Functionality: Query → embed → top‑k vector search → context assembly → generate answer.
- AI Gateway: Support model switching/routing; observability via Gateway.
- Performance: Initial retrieval under target latency (e.g., <2s where feasible).
- Quality: 70%+ test coverage target for new code.

## Technical Objectives
- Frontend: Spark components (Card, Input, Button), chat/search interface, streaming states.
- Backend: Embeddings, vector store, retrieval, generation, caching; gateway routing.
- Endpoints: `/api/v1/search` (RAG), `/query` (compat), `/status` (health).
- Infrastructure: Variables and secrets for vector DB and model providers.

## Notes
- Gateway-first policy (no direct provider calls) for supported providers.
  - **Exception**: Vertex AI (Gemini) calls go directly to Google's API (not through Cloudflare AI Gateway) because Gateway does not currently support Vertex AI/Gemini models. This is a temporary architectural deviation until Gateway support is available. See milestone notes below.
- Prefer Cloudflare-native services (Vectorize, KV, R2) where possible.

## Current Status (Updated: 2025-11-27)

**Overall Progress:** ~60% Complete

### Completed ✅
- **Visual Parity**: Spark UI design implemented (React/Vite/Tailwind/Bun)
- **Frontend**: Spark components (Card, Input, Button), search interface
- **Backend Structure**: Cloudflare Workers, multi-model routing
- **Multi-Model Support**: Gemini integration complete (PR #27 merged)
- **Authentication**: OAuth2 JWT signing with service account authentication
- **Token Caching**: KV-based OAuth2 token caching for performance
- **Error Handling**: Structured error codes and enhanced error messages (PR #32 pending)
- **Endpoints**: `/query` (POST), `/status` (GET)
- **Infrastructure**: Terraform, CI/CD, staging/production workflows
- **AI Gateway**: Routing implemented (needs `AI_GATEWAY_AUTH_TOKEN` to fully activate)

### Not Completed ❌ (Core RAG Features)
- **Vector Store**: No Cloudflare Vectorize integration
- **Embeddings Pipeline**: Not implemented (no text embeddings, no chunking)
- **True RAG**: No vector search (only KV response caching exists)
- **Retrieval API**: `/api/v1/search` endpoint missing
- **Ingestion**: `/api/v1/ingest` endpoint missing
- **Retrieval Pipeline**: No top-k vector search → context assembly → generate flow
- **Source Attribution**: Cannot identify source documents/chunks
- **Test Coverage**: Currently minimal (PR #29 adds tests but needs merge)
- **Gateway Policy**: Vertex AI bypasses Gateway (direct calls - temporary deviation)

**Current State:** Spark UI + basic LLM query via Gateway (not true RAG)  
**Missing:** Actual RAG functionality (embeddings, vector search, retrieval)

### Planned 📋
- **M1**: Vector store setup (Cloudflare Vectorize) + embeddings pipeline + ingest endpoint
- **M2**: Retrieval API (`/api/v1/search`) with vector search and source attribution
- **M3**: UI enhancements (source citations) + comprehensive tests (target: ≥70% coverage)
- Gateway unification: Migrate Vertex AI to Gateway if/when supported
- Performance monitoring and observability

See `ISSUE_25_STATUS_UPDATE.md` for detailed analysis.
