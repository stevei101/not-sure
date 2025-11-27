# Workload Identity Federation Setup via Terraform

## Overview

Workload Identity Federation (WIF) is now **automated via Terraform**! Once you run `terraform apply`, WIF will be automatically configured for your GitHub Actions workflow.

## What Gets Created

When you run Terraform, it will automatically create:

1. ✅ **Workload Identity Pool** (`github-actions-pool`)
2. ✅ **OIDC Provider** (`github-provider`) - configured for GitHub Actions
3. ✅ **Service Account** (`github-actions@[PROJECT_ID].iam.gserviceaccount.com`)
4. ✅ **IAM Roles** - All necessary permissions for Terraform operations
5. ✅ **WIF Binding** - Repository-restricted access (`stevei101/not-sure`)

## Setup Process

### Step 1: Run Terraform Apply

After Terraform creates the infrastructure:

```bash
# After terraform apply succeeds, get the WIF values
cd terraform
terraform output wif_provider
terraform output wif_service_account
```

Or check the GitHub Actions workflow summary after apply - it will show the values!

### Step 2: Add to GitHub Secrets

1. Go to: https://github.com/stevei101/not-sure/settings/secrets/actions

2. Add `WIF_PROVIDER`:
   - Copy the value from `terraform output wif_provider`
   - Format: `projects/[PROJECT_NUMBER]/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider`

3. Add `WIF_SERVICE_ACCOUNT`:
   - Copy the value from `terraform output wif_service_account`
   - Format: `github-actions@[PROJECT_ID].iam.gserviceaccount.com`

### Step 3: Verify It Works

1. Push a change to `terraform/` directory
2. The workflow will check for WIF secrets
3. If configured, it will authenticate using WIF
4. Terraform apply will run automatically on push to `main`

## Repository Restriction

The WIF binding is configured to **only allow access from** `stevei101/not-sure` repository. This means:
- ✅ Only workflows from this repository can use the service account
- ✅ More secure than allowing all repositories
- ✅ Automatically enforced by the WIF binding

If you need to change the repository, update the `github_repository` variable in Terraform.

## What Gets Created (Details)

### Workload Identity Pool
- **Name:** `github-actions-pool`
- **Location:** `global`
- **Purpose:** Container for WIF providers

### OIDC Provider
- **Name:** `github-provider`
- **Issuer:** `https://token.actions.githubusercontent.com`
- **Attribute Mapping:**
  - `google.subject` = `assertion.sub`
  - `attribute.actor` = `assertion.actor`
  - `attribute.repository` = `assertion.repository`

### Service Account
- **Name:** `github-actions`
- **Email:** `github-actions@[PROJECT_ID].iam.gserviceaccount.com`
- **Roles:**
  - `roles/iam.serviceAccountAdmin` - Manage service accounts
  - `roles/resourcemanager.projectIamAdmin` - Manage IAM policies
  - `roles/serviceusage.serviceUsageAdmin` - Enable/disable APIs
  - `roles/secretmanager.admin` - Manage secrets
  - `roles/aiplatform.admin` - Manage Vertex AI resources

### WIF Binding
- **Binding:** Only `stevei101/not-sure` repository can use the service account
- **Role:** `roles/iam.workloadIdentityUser`
- **Format:** `principalSet://.../attribute.repository/stevei101/not-sure`

## Outputs

After `terraform apply`, you'll get these outputs:

```bash
terraform output wif_provider
# Outputs: projects/[PROJECT_NUMBER]/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider

terraform output wif_service_account
# Outputs: github-actions@[PROJECT_ID].iam.gserviceaccount.com
```

## Workflow Behavior

### Before WIF Setup
- ✅ Validation runs (format, validate, lint)
- ✅ Plan runs (but needs credentials)
- ⏸️ Apply skipped (no authentication)

### After WIF Setup
- ✅ Validation runs
- ✅ Plan runs (via Terraform Cloud with GOOGLE_CREDENTIALS)
- ✅ Apply runs automatically (via WIF authentication)

## Benefits

1. ✅ **No Service Account Keys** - More secure, no keys to manage
2. ✅ **Automatic Authentication** - GitHub Actions authenticates via OIDC
3. ✅ **Repository Restricted** - Only your repo can use it
4. ✅ **Fully Automated** - Created and managed by Terraform
5. ✅ **Easy Updates** - Change via Terraform, not manual steps

## Troubleshooting

### Error: "Permission denied"

- **Check:** Is the service account created?
- **Check:** Does it have the necessary IAM roles?
- **Check:** Is the WIF binding correct?

### Error: "Workload Identity Pool not found"

- **Check:** Run `terraform apply` to create the pool
- **Check:** Verify the pool name matches

### Error: "Repository not allowed"

- **Check:** Is the `github_repository` variable correct?
- **Check:** Does it match your repository path exactly?

## Comparison: Manual vs Terraform

| Aspect | Manual Setup | Terraform Setup |
|--------|--------------|-----------------|
| **Pool Creation** | Manual gcloud commands | ✅ Automatic |
| **Provider Setup** | Manual gcloud commands | ✅ Automatic |
| **Service Account** | Manual creation | ✅ Automatic |
| **IAM Roles** | Manual binding | ✅ Automatic |
| **WIF Binding** | Manual binding | ✅ Automatic |
| **Updates** | Manual changes | ✅ Terraform managed |
| **Reproducibility** | Documented steps | ✅ Infrastructure as Code |

## Next Steps

1. **Run Terraform Apply:**
   - Via GitHub Actions (when credentials are set)
   - Or locally: `cd terraform && terraform apply`

2. **Get WIF Values:**
   - From Terraform outputs
   - Or from GitHub Actions workflow summary

3. **Add to GitHub Secrets:**
   - `WIF_PROVIDER`
   - `WIF_SERVICE_ACCOUNT`

4. **Test:**
   - Push a change to trigger the workflow
   - Verify WIF authentication works

## Summary

WIF setup is now **fully automated via Terraform**! Just:
1. Run `terraform apply`
2. Copy the outputs
3. Add to GitHub Secrets
4. Done! 🎉

No more manual gcloud commands needed!

