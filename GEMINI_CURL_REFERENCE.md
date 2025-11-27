# Gemini API cURL Reference for Cloudflare AI Gateway

## Native cURL Format

The Cloudflare AI Gateway accepts Gemini API requests in the following format:

```bash
curl --request POST \
  --url https://gateway.ai.cloudflare.com/v1/{account_id}/default/google-ai-studio/v1/models/gemini-1.0-pro:generateContent \
  --header 'content-type: application/json' \
  --header 'x-goog-api-key: GOOGLE_AI_STUDIO_TOKEN' \
  --data '{"contents":[{"role":"user","parts":[{"text":"What is Cloudflare?"}]}]}'
```

## Endpoint Structure

The full endpoint URL breaks down as:
```
https://gateway.ai.cloudflare.com/v1/{account_id}/default/google-ai-studio/v1/models/{model}:generateContent
```

Where:
- `https://gateway.ai.cloudflare.com/v1` = Gateway base URL
- `{account_id}` = Cloudflare account ID (e.g., `1d361f061ebf3d1a293900bdb815db26`)
- `default` = Special keyword for default gateway configuration
- `google-ai-studio` = Provider identifier
- `/v1/models/{model}:generateContent` = Gemini API endpoint path

## Request Format

### Headers
- `content-type: application/json`
- `x-goog-api-key: {GOOGLE_AI_STUDIO_TOKEN}` - The API key configured in Cloudflare AI Gateway

### Request Body
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "Your prompt here"
        }
      ]
    }
  ]
}
```

## SDK Implementation

The Google Generative AI SDK (`@google/generative-ai`) handles this automatically when configured with:

```typescript
const genAI = new GoogleGenerativeAI(GOOGLE_AI_STUDIO_TOKEN);
const model = genAI.getGenerativeModel(
  { model: 'gemini-1.5-flash' },
  { baseUrl: 'https://gateway.ai.cloudflare.com/v1/{account_id}/default/google-ai-studio' }
);
```

### How SDK Maps to cURL

1. **baseUrl**: `https://gateway.ai.cloudflare.com/v1/{account_id}/default/google-ai-studio`
   - SDK automatically appends `/v1/models/{model}:generateContent`

2. **Authentication**: SDK automatically sets `x-goog-api-key` header from the token passed to constructor

3. **Request Body**: SDK automatically formats the request body as:
   ```json
   {
     "contents": [{
       "role": "user",
       "parts": [{"text": "prompt"}]
     }]
   }
   ```

4. **Response**: SDK automatically parses the response and extracts the text

## Gateway Configuration

The API key (`GOOGLE_AI_STUDIO_TOKEN`) must be:
1. **Configured in Cloudflare AI Gateway dashboard** - This enables the gateway to authenticate with Google AI Studio
2. **Set as Worker secret** - This allows the Worker to send requests with the `x-goog-api-key` header

Both should use the same API key value.

## Testing

### Using cURL directly:
```bash
curl --request POST \
  --url https://gateway.ai.cloudflare.com/v1/1d361f061ebf3d1a293900bdb815db26/default/google-ai-studio/v1/models/gemini-1.5-flash:generateContent \
  --header 'content-type: application/json' \
  --header 'x-goog-api-key: YOUR_API_KEY_HERE' \
  --data '{"contents":[{"role":"user","parts":[{"text":"What is Cloudflare?"}]}]}'
```

### Using Worker:
```bash
curl -X POST https://lornu.ai/query \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is Cloudflare?","model":"vertex-ai"}'
```

