# Service Account for Terraform Cloud CI to access GCP resources
# This service account is used by Terraform Cloud/GitHub Actions to manage GCP infrastructure
# Note: The workflow uses Workload Identity Federation (WIF), but this service account
# can be used as a fallback or for Terraform Cloud backend authentication

variable "terraform_ci_service_account_id" {
  description = "ID (short name) for the Terraform CI service account"
  type        = string
  default     = "terraform-ci-sa"
}

variable "terraform_ci_service_account_display_name" {
  description = "Display name for the Terraform CI service account"
  type        = string
  default     = "Terraform CI Service Account"
}

# Create the service account for Terraform Cloud CI
resource "google_service_account" "ci_sa" {
  project      = var.project_id
  account_id   = var.terraform_ci_service_account_id
  display_name = var.terraform_ci_service_account_display_name
  description  = "Service account for Terraform Cloud CI to manage GCP resources"
}

# Grant required IAM roles to the service account
# Adjust the list of roles as needed for your Terraform workflow
locals {
  ci_required_roles = [
    # Vertex AI admin (for managing Vertex AI resources)
    "roles/aiplatform.admin",
    # Service account user (allows the service account to be used)
    "roles/iam.serviceAccountUser",
    # Secret Manager admin (for managing secrets)
    "roles/secretmanager.admin",
    # KMS crypto key access (for encryption/decryption)
    "roles/cloudkms.cryptoKeyEncrypterDecrypter",
    # Storage object admin (for Vertex AI artifacts)
    "roles/storage.objectAdmin",
  ]
}

resource "google_project_iam_member" "ci_sa_roles" {
  for_each = toset(local.ci_required_roles)
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.ci_sa.email}"
}

# Create a key for the service account (JSON) – this will be stored in Terraform state (sensitive)
resource "google_service_account_key" "ci_sa_key" {
  service_account_id = google_service_account.ci_sa.name
  public_key_type    = "TYPE_X509_PEM_FILE"
  private_key_type   = "TYPE_GOOGLE_CREDENTIALS_FILE"
}

# Output the service account email and the private key (base64-encoded)
output "terraform_ci_service_account_email" {
  description = "Email of the service account used by Terraform Cloud CI"
  value       = google_service_account.ci_sa.email
  sensitive   = false
}

output "terraform_ci_service_account_key" {
  description = "Base64-encoded JSON key for the Terraform CI service account (sensitive)"
  value       = google_service_account_key.ci_sa_key.private_key
  sensitive   = true
}

