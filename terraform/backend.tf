# Terraform Cloud Backend Configuration
# State is stored remotely in Terraform Cloud
#
# IMPORTANT: Backend configuration cannot use variables - values must be hardcoded.
# If your Terraform Cloud organization or workspace is different, update the values below.
#
# To find your organization name:
# - Go to Terraform Cloud dashboard
# - Organization name is shown in the top left
#
# Current configuration:
# - Organization: "disposable-org" (update if different)
# - Workspace prefix: "not-sure-" (avoids name collisions across forks)
#
# Using a workspace prefix allows multiple workspaces (e.g., "not-sure-main", "not-sure-feature-branch")
# while avoiding collisions when forks use the same repository name.
terraform {
  cloud {
    organization = "disposable-org"
    workspaces {
      # Use a prefix so forks don't collide on the same workspace name.
      prefix = "not-sure-"
    }
  }
}

