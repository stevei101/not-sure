# Required Secrets for Vertex AI Integration

## ✅ Simplified Configuration

After switching to Vertex AI, here are the required secrets:

## Required Secrets

### 1. **GCP_PROJECT_ID** (Environment Variable or Secret)
   - **Type**: String
   - **Example**: `my-gcp-project-12345`
   - **Note**: This is the **same value** as your GitHub secret `GCP_PROJECT_ID`
   - **Set via**: `wrangler secret put GCP_PROJECT_ID` OR add to `wrangler.jsonc` vars
   - **Alternative**: You can use `VERTEX_AI_PROJECT_ID` instead (they're aliases)

### 2. **VERTEX_AI_SERVICE_ACCOUNT_JSON** (Secret - REQUIRED)
   - **Type**: Secret (JSON string)
   - **Content**: Entire service account JSON key file contents
   - **Set via**: `cat service-account-key.json | wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON`
   - **⚠️ IMPORTANT**: This is sensitive - never commit to git

### 3. **VERTEX_AI_LOCATION** (Optional - Recommended)
   - **Type**: String
   - **Example**: `us-central1`
   - **Default**: `us-central1` (if not set)
   - **Set via**: `wrangler secret put VERTEX_AI_LOCATION` OR add to `wrangler.jsonc` vars

### 4. **VERTEX_AI_MODEL** (Optional)
   - **Type**: String
   - **Example**: `gemini-1.5-flash` or `gemini-2.5-flash`
   - **Default**: `gemini-1.5-flash` (if not set)
   - **Set via**: `wrangler secret put VERTEX_AI_MODEL` OR add to `wrangler.jsonc` vars

## Summary

**Minimum Required:**
- ✅ `GCP_PROJECT_ID` (or `VERTEX_AI_PROJECT_ID`) - Same value as GitHub secret
- ✅ `VERTEX_AI_SERVICE_ACCOUNT_JSON` - Service account JSON key

**Optional (with defaults):**
- `VERTEX_AI_LOCATION` - Defaults to `us-central1`
- `VERTEX_AI_MODEL` - Defaults to `gemini-1.5-flash`

## Removed Secrets

- ❌ **GOOGLE_AI_STUDIO_TOKEN** - No longer needed (was for Google AI Studio)

## Quick Setup

```bash
# Required: Set project ID (same as GitHub secret GCP_PROJECT_ID)
wrangler secret put GCP_PROJECT_ID

# Required: Set service account JSON
cat path/to/service-account-key.json | wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON

# Optional: Set location (defaults to us-central1)
wrangler secret put VERTEX_AI_LOCATION

# Optional: Set model (defaults to gemini-1.5-flash)
wrangler secret put VERTEX_AI_MODEL
```

See `VERTEX_AI_SETUP.md` for detailed setup instructions.
