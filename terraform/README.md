# Terraform Infrastructure for Vertex AI Integration

This directory contains Terraform configuration to automate the setup of Google Cloud infrastructure required for Vertex AI integration with the Cloudflare Workers application.

> **Note**: This configuration will be validated automatically via GitHub Actions on every push.

## Overview

This Terraform configuration creates:
- ✅ Vertex AI API enablement
- ✅ Service account with appropriate IAM roles
- ✅ Secret Manager secret for storing service account credentials
- ✅ IAM bindings for service account access

## Prerequisites

1. **Google Cloud Project**: You need a GCP project ID
2. **Terraform Cloud**: Set up a Terraform Cloud workspace (or modify `backend.tf` for local state)
3. **Authentication**: Configure authentication for Terraform to access GCP
   - For local: `gcloud auth application-default login`
   - For GitHub Actions: Workload Identity Federation (see workflow file)

## Configuration

### 1. Configure Terraform Cloud Backend

**Important**: The Terraform Cloud backend configuration in `backend.tf` uses hardcoded values (cannot use variables). If you need different values:

1. Edit `terraform/backend.tf` directly
2. Update the `organization` and `workspace` name values

Current defaults:
- Organization: `disposable-org`
- Workspace: `not-sure`

### 2. Set Variables

Create a `terraform.tfvars` file (or use environment variables):

```hcl
project_id              = "your-gcp-project-id"
vertex_ai_location      = "us-central1"
vertex_ai_model         = "gemini-1.5-pro"
service_account_id      = "not-sure-vertex-ai"
```

### 2. Initialize Terraform

```bash
cd terraform
terraform init
```

### 3. Plan and Apply

```bash
terraform plan
terraform apply
```

## Post-Deployment Steps

After Terraform creates the infrastructure:

1. **Generate Service Account Key**:
   ```bash
   ./scripts/generate-and-store-key.sh
   ```

2. **Set Cloudflare Worker Secrets**:
   ```bash
   wrangler secret put VERTEX_AI_PROJECT_ID
   wrangler secret put VERTEX_AI_LOCATION  
   wrangler secret put VERTEX_AI_MODEL
   wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON
   ```

## GitHub Actions Integration

See `.github/workflows/terraform.yml` for automated Terraform execution via GitHub Actions with Terraform Cloud.

## Outputs

After applying, Terraform will output:
- `service_account_email`: Use this for reference
- `project_id`: GCP Project ID
- `vertex_ai_location`: Vertex AI region
- `vertex_ai_model`: Model name
- `secret_name`: Secret Manager secret name
- `setup_instructions`: Next steps for completing the setup

## Resources Created

- **APIs Enabled**:
  - `aiplatform.googleapis.com` - Vertex AI API
  - `iam.googleapis.com` - IAM API
  - `secretmanager.googleapis.com` - Secret Manager API
  - `cloudresourcemanager.googleapis.com` - Resource Manager API
  - `serviceusage.googleapis.com` - Service Usage API

- **Service Account**: 
  - Name: `not-sure-vertex-ai` (configurable)
  - Roles:
    - `roles/aiplatform.user`
    - `roles/aiplatform.serviceAgent`
    - `roles/secretmanager.secretAccessor`

- **Secret Manager Secret**:
  - Name: `VERTEX_AI_SERVICE_ACCOUNT_JSON`
  - Contains: Service account JSON key (added after creation)

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

