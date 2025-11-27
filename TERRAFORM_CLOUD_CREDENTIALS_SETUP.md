# Terraform Cloud GCP Credentials Setup

## Problem

When Terraform Cloud runs plans/apply **remotely**, it needs GCP credentials configured in the **Terraform Cloud workspace**, not from GitHub Actions.

**Error you're seeing:**
```
Error: Attempted to load application default credentials since neither `credentials` nor `access_token` was set in the provider block. No credentials loaded.
```

## Solution

Set up a **service account** for Terraform Cloud and configure it as an **environment variable** in your Terraform Cloud workspace.

## Step 1: Create a Service Account for Terraform Cloud

Create a service account that Terraform Cloud will use to authenticate to GCP:

```bash
# Set your project ID
export GCP_PROJECT_ID="your-project-id"

# Create service account
gcloud iam service-accounts create terraform-cloud \
  --display-name="Terraform Cloud Service Account" \
  --project=$GCP_PROJECT_ID

# Grant necessary permissions
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:terraform-cloud@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/editor"

# Grant specific permissions needed for our Terraform resources
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:terraform-cloud@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/aiplatform.admin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:terraform-cloud@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountAdmin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:terraform-cloud@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin"

# Create and download key
gcloud iam service-accounts keys create terraform-cloud-key.json \
  --iam-account=terraform-cloud@${GCP_PROJECT_ID}.iam.gserviceaccount.com \
  --project=$GCP_PROJECT_ID
```

## Step 2: Set Credentials in Terraform Cloud Workspace

1. **Go to your Terraform Cloud workspace:**
   ```
   https://app.terraform.io/app/[ORGANIZATION]/not-sure
   ```

2. **Navigate to Variables:**
   - Click on **"Variables"** in the left sidebar

3. **Add Environment Variable:**
   - Click **"Add variable"**
   - Select **"Environment variable"** (not Terraform variable)
   - **Key:** `GOOGLE_CREDENTIALS`
   - **Value:** Paste the **entire contents** of `terraform-cloud-key.json` (the service account key JSON)
   - **Mark as sensitive:** ✅ (check the box)
   - **HCL:** Leave unchecked

4. **Save the variable**

## Step 3: Verify Provider Configuration

The provider is already configured to use `GOOGLE_CREDENTIALS` environment variable:

```hcl
provider "google" {
  project = var.project_id
  region  = var.default_region
  # credentials will be loaded from GOOGLE_CREDENTIALS env var if set
}
```

## Alternative: Using Access Token

If you prefer using an access token instead:

1. **Generate an access token:**
   ```bash
   gcloud auth print-access-token
   ```

2. **Set in Terraform Cloud workspace:**
   - **Key:** `GOOGLE_OAUTH_ACCESS_TOKEN`
   - **Value:** The access token (note: tokens expire, so this needs periodic updates)

3. **Update provider.tf:**
   ```hcl
   provider "google" {
     project = var.project_id
     region  = var.default_region
     access_token = var.google_oauth_access_token  # Requires variable
   }
   ```

**Note:** Service account key is more reliable (doesn't expire) than access tokens.

## Verification

After setting up credentials:

1. **Trigger a new plan** in Terraform Cloud (or push a change to trigger GitHub Actions)
2. **Check the plan output** - it should now authenticate successfully
3. **Verify** it can access GCP resources

## Security Best Practices

1. ✅ **Use separate service account** for Terraform Cloud (don't reuse other service accounts)
2. ✅ **Grant least privilege** - only the IAM roles needed
3. ✅ **Mark credentials as sensitive** in Terraform Cloud
4. ✅ **Rotate keys periodically**
5. ✅ **Don't commit service account keys** to git (already in `.gitignore`)

## Troubleshooting

### Error: "No credentials loaded"

- **Check:** Is `GOOGLE_CREDENTIALS` set in Terraform Cloud workspace?
- **Check:** Is it marked as an **environment variable** (not Terraform variable)?
- **Check:** Is the JSON key valid?

### Error: "Permission denied"

- **Check:** Does the service account have the necessary IAM roles?
- **Check:** Is the service account active?

### Error: "Invalid JSON"

- **Check:** Did you paste the entire JSON key correctly?
- **Check:** No extra spaces or newlines at the beginning/end

## Summary

**Quick Setup:**
1. Create service account: `terraform-cloud@[PROJECT_ID].iam.gserviceaccount.com`
2. Grant necessary roles (editor, aiplatform.admin, iam.serviceAccountAdmin, secretmanager.admin)
3. Create and download service account key JSON
4. Set `GOOGLE_CREDENTIALS` environment variable in Terraform Cloud workspace with the JSON contents
5. Mark as sensitive ✅

After this, Terraform Cloud remote execution should work!

