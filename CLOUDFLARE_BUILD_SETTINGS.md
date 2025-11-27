# Cloudflare Build Command Configuration

## ✅ GitHub Actions (Current - Already Correct)

The GitHub Actions workflows **already use** `bun run build`:

- **Staging**: `.github/workflows/deploy-staging.yml` → Line 30: `bun run build`
- **Production**: `.github/workflows/deploy.yml` → Line 29: `bun run build`

✅ **No changes needed** - GitHub Actions workflows are correctly configured.

## ⚠️ Cloudflare Dashboard Settings

If you have **Cloudflare Pages** or **Workers** auto-deployment enabled in the dashboard, update the build command there:

### For Cloudflare Pages:

1. Go to **Cloudflare Dashboard** → **Pages** → Your project
2. Navigate to **Settings** → **Builds & deployments**
3. Update **Build command** to: `bun run build`
4. Ensure **Build output directory** is: `dist`
5. Save changes

### For Cloudflare Workers (if using dashboard deployment):

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → Your Worker
2. Navigate to **Settings** → **Builds** (if available)
3. Update **Build command** to: `bun run build`
4. Save changes

## Recommended: Disable Dashboard Auto-Deployment

**To avoid double deployments**, disable Cloudflare dashboard auto-deployment and use GitHub Actions only:

1. **Cloudflare Pages**: Disable "Auto-deploy from Git" in Settings
2. **Cloudflare Workers**: Don't enable Git integration
3. **Use GitHub Actions**: All deployments via `.github/workflows/`

## Current Deployment Flow

```
Code Push → GitHub Actions → bun run build → wrangler deploy → Cloudflare Workers
```

✅ Build command: `bun run build` (in GitHub Actions workflows)  
✅ No dashboard build settings needed if using GitHub Actions

