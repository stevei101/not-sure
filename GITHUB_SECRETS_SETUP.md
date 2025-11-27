# GitHub Secrets Setup for Terraform

This guide explains how to configure GitHub secrets for Terraform infrastructure automation.

## Required GitHub Secrets

Configure these secrets in your GitHub repository:
**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### 1. Terraform Cloud Configuration

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `TF_API_TOKEN` | Your Terraform Cloud API token | The token you created (e.g., `not-sure-api-token` value) |
| `TF_CLOUD_ORGANIZATION` | Your Terraform Cloud organization name | e.g., `disposable-org` |
| `TF_WORKSPACE` | `not-sure` | Terraform Cloud workspace name (optional - defaults to `not-sure`) |

**To get your Terraform Cloud API token:**
1. Go to [Terraform Cloud](https://app.terraform.io)
2. Navigate to **User Settings** → **Tokens**
3. Click **Create an API token**
4. Name it (e.g., `not-sure-api-token`)
5. Copy the token value immediately (you won't be able to see it again)

### 2. Google Cloud Configuration

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `GCP_PROJECT_ID` | Your GCP project ID | The Google Cloud project ID where resources will be created |

### 3. Workload Identity Federation (for GCP authentication)

If you're using Workload Identity Federation (recommended for security):

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `WIF_PROVIDER` | WIF provider resource name | Format: `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID` |
| `WIF_SERVICE_ACCOUNT` | Service account email | e.g., `github-actions@PROJECT_ID.iam.gserviceaccount.com` |

**If you haven't set up Workload Identity Federation yet**, you can use service account key authentication temporarily (see alternative below).

## Setting Up Secrets

### Option 1: Via GitHub Web UI (Recommended)

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each secret above
4. Enter the secret name and value
5. Click **Add secret**

### Option 2: Via GitHub CLI

```bash
gh secret set TF_API_TOKEN --body "your-token-value"
gh secret set TF_CLOUD_ORGANIZATION --body "disposable-org"
gh secret set GCP_PROJECT_ID --body "your-project-id"
gh secret set WIF_PROVIDER --body "projects/123456/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider"
gh secret set WIF_SERVICE_ACCOUNT --body "github-actions@your-project.iam.gserviceaccount.com"
```

## Verification

After setting up secrets, you can verify the workflow by:

1. **Check workflow file**: The workflow at `.github/workflows/terraform.yml` should reference these secrets
2. **Trigger workflow**: Push changes to `terraform/` directory or manually trigger the workflow
3. **Check workflow logs**: If secrets are missing or incorrect, you'll see errors in the workflow logs

## Quick Setup Checklist

- [ ] `TF_API_TOKEN` - Terraform Cloud API token (from `not-sure-api-token` token value)
- [ ] `TF_CLOUD_ORGANIZATION` - Terraform Cloud organization name
- [ ] `TF_WORKSPACE` - Workspace name: `not-sure` (optional, already defaults to this)
- [ ] `GCP_PROJECT_ID` - Your Google Cloud project ID
- [ ] `WIF_PROVIDER` - Workload Identity Federation provider (if using WIF)
- [ ] `WIF_SERVICE_ACCOUNT` - Service account email for WIF (if using WIF)

## Current Configuration

Based on your setup:
- ✅ **Workspace**: `not-sure` (configured)
- ✅ **API Token**: `not-sure-api-token` (create GitHub secret `TF_API_TOKEN` with the token value)

**Next Steps:**
1. Create the GitHub secret `TF_API_TOKEN` with the value of your `not-sure-api-token`
2. Set other required secrets (see above)
3. Push changes to trigger the workflow

## Troubleshooting

### Secret Not Found Errors

If you see errors about missing secrets:
- Verify the secret name matches exactly (case-sensitive)
- Check that the secret exists in **Actions** secrets (not environment secrets)
- Ensure the workflow has access to the secret

### Invalid Token Errors

If Terraform Cloud authentication fails:
- Verify the API token is correct
- Check that the token hasn't expired
- Ensure the token has access to the workspace

### Workspace Not Found

If you see workspace not found errors:
- Verify the workspace name matches: `not-sure`
- Check that the API token has access to the workspace
- Verify the organization name is correct

## Security Notes

- ⚠️ Never commit secrets to your repository
- ⚠️ Use GitHub secrets for all sensitive values
- ✅ Use Workload Identity Federation instead of service account keys when possible
- ✅ Rotate API tokens periodically
- ✅ Use different tokens for different environments/projects

