# Cloudflare Pages Build Configuration

## Issue
If you see this error:
```
✘ [ERROR] The directory specified by the "assets.directory" field in your configuration file does not exist: /opt/buildhome/repo/dist
```

This means the **build command** in Cloudflare Pages is incorrect.

## Fix

In your Cloudflare Pages dashboard settings, update the build configuration:

### Build Command
Change from:
```
bun install
```

To:
```
bun run build
```

### Build Output Directory
Ensure it's set to:
```
dist
```

## Why This Happens

The `dist` directory is created by running `bun run build`, which:
1. Runs TypeScript compiler (`tsc`)
2. Builds the React app with Vite (`vite build`)

Simply running `bun install` only installs dependencies but doesn't build the project.

## Verification

After updating the build command, the build should:
1. ✅ Install dependencies (`bun install`)
2. ✅ Build the React app (`bun run build`) → creates `dist/` directory
3. ✅ Deploy assets from `dist/` directory

## Alternative: Use GitHub Actions

If you prefer to use GitHub Actions instead of Cloudflare Pages:
- The `.github/workflows/deploy.yml` already has the correct build step
- It runs `bun run build` before deploying
- Deploys using `bunx wrangler deploy`
