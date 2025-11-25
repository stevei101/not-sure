# Deployment Strategy for Not Sure V2

## Current Situation

- **Production Domain**: `lornu.ai` and `www.lornu.ai`
- **Current Deployment**: Old HTML/JS frontend served from `./public`
- **New Deployment**: React app served from `./dist`
- **CI/CD Trigger**: Only deploys on pushes to `main` branch
- **PR Target**: `develop` branch (safe - won't auto-deploy)

## Deployment Safety

### ✅ Safe to Merge to `develop`
- Merging this PR to `develop` will **NOT** trigger deployment
- CI/CD only runs on `main` branch pushes
- Production remains unchanged

### ⚠️ When Merging `develop` → `main`
- This **WILL** trigger automatic deployment
- Will replace current production frontend
- Backend API endpoints remain the same (`/query`, `/status`)

## Recommended Deployment Options

### Option 1: Preview/Staging Subdomain (Recommended) ✅ IMPLEMENTED
Deploy to a staging subdomain first to test before production:

**Configuration Files Created:**
- `wrangler.staging.jsonc` - Staging Worker configuration
- `.github/workflows/deploy-staging.yml` - Auto-deploy to staging on `develop` branch

**Setup Steps:**

1. **Configure DNS** (if using custom subdomain):
   - Add `staging.lornu.ai` or `v2.lornu.ai` DNS record in Cloudflare
   - Point to your Cloudflare account

2. **Update staging routes** in `wrangler.staging.jsonc`:
   ```jsonc
   "routes": [
     {
       "pattern": "staging.lornu.ai",
       "custom_domain": true
     }
   ]
   ```
   Or use the default `workers.dev` subdomain: `not-sure-staging.*.workers.dev`

3. **Deploy to staging**:
   ```bash
   # Manual deployment
   bun run build
   bun wrangler deploy --config wrangler.staging.jsonc
   ```
   
   Or let CI/CD handle it (auto-deploys on `develop` branch pushes)

4. **Test on staging** before merging to `main`

**Benefits:**
- ✅ Safe testing environment separate from production
- ✅ Auto-deploys on `develop` branch (no manual steps)
- ✅ Same codebase, isolated deployment
- ✅ Can test with real RAG and AI Gateway

### Option 2: Cloudflare Workers Preview Deployments
Use Wrangler's preview deployments:

```bash
# Generate preview URL without deploying to production
wrangler deploy --dry-run
# or
wrangler pages deploy dist --project-name=not-sure-preview
```

### Option 3: Feature Flag / Gradual Rollout
Add a feature flag to switch between old and new frontend:

```typescript
// In Worker
const useNewUI = env.USE_NEW_UI === "true";
if (useNewUI) {
  // Serve from dist/
} else {
  // Serve from public/
}
```

### Option 4: Direct Merge with Monitoring (Fastest)
If confident in the changes:
1. Merge `develop` → `main`
2. Monitor deployment
3. Rollback if issues (revert commit)

## Current Configuration

The Worker serves:
- **Static Assets**: From `./dist` (React app)
- **API Endpoints**: `/query` (RAG), `/status` (health check)
- **Routes**: `lornu.ai`, `www.lornu.ai`

## ⚠️ Deployment Method: GitHub Actions Only

**This project uses GitHub Actions for deployment** - do NOT enable Cloudflare Pages auto-deployment.

**Current Setup:**
- ✅ **Staging**: Auto-deploys via GitHub Actions on `develop` branch
- ✅ **Production**: Auto-deploys via GitHub Actions on `main` branch
- ✅ Both use `wrangler deploy` to Cloudflare Workers

**If you see Cloudflare Pages errors:**
- Disable Cloudflare Pages auto-deployment in the dashboard
- Use GitHub Actions workflows instead (already configured)
- See `CLOUDFLARE_PAGES_BUILD.md` for details

**Why GitHub Actions:**
- ✅ Single deployment method (no conflicts)
- ✅ Full control over build and deploy process
- ✅ Consistent CI/CD pipeline
- ✅ Better integration with GitHub

## Rollback Plan

If deployment fails:
1. Revert the commit on `main`
2. Or manually deploy previous version:
   ```bash
   git checkout <previous-commit>
   bun run build
   wrangler deploy
   ```

## Recommendation

**For this PR**: Safe to merge to `develop` - no production impact.

**Before merging to `main`**: 
1. Test locally: `bun run build && bun wrangler dev`
2. Consider staging deployment first
3. Monitor after merge to `main`

