# Import Service Account via Terraform Cloud

Since we're using Terraform Cloud, the import needs to be done through Terraform Cloud's remote execution.

## ⚠️ Important: UI Options Don't Support Imports

**None of the Terraform Cloud UI run options directly support imports:**
- ❌ Plan and Apply (standard) - Normal plan/apply, not for imports
- ❌ Refresh State - Only refreshes existing state
- ❌ Plan Only - Just runs terraform plan
- ❌ Allow empty apply - Allows apply with no changes

**Imports must be done via CLI** (which executes remotely in Terraform Cloud).

## Recommended Workflow

### Step 1: Run "Plan Only" in UI (Optional)

First, run a "Plan Only" in Terraform Cloud UI to see what Terraform would create:
- Go to: https://app.terraform.io/app/disposable-org/workspaces/not-sure
- Click "Actions" → "Start new plan" → Select "Plan Only"
- This shows you what resources Terraform wants to create

### Step 2: Import via CLI (Required)

The import must be done via CLI. The command will execute remotely in Terraform Cloud:

```bash
cd terraform
export TF_VAR_project_id="vertex-ai-rag-search-p0"

# Use the helper script (recommended)
./scripts/import-service-account.sh

# OR run the import command directly:
terraform import \
  -var="project_id=vertex-ai-rag-search-p0" \
  google_service_account.vertex_ai \
  projects/vertex-ai-rag-search-p0/serviceAccounts/cloudflare-workers-vertex-ai@vertex-ai-rag-search-p0.iam.gserviceaccount.com
```

**Note:** If you get a version mismatch error, you can:
- Upgrade local Terraform to >= 1.14.0 (recommended)
- Or use `-ignore-remote-version` flag (not recommended, but works)

### Step 3: Verify with "Plan Only"

After import, run another "Plan Only" in the UI to verify:
- You should see **no changes** if the import was successful
- The service account should show as already in state

## Alternative: Import via Terraform Cloud CLI

First, authenticate with Terraform Cloud:

```bash
terraform login
```

Then run the import command (this will execute in Terraform Cloud):

```bash
cd terraform
export TF_VAR_project_id="vertex-ai-rag-search-p0"

terraform import \
  -var="project_id=vertex-ai-rag-search-p0" \
  google_service_account.vertex_ai \
  projects/vertex-ai-rag-search-p0/serviceAccounts/cloudflare-workers-vertex-ai@vertex-ai-rag-search-p0.iam.gserviceaccount.com
```

## Option 3: Update Terraform Cloud Workspace Variables

1. Ensure `TF_VAR_project_id` is set to `vertex-ai-rag-search-p0` in Terraform Cloud workspace
2. The import command above should work if Terraform Cloud has proper GCP authentication configured

## Verification

After import, verify with:

```bash
terraform plan -var="project_id=vertex-ai-rag-search-p0"
```

You should see no changes if the configuration matches the existing service account.


