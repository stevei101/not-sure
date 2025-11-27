# Import Troubleshooting

## Current Issue

The import command is failing with:
```
Error 403: Permission 'iam.serviceAccounts.get' denied on resource
```

## Root Cause

The local GCP account (`s73ven.1rvin@gmail.com`) doesn't have access to the project `vertex-ai-rag-search-p0`.

## Solutions

### Option 1: Switch GCP Account (Recommended)

If you have another account with access to the project:

```bash
# Switch to the account with access
gcloud auth login <account-email>
gcloud config set project vertex-ai-rag-search-p0

# Re-authenticate application-default credentials
gcloud auth application-default login

# Then retry the import
cd terraform
export TF_VAR_project_id="vertex-ai-rag-search-p0"
/opt/homebrew/bin/terraform import \
  -var="project_id=vertex-ai-rag-search-p0" \
  google_service_account.vertex_ai \
  projects/vertex-ai-rag-search-p0/serviceAccounts/cloudflare-workers-vertex-ai@vertex-ai-rag-search-p0.iam.gserviceaccount.com
```

### Option 2: Skip Import (Acceptable for this case)

Since the service account already exists and matches our Terraform configuration, you can:

1. **Just run `terraform plan`** - Terraform will show it wants to create the resource
2. **Remove the service account from GCP** (if you want Terraform to manage it from scratch)
3. **Or manually add to state** (complex, not recommended)

Actually, since the resource already exists, when you run `terraform apply`, it might:
- Try to create it, fail because it exists, and you can then import
- Or if Terraform Cloud has the right permissions, it might detect the existing resource

### Option 3: Grant Local Account Access

If you have admin access to the project, grant yourself access:

```bash
# Grant yourself serviceAccountViewer role
gcloud projects add-iam-policy-binding vertex-ai-rag-search-p0 \
  --member="user:s73ven.1rvin@gmail.com" \
  --role="roles/iam.serviceAccountViewer"
```

### Option 4: Use Terraform Cloud's Remote Execution (Advanced)

If Terraform Cloud has GCP workspace integration configured correctly, you might be able to use the Terraform Cloud API to trigger an import run. However, this is complex and typically not necessary.

## Recommended Next Step

**For now, let's proceed with Option 2**: Since the service account already exists and matches our configuration, we can:

1. Continue with the rest of PR 2.1 (IAM roles, Secret Manager, etc.)
2. Deal with the import later, or
3. Just let Terraform manage it going forward (it will detect the existing resource and manage changes)

The service account configuration in `terraform/service_account.tf` matches the existing one, so once imported (or recreated), everything should align.

