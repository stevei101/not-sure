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

### Option 1: Preview/Staging Subdomain (Recommended)
Deploy to a staging subdomain first to test before production:

1. **Create staging Worker**:
   ```bash
   # Create new wrangler config for staging
   wrangler deploy --name not-sure-staging
   ```

2. **Add staging route** to `wrangler.jsonc`:
   ```jsonc
   "routes": [
     {
       "pattern": "staging.lornu.ai",
       "custom_domain": true
     }
   ]
   ```

3. **Test on staging** before merging to `main`

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

