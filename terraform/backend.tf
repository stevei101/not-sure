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
# - Workspace: "not-sure" (matches your workspace name)
#
# Note: The cloud backend block only supports 'name' (single workspace) or 'tags' (tagged workspaces).
# Using a fixed workspace name ensures consistent state management.
terraform {
  cloud {
    organization = "disposable-org"
    workspaces {
      name = "not-sure"
    }
  }
}

