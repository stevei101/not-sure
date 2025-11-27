# Secret Manager Secret for Service Account Key

# Create Secret Manager secret to store the service account key
resource "google_secret_manager_secret" "vertex_ai_sa_key" {
  project   = var.project_id
  secret_id = "vertex-ai-service-account-key"

  replication {
    auto {}
  }

  labels = {
    purpose = "vertex-ai"
    managed = "terraform"
  }
}

# Store the service account key in Secret Manager
resource "google_secret_manager_secret_version" "vertex_ai_sa_key" {
  secret      = google_secret_manager_secret.vertex_ai_sa_key.id
  secret_data = base64decode(google_service_account_key.vertex_ai_key.private_key)
}

