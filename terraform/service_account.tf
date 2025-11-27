# Service Account for Terraform Cloud to access GCP resources

variable "service_account_id" {
  description = "ID (short name) for the GCP service account"
  type        = string
  default     = "terraform-ci-sa"
}

variable "service_account_display_name" {
  description = "Display name for the service account"
  type        = string
  default     = "Terraform CI Service Account"
}

# Create the service account
resource "google_service_account" "ci_sa" {
  project      = var.project_id
  account_id   = var.service_account_id
  display_name = var.service_account_display_name
}

# Grant required IAM roles to the service account
# Adjust the list of roles as needed for your Vertex AI workflow
locals {
  required_roles = [
    "roles/aiplatform.admin",
    "roles/iam.serviceAccountUser",
    "roles/secretmanager.admin",
    "roles/cloudkms.cryptoKeyEncrypterDecrypter",
    "roles/storage.objectAdmin",
  ]
}

resource "google_project_iam_member" "ci_sa_roles" {
  for_each = toset(local.required_roles)
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

# Output the service account email and the private key (base64‑encoded)
output "service_account_email" {
  description = "Email of the service account used by Terraform Cloud"
  value       = google_service_account.ci_sa.email
}

output "service_account_key" {
  description = "Base64‑encoded JSON key for the service account (sensitive)"
  value       = google_service_account_key.ci_sa_key.private_key
  sensitive   = true
}
