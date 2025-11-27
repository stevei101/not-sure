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
- Gateway-first policy (no direct provider calls).
- Prefer Cloudflare-native services (Vectorize, KV, R2) where possible.
