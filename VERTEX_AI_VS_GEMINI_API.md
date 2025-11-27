# Vertex AI vs Direct Gemini API

This document clarifies the difference between the two Google AI integration approaches and which secrets you need for each.

## Two Integration Options

### Option 1: Vertex AI (Recommended for Production)

**What it is**: Enterprise-grade AI platform with Vertex AI Gemini models
- More control and fine-tuning
- Better for production workloads
- Integrated with Google Cloud infrastructure
- Supports advanced features (RAG, fine-tuning, etc.)

**Authentication**: Service Account JSON Key
- Requires: `VERTEX_AI_SERVICE_ACCOUNT_JSON` secret (Cloudflare Worker)
- Created via: Terraform (automated) or manually

**What you need**:
1. ✅ `GCP_PROJECT_ID` - Already added
2. ⏳ `WIF_PROVIDER` - For GitHub Actions authentication
3. ⏳ `WIF_SERVICE_ACCOUNT` - For GitHub Actions authentication
4. ⏳ Run Terraform to create service account
5. ⏳ Store service account JSON as `VERTEX_AI_SERVICE_ACCOUNT_JSON` in Cloudflare Worker

**Current Status**: This is what we're setting up with Terraform.

### Option 2: Direct Gemini API (Simpler, but Limited)

**What it is**: Direct API access to Gemini models
- Simpler setup
- Good for development/testing
- Limited to API features only
- Less control over infrastructure

**Authentication**: API Key
- Requires: `GEMINI_API_KEY` secret ✅ (Already added to GitHub)

**What you need**:
1. ✅ `GEMINI_API_KEY` - Already added to GitHub
2. ⏳ Set as Cloudflare Worker secret: `wrangler secret put GEMINI_API_KEY`

**Current Status**: You've added this secret to GitHub. You can use it if you want to call Gemini API directly (not through Vertex AI).

## Which One Should You Use?

### Use Vertex AI (Current Setup) If:
- ✅ You want production-grade infrastructure
- ✅ You need fine-tuning or advanced features
- ✅ You want integration with other GCP services
- ✅ You're building a scalable production application

### Use Direct Gemini API If:
- ✅ You want a quick prototype/test
- ✅ You don't need advanced features
- ✅ You prefer simpler authentication
- ✅ You're just experimenting

## Can You Use Both?

Yes! You can use both:
- Vertex AI for production workloads
- Direct Gemini API for development/testing
- The worker code can switch between them based on configuration

## Current Configuration

Your worker (`src/index.ts`) currently supports:
- ✅ Cloudflare AI (`cloudflare` model)
- ✅ Vertex AI (`vertex-ai` model) - **In progress via Terraform**

The Vertex AI setup is what we're automating with Terraform. The `GEMINI_API_KEY` you added could be used for a future direct Gemini API integration, but it's not needed for the current Vertex AI setup.

## Next Steps for Vertex AI

To complete the Vertex AI setup (which is what Terraform is configuring):

1. ✅ `TF_API_TOKEN` - Done
2. ✅ `GCP_PROJECT_ID` - Done  
3. ⏳ `TF_CLOUD_ORGANIZATION` - Still needed
4. ⏳ `WIF_PROVIDER` - Still needed (can copy from agentnav)
5. ⏳ `WIF_SERVICE_ACCOUNT` - Still needed (can copy from agentnav)
6. ⏳ Run Terraform to create service account
7. ⏳ Store service account JSON as Cloudflare Worker secret

The `GEMINI_API_KEY` is separate and not used by the Vertex AI integration.

## Summary

- **GEMINI_API_KEY**: For direct Gemini API calls (different from Vertex AI)
- **VERTEX_AI_SERVICE_ACCOUNT_JSON**: For Vertex AI integration (created via Terraform)

Both can coexist if you want to support both integration methods.

