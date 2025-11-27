# Required Secrets for Vertex AI Integration

## ✅ Simplified Configuration - API Key Support!

Great news! **The same API key works for both Google AI Studio and Vertex AI**. This makes setup much simpler!

## Required Secrets

### 1. **GCP_PROJECT_ID** (Environment Variable or Secret)
   - **Type**: String
   - **Example**: `my-gcp-project-12345`
   - **Note**: This is the **same value** as your GitHub secret `GCP_PROJECT_ID`
   - **Set via**: `wrangler secret put GCP_PROJECT_ID` OR add to `wrangler.jsonc` vars
   - **Alternative**: You can use `VERTEX_AI_PROJECT_ID` instead (they're aliases)

### 2. **GEMINI_API_KEY** (Secret - REQUIRED) ✅
   - **Type**: Secret (String)
   - **Note**: **Same API key works for both Google AI Studio and Vertex AI!** 
   - **Set via**: `wrangler secret put GEMINI_API_KEY`
   - **You already have this!** - Use the same key you configured for Google AI Studio

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

## Alternative: Service Account (Optional)

If you prefer service account authentication instead of API key:

### **VERTEX_AI_SERVICE_ACCOUNT_JSON** (Secret - Alternative to API key)
   - **Type**: Secret (JSON string)
   - **Content**: Entire service account JSON key file contents
   - **Set via**: `cat service-account-key.json | wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON`
   - **Note**: Only needed if you prefer service account over API key (API key is simpler)
   - **⚠️ IMPORTANT**: This is sensitive - never commit to git

## Summary

**Minimum Required (Simplest Approach):**
- ✅ `GCP_PROJECT_ID` (or `VERTEX_AI_PROJECT_ID`) - Same value as GitHub secret
- ✅ `GEMINI_API_KEY` - **Same API key works for both Google AI Studio and Vertex AI!** ✅

**Optional (with defaults):**
- `VERTEX_AI_LOCATION` - Defaults to `us-central1`
- `VERTEX_AI_MODEL` - Defaults to `gemini-1.5-flash`

**💡 Tip**: Use `GEMINI_API_KEY` - it's simpler and works for both services!

## Quick Setup

### Using API Key (Recommended) ✅

```bash
# Required: Set project ID (same as GitHub secret GCP_PROJECT_ID)
wrangler secret put GCP_PROJECT_ID

# Required: Set API key (same key works for both Google AI Studio and Vertex AI!)
wrangler secret put GEMINI_API_KEY
# Use the same API key you already have configured!

# Optional: Set location (defaults to us-central1)
wrangler secret put VERTEX_AI_LOCATION

# Optional: Set model (defaults to gemini-1.5-flash)
wrangler secret put VERTEX_AI_MODEL
```

### Using Service Account (Alternative)

Only if you prefer service account authentication:

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

## Removed Secrets

- ❌ **GOOGLE_AI_STUDIO_TOKEN** - Replaced by `GEMINI_API_KEY` (same thing, better name)

## What You Already Have

If you previously set up Google AI Studio:
- ✅ `GEMINI_API_KEY` - **You can reuse this!** Just set it as `GEMINI_API_KEY` secret

See `VERTEX_AI_SETUP.md` for detailed setup instructions.
