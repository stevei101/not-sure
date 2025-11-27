# Gemini via OpenAI-Compatible Endpoint

## Overview

Cloudflare AI Gateway provides an **OpenAI-compatible endpoint** for Gemini models, which is simpler than using the Vertex AI endpoint directly.

## Endpoint Format

**From Cloudflare documentation:**
```
/v1/{account_id}/default/compat/chat/completions
```

**Or with specific gateway ID:**
```
/v1/{account_id}/{gateway_id}/compat/chat/completions
```

## Implementation

### Code Example

```typescript
const gatewayEndpoint = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/compat/chat/completions`;

const response = await fetch(gatewayEndpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${GEMINI_API_KEY}`
  },
  body: JSON.stringify({
    model: "google-ai-studio/gemini-2.5",
    messages: [
      { role: "system", content: "You are a helpful AI assistant." },
      { role: "user", content: prompt }
    ]
  })
});
```

### Request Format (OpenAI-Compatible)

```json
{
  "model": "google-ai-studio/gemini-2.5",
  "messages": [
    { "role": "system", "content": "You are a helpful AI assistant." },
    { "role": "user", "content": "What is Cloudflare?" }
  ]
}
```

### Response Format (OpenAI-Compatible)

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Response text here..."
      }
    }
  ]
}
```

## Available Models

- `google-ai-studio/gemini-2.5` - Latest Gemini model
- `google-ai-studio/gemini-1.5-pro` - Gemini 1.5 Pro
- `google-ai-studio/gemini-1.5-flash` - Gemini 1.5 Flash

## Configuration

### Required Environment Variables

1. **GEMINI_API_KEY** - Your Gemini API key (already added to GitHub secrets)
2. **GEMINI_MODEL** (optional) - Model name, defaults to `google-ai-studio/gemini-2.5`

### Setting Secrets in Cloudflare Worker

```bash
wrangler secret put GEMINI_API_KEY
# Enter your Gemini API key when prompted

# Optional: Set model name as variable
# Edit wrangler.jsonc to add:
# "GEMINI_MODEL": "google-ai-studio/gemini-2.5"
```

## Advantages Over Vertex AI Endpoint

✅ **Simpler:** Uses OpenAI-compatible format (standard `messages` array)  
✅ **No Infrastructure Needed:** No service accounts, Terraform, or GCP setup  
✅ **Already Configured:** Uses existing `GEMINI_API_KEY` from GitHub secrets  
✅ **Easier Auth:** Just an API key, no service account JSON  
✅ **Standard Format:** Compatible with OpenAI client libraries  

## Migration Notes

We've updated the implementation to use this simpler approach instead of the Vertex AI endpoint. The Terraform setup for Vertex AI can still be used if you want the enterprise features, but for most use cases, this OpenAI-compatible endpoint is sufficient.

## References

- [Cloudflare AI Gateway Docs](https://developers.cloudflare.com/ai-gateway/)
- [OpenAI-Compatible Endpoint](https://developers.cloudflare.com/ai-gateway/providers/)

