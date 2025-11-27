# Staging vs Production Deployment Guide

## Current Setup ✅

The project has **separate staging and production deployments** configured:

### Staging Environment

**Workflow**: `.github/workflows/deploy-staging.yml`
- **Triggers**: Pushes to `develop` branch
- **Worker Name**: `not-sure-staging`
- **Config File**: `wrangler.staging.jsonc`
- **URL**: `not-sure-staging.*.workers.dev` (or custom domain if configured)

### Production Environment

**Workflow**: `.github/workflows/deploy.yml`
- **Triggers**: Pushes to `main` branch
- **Worker Name**: `not-sure`
- **Config File**: `wrangler.jsonc`
- **URL**: `lornu.ai` and `www.lornu.ai`

## How They're Separated

### 1. Different Worker Names
- **Staging**: `not-sure-staging` (separate Worker instance)
- **Production**: `not-sure` (production Worker instance)

### 2. Different Configuration Files
- **Staging**: `wrangler.staging.jsonc`
- **Production**: `wrangler.jsonc`

### 3. Different Git Branches
- **Staging**: Deploys from `develop` branch
- **Production**: Deploys from `main` branch

### 4. Same Bindings (Shared Resources)
Both environments use the same:
- ✅ KV Namespace: `RAG_KV` (shared cache)
- ✅ R2 Bucket: `not_sure_assets` (shared storage)
- ✅ AI Gateway: Same gateway ID
- ✅ AI Binding: Same AI service

**Note**: This means staging and production share the same data stores. If you want completely isolated staging, you'd need separate KV namespaces and R2 buckets.

## Deployment Flow

```
┌─────────────────┐
│  Feature Branch │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  develop branch │ ───▶ │ Staging Worker   │
│  (PR merged)     │      │ not-sure-staging │
└─────────────────┘      └──────────────────┘
         │
         │ (after testing)
         ▼
┌─────────────────┐      ┌──────────────────┐
│   main branch   │ ───▶ │ Production Worker │
│  (merged)       │      │ not-sure          │
└─────────────────┘      │ lornu.ai         │
                          └──────────────────┘
```

## Testing the Separation

### Verify Staging Deployment
```bash
# Check staging Worker
bunx wrangler deployments list --config wrangler.staging.jsonc

# Test staging URL
curl https://not-sure-staging.*.workers.dev/status
```

### Verify Production Deployment
```bash
# Check production Worker
bunx wrangler deployments list

# Test production URL
curl https://lornu.ai/status
```

## Isolated Staging (Optional)

If you want **completely isolated staging** with separate data stores:

1. **Create separate KV namespace** for staging:
   ```bash
   bunx wrangler kv:namespace create "RAG_KV_STAGING" --config wrangler.staging.jsonc
   ```

2. **Create separate R2 bucket** for staging:
   - Update `wrangler.staging.jsonc` with new bucket name

3. **Update staging config**:
   ```jsonc
   "kv_namespaces": [
     {
       "binding": "RAG_KV",
       "id": "<staging-kv-id>"
     }
   ],
   "r2_buckets": [
     {
       "binding": "not_sure_assets",
       "bucket_name": "not-sure-assets-staging"
     }
   ]
   ```

## Current Status

✅ **Staging and Production are separated by:**
- Different Worker instances
- Different deployment workflows
- Different Git branches
- Different configuration files

⚠️ **They share:**
- Same KV namespace (cache)
- Same R2 bucket (assets)
- Same AI Gateway

This is a **common setup** - staging and production share infrastructure but are separate deployments.

## URLs

- **Staging**: `https://not-sure-staging.*.workers.dev`
- **Production**: `https://lornu.ai` / `https://www.lornu.ai`

To add a custom staging domain (e.g., `staging.lornu.ai`):
1. Add DNS record in Cloudflare
2. Update `wrangler.staging.jsonc` routes section
3. Redeploy

