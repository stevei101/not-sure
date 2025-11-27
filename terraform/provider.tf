provider "google" {
  project = var.project_id
  region  = var.default_region
  # For Terraform Cloud remote execution:
  # Option 1: Use GCP workspace integration (recommended - no credentials needed)
  #   - Configure in Terraform Cloud workspace settings
  #   - Terraform Cloud handles authentication automatically
  # Option 2: Use GOOGLE_CREDENTIALS environment variable (if integration not available)
  #   - Set as sensitive environment variable in Terraform Cloud workspace
  #   - Contains service account key JSON
}

