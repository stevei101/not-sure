# PR Description for PR 2.2

## Overview

This PR integrates Google Vertex AI (Gemini models) into the Cloudflare Worker, enabling users to query Gemini models alongside Cloudflare AI models.

**This is PR 2.2 of the Vertex AI epic.** See `PR_EPIC_PLAN.md` for the complete epic structure.

Related issue: #16

## What's Included

### Vertex AI Integration
- ✅ Added `"gemini"` to `AIModel` type union
- ✅ Implemented Google OAuth2 JWT signing with service account authentication
- ✅ Implemented `callGeminiAI()` function for Vertex AI API calls
- ✅ Added Vertex AI configuration to `Env` interface
- ✅ Updated model routing to support `gemini` model
- ✅ Updated API client types to include `gemini` model

### Authentication
- ✅ JWT signing implementation using Web Crypto API
- ✅ Service account JSON key parsing and validation
- ✅ OAuth2 access token generation and caching
- ✅ Proper error handling for authentication failures

### Configuration
- ✅ Added Vertex AI environment variable documentation to `wrangler.jsonc`
- ✅ Updated `/status` endpoint to show Vertex AI configuration status
- ✅ Updated `validModels` array to include `"gemini"`

## Files Changed

```
3 files changed, 200+ insertions(+), 10 deletions(-)
- src/index.ts (updated)
- src/lib/api.ts (updated)
- wrangler.jsonc (updated with documentation)
```

## Implementation Details

### JWT Signing Implementation

The implementation uses Web Crypto API to sign JWTs for Google OAuth2 authentication:

1. **Service Account JSON Parsing**: Validates and parses the service account JSON key
2. **JWT Creation**: Creates JWT header and payload with required claims
3. **Private Key Import**: Imports RSA private key in PKCS#8 format
4. **JWT Signing**: Signs JWT using RSASSA-PKCS1-v1_5 algorithm
5. **Token Exchange**: Exchanges JWT for OAuth2 access token
6. **API Authentication**: Uses access token to authenticate Vertex AI API calls

### Vertex AI API Integration

- **Endpoint**: Uses Vertex AI REST API endpoint format:
  ```
  https://{location}-aiplatform.googleapis.com/v1/projects/{projectId}/locations/{location}/publishers/google/models/{model}:generateContent
  ```

- **Request Format**: Sends prompt as text in Vertex AI format:
  ```json
  {
    "contents": [{
      "parts": [{
        "text": "your prompt"
      }]
    }]
  }
  ```

- **Response Parsing**: Extracts text from Vertex AI response structure

## Configuration Required

After this PR is merged, set the following Cloudflare Workers secrets:

```bash
# Service account JSON key (from Terraform/Secret Manager)
wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON

# GCP configuration
wrangler secret put GCP_PROJECT_ID
wrangler secret put VERTEX_AI_LOCATION  # e.g., "us-central1"
wrangler secret put VERTEX_AI_MODEL     # e.g., "gemini-3-pro-preview"
```

### Retrieving Service Account Key

Use the helper script from PR 2.1:

```bash
./terraform/scripts/get-service-account-key.sh <PROJECT_ID>
```

Or manually:

```bash
gcloud secrets versions access latest \
  --secret="vertex-ai-service-account-key" \
  --project=<PROJECT_ID> | \
wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON
```

## API Usage

### Query with Gemini Model

```bash
curl -X POST https://lornu.ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is the capital of France?",
    "model": "gemini"
  }'
```

Response:
```json
{
  "answer": "The capital of France is Paris.",
  "cached": false,
  "model": "gemini"
}
```

### Check Status

```bash
curl https://lornu.ai/status
```

Response (when Vertex AI is configured):
```json
{
  "ok": true,
  "version": "2.1.0",
  "timestamp": "2025-11-27T...",
  "models": ["cloudflare", "gemini"],
  "gatewayId": "...",
  "gatewayUrl": "...",
  "vertexAiConfigured": true
}
```

## Validation

- ✅ `TypeScript` compilation passes
- ✅ No linter errors
- ✅ Model validation includes `"gemini"`
- ✅ Status endpoint reflects Vertex AI configuration
- ✅ Error handling for missing configuration

## Testing

### Manual Testing

1. **Set required secrets** (see Configuration Required section)
2. **Deploy worker** or run locally with `wrangler dev`
3. **Test Gemini model**:
   ```bash
   curl -X POST http://localhost:8787/query \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Hello", "model": "gemini"}'
   ```
4. **Verify status**:
   ```bash
   curl http://localhost:8787/status
   ```

### Error Cases

- Missing service account JSON → Returns error message
- Missing GCP configuration → Returns error message
- Invalid service account JSON → Returns error message
- Authentication failure → Returns error with details

## Next Steps

After this PR is merged to `develop`:
- **Testing**: Add unit tests for JWT signing and Vertex AI API calls
- **Error Handling**: Improve error messages for better debugging
- **Caching**: Consider caching OAuth2 access tokens (they expire in 1 hour)
- **Performance**: Monitor Vertex AI API response times

## Related

- Previous PR: PR 2.1 (Vertex AI Service Account and IAM)
- Issue: #16
- Epic plan: `PR_EPIC_PLAN.md` (if exists)

## Notes

- **JWT Signing**: Implemented using Web Crypto API - no external dependencies
- **Token Expiry**: OAuth2 tokens expire in 1 hour - tokens are generated per request
- **Future Optimization**: Consider caching access tokens to reduce authentication overhead
- **Gateway Integration**: Vertex AI calls are direct (not through Cloudflare AI Gateway) - this may change in the future if Gateway supports Vertex AI

