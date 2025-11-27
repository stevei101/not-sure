# Secret Manager Secret for Service Account JSON Key
# This will store the service account key JSON for use in Cloudflare Workers
resource "google_secret_manager_secret" "service_account_key" {
  secret_id = "VERTEX_AI_SERVICE_ACCOUNT_JSON"
  project   = var.project_id

  replication {
    auto {
    }
  }

  labels = {
    service     = "not-sure-worker"
    api_type    = "vertex-ai"
    managed_by  = "terraform"
    environment = var.environment
  }

  depends_on = [google_project_service.apis]
}

# Generate service account key
resource "google_service_account_key" "vertex_ai" {
  service_account_id = google_service_account.vertex_ai.name

  depends_on = [google_service_account.vertex_ai]
}

# Store the service account key JSON in Secret Manager
# The private_key from google_service_account_key is already base64-encoded JSON, so we decode it
resource "google_secret_manager_secret_version" "service_account_key" {
  secret      = google_secret_manager_secret.service_account_key.id
  secret_data = base64decode(google_service_account_key.vertex_ai.private_key)

  depends_on = [
    google_secret_manager_secret.service_account_key,
    google_service_account_key.vertex_ai
  ]
}

# Grant the service account access to read its own key (for validation/testing)
resource "google_secret_manager_secret_iam_member" "service_account_key_accessor" {
  secret_id = google_secret_manager_secret.service_account_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.vertex_ai.email}"

  depends_on = [google_secret_manager_secret.service_account_key]
}

