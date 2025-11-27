# Terraform Cloud Authentication Setup

## Problem

When running `terraform plan` on pull requests, Terraform Cloud executes the plan remotely. Remote execution requires GCP authentication to be configured in the Terraform Cloud workspace.

**Error you'll see:**
```
Error: Attempted to load application default credentials since neither `credentials` nor `access_token` was set in the provider block. No credentials loaded.
```

## Solution Options

### Option 1: GCP Workspace Integration (Recommended)

Terraform Cloud supports GCP workspace integration for automatic authentication. No service account keys needed!

1. **Go to Terraform Cloud workspace settings**:
   - Navigate to: https://app.terraform.io/app/YOUR_ORG/workspaces/not-sure/settings/integrations
   - Or: Workspace → Settings → Integrations

2. **Configure GCP Integration**:
   - Click "Connect a GCP integration"
   - Follow the setup wizard to link your GCP project
   - Terraform Cloud will handle authentication automatically

3. **Verify**:
   - The integration should appear in workspace settings
   - Plans and applies will authenticate automatically

**Benefits:**
- ✅ No service account keys to manage
- ✅ Automatic credential rotation
- ✅ More secure (no keys stored)

### Option 2: Use GOOGLE_CREDENTIALS Environment Variable (Fallback)

If GCP workspace integration isn't available, use service account keys:

#### Using Service Account Key (Fallback Method)

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

#### Using Existing Service Account Key

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

## Authentication Methods Summary

- **GitHub Actions**: Uses Workload Identity Federation (WIF) - no service account key needed
- **Terraform Cloud (Recommended)**: Uses GCP workspace integration - automatic authentication, no keys needed
- **Terraform Cloud (Fallback)**: Uses `GOOGLE_CREDENTIALS` environment variable - requires service account key JSON

**Best Practice**: Use GCP workspace integration when available. Service account keys are only needed as a fallback.

## Temporary Workaround for PRs

Until credentials are configured, the workflow will:
- ✅ Still run validation (format, lint, validate) - these don't need credentials
- ⚠️ Skip or fail on `terraform plan` - this requires credentials

You can still merge PRs if validation passes, and configure credentials before first apply.

