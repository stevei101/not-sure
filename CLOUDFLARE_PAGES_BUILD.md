# Cloudflare Pages Build Configuration

## ⚠️ Important: Build Settings

If you're deploying via **Cloudflare Pages** (not just Workers), you need to configure the build settings correctly in the Cloudflare dashboard.

## Required Build Settings

### Build Command
```
bun run build
```

**NOT** `bun install` (this only installs dependencies, doesn't build the app)

### Build Output Directory
```
dist
```

### Root Directory
```
/
```
(Leave as default, or set to repository root)

## Why This Matters

The deployment process needs:
1. ✅ **Install dependencies**: `bun install` (happens automatically)
2. ✅ **Build React app**: `bun run build` (creates `dist/` directory)
3. ✅ **Deploy assets**: Wrangler uploads from `dist/`

If the build command is set to `bun install`:
- ❌ Dependencies install, but `dist/` is never created
- ❌ Wrangler tries to upload from non-existent `dist/` directory
- ❌ Deployment fails with "dist doesn't exist" error

## How to Update in Cloudflare Dashboard

1. Go to **Cloudflare Dashboard** → **Pages** → Your project
2. Navigate to **Settings** → **Builds & deployments**
3. Update **Build command** to: `bun run build`
4. Ensure **Build output directory** is: `dist`
5. Save changes

## Alternative: Use GitHub Actions (Recommended)

Instead of Cloudflare Pages auto-deploy, use the GitHub Actions workflows:
- **Staging**: `.github/workflows/deploy-staging.yml` (deploys on `develop`)
- **Production**: `.github/workflows/deploy.yml` (deploys on `main`)

These workflows:
- ✅ Run `bun run build` automatically
- ✅ Deploy via `wrangler deploy`
- ✅ More control over the deployment process

## Current Setup

This project uses **Cloudflare Workers** (not Pages) with:
- Worker serves both API endpoints (`/query`, `/status`) and static assets
- Static assets come from `dist/` directory (built React app)
- Configuration in `wrangler.jsonc` and `wrangler.staging.jsonc`

If you're seeing Cloudflare Pages errors, you may have:
1. Connected the repo to Cloudflare Pages (instead of Workers)
2. Need to update the build command in Pages settings
3. Or switch to using Workers deployment via GitHub Actions

