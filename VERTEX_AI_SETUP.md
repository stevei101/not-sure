# Vertex AI Integration Setup Guide

This guide explains how to configure Google Vertex AI integration for the Cloudflare Workers-based RAG engine.

## Overview

The worker now supports Google Vertex AI (Gemini models) in addition to Cloudflare AI. All AI requests are routed through Cloudflare AI Gateway for unified analytics, caching, and monitoring.

## Prerequisites

1. **Google Cloud Platform (GCP) Account**
   - Create an account at [https://cloud.google.com/](https://cloud.google.com/)
   - New users may be eligible for $300 free credits valid for 90 days

2. **Enable Vertex AI API**
   - Navigate to the [Vertex AI API page](https://console.cloud.google.com/vertex-ai)
   - Enable the Vertex AI API for your project
   - Apply for access to Gemini models if required

3. **Cloudflare AI Gateway**
   - Ensure your Cloudflare AI Gateway is configured (already set up)
   - Refer to your Cloudflare dashboard for gateway configuration details

## Configuration Steps

### Option 1: Automated Setup with Terraform (Recommended)

This project includes Terraform configuration to automate the entire Google Cloud setup. This is the recommended approach as it ensures consistency and can be version-controlled.

#### Prerequisites for Terraform

1. **Terraform Cloud Account**: Set up at [terraform.io](https://app.terraform.io)
2. **GitHub Secrets**: Configure the following secrets in your repository:
   - `GCP_PROJECT_ID` - Your Google Cloud Project ID
   - `TF_CLOUD_ORGANIZATION` - Your Terraform Cloud organization name
   - `TF_WORKSPACE` - Terraform Cloud workspace name (default: `not-sure`)
   - `TF_API_TOKEN` - Terraform Cloud API token
   - `WIF_PROVIDER` - Workload Identity Federation provider (for GitHub Actions)
   - `WIF_SERVICE_ACCOUNT` - Service account email for WIF

#### Automated Setup Steps

1. **Configure Terraform Variables**:
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

2. **Run Terraform** (automatically via GitHub Actions):
   - Push changes to the `terraform/` directory
   - GitHub Actions will run `terraform plan` on PRs
   - Merge to `main` to automatically run `terraform apply`

3. **Generate and Store Service Account Key**:
   After Terraform creates the infrastructure, run:
   ```bash
   export PROJECT_ID="your-project-id"
   export SERVICE_ACCOUNT_EMAIL=$(terraform output -raw service_account_email)
   ./terraform/scripts/generate-and-store-key.sh
   ```

4. **Set Cloudflare Worker Secrets**:
   ```bash
   wrangler secret put VERTEX_AI_PROJECT_ID
   wrangler secret put VERTEX_AI_LOCATION
   wrangler secret put VERTEX_AI_MODEL
   wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON
   ```

For more details, see [terraform/README.md](terraform/README.md).

### Option 2: Manual Setup

If you prefer to set up manually or need to configure specific settings:

### 1. Create a Service Account

1. Go to [GCP IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click **Create Service Account**
3. Provide a name and description (e.g., "cloudflare-workers-vertex-ai")
4. Click **Create and Continue**
5. Grant the following roles:
   - **Vertex AI User** (`roles/aiplatform.user`)
   - **Vertex AI Service Agent** (`roles/aiplatform.serviceAgent`)
6. Click **Done**

### 2. Generate Service Account Key

1. Find your newly created service account in the list
2. Click on the service account email
3. Go to the **Keys** tab
4. Click **Add Key** > **Create New Key**
5. Select **JSON** format
6. Download the JSON key file
7. **Keep this file secure** - it contains sensitive credentials

### 3. Generate and Store Service Account Key

After creating the service account, generate a JSON key:

```bash
gcloud iam service-accounts keys create vertex-ai-key.json \
  --iam-account=SERVICE_ACCOUNT_EMAIL \
  --project=YOUR_PROJECT_ID
```

**⚠️ IMPORTANT**: Store this key securely. You'll need it for the Cloudflare Worker configuration.

### 4. Configure Cloudflare Worker Environment Variables

#### Option A: Using Wrangler CLI (Recommended for Local Development)

1. Set the Vertex AI configuration variables:

```bash
# Set project configuration
wrangler secret put VERTEX_AI_PROJECT_ID
# Enter your GCP project ID when prompted

wrangler secret put VERTEX_AI_LOCATION
# Enter your preferred region (e.g., "us-central1")

wrangler secret put VERTEX_AI_MODEL
# Enter the model name (e.g., "gemini-1.5-pro" or "gemini-1.5-flash")

# Set service account JSON (copy entire contents of the key file)
cat vertex-ai-key.json | wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON
# Or paste the entire JSON content when prompted

# Clean up the key file after use
rm vertex-ai-key.json
```

#### Option B: Using Cloudflare Dashboard

1. Go to your Worker in the [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Settings** > **Variables and Secrets**
3. Add the following **Environment Variables** (or use Secrets for all):
   - `VERTEX_AI_PROJECT_ID`: Your GCP project ID
   - `VERTEX_AI_LOCATION`: Region (e.g., `us-central1`)
   - `VERTEX_AI_MODEL`: Model name (e.g., `gemini-1.5-pro`)

4. Add the following **Secret**:
   - `VERTEX_AI_SERVICE_ACCOUNT_JSON`: Paste the entire contents of your service account JSON file

#### Option C: Update wrangler.jsonc (Not Recommended for Secrets)

For non-sensitive configuration only, you can add to `wrangler.jsonc`:

```jsonc
"vars": {
  // ... existing vars ...
  "VERTEX_AI_PROJECT_ID": "your-gcp-project-id",
  "VERTEX_AI_LOCATION": "us-central1",
  "VERTEX_AI_MODEL": "gemini-1.5-pro"
}
```

**⚠️ IMPORTANT:** 
- Never commit service account JSON keys to your repository
- Always use Cloudflare Secrets for `VERTEX_AI_SERVICE_ACCOUNT_JSON`
- Non-sensitive vars can be in `wrangler.jsonc`, but secrets must use `wrangler secret put`

### 4. Verify Configuration

Test your configuration using the status endpoint:

```bash
curl https://your-worker.workers.dev/status
```

Expected response should include:

```json
{
  "ok": true,
  "version": "2.2.0",
  "models": ["cloudflare", "vertex-ai"],
  "vertexAI": {
    "projectId": "your-project-id",
    "location": "us-central1",
    "model": "gemini-1.5-pro",
    "configured": true
  }
}
```

## Usage

### API Endpoint

Use the `/query` endpoint with the `vertex-ai` model:

```bash
curl -X POST https://your-worker.workers.dev/query \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is machine learning?",
    "model": "vertex-ai"
  }'
```

### Supported Models

The worker supports the following Vertex AI Gemini models:

- `gemini-1.5-pro` (default) - Best for complex tasks
- `gemini-1.5-flash` - Faster, more cost-effective for simpler tasks
- `gemini-1.0-pro` - Stable production model

Set your preferred model using the `VERTEX_AI_MODEL` environment variable.

### Supported Regions

Common Vertex AI regions:

- `us-central1` (Iowa)
- `us-east1` (South Carolina)
- `us-west1` (Oregon)
- `europe-west1` (Belgium)
- `asia-northeast1` (Tokyo)

## Architecture

```
┌─────────────────┐
│  Cloudflare     │
│  Worker         │
└────────┬────────┘
         │
         │ HTTP Request
         │
         ▼
┌─────────────────────────────┐
│  Cloudflare AI Gateway      │
│  - Analytics                │
│  - Caching                  │
│  - Rate Limiting            │
└────────┬────────────────────┘
         │
         │ Proxied Request
         │
         ▼
┌─────────────────────────────┐
│  Google Vertex AI           │
│  (Gemini Models)            │
└─────────────────────────────┘
```

All requests are:
1. Received by the Cloudflare Worker
2. Routed through Cloudflare AI Gateway (for analytics/caching)
3. Forwarded to Google Vertex AI
4. Cached in Cloudflare KV for future identical requests

## Caching

The worker automatically caches responses in Cloudflare KV:
- **Cache Key**: SHA-256 hash of `{model}:{prompt}`
- **TTL**: 7 days
- **Benefit**: Reduces API costs and improves response times for repeated queries

## Troubleshooting

### Error: "Vertex AI configuration missing"

**Solution**: Ensure `VERTEX_AI_PROJECT_ID` and `VERTEX_AI_LOCATION` are set.

### Error: "Vertex AI error (401)" or "(403)"

**Solution**: 
1. Verify your service account JSON is correctly set as a secret
2. Check that the service account has the required IAM roles
3. Ensure the Vertex AI API is enabled in your GCP project

### Error: "Invalid model"

**Solution**: 
- The `vertex-ai` model will only appear in the valid models list if both `VERTEX_AI_PROJECT_ID` and `VERTEX_AI_LOCATION` are configured
- Check your environment variables are set correctly

### Model Not Available in Region

**Solution**: 
- Some Gemini models may not be available in all regions
- Try a different region or check [Vertex AI model availability](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/model-support)

## Security Best Practices

1. **Never commit secrets**: Service account JSON files contain sensitive credentials
2. **Use Cloudflare Secrets**: Store `VERTEX_AI_SERVICE_ACCOUNT_JSON` as a secret, not a variable
3. **Rotate keys regularly**: Periodically regenerate service account keys
4. **Least privilege**: Grant only necessary IAM roles to the service account
5. **Monitor usage**: Review Cloudflare AI Gateway analytics for unusual patterns

## Cost Considerations

- **Cloudflare Workers**: Pay-as-you-go, very low cost
- **Cloudflare KV**: Free tier includes 100,000 reads/day
- **Vertex AI**: 
  - `gemini-1.5-pro`: ~$1.25 per 1M input tokens, ~$5 per 1M output tokens
  - `gemini-1.5-flash`: ~$0.075 per 1M input tokens, ~$0.30 per 1M output tokens
- **Caching**: Reduces Vertex AI API costs by avoiding redundant requests

## Migration from Cloudflare AI

The worker maintains backward compatibility with Cloudflare AI. To migrate:

1. Configure Vertex AI as described above
2. Update your API calls to use `"model": "vertex-ai"` instead of `"model": "cloudflare"`
3. Both models can coexist - choose based on your needs

## Additional Resources

- [Cloudflare AI Gateway Documentation](https://developers.cloudflare.com/ai-gateway/)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Gemini Model Reference](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/gemini)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)

## Support

For issues or questions:
1. Check the [GitHub Issues](https://github.com/stevei101/not-sure/issues)
2. Review Cloudflare AI Gateway logs in the dashboard
3. Check GCP Cloud Logging for Vertex AI errors

