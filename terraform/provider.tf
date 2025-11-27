provider "google" {
  project = var.project_id
  region  = var.default_region
  # Terraform Cloud uses GCP workspace integration for authentication
  # No explicit credentials needed when integration is configured
}

