# Terraform Variables Setup

## Overview

Terraform variables can be provided in multiple ways. When using Terraform Cloud with remote execution, variables need to be set either:
1. Via `-var` flags in the command line (current GitHub Actions approach)
2. In Terraform Cloud workspace variables (recommended for production)

## Required Variables

The only **required** variable (no default) is:
- `project_id` - Your Google Cloud Project ID

## Optional Variables (have defaults)

These variables have defaults and can be overridden:
- `vertex_ai_location` (default: `us-central1`)
- `vertex_ai_model` (default: `gemini-1.5-pro`)
- `service_account_id` (default: `not-sure-vertex-ai`)
- `environment` (default: `prod`)

## Setting Variables in Terraform Cloud Workspace

**Recommended approach for production:**

1. Go to your Terraform Cloud workspace: `https://app.terraform.io/app/[ORGANIZATION]/not-sure`
2. Navigate to **Variables** tab
3. Add a variable:
   - **Key:** `project_id`
   - **Type:** `terraform`
   - **Value:** Your GCP project ID (e.g., `your-project-id`)
   - **Sensitive:** Optional (can mark as sensitive if desired)
   - **HCL:** Leave unchecked (it's a string)

4. (Optional) Override other variables:
   - `vertex_ai_location`
   - `vertex_ai_model`
   - `service_account_id`
   - `environment`

## Current GitHub Actions Setup

The workflow currently passes variables via `-var` flags:
- `terraform plan -var="project_id=${{ secrets.GCP_PROJECT_ID }}"`
- `terraform apply -var="project_id=${{ secrets.GCP_PROJECT_ID }}"`

This works for both local execution and remote Terraform Cloud execution.

## Local Development

For local development, you can:

**Option 1: Use environment variable**
```bash
export TF_VAR_project_id="your-project-id"
terraform plan
```

**Option 2: Use -var flag**
```bash
terraform plan -var="project_id=your-project-id"
```

**Option 3: Create terraform.tfvars file**
```hcl
# terraform/terraform.tfvars (DO NOT COMMIT THIS FILE)
project_id = "your-project-id"
vertex_ai_location = "us-central1"
```

Then run:
```bash
terraform plan
```

**Option 4: Use .auto.tfvars file**
```hcl
# terraform/.auto.tfvars (DO NOT COMMIT IF IT CONTAINS SENSITIVE DATA)
project_id = "your-project-id"
```

## Troubleshooting

**Error: "No value for required variable 'project_id'"**

- Ensure `project_id` is set via one of the methods above
- If using Terraform Cloud, check workspace variables
- If using GitHub Actions, verify `GCP_PROJECT_ID` secret exists

**Variables not working in Terraform Cloud remote execution:**

- Set variables in Terraform Cloud workspace UI (recommended)
- Or ensure `-var` flags are used in the workflow commands

**Error: "No credentials loaded" or "could not find default credentials":**

- This is a **credentials issue**, not a variables issue
- Terraform Cloud needs GCP credentials configured in the workspace
- See `TERRAFORM_CLOUD_CREDENTIALS_SETUP.md` for complete setup instructions
- You need to set `GOOGLE_CREDENTIALS` environment variable in Terraform Cloud workspace

