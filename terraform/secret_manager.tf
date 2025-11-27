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

# Grant the service account access to read its own key (for validation/testing)
resource "google_secret_manager_secret_iam_member" "service_account_key_accessor" {
  secret_id = google_secret_manager_secret.service_account_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.vertex_ai.email}"
}

# Note: The actual service account JSON key value must be added after the service account key is created.
# Use the script in scripts/generate-service-account-key.sh or manually via:
# gcloud iam service-accounts keys create key.json --iam-account=SERVICE_ACCOUNT_EMAIL
# echo "$(cat key.json)" | gcloud secrets versions add VERTEX_AI_SERVICE_ACCOUNT_JSON --data-file=-
# rm key.json

