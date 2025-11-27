# Workload Identity Federation (WIF) Setup Guide

Workload Identity Federation allows GitHub Actions to authenticate to Google Cloud without storing long-lived service account keys. This is the **recommended and secure** authentication method.

## ⚠️ Current Status

Your Terraform workflow requires WIF for Google Cloud authentication. Without it, the workflow will fail when trying to authenticate.

## Two Options

### Option 1: Set Up Workload Identity Federation (Recommended)

This is the secure, recommended approach. Follow these steps:

#### Prerequisites

- Access to Google Cloud Console
- Permissions to create IAM resources
- GitHub repository where workflows will run

#### Step 1: Create Workload Identity Pool

```bash
gcloud iam workload-identity-pools create github-actions-pool \
  --project=YOUR_PROJECT_ID \
  --location="global" \
  --display-name="GitHub Actions Pool"
```

#### Step 2: Create Workload Identity Provider

```bash
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --project=YOUR_PROJECT_ID \
  --location="global" \
  --workload-identity-pool="github-actions-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

#### Step 3: Get the Provider Resource Name

After creating the provider, you'll get the resource name. It will look like:

```
projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider
```

**Save this** - you'll need it for the `WIF_PROVIDER` GitHub secret.

#### Step 4: Create Service Account for GitHub Actions

```bash
gcloud iam service-accounts create github-actions \
  --project=YOUR_PROJECT_ID \
  --display-name="GitHub Actions Service Account"
```

#### Step 5: Grant Permissions to Service Account

The service account needs permissions for Terraform to manage resources:

```bash
# Basic permissions for Terraform
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountAdmin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/resourcemanager.projectIamAdmin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/serviceusage.serviceUsageAdmin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin"
```

#### Step 6: Allow GitHub Actions to Impersonate Service Account

```bash
gcloud iam service-accounts add-iam-policy-binding \
  github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --project=YOUR_PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/YOUR_GITHUB_OWNER/YOUR_REPO_NAME"
```

Replace:
- `YOUR_PROJECT_ID` - Your GCP project ID
- `PROJECT_NUMBER` - Your GCP project number (find it in GCP Console)
- `YOUR_GITHUB_OWNER` - Your GitHub username or organization
- `YOUR_REPO_NAME` - Your repository name (e.g., `not-sure`)

#### Step 7: Add GitHub Secrets

Add these secrets to your GitHub repository:

1. **`WIF_PROVIDER`**: The provider resource name from Step 3
   ```
   projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider
   ```

2. **`WIF_SERVICE_ACCOUNT`**: The service account email
   ```
   github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

### Option 2: Temporary Alternative (Not Recommended for Production)

If you need to test quickly and don't have WIF set up yet, you can temporarily modify the workflow to use a service account key. However, this is **less secure** and not recommended for production.

**Note**: We can modify the workflow to support this if needed, but WIF is the preferred approach.

## Verification

After setting up WIF:

1. Push a change to the `terraform/` directory
2. Check the GitHub Actions workflow logs
3. The authentication step should succeed without errors

## Troubleshooting

### Error: "The caller does not have permission"

- Verify the service account has the required IAM roles
- Check that the workload identity binding is correct
- Ensure the repository path in the binding matches your repo exactly

### Error: "Workload Identity Pool not found"

- Verify the pool and provider names are correct
- Check that the provider resource name format is correct
- Ensure the project ID matches

### Error: "Permission denied on service account"

- Verify the workload identity user role is bound correctly
- Check the principalSet format matches your repository path
- Ensure the service account exists and is in the correct project

## Resources

- [Google Cloud Workload Identity Federation Docs](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub Actions OIDC Docs](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [google-github-actions/auth Action](https://github.com/google-github-actions/auth)

## Quick Reference

After setup, you'll have:
- **WIF_PROVIDER**: `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider`
- **WIF_SERVICE_ACCOUNT**: `github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com`

Add both as GitHub secrets to complete the authentication setup.

