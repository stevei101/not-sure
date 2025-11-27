# Required Secrets for Vertex AI Integration

## Current Status (After Migration to Vertex AI)

We've switched from **Google AI Studio** (API key) to **Vertex AI** (service account). Here are the required secrets:

## Required Secrets

### 1. **VERTEX_AI_PROJECT_ID** (Environment Variable or Secret)
   - **Type**: String
   - **Example**: `my-gcp-project-12345`
   - **Source**: Your Google Cloud Project ID
   - **Set via**: `wrangler secret put VERTEX_AI_PROJECT_ID` OR add to `wrangler.jsonc` vars (not recommended for production)

### 2. **VERTEX_AI_LOCATION** (Environment Variable or Secret)
   - **Type**: String
   - **Example**: `us-central1`
   - **Default**: `us-central1` (if not set)
   - **Options**: `us-central1`, `us-east4`, `europe-west3`, `europe-west4`, etc.
   - **Set via**: `wrangler secret put VERTEX_AI_LOCATION` OR add to `wrangler.jsonc` vars

### 3. **VERTEX_AI_MODEL** (Environment Variable - Optional)
   - **Type**: String
   - **Example**: `gemini-1.5-flash` or `gemini-2.5-flash`
   - **Default**: `gemini-1.5-flash` (if not set)
   - **Set via**: `wrangler secret put VERTEX_AI_MODEL` OR add to `wrangler.jsonc` vars

### 4. **VERTEX_AI_SERVICE_ACCOUNT_JSON** (Secret - REQUIRED)
   - **Type**: Secret (JSON string)
   - **Content**: Entire service account JSON key file contents
   - **Example**:
     ```json
     {
       "type": "service_account",
       "project_id": "my-project",
       "private_key_id": "...",
       "private_key": "-----BEGIN PRIVATE KEY-----\n...",
       "client_email": "...",
       "client_id": "...",
       "auth_uri": "https://accounts.google.com/o/oauth2/auth",
       "token_uri": "https://oauth2.googleapis.com/token",
       ...
     }
     ```
   - **Set via**: `cat service-account-key.json | wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON`
   - **⚠️ IMPORTANT**: This is sensitive - never commit to git

## Removed Secrets

These are **no longer needed** after switching to Vertex AI:

- ❌ **GOOGLE_AI_STUDIO_TOKEN** - Removed (was for Google AI Studio API key)

## How to Set Secrets

### Option 1: Using Wrangler CLI

```bash
# Set project ID
wrangler secret put VERTEX_AI_PROJECT_ID
# Enter your GCP project ID when prompted

# Set location (optional - defaults to us-central1)
wrangler secret put VERTEX_AI_LOCATION
# Enter region (e.g., us-central1)

# Set model (optional - defaults to gemini-1.5-flash)
wrangler secret put VERTEX_AI_MODEL
# Enter model name (e.g., gemini-1.5-flash)

# Set service account JSON (REQUIRED)
cat path/to/service-account-key.json | wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON
# Or paste the entire JSON content when prompted
```

### Option 2: Using Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com/1d361f061ebf3d1a293900bdb815db26/workers/services/view/not-sure/settings
2. Navigate to **Settings** → **Variables and Secrets**
3. Add the following:

   **Environment Variables** (can be plain text):
   - `VERTEX_AI_PROJECT_ID`: Your GCP project ID
   - `VERTEX_AI_LOCATION`: Region (e.g., `us-central1`)
   - `VERTEX_AI_MODEL`: Model name (e.g., `gemini-1.5-flash`)

   **Secrets** (encrypted):
   - `VERTEX_AI_SERVICE_ACCOUNT_JSON`: Paste entire service account JSON file contents

## Getting the Service Account Key

If you're using Terraform (recommended), the service account is created automatically. To generate a key:

```bash
# After Terraform creates the infrastructure
export PROJECT_ID="your-project-id"
export SERVICE_ACCOUNT_EMAIL="your-sa@project.iam.gserviceaccount.com"

gcloud iam service-accounts keys create vertex-ai-key.json \
  --iam-account=${SERVICE_ACCOUNT_EMAIL} \
  --project=${PROJECT_ID}

# Then set as secret
cat vertex-ai-key.json | wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON

# Clean up local file
rm vertex-ai-key.json
```

Or use the helper script:
```bash
./terraform/scripts/generate-and-store-key.sh
```

## Verification

Check if secrets are set correctly:

```bash
# Check status endpoint
curl https://lornu.ai/status

# Should show:
# "vertexAI": {
#   "projectId": "...",
#   "location": "...",
#   "model": "...",
#   "configured": true
# }
```

## Summary

| Secret/Variable | Required | Type | Default |
|----------------|----------|------|---------|
| `VERTEX_AI_PROJECT_ID` | ✅ Yes | Env Var or Secret | None |
| `VERTEX_AI_LOCATION` | ⚠️ Recommended | Env Var or Secret | `us-central1` |
| `VERTEX_AI_MODEL` | ⚠️ Optional | Env Var or Secret | `gemini-1.5-flash` |
| `VERTEX_AI_SERVICE_ACCOUNT_JSON` | ✅ Yes | Secret | None |
| `GOOGLE_AI_STUDIO_TOKEN` | ❌ No | Removed | N/A |

