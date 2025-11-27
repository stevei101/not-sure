# Terraform Outputs

output "service_account_email" {
  description = "Email of the service account used by Cloudflare Workers for Vertex AI access"
  value       = google_service_account.vertex_ai.email
  sensitive   = false
}

output "service_account_id" {
  description = "ID of the service account"
  value       = google_service_account.vertex_ai.id
  sensitive   = false
}

output "secret_name" {
  description = "Name of the Secret Manager secret containing the service account key"
  value       = google_secret_manager_secret.vertex_ai_sa_key.secret_id
  sensitive   = false
}

output "secret_project" {
  description = "Project ID where the secret is stored"
  value       = google_secret_manager_secret.vertex_ai_sa_key.project
  sensitive   = false
}

output "setup_instructions" {
  description = "Instructions for retrieving the service account key"
  value       = <<-EOT
    To retrieve the service account key from Secret Manager:
    
    gcloud secrets versions access latest \
      --secret="${google_secret_manager_secret.vertex_ai_sa_key.secret_id}" \
      --project=${var.project_id} | \
    wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON
    
    Or use the helper script:
    ./scripts/get-service-account-key.sh ${var.project_id}
  EOT
  sensitive   = false
}

