# Jules Prompt: Add Cloudflare AI Gateway Integration

> Use this prompt to hand off the AI Gateway integration task to Jules.

## 📋 Task Overview

**Objective:** Integrate Cloudflare AI Gateway to route all AI model requests through a unified gateway for analytics, caching, and monitoring.

**Priority:** [x] Critical | [ ] High | [ ] Medium | [ ] Low

**Estimated Complexity:** [ ] Simple (1-2 files) | [x] Medium (3-5 files) | [ ] Complex (6+ files)

---

## 🎯 Detailed Requirements

### What Needs to Change:
- [ ] **`src/index.ts`**: Update `callOpenAI` and `callCloudflareAI` functions to route requests through the AI Gateway URL.
- [ ] **`src/index.ts`**: Add a helper function `getGatewayUrl` to construct the gateway endpoints.
- [ ] **`src/index.ts`**: Update the `/status` endpoint to include gateway information.
- [ ] **`wrangler.jsonc`**: Add `ACCOUNT_ID`, `AI_GATEWAY_ID`, and `AI_GATEWAY_URL` to the `vars` configuration.

### Current State:
```typescript
// Direct API calls
await fetch("https://api.openai.com/v1/chat/completions", ...)  // OpenAI
await env.AI.run("@cf/meta/llama-2-7b-chat-fp16", ...)          // Cloudflare AI
```

### Desired State:
```typescript
// All requests routed through AI Gateway
const gatewayUrl = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}`;

// OpenAI via Gateway
await fetch(`${gatewayUrl}/openai/chat/completions`, ...)

// Cloudflare AI via Gateway
await fetch(`${gatewayUrl}/workers-ai/@cf/meta/llama-2-7b-chat-fp16`, ...)
```

---

## 🔍 Context & Background

**Gateway Details:**
- **Gateway ID:** `AQ.Ab8RN6JKBAPQhVWbuiBKBT1j9r3lE0Gqj4rfeat0SIo9aQzFFw`
- **Account ID:** `1d361f061ebf3d1a293900bdb815db26`
- **Dashboard:** [Cloudflare AI Gateway Dashboard](https://dash.cloudflare.com/1d361f061ebf3d1a293900bdb815db26/ai/ai-gateway)

### Files Involved:
- `src/index.ts` - Main worker logic containing AI function calls.
- `wrangler.jsonc` - Configuration file for environment variables.

---

## ⚠️ Constraints & Don'ts

**DO NOT:**
- [ ] Remove existing model support (keep `cloudflare` and `openai`).
- [ ] Change the `/query` API contract (request/response format must stay the same).
- [ ] Add new dependencies (use existing `fetch`).
- [ ] Modify test files (tests were recently added and should pass without changes if logic is correct).
- [ ] Change the existing KV caching logic.
- [ ] Re-add Gemini support (it was removed due to auth issues).

**MUST:**
- [ ] Maintain backward compatibility.
- [ ] Preserve existing error handling.
- [ ] Ensure all new environment variables are defined in `wrangler.jsonc`.

---

## ✅ Success Criteria

Jules' work will be considered complete when:

1. **Functional:** Both OpenAI and Cloudflare AI models work via the gateway.
   ```bash
   # Test OpenAI
   curl -X POST https://not-sure.s73ven-1rvin.workers.dev/query \
     -H "Content-Type: application/json" \
     -d '{"prompt":"What is 2+2?","model":"openai"}'

   # Test Cloudflare AI
   curl -X POST https://not-sure.s73ven-1rvin.workers.dev/query \
     -H "Content-Type: application/json" \
     -d '{"prompt":"What is 2+2?","model":"cloudflare"}'
   ```
   Expected output: Valid JSON response with `"answer"` and `"model"` fields, no errors.

2. **Verification:**
   - Requests appear in the [AI Gateway Dashboard](https://dash.cloudflare.com/1d361f061ebf3d1a293900bdb815db26/ai/ai-gateway).

3. **Code Quality:**
   - TypeScript types are correct.
   - No linter errors.

---

## 📚 Relevant Documentation

- [Cloudflare AI Gateway Overview](https://developers.cloudflare.com/ai-gateway/)
- [Universal Endpoint Docs](https://developers.cloudflare.com/ai-gateway/get-started/universal-endpoint/)
- [Provider-Specific Endpoints](https://developers.cloudflare.com/ai-gateway/providers/)

---

## 🔧 Implementation Details for Jules

### 1. Update `wrangler.jsonc`
Add these to `vars`:
```json
"ACCOUNT_ID": "1d361f061ebf3d1a293900bdb815db26",
"AI_GATEWAY_ID": "AQ.Ab8RN6JKBAPQhVWbuiBKBT1j9r3lE0Gqj4rfeat0SIo9aQzFFw",
"AI_GATEWAY_URL": "https://gateway.ai.cloudflare.com/v1"
```

### 2. Helper Function
```typescript
function getGatewayUrl(provider: string, env: Env): string {
  return `${env.AI_GATEWAY_URL}/${env.ACCOUNT_ID}/${env.AI_GATEWAY_ID}/${provider}`;
}
```

### 3. Cloudflare AI Specifics
When calling Cloudflare AI via Gateway, use the REST API pattern instead of `env.AI.run`:
```typescript
const gatewayEndpoint = `${getGatewayUrl("workers-ai", env)}/@cf/meta/llama-2-7b-chat-fp16`;
const response = await fetch(gatewayEndpoint, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${env.CLOUDFLARE_API_TOKEN}`, // Ensure this token is available or use a compatible auth method for Workers AI via REST
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ messages })
});
```
*Note: If `env.AI.run` supports a gateway option natively in the future, that would be preferred, but for now, REST via Gateway is the standard way to get analytics.*

---

**Handed off on:** 2024-11-22
