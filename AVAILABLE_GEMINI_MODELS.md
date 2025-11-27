# Available Gemini Models

## Google AI Studio Models

The following Gemini models are available in Google AI Studio and can be used with Vertex AI:

### Latest Models (Auto-Updating)
- `gemini-flash-latest` - Always points to the latest Flash model
- `gemini-flash-lite-latest` - Always points to the latest Flash Lite model

### Specific Models
- `gemini-3-pro-preview` - Latest preview model (recommended default)
- `gemini-1.5-flash` - Fast, efficient model
- `gemini-1.5-pro` - More powerful model
- `gemini-2.0-flash-exp` - Experimental latest model
- `gemini-1.0-pro` - Stable production model

## Usage

### Via Environment Variable

Set the `VERTEX_AI_MODEL` environment variable:

```bash
# Using wrangler secret
wrangler secret put VERTEX_AI_MODEL
# Enter: gemini-flash-latest

# Or via Terraform variable
terraform apply -var="vertex_ai_model=gemini-flash-latest"
```

### Via Worker Configuration

In `wrangler.jsonc`:

```jsonc
{
  "vars": {
    "VERTEX_AI_MODEL": "gemini-flash-latest"
  }
}
```

## Recommended Models

### For Production
- **`gemini-1.5-flash`** - Best balance of speed and quality
- **`gemini-1.5-pro`** - Highest quality for complex tasks

### For Latest Features
- **`gemini-3-pro-preview`** - Latest preview with newest capabilities
- **`gemini-flash-latest`** - Always gets newest Flash updates

### For Cost Optimization
- **`gemini-flash-lite-latest`** - Lightweight, fast, and cost-effective

## Model Format

When using Vertex AI via Cloudflare AI Gateway, the model name should **not** include the `models/` prefix. Use just the model identifier:

✅ **Correct:**
- `gemini-flash-latest`
- `gemini-3-pro-preview`
- `gemini-1.5-flash`

❌ **Incorrect:**
- `models/gemini-flash-latest`
- `models/gemini-3-pro-preview`

## References

- [Gemini Model Reference](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)
- [Google AI Studio Models](https://aistudio.google.com/app/apikey)

