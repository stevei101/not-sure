# Terraform Cloud Credentials Setup

## Problem

When running `terraform plan` on pull requests, Terraform Cloud executes the plan remotely. Remote execution requires GCP credentials to be configured in the Terraform Cloud workspace.

**Error you'll see:**
```
Error: Attempted to load application default credentials since neither `credentials` nor `access_token` was set in the provider block. No credentials loaded.
```

## Solution: Configure GOOGLE_CREDENTIALS in Terraform Cloud

### Option 1: Use Service Account Key (Recommended for Terraform Cloud)

1. **Create a service account key** (if you haven't already):
   ```bash
   gcloud iam service-accounts keys create terraform-cloud-key.json \
     --iam-account=YOUR_SERVICE_ACCOUNT@PROJECT_ID.iam.gserviceaccount.com
   ```

2. **Add GOOGLE_CREDENTIALS to Terraform Cloud workspace**:
   - Go to: https://app.terraform.io/app/YOUR_ORG/workspaces/not-sure/variables
   - Click "Add variable"
   - Key: `GOOGLE_CREDENTIALS`
   - Value: Paste the entire contents of `terraform-cloud-key.json`
   - Mark as: **Sensitive** ✅
   - Mark as: **Environment variable** ✅ (not Terraform variable)

3. **Save the variable**

### Option 2: Use Existing Service Account Key

If you already have a service account key (`cloudflare-workers-vertex-ai@vertex-ai-rag-search-p0.iam.gserviceaccount.com`):

1. Download the key:
   ```bash
   gcloud iam service-accounts keys list \
     --iam-account=cloudflare-workers-vertex-ai@vertex-ai-rag-search-p0.iam.gserviceaccount.com
   
   # Download the latest key
   gcloud iam service-accounts keys download KEY_ID \
     --iam-account=cloudflare-workers-vertex-ai@vertex-ai-rag-search-p0.iam.gserviceaccount.com
   ```

2. Add the JSON content to Terraform Cloud workspace as `GOOGLE_CREDENTIALS` (sensitive environment variable)

### Option 3: Create Terraform CI Service Account (Future)

Once the Terraform CI service account is created (via `service_account_ci.tf`), you can:

1. Generate a key from Terraform output
2. Add it to Terraform Cloud workspace

## Why This Is Needed

- **GitHub Actions**: Uses Workload Identity Federation (WIF) - no service account key needed
- **Terraform Cloud**: Runs on remote infrastructure - needs service account key via `GOOGLE_CREDENTIALS` environment variable

These are separate authentication methods for different execution environments.

## Temporary Workaround for PRs

Until credentials are configured, the workflow will:
- ✅ Still run validation (format, lint, validate) - these don't need credentials
- ⚠️ Skip or fail on `terraform plan` - this requires credentials

You can still merge PRs if validation passes, and configure credentials before first apply.

