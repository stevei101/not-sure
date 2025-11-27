# Service Account Import Workflow

## Quick Answer: Which Terraform Cloud UI Option?

**None of them directly support imports!** However, here's the recommended workflow:

## Workflow Steps

### 1. First, Run "Plan Only" (Optional - to see what would be created)

1. Go to: https://app.terraform.io/app/disposable-org/workspaces/not-sure
2. Click "Actions" → "Start new plan"
3. Select **"Plan Only"**
4. This shows you what Terraform would create (the service account)

### 2. Import via CLI (Required)

Imports **must** be done via CLI. The command executes remotely in Terraform Cloud:

```bash
cd terraform

# Option A: Use the helper script (easiest)
./scripts/import-service-account.sh

# Option B: Run import command directly
export TF_VAR_project_id="vertex-ai-rag-search-p0"
terraform import \
  -var="project_id=vertex-ai-rag-search-p0" \
  google_service_account.vertex_ai \
  projects/vertex-ai-rag-search-p0/serviceAccounts/cloudflare-workers-vertex-ai@vertex-ai-rag-search-p0.iam.gserviceaccount.com
```

**If you get a version mismatch:**
- Your local Terraform is 1.13.4
- Terraform Cloud requires ~> 1.14.0
- **Option 1 (recommended):** Upgrade Terraform locally: `brew upgrade terraform` (or download from terraform.io)
- **Option 2:** Use `-ignore-remote-version` flag (not ideal, but works)

### 3. Verify with "Plan Only" (After import)

1. Go back to Terraform Cloud UI
2. Run another **"Plan Only"**
3. You should see **"No changes"** - the service account is now imported!

## Summary

| UI Option | Purpose | Works for Import? |
|-----------|---------|-------------------|
| Plan and Apply (standard) | Normal plan/apply | ❌ No |
| Refresh State | Refresh existing state | ❌ No |
| Plan Only | Run terraform plan | ✅ Use to verify |
| Allow empty apply | Allow apply with no changes | ❌ No |

**Bottom line:** Use CLI for import, UI "Plan Only" to verify!

