# PR Epic Plan: Split PR #17 into Logical Feature Groups

## Overview

PR #17 contains **57 commits** with **6,509 additions** and **77 deletions**. This is too large for a single review. This document outlines how to split it into an epic of smaller, logically related PRs.

## Epic Structure

### Phase 1: Infrastructure Foundation (Prerequisites)
**Dependencies:** None  
**Purpose:** Set up Terraform infrastructure for GCP resources

#### PR 1.1: Terraform Infrastructure Setup
**Files:**
- `terraform/versions.tf`
- `terraform/provider.tf`
- `terraform/backend.tf`
- `terraform/variables.tf`
- `terraform/locals.tf`
- `terraform/apis.tf`
- `.github/workflows/terraform.yml` (initial setup)

**Commits to include:**
- Initial Terraform configuration
- Terraform Cloud backend setup
- Basic workflow setup

#### PR 1.2: Terraform Validation and CI/CD
**Files:**
- `.github/workflows/terraform.yml` (format check, validation, linting)
- `terraform/.gitignore`
- `.git/hooks/pre-push` (terraform fmt hook)
- `scripts/format-terraform.sh`
- `TERRAFORM_FORMAT_GUIDE.md`

**Commits to include:**
- Terraform format checking
- Pre-push hooks
- Validation workflow improvements

---

### Phase 2: Core Vertex AI Resources (Can be done in parallel with Phase 3)
**Dependencies:** Phase 1 complete  
**Purpose:** Create GCP service accounts and basic Vertex AI resources

#### PR 2.1: Vertex AI Service Account and IAM
**Files:**
- `terraform/iam.tf`
- `terraform/secret_manager.tf`
- `terraform/outputs.tf` (service account outputs)

**Commits to include:**
- Service account creation
- IAM roles assignment
- Secret Manager setup
- Automatic key generation

---

### Phase 3: Worker Vertex AI Integration (Can be done in parallel with Phase 2)
**Dependencies:** Phase 1 complete  
**Purpose:** Add Vertex AI support to the Cloudflare Worker

#### PR 3.1: Vertex AI API Integration
**Files:**
- `src/index.ts` (callVertexAI function)
- `wrangler.jsonc` (Vertex AI env vars)
- `test/index.spec.ts` (Vertex AI tests)

**Commits to include:**
- Initial Vertex AI integration
- API endpoint configuration
- Model selection logic

#### PR 3.2: Gemini Model Support Updates
**Files:**
- `src/index.ts` (model updates)
- `terraform/variables.tf` (model variable)
- `wrangler.jsonc` (model comments)
- `AVAILABLE_GEMINI_MODELS.md`

**Commits to include:**
- Update to gemini-3-pro-preview
- Add gemini-flash-latest support
- Model documentation

---

### Phase 4: Cloudflare AI Gateway Integration
**Dependencies:** Phase 3.1 complete  
**Purpose:** Route Vertex AI requests through Cloudflare AI Gateway

#### PR 4.1: AI Gateway Integration
**Files:**
- `src/index.ts` (getGatewayUrl, gateway routing)
- `wrangler.jsonc` (AI Gateway vars)
- `AI_GATEWAY_CONFIGURATION_ISSUE.md`
- `AI_GATEWAY_DYNAMIC_ROUTING.md`

**Commits to include:**
- Gateway URL construction
- Request routing through gateway
- Gateway configuration docs

---

### Phase 5: Workload Identity Federation (WIF)
**Dependencies:** Phase 2 complete  
**Purpose:** Secure authentication for GitHub Actions

#### PR 5.1: WIF Terraform Resources
**Files:**
- `terraform/wif.tf`
- `terraform/apis.tf` (WIF APIs)
- `terraform/variables.tf` (github_repository)
- `terraform/outputs.tf` (WIF outputs)
- `WIF_TERRAFORM_SETUP.md`

**Commits to include:**
- Workload Identity Pool
- OIDC Provider
- Service Account for GitHub Actions
- IAM bindings

#### PR 5.2: WIF Workflow Integration
**Files:**
- `.github/workflows/terraform.yml` (WIF auth, outputs)
- `WIF_SETUP_GUIDE.md` (if needed)

**Commits to include:**
- WIF authentication in workflow
- Output WIF values
- Conditional WIF setup

---

### Phase 6: Documentation and Improvements
**Dependencies:** All previous phases  
**Purpose:** Comprehensive documentation and polish

#### PR 6.1: Setup Documentation
**Files:**
- `VERTEX_AI_SETUP.md`
- `VERTEX_AI_IMPLEMENTATION_NOTES.md`
- `REQUIRED_SECRETS.md`
- `TERRAFORM_README.md` (updates)
- Various status/guide docs

**Commits to include:**
- Complete setup guides
- Implementation notes
- Troubleshooting docs

#### PR 6.2: Security and Best Practices
**Files:**
- `.gitignore` (updates)
- `SECURITY_GUIDELINES.md`
- `SECRETS_STATUS.md`
- Security-related commits

**Commits to include:**
- Security guidelines
- Secret management docs
- Git ignore improvements

---

## Implementation Strategy

### Option A: Sequential PRs (Recommended for Dependencies)
1. Merge PR 1.1 → 1.2 (Infrastructure foundation)
2. Merge PR 2.1 (Service accounts)
3. Merge PR 3.1 (Worker integration)
4. Merge PR 3.2 (Model updates)
5. Merge PR 4.1 (AI Gateway)
6. Merge PR 5.1 → 5.2 (WIF)
7. Merge PR 6.1 → 6.2 (Documentation)

### Option B: Parallel Development
- Branch from Phase 1 completion
- Develop Phase 2, 3, 4 in parallel branches
- Merge sequentially after review

---

## How to Split the PR

### Step 1: Create Base Branch
```bash
git checkout main
git pull origin main
git checkout -b epic/vertex-ai-infrastructure
```

### Step 2: Cherry-pick Commits for Each PR
For each PR above, cherry-pick relevant commits:
```bash
# Example: Create PR 1.1 branch
git checkout -b pr/terraform-infrastructure
git cherry-pick <commit-hash-1> <commit-hash-2> ...
```

### Step 3: Create PRs in Order
1. Create PR 1.1 targeting `main`
2. After merge, create PR 1.2 targeting `main`
3. Continue with remaining PRs

---

## Benefits of Splitting

✅ **Easier Reviews:** Smaller, focused PRs are easier to review  
✅ **Faster Feedback:** Get approvals on foundational pieces first  
✅ **Reduced Risk:** Smaller changes are easier to test and rollback  
✅ **Clear Progress:** Can track progress through the epic  
✅ **Parallel Development:** Some PRs can be worked on simultaneously  

---

## Current PR Status

**PR #17:** 57 commits, 6,509 additions, 77 deletions  
**Target:** Split into ~10-12 smaller PRs as outlined above

---

## Detailed Commit Mapping

### PR 1.1: Terraform Infrastructure Setup
**Branch:** `pr/terraform-infrastructure`  
**Target:** `main`  
**Commits:**
- Initial Terraform configuration (versions.tf, provider.tf, backend.tf, variables.tf, locals.tf)
- API enablement (apis.tf)
- Basic workflow setup (.github/workflows/terraform.yml - initial version)

### PR 1.2: Terraform Validation and CI/CD
**Branch:** `pr/terraform-ci`  
**Target:** `main` (after 1.1)  
**Commits:**
- `2085deb` - feat: Add automatic Terraform formatting before push
- `38a66cb` - style: Format Terraform files with terraform fmt
- Terraform format check in workflow
- Pre-push hooks
- Validation workflow improvements

### PR 2.1: Vertex AI Service Account and IAM
**Branch:** `pr/vertex-ai-iam`  
**Target:** `main` (after 1.1)  
**Commits:**
- `8eec673` - feat: Automatically generate and store service account key in Terraform
- `edbd10a` - feat: Add helper script to retrieve service account key from Secret Manager
- `d565db0` - docs: Add documentation for automatic service account key generation
- `efe82d6` - docs: Update README to reflect automatic service account key generation
- Service account creation (iam.tf)
- IAM roles assignment
- Secret Manager setup

### PR 3.1: Vertex AI Worker Integration (Initial)
**Branch:** `pr/vertex-ai-worker`  
**Target:** `main` (after 2.1)  
**Commits:**
- `39cbd14` - feat: Switch from Google AI Studio to Vertex AI
- `5d42d3e` - docs: Add required secrets documentation for Vertex AI
- `3d82922` - refactor: Use GCP_PROJECT_ID instead of VERTEX_AI_PROJECT_ID
- Initial callVertexAI function
- Environment variable configuration
- Basic tests

### PR 3.2: Vertex AI Authentication Methods
**Branch:** `pr/vertex-ai-auth`  
**Target:** `main` (after 3.1)  
**Commits:**
- `ca7a4de` - feat: Support API key authentication for Vertex AI
- `3123410` - fix: Complete API key support for Vertex AI authentication
- `52794ec` - docs: Update status endpoint to show API key auth method
- `4b27b39` - docs: Update secrets documentation to highlight API key reuse
- `6772583` - docs: Simplify secrets documentation to use GCP_PROJECT_ID
- `dbfb54b` - fix: Update status endpoint to use GCP_PROJECT_ID
- `b8d56bd` - fix: Update remaining references to use GCP_PROJECT_ID

### PR 3.3: Gemini Model Updates
**Branch:** `pr/gemini-models`  
**Target:** `main` (after 3.2)  
**Commits:**
- `19a7283` - feat: Update default Gemini model to gemini-3-pro-preview
- `6c6dc47` - docs: Add gemini-flash-latest and gemini-flash-lite-latest model options
- `0999f20` - docs: Update VERTEX_AI_SETUP.md with latest model options

### PR 4.1: Cloudflare AI Gateway Integration
**Branch:** `pr/ai-gateway`  
**Target:** `main` (after 3.1)  
**Commits:**
- AI Gateway URL construction
- Request routing through gateway
- Gateway configuration docs
- Related commits from earlier iterations

### PR 5.1: Workload Identity Federation
**Branch:** `pr/wif-setup`  
**Target:** `main` (after 2.1)  
**Commits:**
- `e77c9ad` - feat: Add Workload Identity Federation (WIF) Terraform resources
- `221ddff` - feat: Complete WIF Terraform setup with outputs and workflow integration
- `c3be703` - fix: Remove unsupported location argument from workload identity pool
- `2f25f33` - fix: Remove unsupported location argument from workload identity provider
- WIF pool and provider resources
- Workflow integration for WIF

### PR 5.2: Terraform Cloud Credentials Setup
**Branch:** `pr/terraform-cloud-creds`  
**Target:** `main` (can be parallel with others)  
**Commits:**
- `a700ca5` - feat: Add automated script for Terraform Cloud credentials setup
- `106d420` - docs: Add Terraform Cloud GCP credentials setup guide
- `a33f546` - docs: Add Terraform Cloud setup status document
- `9c34930` - docs: Add quick guides for running Terraform Cloud credentials script
- `03e8276` - docs: Add Terraform variables setup guide

### PR 6.1: Terraform Workflow Improvements
**Branch:** `pr/terraform-workflow`  
**Target:** `main` (after 1.1)  
**Commits:**
- `9a92113` - fix: Add TF_VAR_project_id environment variable for Terraform Cloud
- `9ff5977` - fix: Pass project_id variable via -var flag for Terraform Cloud
- `23b7ffb` - revert: Restore workflow to run validation on all branches
- `7320012` - fix: Change Terraform workflow to only trigger on main branch
- `be045f4` - docs: Add quick reference for checking Terraform status
- `f7e66e6` - docs: Add Terraform apply status tracking document

### PR 6.2: Documentation and References
**Branch:** `pr/documentation`  
**Target:** `main` (can be parallel)  
**Commits:**
- `c6eccac` - docs: Add Gemini File Search reference analysis
- `5dd33b0` - docs: Add reference repositories analysis document
- `7780d70` - docs: Add Dynamic Routing setup guide for Cloudflare AI Gateway
- Various documentation updates

### PR 6.3: Security and Quality
**Branch:** `pr/security-quality`  
**Target:** `main` (can be parallel)  
**Commits:**
- `f3fb1e6` - security: Add comprehensive .gitignore and security guidelines
- `4c8b779` - docs: Add Pull Request template
- `ef09ad8` - fix: Resolve TFLint warnings
- `26cc615` - fix: Use hardcoded values in Terraform Cloud backend configuration

### PR 6.4: Bug Fixes and Improvements
**Branch:** `pr/bugfixes`  
**Target:** `main` (after core PRs)  
**Commits:**
- `2604731` - fix: Add missing build script for Cloudflare build system
- `b64623a` - fix: Add missing comma after routes array in wrangler.jsonc
- `dbe47e9` - fix: Improve error handling for better debugging
- `e7c9497` - fix: Improve error message extraction and document AI Gateway configuration issue
- Various bug fixes

---

## Next Steps

1. Review this plan and confirm the groupings
2. Close PR #17 with a note about the epic split: "Splitting this large PR into an epic of smaller, focused PRs for easier review. See PR_EPIC_PLAN.md for details."
3. Create branches from `main` for each PR in sequence
4. Cherry-pick or recreate commits for each logical group
5. Create PRs in dependency order (starting with PR 1.1)
6. Merge sequentially following the dependency chain

## Quick Reference: PR Creation Order

```
1. PR 1.1: Terraform Infrastructure Setup
   ↓
2. PR 1.2: Terraform Validation and CI/CD
   ↓
3. PR 2.1: Vertex AI Service Account and IAM (can parallel with 3.1)
   ↓
4. PR 3.1: Vertex AI Worker Integration (Initial)
   ↓
5. PR 3.2: Vertex AI Authentication Methods
   ↓
6. PR 3.3: Gemini Model Updates
   ↓
7. PR 4.1: Cloudflare AI Gateway Integration
   ↓
8. PR 5.1: Workload Identity Federation
   ↓
9. PR 5.2: Terraform Cloud Credentials Setup
   ↓
10. PR 6.1: Terraform Workflow Improvements
11. PR 6.2: Documentation and References (parallel)
12. PR 6.3: Security and Quality (parallel)
13. PR 6.4: Bug Fixes and Improvements
```

