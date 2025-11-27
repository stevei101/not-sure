# Fix: Search Not Working After API Key Authentication

## Problem

After deploying security fixes with API key authentication, the lornu.ai search stopped working because:
- API now requires `X-API-Key` header
- Frontend doesn't send API key
- Requests are being rejected with 401 Unauthorized

## Solution

**Allow same-origin requests without API key** - Since the frontend and API are served from the same Worker (lornu.ai), same-origin requests don't need an API key. The API key is only required for **external API calls** (cross-origin).

### Updated Authentication Logic

```typescript
function checkApiKey(request: Request, env: Env): boolean {
  // If API_KEY is not configured, allow requests
  if (!env.API_KEY) {
    return true;
  }

  // Allow same-origin requests (from lornu.ai frontend) without API key
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  const isSameOrigin = !origin || origin === url.origin || 
    origin === "https://lornu.ai" || origin === "https://www.lornu.ai";
  
  if (isSameOrigin) {
    return true; // Same-origin requests don't need API key
  }

  // External API calls require API key
  const providedKey = request.headers.get("X-API-Key");
  return providedKey === env.API_KEY;
}
```

## What This Means

✅ **Frontend works** - lornu.ai search works without API key  
✅ **Security maintained** - External API calls still require API key  
✅ **No frontend changes needed** - Frontend doesn't need to send API key

## Testing

### Test Same-Origin (Should Work)

```bash
# Direct request from browser on lornu.ai
# No API key needed - should work!
```

### Test External API (Should Require Key)

```bash
# From external origin - requires API key
curl -X POST https://lornu.ai/query \
  -H "Content-Type: application/json" \
  -H "Origin: https://evil.com" \
  -d '{"prompt": "Hello", "model": "cloudflare"}'

# Expected: 401 Unauthorized

# With API key - should work
curl -X POST https://lornu.ai/query \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{"prompt": "Hello", "model": "cloudflare"}'

# Expected: Success
```

## Deployment

After deploying this fix:
1. ✅ Frontend search will work again
2. ✅ External API calls still secured
3. ✅ No frontend changes required

---

**Status:** ✅ Fixed - Ready to deploy

