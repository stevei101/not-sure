# Terraform Automatic Service Account Key Generation

## ✅ Automated by Terraform

Terraform now **automatically generates and stores** the service account JSON key in Secret Manager!

## What Terraform Does

1. ✅ Creates the service account (`google_service_account.vertex_ai`)
2. ✅ Generates a service account key (`google_service_account_key.vertex_ai`)
3. ✅ Stores the key JSON in Secret Manager (`google_secret_manager_secret_version.service_account_key`)

**No manual steps needed!** After `terraform apply`, the key is ready to use.

## Retrieving the Key

### Option 1: Use the Helper Script (Easiest)

```bash
./terraform/scripts/get-service-account-key.sh [PROJECT_ID]
```

This script will:
- Retrieve the key from Secret Manager
- Set it as the `VERTEX_AI_SERVICE_ACCOUNT_JSON` Worker secret
- Provide next steps

### Option 2: Manual Retrieval

```bash
# Get the secret from Secret Manager
gcloud secrets versions access latest \
  --secret="VERTEX_AI_SERVICE_ACCOUNT_JSON" \
  --project=YOUR_PROJECT_ID | \
wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON
```

### Option 3: Use Terraform Outputs

After `terraform apply`, check the outputs:

```bash
terraform output setup_instructions
```

This will show you the exact commands to retrieve and use the key.

## Full Workflow

1. **Run Terraform Apply** (via GitHub Actions or locally):
   ```bash
   cd terraform
   terraform apply
   ```

2. **Retrieve the Key**:
   ```bash
   ./terraform/scripts/get-service-account-key.sh YOUR_PROJECT_ID
   ```

3. **Set Other Worker Secrets**:
   ```bash
   wrangler secret put GCP_PROJECT_ID        # Same as GitHub secret
   wrangler secret put VERTEX_AI_LOCATION    # e.g., us-central1
   wrangler secret put VERTEX_AI_MODEL       # e.g., gemini-1.5-flash
   ```

4. **Deploy and Test**:
   ```bash
   wrangler deploy
   curl https://lornu.ai/status
   ```

## Secret Manager Location

The key is stored at:
```
projects/YOUR_PROJECT_ID/secrets/VERTEX_AI_SERVICE_ACCOUNT_JSON
```

## Security Notes

- ✅ Key is stored securely in Secret Manager
- ✅ Only the service account itself has read access (for validation)
- ✅ Key is base64-decoded before storing (JSON format)
- ✅ Never commit keys to git
- ✅ Key rotation: Delete old key in Terraform and apply to regenerate

