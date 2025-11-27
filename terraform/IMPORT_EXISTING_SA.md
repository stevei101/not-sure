# Import Existing Service Account into Terraform

## Current Situation

You have an existing service account that was created manually:
- **Email**: `cloudflare-workers-vertex-ai@vertex-ai-rag-search-p0.iam.gserviceaccount.com`
- **Project**: `vertex-ai-rag-search-p0`
- **Service Account ID**: `cloudflare-workers-vertex-ai` (inferred from email)

## Why Import Instead of Create?

- ✅ Avoid duplicate service accounts
- ✅ Manage existing infrastructure with Terraform
- ✅ Track IAM role changes in version control
- ✅ Maintain consistency

## Import Steps

### 1. Update Terraform Configuration

Update `terraform/service_account.tf` to match the existing service account:

```hcl
resource "google_service_account" "vertex_ai" {
  project      = var.project_id  # Should be "vertex-ai-rag-search-p0"
  account_id   = "cloudflare-workers-vertex-ai"  # Match existing
  display_name = "Cloudflare Workers Vertex AI"  # Or whatever it currently is
}
```

### 2. Import the Resource

Run this command to import the existing service account:

```bash
cd terraform
terraform import google_service_account.vertex_ai \
  projects/vertex-ai-rag-search-p0/serviceAccounts/cloudflare-workers-vertex-ai@vertex-ai-rag-search-p0.iam.gserviceaccount.com
```

### 3. Import IAM Roles

If the service account has existing IAM role bindings, you'll need to import those too:

```bash
# For each role binding, import it like this:
terraform import google_project_iam_member.vertex_ai_roles["roles/aiplatform.user"] \
  "projects/vertex-ai-rag-search-p0 roles/aiplatform.user serviceAccount:cloudflare-workers-vertex-ai@vertex-ai-rag-search-p0.iam.gserviceaccount.com"
```

**Note**: IAM role bindings created outside Terraform might conflict. You may need to remove them manually first or let Terraform manage them going forward.

### 4. Verify State

After import, run:

```bash
terraform plan
```

Terraform should show no changes (or minimal changes if you adjust the configuration to match reality).

## About GCP_SA_KEY

The `GCP_SA_KEY` is **optional** and only needed if:

1. **Cloudflare Workers needs to authenticate to Vertex AI**:
   - Cloudflare Workers cannot use Workload Identity Federation
   - They need a service account JSON key to call Vertex AI APIs
   - This key would be stored as a Cloudflare Worker secret

2. **Terraform Cloud needs service account auth** (instead of WIF):
   - Your workflow uses WIF, so this isn't needed
   - But you could generate a key if needed for Terraform Cloud backend

3. **Local development**:
   - You might want a key for local `gcloud` or Terraform operations

**The service account exists without a key** - keys are just credentials used to authenticate as that service account.

## Next Steps

1. Decide: Import existing SA or create new one?
2. If importing: Update `service_account_id` variable to match existing
3. If creating new: The current Terraform config will create it
4. Generate key only if Cloudflare Workers needs it for Vertex AI auth

