# Service Account for Cloudflare Workers to access Vertex AI

# Service account variables are defined in variables.tf with defaults:
# - service_account_id: "not-sure-vertex-ai"
# - service_account_display_name: "Not Sure - Vertex AI Service Account"

# Create the service account for Cloudflare Workers
resource "google_service_account" "vertex_ai" {
  project      = var.project_id
  account_id   = var.service_account_id
  display_name = var.service_account_display_name
  description  = "Service account for Cloudflare Workers to access Vertex AI (Gemini models)"
}

# Grant required IAM roles to the service account for Vertex AI access
# Adjust the list of roles as needed for your Vertex AI workflow
locals {
  required_roles = [
    # Vertex AI admin access (required for full Gemini model management)
    "roles/aiplatform.admin",
    # Service account user (allows the service account to be used)
    "roles/iam.serviceAccountUser",
    # Secret Manager admin (for storing/retrieving service account keys)
    "roles/secretmanager.admin",
    # KMS crypto key access (for encryption/decryption if needed)
    "roles/cloudkms.cryptoKeyEncrypterDecrypter",
    # Storage object admin (for Vertex AI artifacts if needed)
    "roles/storage.objectAdmin",
  ]
}

resource "google_project_iam_member" "vertex_ai_roles" {
  for_each = toset(local.required_roles)
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.vertex_ai.email}"
}

# Create a key for the service account (JSON) – this will be stored in Terraform state (sensitive)
resource "google_service_account_key" "vertex_ai_key" {
  service_account_id = google_service_account.vertex_ai.name
  public_key_type    = "TYPE_X509_PEM_FILE"
  private_key_type   = "TYPE_GOOGLE_CREDENTIALS_FILE"
}

# Output the service account email (used for reference and IAM bindings)
output "service_account_email" {
  description = "Email of the service account used by Cloudflare Workers for Vertex AI access"
  value       = google_service_account.vertex_ai.email
  sensitive   = false
}

# Output the service account key (base64-encoded JSON key for the service account - sensitive)
output "service_account_key" {
  description = "Base64-encoded JSON key for the service account (sensitive - will be stored in Secret Manager)"
  value       = google_service_account_key.vertex_ai_key.private_key
  sensitive   = true
}

