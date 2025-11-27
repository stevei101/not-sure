# Terraform Apply Status

## Current Status

Terraform apply has **not run yet** because:

1. ✅ **Code is on feature branch** (`feature/new-work`) - not on `main`
2. ⚠️ **WIF may not be configured** - needed for automated apply

## When Terraform Will Apply

Terraform will automatically apply when **ALL** of these conditions are met:

1. ✅ Code is on `main` branch
2. ✅ Push event (not pull request)
3. ✅ WIF secrets are configured (`WIF_PROVIDER` and `WIF_SERVICE_ACCOUNT`)
4. ✅ Terraform validation passes

## Current Workflow Behavior

### On Feature Branch (Current State)

When you push to `feature/new-work`:
- ✅ **Terraform Format Check** - Runs
- ✅ **Terraform Init** - Runs
- ✅ **Terraform Validate** - Runs
- ✅ **TFLint** - Runs
- ✅ **Terraform Plan** - Runs (on PRs)
- ⏸️ **Terraform Apply** - **Skipped** (only runs on `main`)

### On Main Branch

When merged to `main`:
- ✅ All validation steps run
- ✅ **Terraform Apply** - Runs if WIF is configured
- ⚠️ **Terraform Apply** - Skipped if WIF is not configured (with note)

## Check Workflow Status

1. **Go to GitHub Actions**: https://github.com/stevei101/not-sure/actions
2. **Find latest run** of "Terraform Infrastructure" workflow
3. **Check the status**:
   - ✅ Green = Validation passed
   - ⚠️ Yellow = Validation passed, but apply skipped (WIF not configured)
   - ❌ Red = Validation failed

## Next Steps

### Option 1: Merge to Main and Let GitHub Actions Apply (If WIF Configured)

1. Create a PR from `feature/new-work` to `main`
2. Review the Terraform plan in PR comments
3. Merge the PR
4. If WIF is configured, apply will run automatically
5. Check Actions tab for service account email output

### Option 2: Apply Manually (Recommended for Now)

Since WIF is optional, you can run Terraform locally:

```bash
# Authenticate to GCP
gcloud auth application-default login

# Navigate to terraform directory
cd terraform

# Initialize (if not done)
terraform init

# Review what will be created
terraform plan

# Apply changes (creates service account, generates key, stores in Secret Manager)
terraform apply

# Check outputs
terraform output setup_instructions
```

### Option 3: Check if WIF is Configured

If you want automated apply:

1. Check if `WIF_PROVIDER` and `WIF_SERVICE_ACCOUNT` secrets exist in GitHub
2. If not, follow `WIF_SETUP_GUIDE.md` or copy from another project
3. Once configured, apply will run automatically on merge to `main`

## What Gets Created

When Terraform applies successfully, it will create:

- ✅ Service Account with IAM roles
- ✅ **Service Account Key** (automatically generated)
- ✅ **Secret Manager Secret** with the key JSON
- ✅ All required APIs enabled

Then you can retrieve the key:
```bash
./terraform/scripts/get-service-account-key.sh [PROJECT_ID]
```

