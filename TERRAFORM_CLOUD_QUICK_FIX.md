# Quick Fix: Terraform Cloud Credentials (2 Steps)

## The Problem

Terraform Cloud can't authenticate to GCP when running plans. You need to give it credentials.

## The Solution (2 Steps)

### Step 1: Create Service Account Key (1 command)

**Option A: Use the automated script** (easiest):
```bash
cd terraform/scripts
export GCP_PROJECT_ID="your-project-id"
./setup-terraform-cloud-credentials.sh
```

**Option B: Manual (3 commands):**
```bash
# Create service account
gcloud iam service-accounts create terraform-cloud \
  --display-name="Terraform Cloud" \
  --project=YOUR_PROJECT_ID

# Grant permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:terraform-cloud@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/editor"

# Create key
gcloud iam service-accounts keys create terraform-cloud-key.json \
  --iam-account=terraform-cloud@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### Step 2: Add to Terraform Cloud (5 clicks)

1. **Go to:** https://app.terraform.io/app/[ORGANIZATION]/not-sure/variables
2. **Click:** "Add variable"
3. **Select:** "Environment variable" (not Terraform variable)
4. **Enter:**
   - Key: `GOOGLE_CREDENTIALS`
   - Value: Paste the entire JSON from `terraform-cloud-key.json`
   - Check: ✓ Mark as sensitive
5. **Click:** "Save variable"

**Done!** 🎉

## Verify It Works

Create a Pull Request - the Terraform Plan should now run successfully!

## That's It!

It's really just these 2 steps. The script automates Step 1, and Step 2 is just copying/pasting in Terraform Cloud UI.

## Need Help?

See `TERRAFORM_CLOUD_CREDENTIALS_SETUP.md` for detailed instructions with troubleshooting.

