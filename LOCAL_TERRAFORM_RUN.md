# Running Terraform Locally

Since WIF is optional, you can run Terraform manually from your local machine. This is a great way to get started quickly.

## Prerequisites

1. **Terraform installed**: [Install Terraform](https://developer.hashicorp.com/terraform/downloads)
2. **gcloud CLI installed**: [Install gcloud](https://cloud.google.com/sdk/docs/install)
3. **Authenticated to GCP**: `gcloud auth application-default login`

## Quick Start

### 1. Authenticate to Google Cloud

```bash
gcloud auth application-default login
```

This authenticates Terraform to use your user credentials for GCP access.

### 2. Configure Terraform Variables

Create a `terraform.tfvars` file:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:

```hcl
project_id              = "your-gcp-project-id"
default_region          = "us-central1"
vertex_ai_location      = "us-central1"
vertex_ai_model         = "gemini-1.5-pro"
terraform_cloud_organization = "your-org-name"
terraform_cloud_workspace    = "not-sure"
```

### 3. Initialize Terraform

```bash
terraform init
```

This will:
- Connect to Terraform Cloud backend
- Download required providers
- Set up the workspace

### 4. Review Changes

```bash
terraform plan
```

This shows what resources will be created without actually creating them.

### 5. Apply Changes

```bash
terraform apply
```

Type `yes` when prompted to confirm, or use `terraform apply -auto-approve` to skip confirmation.

## What Gets Created

After running `terraform apply`, you'll have:

1. **APIs Enabled**:
   - Vertex AI API
   - IAM API
   - Secret Manager API
   - Resource Manager API
   - Service Usage API

2. **Service Account**:
   - Name: `not-sure-vertex-ai`
   - Email: `not-sure-vertex-ai@PROJECT_ID.iam.gserviceaccount.com`
   - Permissions: Vertex AI User, Service Agent, Secret Accessor

3. **Secret Manager Secret**:
   - Name: `VERTEX_AI_SERVICE_ACCOUNT_JSON`
   - This is where you'll store the service account JSON key

## Next Steps After Terraform Apply

### 1. Generate Service Account Key

```bash
# Get the service account email from Terraform output
export SERVICE_ACCOUNT_EMAIL=$(terraform output -raw service_account_email)
export PROJECT_ID=$(terraform output -raw project_id)

# Generate the key
gcloud iam service-accounts keys create vertex-ai-key.json \
  --iam-account="$SERVICE_ACCOUNT_EMAIL" \
  --project="$PROJECT_ID"
```

### 2. Store Key in Secret Manager

```bash
cat vertex-ai-key.json | gcloud secrets versions add VERTEX_AI_SERVICE_ACCOUNT_JSON \
  --data-file=- \
  --project="$PROJECT_ID"
```

### 3. Clean Up Key File

```bash
rm vertex-ai-key.json
```

### 4. Set Cloudflare Worker Secrets

```bash
wrangler secret put VERTEX_AI_PROJECT_ID
# Enter your GCP project ID

wrangler secret put VERTEX_AI_LOCATION
# Enter the location (e.g., us-central1)

wrangler secret put VERTEX_AI_MODEL
# Enter the model (e.g., gemini-1.5-pro)

wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON
# Paste the entire contents of the JSON key file
```

## Troubleshooting

### Error: "Could not load default credentials"

**Solution**: Run `gcloud auth application-default login`

### Error: "Permission denied"

**Solution**: Ensure your user account has the necessary permissions:
- `roles/resourcemanager.projectIamAdmin`
- `roles/iam.serviceAccountAdmin`
- `roles/serviceusage.serviceUsageAdmin`
- `roles/secretmanager.admin`

### Error: "API not enabled"

**Solution**: Terraform will automatically enable APIs, but if it fails, enable manually:
```bash
gcloud services enable aiplatform.googleapis.com --project=YOUR_PROJECT_ID
```

### Error: "Backend configuration changed"

**Solution**: This means the Terraform Cloud backend settings changed. Run:
```bash
terraform init -reconfigure
```

## Verifying the Setup

After applying, verify everything worked:

```bash
# Check service account exists
gcloud iam service-accounts describe not-sure-vertex-ai \
  --project=YOUR_PROJECT_ID

# Check secret exists
gcloud secrets describe VERTEX_AI_SERVICE_ACCOUNT_JSON \
  --project=YOUR_PROJECT_ID

# View Terraform outputs
terraform output
```

## Switching to Automated Apply Later

Once you set up WIF:
1. Add `WIF_PROVIDER` and `WIF_SERVICE_ACCOUNT` GitHub secrets
2. The workflow will automatically apply on merge to `main`
3. You can still run locally for testing

## Cleanup

To destroy all resources (if needed):

```bash
terraform destroy
```

**Warning**: This will delete the service account and secret. Make sure you have backups if needed.

