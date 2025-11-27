# Service Account Outputs
output "service_account_email" {
  description = "Service account email for Cloudflare Workers Vertex AI access"
  value       = google_service_account.vertex_ai.email
  sensitive   = false
}

output "service_account_id" {
  description = "Service account ID"
  value       = google_service_account.vertex_ai.account_id
  sensitive   = false
}

# Project Information
output "project_id" {
  description = "GCP Project ID"
  value       = var.project_id
  sensitive   = false
}

output "vertex_ai_location" {
  description = "Vertex AI region/location"
  value       = var.vertex_ai_location
  sensitive   = false
}

output "vertex_ai_model" {
  description = "Vertex AI model name"
  value       = var.vertex_ai_model
  sensitive   = false
}

# Secret Manager Outputs
output "secret_name" {
  description = "Secret Manager secret name for service account JSON"
  value       = google_secret_manager_secret.service_account_key.secret_id
  sensitive   = false
}

# Instructions for adding the service account key to the secret
output "setup_instructions" {
  description = "Instructions for completing the setup"
  value       = <<-EOT
    To complete the Vertex AI setup:
    
    1. Generate a service account key:
       gcloud iam service-accounts keys create key.json \
         --iam-account=${google_service_account.vertex_ai.email} \
         --project=${var.project_id}
    
    2. Add the key to Secret Manager:
       cat key.json | gcloud secrets versions add ${google_secret_manager_secret.service_account_key.secret_id} \
         --data-file=- \
         --project=${var.project_id}
    
    3. Clean up the key file:
       rm key.json
    
    4. Set Cloudflare Worker secrets:
       wrangler secret put VERTEX_AI_PROJECT_ID
       wrangler secret put VERTEX_AI_LOCATION
       wrangler secret put VERTEX_AI_MODEL
       wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON
    
    Or use the provided script: scripts/generate-and-store-key.sh
  EOT
  sensitive   = false
}

