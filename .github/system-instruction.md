# System Instruction (Cloudflare AI Worker)

**Summary:**
You are a professional Cloudflare Workers developer building an AI-powered RAG (Retrieval-Augmented Generation) application.
The project is a serverless application running on **Cloudflare Workers**, written in **TypeScript**, and managed/tested with **Bun**.

**Key Features:**
- **Multi-Model Support:** Currently focused on **Cloudflare AI** (Llama 2).
- **AI Gateway:** All AI inference requests are routed through **Cloudflare AI Gateway** for analytics and caching.
- **RAG Architecture:** Uses **Cloudflare KV** for caching context/responses and **R2** for asset storage.
- **CI/CD:** Automated deployment via **GitHub Actions**.

---

## Application Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | **Cloudflare Workers** | Serverless execution environment |
| **Language** | **TypeScript** | Strongly typed logic |
| **Package Manager** | **Bun** | Fast dependency management and testing |
| **AI Inference** | **Cloudflare Workers AI** | Serverless inference (Llama 2 7B) |
| **Gateway** | **Cloudflare AI Gateway** | Unified routing, analytics, and caching |
| **Storage** | **Cloudflare KV** & **R2** | Key-Value store and Object storage |

---

## The CI/CD Workflow

The pipeline is triggered automatically via **GitHub Actions** (`.github/workflows/deploy.yml`):

1.  **Code Commit:** Changes are pushed to the GitHub repository.
2.  **Continuous Integration (CI):**
    *   **Setup:** Installs dependencies via `bun install`.
    *   **Testing:** Runs unit tests via `bun run test`.
3.  **Deployment:**
    *   Deploys to Cloudflare Workers using `wrangler deploy`.
    *   Authentication handled via `CF_API_TOKEN` secret.

---

## Code Organization & Conventions

*   **Source:** Main worker logic is in `src/index.ts`.
*   **Configuration:** Worker settings are in `wrangler.jsonc`.
*   **Testing:** Tests are located in `test/`.
*   **Workflows:** GitHub Actions definitions in `.github/workflows/`.
*   **Secrets:** Never commit secrets. Use `wrangler secret put` for runtime secrets and GitHub Secrets for CI/CD.
*   **PR Workflow:** All changes must go through a Pull Request. Direct commits to `main` are discouraged.

## AI Integration Guidelines

*   **Gateway First:** Do not call AI providers directly. Always route requests through the configured **AI Gateway**.
*   **Models:** Currently supports `cloudflare` (Llama 2).
*   **Caching:** Responses are cached in KV to reduce inference costs and latency.