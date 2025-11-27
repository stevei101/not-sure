# Finding Existing Workload Identity Federation Values

If you already have WIF set up for your other projects (like `agentnav`), you can reuse the same configuration for this project.

## Quick Method: Check Existing GitHub Secrets

The easiest way is to check if your other repositories already have these secrets configured:

1. Go to your other repository (e.g., `agentnav`)
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Look for:
   - `WIF_PROVIDER`
   - `WIF_SERVICE_ACCOUNT`
   - `GCP_PROJECT_ID`

If they exist and use the same GCP project, you can copy those exact values to this repository!

## Method 2: Find via Google Cloud Console

If you need to find the values manually:

### Find WIF_PROVIDER

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **IAM & Admin** → **Workload Identity Federation**
3. Click on your pool (likely named `github-actions-pool`)
4. Click on your provider (likely named `github-provider`)
5. The **Resource name** is what you need - it looks like:
   ```
   projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider
   ```
6. Copy this entire string → This is your `WIF_PROVIDER` value

### Find WIF_SERVICE_ACCOUNT

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **IAM & Admin** → **Service Accounts**
3. Look for a service account named `github-actions` (or similar)
4. Click on it
5. Copy the **Email** field - it looks like:
   ```
   github-actions@PROJECT_ID.iam.gserviceaccount.com
   ```
6. This is your `WIF_SERVICE_ACCOUNT` value

## Method 3: Use gcloud CLI

If you have `gcloud` installed:

```bash
# Find the provider resource name
gcloud iam workload-identity-pools providers describe github-provider \
  --workload-identity-pool=github-actions-pool \
  --location=global \
  --project=YOUR_PROJECT_ID \
  --format="value(name)"

# Find the service account email
gcloud iam service-accounts list \
  --project=YOUR_PROJECT_ID \
  --filter="displayName:github-actions" \
  --format="value(email)"
```

## Reusing from agentnav

Since you mentioned `agentnav` already has WIF set up, and both projects likely use the same GCP project:

1. **Check agentnav secrets**: Go to `stevei101/agentnav` → Settings → Secrets
2. **Copy the values**:
   - `WIF_PROVIDER` → Copy to `not-sure` repository
   - `WIF_SERVICE_ACCOUNT` → Copy to `not-sure` repository
3. **Verify GCP_PROJECT_ID**: Make sure both projects use the same project ID

## Verify Values Are Correct

After adding the secrets, you can verify by:

1. Pushing a small change to `terraform/` directory
2. Checking the GitHub Actions workflow
3. Looking at the "Authenticate to Google Cloud" step - it should succeed

If authentication fails, double-check:
- The provider resource name format is correct
- The service account email is correct
- The GCP project ID matches
- The service account has the necessary permissions

## Quick Copy Checklist

If reusing from agentnav or another project:

- [ ] Check other repository for `WIF_PROVIDER` secret
- [ ] Check other repository for `WIF_SERVICE_ACCOUNT` secret  
- [ ] Verify `GCP_PROJECT_ID` is the same
- [ ] Copy `WIF_PROVIDER` to this repository's secrets
- [ ] Copy `WIF_SERVICE_ACCOUNT` to this repository's secrets
- [ ] Test by pushing a change to `terraform/` directory

## Still Need to Set Up WIF?

If WIF doesn't exist yet, follow the guide in `WIF_SETUP_GUIDE.md` to create it from scratch.

