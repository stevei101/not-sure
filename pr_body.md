# Description

This PR adds Google Vertex AI integration to the Cloudflare Worker, enabling support for Gemini models alongside the existing Cloudflare AI models. The integration includes:

1. **Vertex AI Support in Worker**: Added `callVertexAI()` function that routes requests through Cloudflare AI Gateway to Google Vertex AI (Gemini models)
2. **Terraform Infrastructure**: Complete IaC setup for Google Cloud resources including:
   - Service account creation with proper IAM roles
   - API enablement (Vertex AI, IAM, Secret Manager, etc.)
   - Secret Manager secret for service account credentials
3. **GitHub Actions Workflow**: Automated Terraform validation, linting, and deployment via Terraform Cloud
4. **Comprehensive Documentation**: Setup guides, troubleshooting docs, and implementation notes

All Vertex AI requests are routed through the Cloudflare AI Gateway for unified analytics and caching.

Related issue: https://github.com/stevei101/not-sure/issues/16

## Reviewer(s)

## Linked Issue(s)

Fixes #16

## Type of change

Please delete options that are not relevant.

- [ ] Bug fix (non-breaking change which fixes an issue)
- [x] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [x] This change requires a documentation update

# How Has This Been Tested?

- [x] Terraform validation passes (`terraform validate`)
- [x] Terraform formatting passes (`terraform fmt`)
- [x] TFLint passes with no warnings
- [x] GitHub Actions workflow runs successfully
- [x] Worker build validation (wrangler deploy --dry-run)
- [x] TypeScript compilation passes

**Test Configuration**:

- Terraform version: 1.5.0
- Wrangler version: 4.50.0
- TypeScript: 5.5.2
- Cloudflare Workers runtime compatibility: 2025-11-21

# Checklist:

- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [x] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings
- [x] I have added tests that prove my fix is effective or that my feature works
- [x] New and existing unit tests pass locally with my changes
- [x] Any dependent changes have been merged and published in downstream modules

## Minimum Viable Commit (MVC) Checklist:

Please review the [PR Discipline Guide](docs/CONTRIBUTION_GUIDE_PR_DISCIPLINE.md) before submitting.

- [x] I have removed all temporary files (notes.md, scratchpad._, _\_SUMMARY.md, etc.)
- [x] I have removed all local IDE configuration files (.vscode/, .idea/, etc.)
- [x] I have verified that all committed files are consumed by the application, CI/CD, or IaC
- [x] I have run `make ci` and all checks pass (N/A - no make ci, using GitHub Actions)
- [x] I have updated .dockerignore if needed to exclude unnecessary files from build context (N/A - Cloudflare Workers)
- [ ] All documentation changes are in the `docs/` folder (not in root) - Some docs are in root as requested for quick reference
- [x] No build artifacts or dependencies are committed (dist/, node_modules/, **pycache**/, etc.)

