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

## Current Status (as of PR #27)

### Completed ✅
- **Multi-Model Support**: Gemini integration complete (PR 2.2)
- **Authentication**: OAuth2 JWT signing with service account authentication
- **Token Caching**: KV-based OAuth2 token caching for performance
- **Error Handling**: Structured error codes and enhanced error messages
- **Status Endpoint**: Enhanced with `vertexAiAuthConfigured` flag

### In Progress 🔄
- Test coverage: Target ≥70% for new code (unit tests pending for JWT signing and Vertex AI integration)

### Planned 📋
- Full RAG pipeline (embeddings, vector store, retrieval API)
- Gateway unification: Migrate Vertex AI to Gateway if/when supported
- Source attribution and citations in responses
- Performance monitoring and observability
