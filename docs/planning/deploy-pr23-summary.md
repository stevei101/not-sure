# PR #23 — Develop → Main Deployment Summary (Docs Only)

This document captures what PR #23 deploys and how it aligns to Issue #25.

## What's Included
- React Spark UI (Search interface) — merged from PR #14.
- Vertex AI Terraform infrastructure (service account, IAM, secrets) — merged from PR #21.
- Vertex AI (Gemini) integration — merged from PR #27 (PR 2.2).
- Worker static assets serving via ASSETS binding; CORS; build/test stability.

## Alignment to Issue #25
- Visual Parity: Delivered (Spark design, React/Vite/Tailwind).
- Infra Foundation: Delivered (Vertex AI IAM + Secret Manager; AI Gateway ready).
- Multi-Model Support: ✅ Delivered — worker supports both `cloudflare` and `gemini` models.
  - **Note**: Gemini calls go directly to Vertex AI (not through Cloudflare AI Gateway) because Gateway does not currently support Vertex AI/Gemini models. This is a temporary architectural deviation until Gateway support is available.
- RAG Search: Partially pending — vector embeddings, index, retrieval not yet implemented (only model switching, no retrieval pipeline).

## Follow‑ups Needed (tracked in rag-roadmap.md)
- Vectorize integration, embeddings pipeline, ingestion endpoints.
- `/api/v1/search` endpoint implementing retrieve‑then‑generate with sources.
- Gateway unification: Migrate Vertex AI calls to Cloudflare AI Gateway when support is available.
- UI model picker for manual model selection.
- Source attribution and citations in responses.
