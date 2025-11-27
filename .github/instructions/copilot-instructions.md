# GitHub Copilot Custom Instructions for not-sure

These instructions help GitHub Copilot understand the not-sure project structure, conventions, and best practices.

## Project Overview

**not-sure** is a serverless AI-powered RAG (Retrieval-Augmented Generation) application running on Cloudflare Workers. It provides multi-model AI inference with intelligent caching and routing through Cloudflare AI Gateway.

## Technology Stack

### Frontend & Runtime
- **Runtime:** Cloudflare Workers (serverless edge computing)
- **Language:** TypeScript (strict typing)
- **Package Manager:** Bun (fast dependency management and testing)
- **Build Tool:** Wrangler (Cloudflare Workers CLI)
- **Testing:** Vitest with `@cloudflare/vitest-pool-workers`

### AI & Infrastructure
- **AI Gateway:** Cloudflare AI Gateway (unified routing, analytics, caching)
- **AI Models:** 
  - Cloudflare AI (Llama 2 7B)
  - Google Vertex AI (Gemini models - planned/integration)
- **Storage:** 
  - Cloudflare KV (caching and session data)
  - Cloudflare R2 (asset storage)
- **Infrastructure:** Terraform (Google Cloud Platform resources)

### DevOps & CI/CD
- **CI/CD:** GitHub Actions
- **Infrastructure as Code:** Terraform (with Terraform Cloud backend)
- **Cloud Provider:** Google Cloud Platform (for Vertex AI integration)

## Code Organization

### Directory Structure
```
not-sure/
├── src/
│   └── index.ts          # Main Cloudflare Worker entry point
├── test/
│   └── index.spec.ts     # Unit tests using Vitest
├── public/               # Static assets (HTML, CSS, JS)
├── terraform/            # Infrastructure as Code
│   ├── *.tf             # Terraform configuration files
│   └── scripts/         # Helper scripts for deployment
├── .github/
│   ├── workflows/       # GitHub Actions workflows
│   └── instructions/    # This file (Copilot instructions)
└── wrangler.jsonc       # Cloudflare Workers configuration
```

### Key Files
- `src/index.ts` - Main worker logic with AI model routing
- `wrangler.jsonc` - Cloudflare Workers configuration (bindings, routes, vars)
- `terraform/` - GCP infrastructure configuration
- `.github/workflows/` - CI/CD pipelines

## Coding Conventions

### TypeScript Standards
- **Type Safety:** Use strict TypeScript with explicit types
- **Interfaces:** Define interfaces for environment variables and request/response types
- **Error Handling:** Use try/catch blocks with meaningful error messages
- **Async/Await:** Prefer async/await over promises for readability

### Cloudflare Workers Patterns
- **ExportedHandler:** Use `ExportedHandler<Env>` for type-safe worker handlers
- **Request Handling:** Check HTTP method and pathname early, return 404 for unsupported routes
- **Environment Variables:** Access via `env` parameter, validate presence before use
- **KV Storage:** Use for caching (1-week TTL for AI responses)

### Error Handling
- **Early Returns:** Guard clauses for invalid requests (return 400/404 early)
- **Error Responses:** Always return JSON: `{ error: string, model?: string }`
- **Status Codes:**
  - `400` - Bad request (missing/invalid input)
  - `404` - Route not found
  - `500` - Server error (with error message)

### Function Patterns
- **RORO Pattern:** Receive an Object, Return an Object for functions
- **Pure Functions:** Prefer pure functions where possible
- **Helper Functions:** Extract reusable logic (e.g., `hashPrompt`, `getGatewayUrl`)
- **Type Guards:** Validate model types before dispatching

## AI Integration Guidelines

### Cloudflare AI Gateway First
- **Always route through AI Gateway** - Never call AI providers directly
- **Gateway URL Construction:** Use helper function `getGatewayUrl()` to build correct paths
- **Account/Gateway IDs:** Read from environment variables (`ACCOUNT_ID`, `AI_GATEWAY_ID`)
- **Custom Domains:** Support `AI_GATEWAY_SKIP_PATH_CONSTRUCTION` flag for custom domains

### Model Support
- **Current Models:** `cloudflare` (Llama 2), `gemini` (Vertex AI - integration in progress)
- **Model Validation:** Always validate model in `validModels` array before processing
- **Type Safety:** Use `AIModel` union type: `"cloudflare" | "gemini"`

### Caching Strategy
- **Cache Key:** Hash of `model:prompt` using SHA-256
- **TTL:** 1 week (604800 seconds) for cached responses
- **Cache Check:** Always check KV cache before making AI calls
- **Conditional Caching:** Only cache non-empty answers

### API Endpoints

#### Health Check: `GET /status`
- Returns: JSON with `ok`, `version`, `timestamp`, `models`, `gatewayId`, `gatewayUrl`
- Purpose: Verify worker is running and show gateway configuration

#### Query Endpoint: `POST /query`
- **Request Body:**
  ```typescript
  {
    prompt: string;  // Required
    model?: "cloudflare" | "gemini";  // Optional, defaults to "cloudflare"
  }
  ```
- **Response:**
  ```typescript
  {
    answer: string;
    cached: boolean;
    model: string;
  }
  ```
- **Error Response:**
  ```typescript
  {
    error: string;
    model?: string;
  }
  ```

## Infrastructure (Terraform)

### Terraform Conventions
- **Backend:** Terraform Cloud (remote state management)
- **Provider:** Google Cloud Platform (`~> 5.0`)
- **File Organization:** One resource type per file (e.g., `service_account.tf`, `apis.tf`)
- **Variables:** Define all variables in `variables.tf` with descriptions and defaults
- **Outputs:** Use `outputs.tf` for important values (service account email, secret names)

### Resource Dependencies
- **Explicit Dependencies:** Use `depends_on` for API enablement before resource creation
- **Service Account:** Created with IAM roles for Vertex AI access
- **Secret Manager:** Stores service account keys securely
- **API Enablement:** All required APIs enabled in `apis.tf`

### Terraform Workflow
- **Validation:** Always run `terraform fmt` and `terraform validate` before committing
- **State Management:** Use Terraform Cloud for remote state
- **Import Existing Resources:** Use import guides when bringing existing resources under management

## Testing Standards

### Unit Tests
- **Framework:** Vitest with `@cloudflare/vitest-pool-workers`
- **Location:** `test/index.spec.ts`
- **Coverage:** Aim for 70%+ test coverage for new code
- **Test Structure:** Use descriptive test names and arrange/act/assert pattern

### Manual Testing
- **Local Development:** `bun run dev` or `wrangler dev`
- **Health Check:** `curl http://localhost:8787/status`
- **Query Test:** `curl -X POST http://localhost:8787/query -d '{"prompt":"test"}'`

## Git & PR Workflow

### Branch Naming
- **Feature Branches:** `pr/feature-name` or `feat/feature-name`
- **Fix Branches:** `fix/issue-description`
- **PR Naming:** Descriptive titles starting with PR number if part of epic (e.g., "PR 2.1: Service Account...")

### Commit Messages
- **Format:** `[cursor-ide] type: description` (for work done with Cursor IDE)
- **Types:** `feat`, `fix`, `docs`, `refactor`, `style`, `test`
- **PR Labels:** Always tag PRs with `cursor-ide` label if created with Cursor IDE

### PR Requirements
- **Target Branch:** Usually `develop` (not `main`)
- **Description:** Use PR description templates when available
- **Validation:** All CI checks must pass (Terraform validation, tests, formatting)
- **Review:** Address all code review comments before merge

## Security Best Practices

### Secrets Management
- **Never Commit Secrets:** Use Cloudflare Workers secrets (`wrangler secret put`)
- **GitHub Secrets:** Store CI/CD secrets in GitHub repository settings
- **Secret Manager:** Use Google Secret Manager for service account keys
- **Environment Variables:** Sensitive values in `wrangler.jsonc` should be placeholders

### Access Control
- **Least Privilege:** Grant minimum required IAM roles
- **Service Accounts:** Use dedicated service accounts for different purposes
- **API Keys:** Rotate keys regularly, use Secret Manager for storage

## Performance Considerations

### Caching
- **KV Cache:** Use for AI responses to reduce costs and latency
- **Cache Key Strategy:** Include model name in cache key for model-specific caching
- **TTL Management:** 1-week TTL for AI responses balances freshness vs. cost

### AI Gateway Benefits
- **Request Deduplication:** Gateway handles duplicate requests automatically
- **Analytics:** All requests logged in Cloudflare AI Gateway dashboard
- **Rate Limiting:** Gateway provides built-in rate limiting

## Common Patterns & Examples

### Adding a New AI Model
1. Update `AIModel` type to include new model name
2. Add model to `validModels` array
3. Create `call<Model>AI()` function following existing pattern
4. Update `callAI()` dispatcher with new case
5. Test with `/query` endpoint

### Adding a New Endpoint
1. Add route check in `fetch` handler
2. Implement endpoint logic
3. Return JSON responses with appropriate status codes
4. Add tests in `test/index.spec.ts`
5. Document in README or inline comments

### Terraform Resource Creation
1. Create resource file (e.g., `resource_name.tf`)
2. Define resource with proper dependencies
3. Add variables if needed in `variables.tf`
4. Add outputs if needed in `outputs.tf`
5. Run `terraform fmt` and `terraform validate`
6. Update README if needed

## What NOT to Do

### ❌ Don't
- Call AI providers directly (always use AI Gateway)
- Commit secrets or API keys
- Skip error handling
- Use `any` types without good reason
- Create resources without Terraform
- Commit service account key files (use Secret Manager)
- Bypass the PR review process

### ✅ Do
- Route all AI calls through Cloudflare AI Gateway
- Use TypeScript types for all function parameters
- Handle errors gracefully with user-friendly messages
- Cache AI responses in KV
- Manage infrastructure with Terraform
- Use Secret Manager for sensitive data
- Follow PR workflow with proper descriptions

## References

- **Cloudflare Workers Docs:** https://developers.cloudflare.com/workers/
- **Cloudflare AI Gateway:** https://developers.cloudflare.com/ai-gateway/
- **Terraform GCP Provider:** https://registry.terraform.io/providers/hashicorp/google/latest/docs
- **Project System Instructions:** See `.github/system-instruction.md`

## Workflow Integration

When suggesting code:
- **Match existing patterns** - Look at `src/index.ts` for examples
- **Follow TypeScript conventions** - Use proper types, interfaces, and error handling
- **Consider caching** - Always think about when to cache results
- **Gateway-first** - Always route through AI Gateway, never direct API calls
- **Terraform dependencies** - Ensure proper resource ordering and dependencies

