# Service Account for Cloudflare Workers to access Vertex AI

# Create the service account for Cloudflare Workers
resource "google_service_account" "vertex_ai" {
  project      = var.project_id
  account_id   = var.service_account_id
  display_name = var.service_account_display_name
  description  = "Service account for Cloudflare Workers to access Vertex AI (Gemini models)"
}

# Grant required IAM roles to the service account for Vertex AI access
locals {
  required_roles = [
    # Vertex AI User - allows making predictions with Vertex AI models
    "roles/aiplatform.user",
    # Service Account User - allows the service account to be used
    "roles/iam.serviceAccountUser",
  ]
}

resource "google_project_iam_member" "vertex_ai_roles" {
  for_each = toset(local.required_roles)
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.vertex_ai.email}"
}

