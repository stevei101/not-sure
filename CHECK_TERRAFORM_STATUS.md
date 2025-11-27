# How to Check Terraform Apply Status

## Quick Check

Visit: **https://github.com/stevei101/not-sure/actions/workflows/terraform.yml**

## Current Situation

Based on the workflow configuration, Terraform apply will run when:

✅ **On `main` branch**  
✅ **Push event** (not PR)  
✅ **WIF configured** (`WIF_PROVIDER` and `WIF_SERVICE_ACCOUNT` secrets exist)

## Current Branch Status

You're on: `feature/new-work` (not `main`)

**What's happening:**
- ✅ Validation runs on every push
- ✅ Plan runs on PRs
- ⏸️ Apply only runs on `main` branch push (if WIF configured)

## To Trigger Apply

### Option 1: Merge to Main

1. Create a PR from `feature/new-work` → `main`
2. Check the Terraform plan in PR comments
3. Merge the PR
4. If WIF is configured, apply will run automatically
5. Check Actions tab for results

### Option 2: Run Locally

```bash
cd terraform
terraform apply
```

This will create:
- Service Account
- **Service Account Key (automatically generated)**
- Secret Manager secret with the key JSON

## Check if WIF is Configured

You can verify if WIF secrets are set in GitHub:
- Go to: Settings → Secrets and variables → Actions
- Look for: `WIF_PROVIDER` and `WIF_SERVICE_ACCOUNT`

If they're not there, apply will be skipped with a note explaining how to run manually.

