# Terraform Infrastructure for Vertex AI Integration

This directory contains Terraform configuration to automate the setup of Google Cloud infrastructure required for Vertex AI integration with the Cloudflare Workers application.

> **Note**: This configuration will be validated automatically via GitHub Actions on every push.

## Overview

This Terraform configuration creates:
- ✅ Vertex AI API enablement

**Future PRs will add:**
- Service account with appropriate IAM roles
- **Service account key generation (automatic!)**
- Secret Manager secret with stored service account JSON key
- IAM bindings for service account access

## Prerequisites

* **Terraform** ≥ 1.5.0 (version pinned in `versions.tf` to `< 2.0.0` for stability)
* **A Terraform Cloud account** with a **remote backend** (or use local backend for testing)
* **GCP project** with billing enabled
* **GCP authentication** configured:
  - For local: `gcloud auth application-default login`
  - For GitHub Actions: Workload Identity Federation (see workflow file)

## Usage

### Steps

1. **Configure Terraform Cloud Backend** (if using remote backend):

   **Important**: The Terraform Cloud backend configuration in `backend.tf` uses hardcoded values (backend blocks cannot use variables). If you need different values:
   
   - Edit `terraform/backend.tf` directly
   - Update the `organization` value (default: `disposable-org`)
   - Update the `workspace` name (default: `not-sure`)
   
   Current defaults:
   - Organization: `disposable-org` (update if different)
   - Workspace: `not-sure` (matches your workspace name)

2. **Create a `terraform.tfvars`** (or set environment variables):

   ```hcl
   project_id       = "my-gcp-project"
   vertex_ai_location = "us-central1"
   vertex_ai_model    = "gemini-3-pro-preview"
   ```
   
   Or set via environment variables (CI does this automatically):
   ```bash
   export TF_VAR_project_id="my-gcp-project"
   ```

3. **Initialize** the configuration (CI does this automatically):

   ```bash
   cd terraform
   terraform init
   ```

4. **Validate & format** (run locally or rely on CI):

   ```bash
   terraform fmt -check -recursive terraform/
   terraform validate
   ```

5. **Plan & apply** (once the backend is configured):

   ```bash
   terraform plan
   terraform apply
   ```

### Notes

* The `backend.tf` uses a fixed workspace name (`not-sure`) - the Terraform Cloud `cloud` backend only supports `name` or `tags`, not `prefix`.
* The `backend.tf` uses hardcoded organization name (required by Terraform - backend blocks cannot use variables).
* Variables have sensible defaults (see `variables.tf`) - only `project_id` is required.

## Post-Deployment Steps

> **Note**: These steps are for future PRs that will add service account resources. This PR only enables APIs.

After future PRs create service account resources:

1. **Retrieve Service Account Key** (automatically generated and stored by Terraform):
   ```bash
   # Option 1: Use helper script (easiest)
   ./terraform/scripts/get-service-account-key.sh [PROJECT_ID]
   
   # Option 2: Manual retrieval
   gcloud secrets versions access latest \
     --secret="VERTEX_AI_SERVICE_ACCOUNT_JSON" \
     --project=$(terraform output -raw project_id) | \
   wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON
   ```

2. **Set Other Cloudflare Worker Secrets**:
   ```bash
   wrangler secret put GCP_PROJECT_ID      # Same as GitHub secret
   wrangler secret put VERTEX_AI_LOCATION  # e.g., us-central1
   wrangler secret put VERTEX_AI_MODEL     # e.g., gemini-1.5-flash
   ```
   
   Or use API key instead (simpler):
   ```bash
   wrangler secret put GCP_PROJECT_ID
   wrangler secret put GEMINI_API_KEY      # Same API key works for both!
   ```

## GitHub Actions Integration

See `.github/workflows/terraform.yml` for automated Terraform execution via GitHub Actions with Terraform Cloud.

## Resources Created

This PR only creates API enablement resources:

- **APIs Enabled**:
  - `aiplatform.googleapis.com` - Vertex AI API
  - `iam.googleapis.com` - IAM API
  - `secretmanager.googleapis.com` - Secret Manager API
  - `cloudresourcemanager.googleapis.com` - Resource Manager API
  - `serviceusage.googleapis.com` - Service Usage API
  - `iamcredentials.googleapis.com` - IAM Credentials API (for Workload Identity Federation)
  - `sts.googleapis.com` - Security Token Service API (for Workload Identity Federation)

**Future PRs will create:**
- Service Account with appropriate IAM roles
- Secret Manager secret with service account JSON key
- IAM bindings for service account access

## Outputs

> **Note**: Outputs will be added in future PRs when service account resources are created.

After applying, Terraform currently has no outputs. Future PRs will add outputs like:
- `service_account_email`
- `secret_name`
- `setup_instructions`

## Troubleshooting

### API Enablement Fails

If API enablement times out, manually enable in GCP Console or retry:
```bash
gcloud services enable aiplatform.googleapis.com --project=YOUR_PROJECT_ID
```

### Service Account Key Generation

If key generation fails, ensure you have the `iam.serviceAccountKeyAdmin` role:
```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="user:YOUR_EMAIL" \
  --role="roles/iam.serviceAccountKeyAdmin"
```

## Cleanup

To destroy all resources:
```bash
terraform destroy
```

**Warning**: This will delete the service account and secret. Make sure you have backups if needed.

