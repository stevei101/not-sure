provider "google" {
  project = var.project_id
  region  = var.default_region
  # For Terraform Cloud remote execution:
  # Credentials must be set as GOOGLE_CREDENTIALS environment variable in Terraform Cloud workspace
  # The GOOGLE_CREDENTIALS env var should contain the service account key JSON
  # See TERRAFORM_CLOUD_CREDENTIALS_SETUP.md for setup instructions
}

