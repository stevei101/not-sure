# Run the Setup Script Now

## Quick Command

Since the script needs to prompt for your GCP Project ID, run this in your **terminal**:

```bash
cd /Users/stevenirvin/Documents/GitHub/not-sure/terraform/scripts
./setup-terraform-cloud-credentials.sh
```

The script will:
1. Prompt you for your GCP Project ID (or use `$GCP_PROJECT_ID` if set)
2. Create the service account
3. Grant necessary permissions
4. Generate the key file
5. Show you next steps

## Alternative: Set Project ID First

If you know your GCP Project ID, you can set it first:

```bash
# Set your project ID
export GCP_PROJECT_ID="your-actual-project-id"

# Navigate to scripts directory
cd /Users/stevenirvin/Documents/GitHub/not-sure/terraform/scripts

# Run the script
./setup-terraform-cloud-credentials.sh
```

## What Happens Next

After the script runs successfully:

1. ✅ You'll have a file: `terraform-cloud-key.json`

2. 📋 The script will show instructions for:
   - Copying the key file contents
   - Adding it to Terraform Cloud workspace
   - Marking it as sensitive

3. 🎯 **Final step:** Paste the JSON into Terraform Cloud workspace variables

## Ready?

Just run this in your terminal:

```bash
cd /Users/stevenirvin/Documents/GitHub/not-sure/terraform/scripts && ./setup-terraform-cloud-credentials.sh
```

Then follow the on-screen instructions! 🚀

