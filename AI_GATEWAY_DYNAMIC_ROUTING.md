# Cloudflare AI Gateway - Dynamic Routing Setup (Step 3)

## Overview

Dynamic Routing is the **third and final step** to complete your Cloudflare AI Gateway setup. It enables you to create request routing flows with custom rate limits, budget limits, A/B testing, and more—all without touching your application code.

**Reference:** [Cloudflare AI Gateway Dynamic Routing Documentation](https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/)

## Prerequisites

✅ **Step 1:** AI Gateway configured and authenticated  
✅ **Step 2:** Code routing requests through the gateway  
⏸️ **Step 3:** Create dynamic routes ← **You are here**

## What Dynamic Routing Provides

With Dynamic Routing, you can:
- ✅ **Rate limiting** - Control requests per user/project/team
- ✅ **Budget limits** - Enforce cost quotas with automatic fallbacks
- ✅ **A/B testing** - Route requests probabilistically across models
- ✅ **Conditional routing** - Route different users to different models (paid vs free)
- ✅ **Fallback models** - Automatically switch to cheaper/faster models when limits are hit
- ✅ **Visual editor** - Configure routes via dashboard (no code changes needed!)

## Current Setup Status

### ✅ Already Configured

1. **Gateway Details:**
   - Gateway ID: `AQ.Ab8RN6JKBAPQhVWbuiBKBT1j9r3lE0Gqj4rfeat0SIo9aQzFFw`
   - Account ID: `1d361f061ebf3d1a293900bdb815db26`
   - Dashboard: https://dash.cloudflare.com/1d361f061ebf3d1a293900bdb815db26/ai/ai-gateway

2. **Code Integration:**
   - `src/index.ts` routes requests through gateway
   - `wrangler.jsonc` has gateway configuration
   - Helper function `getGatewayUrl()` constructs gateway endpoints

3. **Supported Models:**
   - Cloudflare AI (Llama 2) via `workers-ai` provider
   - Vertex AI (Gemini) via `google-vertex-ai` provider

### ⏸️ Missing: Dynamic Routes

We need to create dynamic routes to:
- Set up rate limits
- Configure budget limits
- Enable fallback models
- Add conditional routing (if needed)

## Setting Up Dynamic Routes

### Step 1: Access Dynamic Routes Dashboard

1. Go to your AI Gateway dashboard:
   ```
   https://dash.cloudflare.com/1d361f061ebf3d1a293900bdb815db26/ai/ai-gateway
   ```

2. Navigate to **"Dynamic Routes"** section

3. Click **"Add Route"**

### Step 2: Create Your First Route

**Route Name:** `not-sure-default`

This will be your default route that all requests go through.

#### Simple Route Structure (Recommended for Start)

```
Start → Model Node → End
```

**Model Node Configuration:**
- **Node Type:** Model
- **Provider:** Select based on your needs:
  - `workers-ai` for Cloudflare AI
  - `google-vertex-ai` for Vertex AI (Gemini)
- **Model:** 
  - Cloudflare: `@cf/meta/llama-2-7b-chat-fp16`
  - Vertex AI: `gemini-1.5-flash` (or your configured model)

#### Advanced Route with Rate Limiting

```
Start → Rate Limit Node → Model Node → End
                    ↓ (if limit exceeded)
              Fallback Model Node → End
```

**Rate Limit Node:**
- **Type:** Rate Limit
- **Limit:** e.g., 100 requests per hour
- **Per:** Your API key or metadata field (userId, etc.)
- **Fallback:** Route to cheaper/faster model when exceeded

#### Advanced Route with Budget Limits

```
Start → Budget Limit Node → Model Node → End
                    ↓ (if budget exceeded)
              Fallback Model Node → End
```

**Budget Limit Node:**
- **Type:** Budget Limit
- **Limit:** e.g., $10 per day
- **Per:** Your API key or metadata field
- **Fallback:** Route to cheaper model when budget exceeded

### Step 3: Configure Route Settings

1. **Name the route:** `not-sure-default` (or choose your own name)
2. **Add nodes:** Use the visual editor to add Start, Model, Rate Limit, Budget Limit, etc.
3. **Connect nodes:** Draw connections between nodes
4. **Configure each node:**
   - Model nodes: Select provider and model
   - Rate Limit nodes: Set request limits
   - Budget Limit nodes: Set cost limits
   - Conditional nodes: Set if/else conditions

### Step 4: Save and Deploy

1. **Click "Save"** to save the route as a draft
2. **Review** the route configuration
3. **Click "Deploy"** to make it live
4. **Rollback available:** You can always roll back to previous versions

### Step 5: Update Your Code (Optional)

If you created a named route (e.g., `not-sure-default`), you can use it in your code:

```typescript
// Instead of direct model calls, use the dynamic route
const routeEndpoint = `${env.AI_GATEWAY_URL}/${env.ACCOUNT_ID}/${env.AI_GATEWAY_ID}/dynamic/not-sure-default`;

// Use it like any other model
const response = await fetch(routeEndpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    // ... other headers
  },
  body: JSON.stringify({
    messages: [...],
    // ... other params
  })
});
```

**Note:** You can also keep using direct provider/model endpoints - dynamic routes work alongside them!

## Example Route Configurations

### Example 1: Simple Rate-Limited Route

**Route Name:** `not-sure-rate-limited`

**Structure:**
```
Start
  ↓
Rate Limit (100/hour)
  ↓
Model: workers-ai/@cf/meta/llama-2-7b-chat-fp16
  ↓
End
```

**Use Cases:**
- Prevent abuse
- Control costs
- Ensure fair usage

### Example 2: Budget-Aware Route with Fallback

**Route Name:** `not-sure-budget-aware`

**Structure:**
```
Start
  ↓
Budget Limit ($10/day)
  ├─→ Model: google-vertex-ai/gemini-1.5-pro (premium)
  │     ↓
  └─→ Model: workers-ai/@cf/meta/llama-2-7b-chat-fp16 (fallback)
        ↓
End
```

**Use Cases:**
- Use premium model until budget runs out
- Automatically switch to free/cheaper model
- No code changes needed!

### Example 3: Conditional Routing (Paid vs Free Users)

**Route Name:** `not-sure-tiered`

**Structure:**
```
Start
  ↓
Conditional: userPlan == "paid"
  ├─→ Model: google-vertex-ai/gemini-1.5-pro
  │     ↓
  └─→ Model: workers-ai/@cf/meta/llama-2-7b-chat-fp16
        ↓
End
```

**Use Cases:**
- Different models for different user tiers
- A/B testing different models
- Route based on metadata

### Example 4: A/B Testing Route

**Route Name:** `not-sure-ab-test`

**Structure:**
```
Start
  ↓
Percentage Split (50/50)
  ├─→ Model: google-vertex-ai/gemini-1.5-pro (50%)
  │     ↓
  └─→ Model: workers-ai/@cf/meta/llama-2-7b-chat-fp16 (50%)
        ↓
End
```

**Use Cases:**
- Test model performance
- Gradual rollouts
- Compare response quality

## Using Routes in Your Application

### Option 1: Use Dynamic Route Name

```typescript
// Instead of:
const endpoint = `${getGatewayUrl("workers-ai", env)}/@cf/meta/llama-2-7b-chat-fp16`;

// Use:
const endpoint = `${getGatewayUrl("dynamic", env)}/not-sure-default`;
```

### Option 2: Pass Metadata for Conditional Routing

```typescript
const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "CF-AI-Gateway-Metadata": JSON.stringify({
      userId: "user123",
      userPlan: "paid",  // Used in conditional nodes
      orgId: "org456"
    })
  },
  body: JSON.stringify({ messages, ... })
});
```

### Option 3: Keep Using Direct Provider Endpoints

You can continue using direct provider endpoints - dynamic routes work alongside them:

```typescript
// Both work:
const directEndpoint = `${getGatewayUrl("workers-ai", env)}/@cf/meta/llama-2-7b-chat-fp16`;
const routeEndpoint = `${getGatewayUrl("dynamic", env)}/not-sure-default`;
```

## Next Steps

1. ✅ **Access Dashboard:**
   - Go to: https://dash.cloudflare.com/1d361f061ebf3d1a293900bdb815db26/ai/ai-gateway
   - Click "Dynamic Routes" → "Add Route"

2. ✅ **Create Simple Route:**
   - Name: `not-sure-default`
   - Add Model node with your preferred provider/model
   - Save and Deploy

3. ✅ **Test the Route:**
   - Test via your application
   - Check analytics in the dashboard
   - Verify rate limits/budget limits work

4. ✅ **Iterate:**
   - Add rate limits as needed
   - Add budget limits as needed
   - Add conditional routing for different user tiers
   - Create A/B testing routes

## Benefits After Setup

Once dynamic routes are configured:
- ✅ **No code changes needed** - Update routes via dashboard
- ✅ **Instant rollback** - Revert to previous route versions
- ✅ **Better analytics** - Track usage per route
- ✅ **Cost control** - Automatic budget enforcement
- ✅ **Fair usage** - Rate limiting prevents abuse
- ✅ **Smart routing** - Conditional and percentage-based routing

## Troubleshooting

### Route Not Found

**Error:** `404 Route not found`

**Solution:**
- Verify route name matches exactly
- Check route is deployed (not just saved as draft)
- Ensure you're using the correct endpoint format: `dynamic/route-name`

### Rate Limit Not Working

**Solution:**
- Verify rate limit node is connected properly in the flow
- Check rate limit is configured with correct values
- Ensure metadata is passed correctly for per-user limits

### Budget Limit Not Working

**Solution:**
- Verify budget limit node is in the flow before model node
- Check budget limit values are set correctly
- Ensure fallback model is configured

## References

- **Dynamic Routing Docs:** https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/
- **AI Gateway Dashboard:** https://dash.cloudflare.com/1d361f061ebf3d1a293900bdb815db26/ai/ai-gateway
- **Gateway Configuration:** See `AI_GATEWAY_CONFIGURATION_ISSUE.md`
- **Gateway Integration:** See `src/index.ts` for current implementation

## Summary

Dynamic Routing is the final piece to unlock the full power of Cloudflare AI Gateway:
- ✅ Set up rate limits and budget limits
- ✅ Configure fallback models
- ✅ Enable A/B testing
- ✅ Route users conditionally
- ✅ All without code changes!

Just create a route in the dashboard, configure nodes, save, and deploy! 🚀

