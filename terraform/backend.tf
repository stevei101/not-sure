# Terraform Cloud Backend Configuration
# State is stored remotely in Terraform Cloud
terraform {
  cloud {
    organization = var.terraform_cloud_organization
    workspaces {
      name = var.terraform_cloud_workspace
    }
  }
}

