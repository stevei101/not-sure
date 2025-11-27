# Setting Cloudflare Worker Secrets

## ✅ Worker Deployed

The Worker has been successfully deployed. You can now set the secret.

## Set the Secret

Run this command:

```bash
wrangler secret put GOOGLE_AI_STUDIO_TOKEN
```

When prompted, enter your Google AI Studio API key (the same one you configured in the Cloudflare AI Gateway dashboard).

## Alternative: Use Cloudflare Dashboard

If you prefer using the dashboard:

1. Go to: https://dash.cloudflare.com/1d361f061ebf3d1a293900bdb815db26/workers/services/view/not-sure/settings
2. Navigate to **Settings** → **Variables and Secrets**
3. Click **Add secret**
4. Name: `GOOGLE_AI_STUDIO_TOKEN`
5. Value: Your Google AI Studio API key
6. Save

## Verify Deployment

After setting the secret, test the Gemini integration:

```bash
# Check status
curl https://lornu.ai/status

# Test Gemini
curl -X POST https://lornu.ai/query \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is Cloudflare?","model":"vertex-ai"}'
```

The `/status` endpoint should show `vertexAI: { configured: true }` after the secret is set.

