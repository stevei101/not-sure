# Terraform Cloud VCS Setup Guide

## Problem

Error: **"Configuration version is missing"** when trying to run "Plan Only" in Terraform Cloud UI.

## Root Cause

The Terraform Cloud workspace is not connected to your GitHub repository, so it doesn't have access to the Terraform configuration files.

## Solution: Connect Workspace to GitHub VCS

### Step 1: Go to Workspace Settings

1. Navigate to: https://app.terraform.io/app/<YOUR_ORGANIZATION>/workspaces/<YOUR_WORKSPACE>
2. Click on **"Settings"** (top right)
3. Click on **"General Settings"** or **"Version Control"**

### Step 2: Connect to GitHub

1. Look for **"Version Control"** or **"VCS Connection"** section
2. Click **"Connect a VCS provider"** or **"Connect to GitHub"**
3. If not already connected:
   - Authorize Terraform Cloud to access your GitHub account
   - Select the repository: `<owner>/<repository-name>`
   - Select the branch: `develop` (or `main`)
   - Set **"Terraform Working Directory"** to: `terraform`

### Step 3: Configure Working Directory

**Critical:** Set the Terraform working directory to `terraform` so Terraform Cloud knows where your `.tf` files are located.

### Step 4: Test Connection

After connecting:
1. Terraform Cloud will automatically create a new run with the latest commit
2. Or go to **"Runs"** tab and click **"Queue plan manually"**
3. This should now work without the "Configuration version is missing" error

## Alternative: CLI-Driven Workflow

If you prefer to use CLI-driven workflow instead of VCS:

1. Go to workspace **"Settings"** → **"General Settings"**
2. Change **"Execution Mode"** from **"VCS"** to **"CLI-driven workflow"**
3. Then use the CLI to upload configuration and run plans

However, **VCS connection is recommended** for automatic runs on commits.

## Verify Setup

After connecting VCS:

1. Go to **"Runs"** tab
2. You should see recent commits from your GitHub repository
3. Click **"Queue plan manually"** → Should now work! ✅

## Working Directory Configuration

Make sure the **Terraform Working Directory** is set to:
```
terraform
```

This tells Terraform Cloud that your `.tf` files are in the `terraform/` subdirectory, not the root.

## Troubleshooting

### Still Getting "Configuration version is missing"?

1. **Check Working Directory**: Ensure it's set to `terraform` (not root `/`)
2. **Check Branch**: Make sure the workspace is watching the correct branch (`develop` or `main`)
3. **Check Repository**: Verify it's connected to `<owner>/<repository-name>`
4. **Check File Structure**: Ensure `terraform/*.tf` files exist in the repository

### Workspace Can't Find Files?

If Terraform Cloud says it can't find `.tf` files:
- Verify the **working directory** is `terraform`
- Check that files are committed and pushed to GitHub
- Ensure the workspace is watching the correct branch

