# PR #23 — Develop → Main Deployment Summary (Docs Only)

This document captures what PR #23 deploys and how it aligns to Issue #25.

## What’s Included
- React Spark UI (Search interface) — merged from PR #14.
- Vertex AI Terraform infrastructure (service account, IAM, secrets) — merged from PR #21.
- Worker static assets serving via ASSETS binding; CORS; build/test stability.

## Alignment to Issue #25
- Visual Parity: Delivered (Spark design, React/Vite/Tailwind).
- Infra Foundation: Delivered (Vertex AI IAM + Secret Manager; AI Gateway ready).
- RAG Search: Partially pending — vector embeddings, index, retrieval not yet implemented.
- Gateway Multi‑Model: Pending — worker currently uses `cloudflare` model path.

## Follow‑ups Needed (tracked in rag-roadmap.md)
- Vectorize integration, embeddings pipeline, ingestion endpoints.
- `/api/v1/search` endpoint implementing retrieve‑then‑generate with sources.
- Model selection/routing via Gateway and UI control.
