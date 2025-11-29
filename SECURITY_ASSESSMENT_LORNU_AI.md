# Security Assessment: lornu.ai

**Assessment Date:** 2025-11-27  
**Site Status:** ✅ Deployed and operational  
**Authentication Status:** ❌ Disabled (no authentication required)

---

## Executive Summary

The lornu.ai application is currently deployed and functional but **lacks critical security controls**. The site is publicly accessible without authentication, rate limiting, or proper access controls. While Cloudflare Workers provides some inherent protections (DDoS mitigation, edge security), application-level security is minimal.

### Risk Level: **MEDIUM-HIGH** ⚠️

**Critical Issues:** 3  
**High Issues:** 4  
**Medium Issues:** 2  
**Low Issues:** 1

---

## 🔴 Critical Security Issues

### 1. **No Authentication on API Endpoints**
**Severity:** CRITICAL  
**Impact:** Any user can make unlimited API calls, potentially incurring costs

**Details:**
- `/query` endpoint accepts requests from any origin without authentication
- No API key, token, or user authentication required
- Public access to AI inference services

**Risk:**
- Unlimited abuse potential
- Cost escalation from malicious usage
- Resource exhaustion attacks

**Recommendation:**
```typescript
// Add API key validation
const API_KEY = env.API_KEY; // Set as Worker secret
const providedKey = request.headers.get("X-API-Key");
if (!API_KEY || providedKey !== API_KEY) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), { 
    status: 401,
    headers: corsHeaders 
  });
}
```

**Priority:** **IMMEDIATE** - Implement before production use

---

### 2. **CORS Set to Wildcard (`*`)**
**Severity:** CRITICAL  
**Impact:** Any website can make requests to your API from the browser

**Current Code:**
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",  // ⚠️ ALLOWS ALL ORIGINS
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
```

**Risk:**
- Any malicious website can call your API from user's browser
- CSRF attacks possible
- Credential theft via browser requests

**Recommendation:**
```typescript
// Restrict to specific origins
const allowedOrigins = [
  "https://lornu.ai",
  "https://www.lornu.ai",
  // Add staging if needed: "https://staging.lornu.ai"
];

const origin = request.headers.get("Origin");
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigins.includes(origin || "") 
    ? origin || "*" 
    : "null",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key", // Add API key header
  "Access-Control-Allow-Credentials": "false",
};
```

**Priority:** **IMMEDIATE** - Fix before production

---

### 3. **No Rate Limiting**
**Severity:** CRITICAL  
**Impact:** Potential for abuse, DDoS, cost escalation

**Details:**
- No request rate limiting implemented
- No per-IP throttling
- No per-API-key quotas
- KV caching exists but won't prevent rapid-fire requests

**Risk:**
- API abuse and cost escalation
- DDoS-like attacks from single source
- Resource exhaustion

**Recommendation:**
Use Cloudflare Rate Limiting:
```jsonc
// wrangler.jsonc - Add rate limit binding
"rate_limits": [
  {
    "name": "API_RATE_LIMIT",
    "limit": {
      "requests": 100,
      "period": 60 // 100 requests per minute
    }
  }
]
```

Or implement custom rate limiting with KV:
```typescript
async function checkRateLimit(ip: string, env: Env): Promise<boolean> {
  const key = `rate_limit:${ip}`;
  const count = await env.RAG_KV.get(key);
  const currentCount = count ? parseInt(count) : 0;
  
  if (currentCount >= 100) { // 100 requests per minute
    return false;
  }
  
  await env.RAG_KV.put(key, String(currentCount + 1), { expirationTtl: 60 });
  return true;
}
```

**Priority:** **HIGH** - Implement soon

---

## 🟠 High Security Issues

### 4. **Information Disclosure in `/status` Endpoint**
**Severity:** HIGH  
**Impact:** Exposes configuration details, infrastructure info

**Current Response:**
```typescript
{
  ok: true,
  version: "2.2.1",
  timestamp: "...",
  models: ["cloudflare", "gemini"],
  gatewayId: "{GATEWAY_ID}", // ⚠️ (redacted)
  gatewayUrl: "https://gateway.ai.cloudflare.com/v1/...", // ⚠️
  vertexAiConfigured: true,
  vertexAiAuthConfigured: true,
  vertexAiTokenCached: true
}
```

**Risk:**
- Gateway ID exposed (could aid in attacks)
- Configuration state revealed
- Version information can be used for targeted exploits

**Recommendation:**
- Remove sensitive IDs from public status endpoint
- Move detailed status to authenticated admin endpoint
- Return minimal public status (just `ok: true`)

**Priority:** **HIGH** - Address quickly

---

### 5. **AI Gateway Authentication Disabled**
**Severity:** HIGH  
**Impact:** Gateway is publicly accessible without authentication token

**Status:** Authentication is currently disabled in gateway dashboard

**Risk:**
- Anyone can use your gateway endpoint directly
- Bypass worker controls
- Cost escalation

**Recommendation:**
- Enable "Authenticated Gateway" in Cloudflare dashboard
- Create gateway authentication token
- Store as `AI_GATEWAY_AUTH_TOKEN` secret
- Code already supports this (just needs token configured)

**Priority:** **HIGH** - Enable gateway authentication

---

### 6. **Error Messages May Leak Sensitive Information**
**Severity:** HIGH  
**Impact:** Error responses might expose internal details

**Current Code:**
```typescript
// Error messages include account IDs and URLs
const error = new Error(
  `AI Gateway configuration required (error 2001): ${gatewayError.message}. ` +
  `See: https://dash.cloudflare.com/{ACCOUNT_ID}/ai/ai-gateway` // ⚠️ (redacted)
);
```

**Risk:**
- Account IDs exposed in error messages
- Internal URLs revealed
- Stack traces could leak code structure

**Recommendation:**
- Sanitize error messages for public endpoints
- Don't expose account IDs or internal URLs
- Use generic error messages for users, detailed logs for admins

**Priority:** **MEDIUM-HIGH** - Improve error handling

---

### 7. **No Input Validation/Sanitization**
**Severity:** HIGH  
**Impact:** Potential injection attacks, malformed requests

**Current Code:**
```typescript
const prompt: string = body.prompt; // ⚠️ No validation
const model: AIModel = body.model || "cloudflare"; // ⚠️ Limited validation
const modelName: string | undefined = body.modelName; // ⚠️ No validation
```

**Risk:**
- Prompt injection attacks
- Extremely long prompts causing resource exhaustion
- Malformed requests causing crashes

**Recommendation:**
```typescript
// Add input validation
if (!prompt || typeof prompt !== "string") {
  return errorResponse("Invalid prompt", "invalid_request");
}

if (prompt.length > 10000) { // Set reasonable limit
  return errorResponse("Prompt too long (max 10000 characters)", "invalid_request");
}

// Validate model name format
if (modelName && !/^[a-z0-9\-/@_.]+$/i.test(modelName)) {
  return errorResponse("Invalid model name format", "invalid_request");
}
```

**Priority:** **MEDIUM-HIGH** - Add validation

---

## 🟡 Medium Security Issues

### 8. **No Request Size Limits**
**Severity:** MEDIUM  
**Impact:** Large requests could cause resource exhaustion

**Details:**
- No explicit size limits on request body
- Very large prompts could cause issues
- JSON parsing could fail on huge payloads

**Recommendation:**
- Add Cloudflare Workers request size limits (default is 100MB, but should limit at app level)
- Limit prompt length to reasonable size (e.g., 10,000 characters)
- Validate JSON body size before parsing

**Priority:** **MEDIUM** - Add reasonable limits

---

### 9. **Cache Keys Could Be Manipulated**
**Severity:** MEDIUM  
**Impact:** Cache poisoning, denial of service

**Current Code:**
```typescript
const cacheKey = modelName ? `${model}:${modelName}:${prompt}` : `${model}:${prompt}`;
const key = await hashPrompt(cacheKey, model);
```

**Risk:**
- If hash collision possible, could poison cache
- No cache key expiration validation
- Large cache keys could cause issues

**Recommendation:**
- Hash function (SHA-256) is good, but add length limits
- Add cache key validation
- Monitor cache hit rates for anomalies

**Priority:** **LOW-MEDIUM** - Monitor for issues

---

## 🟢 Low Security Issues

### 10. **No Request Logging/Auditing**
**Severity:** LOW  
**Impact:** Difficult to track abuse or investigate incidents

**Details:**
- No structured logging of requests
- No audit trail
- Hard to detect abuse patterns

**Recommendation:**
- Add request logging (Cloudflare Workers logs automatically)
- Log: IP address, timestamp, endpoint, model used, prompt length
- Use Cloudflare Analytics for monitoring

**Priority:** **LOW** - Nice to have

---

## ✅ Security Strengths

1. **Cloudflare Workers Platform**
   - DDoS protection built-in
   - Edge security
   - Automatic TLS/HTTPS
   - Observability enabled

2. **Secrets Management**
   - Secrets stored as Worker secrets (encrypted)
   - Not exposed in code or environment variables

3. **CORS Preflight Handling**
   - Proper OPTIONS handling (even if too permissive)

4. **TypeScript Type Safety**
   - Compile-time type checking reduces errors

5. **Error Handling**
   - Structured error responses
   - Error codes for categorization

---

## 🛡️ Immediate Action Plan

### Phase 1: Critical Fixes (Do Now)
1. ✅ **Restrict CORS** - Change from `*` to specific origins
2. ✅ **Add API Authentication** - Require API key for `/query` endpoint
3. ✅ **Enable Gateway Authentication** - Turn on in Cloudflare dashboard

### Phase 2: High Priority (This Week)
4. ✅ **Implement Rate Limiting** - Add per-IP or per-API-key limits
5. ✅ **Sanitize `/status` Endpoint** - Remove sensitive information
6. ✅ **Add Input Validation** - Validate and sanitize all inputs
7. ✅ **Improve Error Messages** - Don't expose internal details

### Phase 3: Medium Priority (Next Sprint)
8. ✅ **Add Request Size Limits** - Limit prompt length
9. ✅ **Enhance Logging** - Add structured request logging
10. ✅ **Monitor and Alert** - Set up abuse detection

---

## 📊 Risk Matrix

| Risk | Likelihood | Impact | Priority |
|------|-----------|--------|----------|
| API Abuse (No Auth) | High | High | **CRITICAL** |
| CORS Wildcard | High | Medium | **CRITICAL** |
| No Rate Limiting | Medium | High | **HIGH** |
| Info Disclosure | Low | Medium | **HIGH** |
| Gateway Auth Disabled | Medium | Medium | **HIGH** |
| Input Validation | Low | Medium | **MEDIUM** |

---

## 🔗 Additional Resources

- [Cloudflare Workers Security Best Practices](https://developers.cloudflare.com/workers/learning/security-best-practices/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Cloudflare Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)

---

## 📝 Recommendations Summary

1. **Implement API authentication** (API key or token-based)
2. **Restrict CORS** to specific origins
3. **Enable AI Gateway authentication**
4. **Add rate limiting** (per IP or API key)
5. **Sanitize error messages** and status endpoint
6. **Add input validation** and size limits
7. **Monitor for abuse** and set up alerts

**Estimated Time to Fix Critical Issues:** 2-4 hours  
**Estimated Time to Fix High Issues:** 1-2 days

---

**Assessment completed by:** AI Security Analysis  
**Next Review Date:** After critical fixes implemented

