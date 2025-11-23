# Feature Request: Add Cloudflare AI Gateway Integration

## 📋 Overview

**Feature:** Integrate Cloudflare AI Gateway to route all AI model requests through a unified gateway for analytics, caching, and monitoring.

**Priority:** High  
**Complexity:** Medium (3-5 files)  
**Estimated Time:** 30-45 minutes for Jules

---

## 🎯 Objective

Route all AI API calls (OpenAI, Cloudflare AI, future models) through Cloudflare AI Gateway to gain:
- 📊 Unified analytics across all AI providers
- 🚀 Automatic caching (faster + cheaper)
- 📈 Cost tracking and monitoring
- 🔄 Request logging and debugging
- 🛡️ Rate limiting and abuse protection

---

## 🌐 AI Gateway Details

**Gateway ID:** `AQ.Ab8RN6JKBAPQhVWbuiBKBT1j9r3lE0Gqj4rfeat0SIo9aQzFFw`  
**Account ID:** `1d361f061ebf3d1a293900bdb815db26`  
**Dashboard:** https://dash.cloudflare.com/1d361f061ebf3d1a293900bdb815db26/ai/ai-gateway

---

## 📝 Current State

### Files Involved:
- `src/index.ts` - Main worker with AI function calls
- `wrangler.jsonc` - May need AI Gateway binding

### Current Implementation:
```typescript
// Direct API calls
await fetch("https://api.openai.com/v1/chat/completions", ...)  // OpenAI
await env.AI.run("@cf/meta/llama-2-7b-chat-fp16", ...)          // Cloudflare AI
```

### Supported Models:
- ✅ Cloudflare AI (Llama 2 7B)
- ✅ OpenAI (GPT-4o-mini)
- ❌ Gemini (removed - auth issues)

---

## ✨ Desired State

### After Implementation:

```typescript
// All requests routed through AI Gateway
const gatewayUrl = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}`;

// OpenAI via Gateway
await fetch(`${gatewayUrl}/openai/chat/completions`, ...)

// Cloudflare AI via Gateway
await fetch(`${gatewayUrl}/workers-ai/@cf/meta/llama-2-7b-chat-fp16`, ...)
```

---

## 🔧 Implementation Requirements

### 1. Update Environment Variables

**Add to `wrangler.jsonc > vars`:**
```jsonc
"vars": {
  "ACCOUNT_ID": "1d361f061ebf3d1a293900bdb815db26",
  "AI_GATEWAY_ID": "AQ.Ab8RN6JKBAPQhVWbuiBKBT1j9r3lE0Gqj4rfeat0SIo9aQzFFw",
  "AI_GATEWAY_URL": "https://gateway.ai.cloudflare.com/v1"
}
```

### 2. Create Gateway Helper Function

**Add to `src/index.ts`:**
```typescript
/** Build AI Gateway URL for a provider */
function getGatewayUrl(provider: string, env: Env): string {
  return `${env.AI_GATEWAY_URL}/${env.ACCOUNT_ID}/${env.AI_GATEWAY_ID}/${provider}`;
}
```

### 3. Update OpenAI Function

**Change `callOpenAI()` to route through gateway:**

**Before:**
```typescript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
```

**After:**
```typescript
const gatewayEndpoint = `${getGatewayUrl("openai", env)}/chat/completions`;
const response = await fetch(gatewayEndpoint, {
```

### 4. Update Cloudflare AI Function

**Change `callCloudflareAI()` to route through gateway:**

**Before:**
```typescript
const result = await env.AI.run("@cf/meta/llama-2-7b-chat-fp16", { messages });
```

**After:**
```typescript
const gatewayEndpoint = `${getGatewayUrl("workers-ai", env)}/@cf/meta/llama-2-7b-chat-fp16`;
const response = await fetch(gatewayEndpoint, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ messages })
});
```

### 5. Update `/status` Endpoint

**Add gateway info:**
```typescript
{
  ok: true,
  version: "2.1.0",
  timestamp: new Date().toISOString(),
  models: ["cloudflare", "openai"],
  gateway: env.AI_GATEWAY_ID  // Show that gateway is enabled
}
```

---

## ⚠️ Constraints & Don'ts

**DO NOT:**
- [ ] Remove existing model support (keep cloudflare, openai)
- [ ] Change the `/query` API contract
- [ ] Add new dependencies
- [ ] Modify test files (tests were just added by Jules)
- [ ] Change the caching logic (KV caching should still work)

**MUST:**
- [ ] Maintain backward compatibility
- [ ] Preserve existing error handling
- [ ] Keep the same response format
- [ ] Ensure all environment variables are documented

---

## ✅ Success Criteria

### 1. Functional Testing

**Test OpenAI via Gateway:**
```bash
curl -X POST https://not-sure.s73ven-1rvin.workers.dev/query \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is 2+2?","model":"openai"}'
```
**Expected:** Valid JSON response, no errors

**Test Cloudflare AI via Gateway:**
```bash
curl -X POST https://not-sure.s73ven-1rvin.workers.dev/query \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is 2+2?","model":"cloudflare"}'
```
**Expected:** Valid JSON response, no errors

### 2. Verify in AI Gateway Dashboard

After testing, visit:
https://dash.cloudflare.com/1d361f061ebf3d1a293900bdb815db26/ai/ai-gateway

**Should see:**
- ✅ Request counts for both providers
- ✅ Response times
- ✅ Token usage (if applicable)
- ✅ Any errors/failures

### 3. Code Quality

- [x] TypeScript types are correct
- [x] No linter errors
- [x] Functions have JSDoc comments
- [x] Error messages are clear

---

## 📚 Documentation & References

### Cloudflare AI Gateway Docs:
- **Overview:** https://developers.cloudflare.com/ai-gateway/
- **Universal Endpoint:** https://developers.cloudflare.com/ai-gateway/get-started/universal-endpoint/
- **Providers:** https://developers.cloudflare.com/ai-gateway/providers/

### Provider-Specific Gateway URLs:

| Provider | Gateway Path |
|----------|--------------|
| OpenAI | `/openai/v1/chat/completions` |
| Workers AI | `/workers-ai/[model-name]` |
| Anthropic | `/anthropic/v1/messages` |

### Example Gateway Request:
```typescript
// General pattern
fetch(`https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/{provider}/{endpoint}`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ ... })
});
```

---

## 🧪 Testing Instructions

### Local Testing:

1. **Update environment variables** in `.dev.vars` (for local dev):
   ```
   ACCOUNT_ID=1d361f061ebf3d1a293900bdb815db26
   AI_GATEWAY_ID=AQ.Ab8RN6JKBAPQhVWbuiBKBT1j9r3lE0Gqj4rfeat0SIo9aQzFFw
   ```

2. **Run locally:**
   ```bash
   wrangler dev
   ```

3. **Test both models:**
   ```bash
   # OpenAI
   curl -X POST http://localhost:8787/query \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Hello","model":"openai"}'
   
   # Cloudflare AI
   curl -X POST http://localhost:8787/query \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Hello","model":"cloudflare"}'
   ```

### Production Testing:

After deployment, verify in AI Gateway dashboard that requests appear.

---

## 🎓 Additional Context

### Why AI Gateway?

1. **Unified Analytics** - See all AI usage in one place
2. **Cost Optimization** - Gateway caching reduces redundant API calls
3. **Debugging** - Full request/response logging
4. **Rate Limiting** - Built-in abuse protection
5. **Future-Proof** - Easy to add new providers later

### Benefits for This Project:

- Currently using KV caching (good)
- AI Gateway adds **another layer** of caching before provider APIs
- Get analytics without custom logging code
- Monitor costs across both OpenAI and Cloudflare AI

---

## 💬 Notes for Implementation

### Potential Challenges:

1. **Authentication:** Workers AI might need different auth when going through gateway
2. **Response Format:** Ensure gateway doesn't change response structure
3. **Error Handling:** Gateway errors vs provider errors need clear messages

### Recommended Approach:

1. Start with OpenAI (simpler path)
2. Verify it works in dashboard
3. Then add Cloudflare AI gateway routing
4. Update docs and tests

---

## 🚀 Post-Implementation Tasks

After merging this PR:

- [ ] Document the gateway setup in README
- [ ] Add monitoring/alerting if desired
- [ ] Consider adding more providers (Anthropic, etc.)
- [ ] Update test suite to verify gateway routing

---

**Created by:** Antigravity  
**For:** Jules Autonomous Agent  
**Date:** 2024-11-22  
**Estimated Duration:** 30-45 minutes  
**Files to Modify:** `src/index.ts`, `wrangler.jsonc`, possibly README  

---

## 📋 Jules-Ready Summary

**When sending to Jules, use this prompt:**

```
Add Cloudflare AI Gateway integration to route all AI requests through 
gateway ID AQ.Ab8RN6JKBAPQhVWbuiBKBT1j9r3lE0Gqj4rfeat0SIo9aQzFFw.

Update callOpenAI() and callCloudflareAI() in src/index.ts to use gateway URLs.
Add environment variables to wrangler.jsonc.

DO NOT modify tests, DO NOT add Gemini back, DO NOT change API contract.

Success = Both models work via curl test AND requests appear in 
https://dash.cloudflare.com/1d361f061ebf3d1a293900bdb815db26/ai/ai-gateway
```
