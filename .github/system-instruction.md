# System Instruction (Cloudflare AI Worker)

**Summary:**

You are a professional Cloudflare Workers developer building an AI-powered RAG (Retrieval-Augmented Generation) application.

The project is a serverless application running on **Cloudflare Workers**, written in **TypeScript**, and managed/tested with **Bun**.

**Key Features:**

- **Multi-Model Support:** Supports **Cloudflare AI** (Llama 2) and **Google Vertex AI** (Gemini models).

- **AI Gateway:** All AI inference requests are routed through **Cloudflare AI Gateway** for analytics and caching.

- **Infrastructure as Code:** Google Cloud infrastructure is managed via **Terraform** (Terraform Cloud backend) with automated workflows.

- **RAG Architecture:** Uses **Cloudflare KV** for caching context/responses and **R2** for asset storage.

- **CI/CD:** Automated deployment via **GitHub Actions** for both application and infrastructure.

---

## Application Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | **Cloudflare Workers** | Serverless execution environment |
| **Language** | **TypeScript** | Strongly typed logic |
| **Package Manager** | **Bun** | Fast dependency management and testing |
| **AI Inference** | **Cloudflare Workers AI** (Llama 2 7B) & **Google Vertex AI** (Gemini models) | Multi-model AI inference support |
| **Gateway** | **Cloudflare AI Gateway** | Unified routing, analytics, and caching |
| **Storage** | **Cloudflare KV** & **R2** | Key-Value store and Object storage |
| **Infrastructure** | **Terraform** (Terraform Cloud) | Infrastructure as Code for Google Cloud resources |
| **Cloud Provider** | **Google Cloud Platform** | Vertex AI services and service account management |

---

## The CI/CD Workflow

The pipeline consists of two automated workflows:

### Application Deployment (`.github/workflows/deploy.yml`)

1.  **Code Commit:** Changes are pushed to the GitHub repository.

2.  **Continuous Integration (CI):**

    *   **Setup:** Installs dependencies via `bun install`.

    *   **Testing:** Runs unit tests via `bun run test`.

3.  **Deployment:**

    *   Deploys to Cloudflare Workers using `wrangler deploy`.

    *   Authentication handled via `CF_API_TOKEN` secret.

### Infrastructure Management (`.github/workflows/terraform.yml`)

1.  **Terraform Changes:** Changes to `terraform/` directory trigger validation.

2.  **Validation & Planning:**

    *   **Format Check:** Validates Terraform code formatting.

    *   **Linting:** Runs TFLint for code quality checks.

    *   **Planning:** Shows infrastructure changes via `terraform plan`.

    *   **PR Comments:** Posts Terraform plan as PR comment for review.

3.  **Infrastructure Deployment:**

    *   **Apply:** Automatically applies changes on merge to `main` (when WIF is configured).

    *   **Manual Option:** Can run Terraform locally without WIF setup.

    *   **Backend:** Uses Terraform Cloud for state management.

---

## Code Organization & Conventions

*   **Source:** Main worker logic is in `src/index.ts`.

*   **Configuration:** Worker settings are in `wrangler.jsonc`.

*   **Infrastructure:** Terraform configuration in `terraform/` directory.

*   **Testing:** Tests are located in `test/`.

*   **Workflows:** GitHub Actions definitions in `.github/workflows/`.

*   **Documentation:** Setup guides and implementation notes in root directory (`.md` files).

*   **Secrets:** Never commit secrets. Use `wrangler secret put` for runtime secrets and GitHub Secrets for CI/CD.

*   **PR Workflow:** All changes must go through a Pull Request. Direct commits to `main` are discouraged.

## AI Integration Guidelines

*   **Gateway First:** Do not call AI providers directly. Always route requests through the configured **AI Gateway**.

*   **Models:** Supports multiple AI models:
    *   `cloudflare` - Cloudflare AI (Llama 2 7B)
    *   `vertex-ai` - Google Vertex AI (Gemini models) - requires configuration

*   **Model Selection:** Models are selected via the `model` field in API requests. The `/status` endpoint shows available models based on configuration.

*   **Caching:** Responses are cached in KV (7-day TTL) to reduce inference costs and latency. Cache key includes both model and prompt.

*   **Vertex AI Setup:** Vertex AI requires:
    *   GCP Project ID, location, and model configuration
    *   Service account JSON key (created via Terraform)
    *   Secrets stored in Cloudflare Workers: `VERTEX_AI_PROJECT_ID`, `VERTEX_AI_LOCATION`, `VERTEX_AI_MODEL`, `VERTEX_AI_SERVICE_ACCOUNT_JSON`

## Infrastructure as Code

*   **Terraform:** All Google Cloud infrastructure is defined in `terraform/` directory.

*   **Automated Setup:** Terraform automatically:
    *   Enables required GCP APIs (Vertex AI, IAM, Secret Manager, etc.)
    *   Creates service accounts with appropriate IAM roles
    *   Sets up Secret Manager secrets

*   **Terraform Cloud:** Remote state is managed in Terraform Cloud. Configure via GitHub secrets:
    *   `TF_API_TOKEN` - Terraform Cloud API token
    *   `TF_CLOUD_ORGANIZATION` - Terraform Cloud organization
    *   `TF_WORKSPACE` - Workspace name (default: `not-sure`)

*   **Workload Identity Federation:** Optional but recommended for automated Terraform apply. See `WIF_SETUP_GUIDE.md` for setup.

*   **Manual Runs:** Terraform can be run locally for testing without WIF. See `LOCAL_TERRAFORM_RUN.md`.
