# Terraform Infrastructure for Vertex AI Integration

This directory contains Terraform configuration to automate the setup of Google Cloud infrastructure required for Vertex AI integration with the Cloudflare Workers application.

> **Note**: This configuration will be validated automatically via GitHub Actions on every push.

## Overview

This Terraform configuration creates:
- ✅ Vertex AI API enablement
- ✅ Service account with appropriate IAM roles for Vertex AI access
- ✅ Service account key generation (automatic JSON key)
- ✅ Secret Manager secret with stored service account JSON key
- ✅ IAM bindings for service account access

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

After Terraform creates the service account and stores the key:

1. **Retrieve Service Account Key** (automatically generated and stored by Terraform):
   ```bash
   # Option 1: Use gcloud directly
   gcloud secrets versions access latest \
     --secret="vertex-ai-service-account-key" \
     --project=$(terraform output -raw project_id) | \
   wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON
   
   # Option 2: Using Terraform output (shows exact command)
   terraform output setup_instructions
   ```

2. **Set Other Cloudflare Worker Secrets**:
   ```bash
   wrangler secret put GCP_PROJECT_ID      # Same as GitHub secret
   wrangler secret put VERTEX_AI_LOCATION  # e.g., us-central1
   wrangler secret put VERTEX_AI_MODEL     # e.g., gemini-3-pro-preview
   ```
   
   Or use API key instead (simpler, but less secure):
   ```bash
   wrangler secret put GCP_PROJECT_ID
   wrangler secret put GEMINI_API_KEY      # Same API key works for both!
   ```

## GitHub Actions Integration

See `.github/workflows/terraform.yml` for automated Terraform execution via GitHub Actions with Terraform Cloud.

## Resources Created

### APIs Enabled
- `aiplatform.googleapis.com` - Vertex AI API
- `iam.googleapis.com` - IAM API
- `secretmanager.googleapis.com` - Secret Manager API
- `cloudresourcemanager.googleapis.com` - Resource Manager API
- `serviceusage.googleapis.com` - Service Usage API
- `iamcredentials.googleapis.com` - IAM Credentials API (for Workload Identity Federation)
- `sts.googleapis.com` - Security Token Service API (for Workload Identity Federation)

### Service Account Resources
- **Service Account**: `cloudflare-workers-vertex-ai` (default) or configured via `service_account_id` variable
  - IAM Roles:
    - `roles/aiplatform.user` - Vertex AI access
    - `roles/iam.serviceAccountUser` - Service account usage
- **Service Account Key**: JSON key automatically generated and stored
- **Secret Manager Secret**: `vertex-ai-service-account-key`
  - Stores the service account JSON key securely
  - Automatically replicated across regions

## Outputs

After applying, Terraform provides these outputs:

- `service_account_email` - Email of the service account
- `service_account_id` - Resource ID of the service account
- `secret_name` - Name of the Secret Manager secret containing the key
- `secret_project` - Project ID where the secret is stored
- `setup_instructions` - Instructions for retrieving the service account key

To view outputs:
```bash
terraform output
terraform output service_account_email
terraform output setup_instructions
```

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

