# Vertex AI Components We're Using

## Summary

We're using **Vertex AI's Gemini API** to access Google's Gemini models (Gemini 1.5 Pro/Flash). We're NOT using the full Vertex AI platform features like custom models, AutoML, pipelines, etc.

## Components Used

### 1. **Vertex AI API** (`aiplatform.googleapis.com`)

**What it is:** Google Cloud's unified AI platform API  
**What we use it for:** Accessing Gemini models through the Vertex AI endpoint

**Endpoint we call:**
```
https://{location}-aiplatform.googleapis.com/v1/projects/{project}/locations/{location}/publishers/google/models/{model}:generateContent
```

**Route:** We access it through **Cloudflare AI Gateway** using the `google-vertex-ai` provider:
```
https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/google-vertex-ai/{project}/{location}/{model}:generateContent
```

### 2. **Gemini Models**

**Models we support:**
- `gemini-1.5-pro` (default) - More capable, higher cost
- `gemini-1.5-flash` - Faster, lower cost

**What we use them for:** Text generation for the RAG search engine

### 3. **IAM Roles**

**Service Account Roles:**
- `roles/aiplatform.user` - Allows the service account to use Vertex AI APIs
- `roles/aiplatform.serviceAgent` - Required for Vertex AI service operations
- `roles/secretmanager.secretAccessor` - Allows reading the service account key from Secret Manager

### 4. **Authentication**

**Method:** Service Account JSON Key  
**Storage:** Google Secret Manager (via Terraform)  
**Usage:** Passed through Cloudflare AI Gateway

## What We're NOT Using

❌ **Vertex AI Platform Features:**
- Custom model training
- AutoML
- Vertex AI Pipelines
- Vertex AI Workbench
- Vertex AI Feature Store
- Vertex AI Model Registry
- Vertex AI Prediction (custom models)

❌ **Other Vertex AI Services:**
- Vision API (separate service)
- Speech-to-Text (separate service)
- Translation API (separate service)

## Architecture Flow

```
User Request → Cloudflare Worker
                ↓
         Cloudflare AI Gateway
                ↓
       Vertex AI API (aiplatform.googleapis.com)
                ↓
         Gemini Model (gemini-1.5-pro/flash)
                ↓
              Response
```

## Why Vertex AI Instead of Direct Gemini API?

1. **Enterprise Features:** Better for production workloads
2. **Integration:** Works better with Google Cloud infrastructure
3. **Gateway Support:** Cloudflare AI Gateway supports Vertex AI routing
4. **Scalability:** Enterprise-grade infrastructure
5. **Compliance:** Better for enterprise security requirements

## API Format

We use the **Gemini API format** through Vertex AI:

**Request:**
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": "prompt text" }]
    }
  ]
}
```

**Response:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "response text"
          }
        ]
      }
    }
  ]
}
```

## Cost Considerations

- **Gemini 1.5 Pro:** ~$1.25 per 1M input tokens, ~$5 per 1M output tokens
- **Gemini 1.5 Flash:** ~$0.075 per 1M input tokens, ~$0.30 per 1M output tokens

## Next Steps

To enable Vertex AI integration:
1. ✅ Terraform infrastructure is ready
2. ⏳ Run `terraform apply` to create resources
3. ⏳ Generate service account key
4. ⏳ Configure Cloudflare Worker secrets
5. ⏳ Test the integration

## References

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Gemini API Reference](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)
- [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/)

