# How to Run the Terraform Cloud Credentials Setup Script

## Quick Start

The script will guide you through everything! Just run:

```bash
cd terraform/scripts
./setup-terraform-cloud-credentials.sh
```

## Prerequisites Check

Before running, make sure you have:

1. ✅ **gcloud CLI installed** - `which gcloud` should work
2. ✅ **Authenticated to GCP** - `gcloud auth list` should show your account
3. ✅ **GCP Project ID** - You'll need this (the script will prompt if not set)

## Step-by-Step Instructions

### Option 1: Run with Environment Variable (Recommended)

```bash
# Set your GCP Project ID
export GCP_PROJECT_ID="your-project-id"

# Navigate to scripts directory
cd terraform/scripts

# Run the script
./setup-terraform-cloud-credentials.sh
```

### Option 2: Run and Enter Project ID When Prompted

```bash
# Navigate to scripts directory
cd terraform/scripts

# Run the script (it will prompt for project ID)
./setup-terraform-cloud-credentials.sh
```

## What the Script Does

1. ✅ **Creates service account** - `terraform-cloud@[PROJECT_ID].iam.gserviceaccount.com`
2. ✅ **Grants IAM roles:**
   - `roles/editor` - General project access
   - `roles/aiplatform.admin` - Vertex AI access
   - `roles/iam.serviceAccountAdmin` - Service account management
   - `roles/secretmanager.admin` - Secret Manager access
3. ✅ **Creates key file** - `terraform-cloud-key.json`
4. ✅ **Shows next steps** - Instructions for Terraform Cloud

## After Running the Script

1. **Copy the key file contents:**
   ```bash
   # On Mac
   pbcopy < terraform-cloud-key.json
   
   # Or view it
   cat terraform-cloud-key.json
   ```

2. **Add to Terraform Cloud:**
   - Go to: https://app.terraform.io/app/[ORGANIZATION]/not-sure/variables
   - Click "Add variable"
   - Type: **Environment variable**
   - Key: `GOOGLE_CREDENTIALS`
   - Value: Paste the JSON from the key file
   - Mark as sensitive: ✓
   - Save

3. **Clean up (optional):**
   ```bash
   # After adding to Terraform Cloud, you can delete the key file
   rm terraform-cloud-key.json
   ```

## Troubleshooting

### Error: "command not found: gcloud"

**Solution:** Install gcloud CLI:
```bash
# On Mac
brew install --cask google-cloud-sdk

# Then authenticate
gcloud auth login
```

### Error: "Permission denied"

**Solution:** Make script executable (already done, but if needed):
```bash
chmod +x terraform/scripts/setup-terraform-cloud-credentials.sh
```

### Error: "Service account already exists"

**This is fine!** The script will continue and just skip creating the service account.

### Error: "Role already granted"

**This is fine!** The script will continue - it just means the role was already there.

## Ready to Run?

Just navigate to the scripts directory and run it:

```bash
cd terraform/scripts
./setup-terraform-cloud-credentials.sh
```

The script will guide you through everything! 🚀

