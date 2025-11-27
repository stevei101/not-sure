# Service Account for Cloudflare Workers to access Vertex AI
# Dependencies: APIs must be enabled first
resource "google_service_account" "vertex_ai" {
  account_id   = var.service_account_id
  display_name = var.service_account_display_name
  description  = "Service account for Cloudflare Workers to access Google Vertex AI (Gemini models)"
  project      = var.project_id

  depends_on = [google_project_service.apis]
}

# IAM roles for Vertex AI access
resource "google_project_iam_member" "vertex_ai_user" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.vertex_ai.email}"
}

resource "google_project_iam_member" "vertex_ai_service_agent" {
  project = var.project_id
  role    = "roles/aiplatform.serviceAgent"
  member  = "serviceAccount:${google_service_account.vertex_ai.email}"
}

# Allow service account to read its own secrets
resource "google_project_iam_member" "secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.vertex_ai.email}"

  depends_on = [google_secret_manager_secret.service_account_key]
}

