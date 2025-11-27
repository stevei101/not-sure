# Import Existing Service Account into Terraform

## Existing Service Account

- **Email**: `cloudflare-workers-vertex-ai@vertex-ai-rag-search-p0.iam.gserviceaccount.com`
- **Account ID**: `cloudflare-workers-vertex-ai`
- **Project**: `vertex-ai-rag-search-p0`

## Import Steps

### 1. Update Variables (if needed)

The Terraform variables have been updated to match the existing service account:
- `service_account_id` = `"cloudflare-workers-vertex-ai"`
- `service_account_display_name` = `"Cloudflare Workers Vertex AI"`

### 2. Import the Service Account

Run this command to import the existing service account into Terraform state:

```bash
cd terraform

# Set the project ID (if not already set)
export TF_VAR_project_id="vertex-ai-rag-search-p0"

# Import the service account
terraform import google_service_account.vertex_ai \
  projects/vertex-ai-rag-search-p0/serviceAccounts/cloudflare-workers-vertex-ai@vertex-ai-rag-search-p0.iam.gserviceaccount.com
```

### 3. Import IAM Role Bindings (if they exist)

If the service account already has IAM roles assigned, you'll need to import those as well. Check which roles exist:

```bash
gcloud projects get-iam-policy vertex-ai-rag-search-p0 \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:cloudflare-workers-vertex-ai@vertex-ai-rag-search-p0.iam.gserviceaccount.com" \
  --format="table(bindings.role)"
```

Then import each role binding (replace ROLE_NAME with actual role):

```bash
terraform import 'google_project_iam_member.vertex_ai_roles["roles/aiplatform.user"]' \
  "projects/vertex-ai-rag-search-p0 roles/aiplatform.user serviceAccount:cloudflare-workers-vertex-ai@vertex-ai-rag-search-p0.iam.gserviceaccount.com"
```

### 4. Verify Import

After importing, run:

```bash
terraform plan
```

Terraform should show minimal or no changes if the configuration matches the existing state. If there are differences, Terraform will show what would change.

### 5. Handle Secret Manager (if secret already exists)

If the service account key is already stored in Secret Manager, you may need to import that secret too:

```bash
# Check if secret exists
gcloud secrets describe vertex-ai-service-account-key \
  --project=vertex-ai-rag-search-p0

# If it exists, import it
terraform import google_secret_manager_secret.vertex_ai_sa_key \
  projects/vertex-ai-rag-search-p0/secrets/vertex-ai-service-account-key
```

**Note**: If a key was already generated manually, you might want to:
- Leave the existing key as-is, OR
- Let Terraform create a new key and update the secret

## Important Notes

- **Do NOT run `terraform apply` before importing** - this would try to create a duplicate service account
- **Import the service account first** before importing IAM bindings
- **Check existing IAM roles** - Terraform will manage only the roles defined in the configuration
- **Secret Manager** - If a secret already exists, decide whether to import it or let Terraform create a new one

