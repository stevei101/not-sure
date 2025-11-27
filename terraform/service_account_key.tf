# Service Account Key for Cloudflare Workers

# Create a JSON key for the service account
# Note: Omitting public_key_type defaults to JSON key format (required for Cloudflare Workers)
resource "google_service_account_key" "vertex_ai_key" {
  service_account_id = google_service_account.vertex_ai.name
}

