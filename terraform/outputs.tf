# Service Account Outputs
output "service_account_email" {
  description = "Service account email for Cloudflare Workers Vertex AI access"
  value       = local.service_account_email
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

output "service_account_key_secret_name" {
  description = "Full Secret Manager resource name for service account JSON"
  value       = google_secret_manager_secret.service_account_key.name
  sensitive   = false
}

output "service_account_key_secret_version" {
  description = "Secret Manager secret version number"
  value       = google_secret_manager_secret_version.service_account_key.version
  sensitive   = false
}

# Instructions for retrieving and using the service account key
output "setup_instructions" {
  description = "Instructions for completing the setup"
  value       = <<-EOT
    ✅ Service account key has been automatically generated and stored in Secret Manager!
    
    To retrieve the service account JSON key:
    
    1. Get the key from Secret Manager:
       gcloud secrets versions access latest \
         --secret="${google_secret_manager_secret.service_account_key.secret_id}" \
         --project=${var.project_id}
    
    2. Set Cloudflare Worker secret:
       gcloud secrets versions access latest \
         --secret="${google_secret_manager_secret.service_account_key.secret_id}" \
         --project=${var.project_id} | \
       wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON
    
    Or set other required secrets:
       wrangler secret put GCP_PROJECT_ID        # Use: ${var.project_id}
       wrangler secret put VERTEX_AI_LOCATION    # Use: ${var.vertex_ai_location}
       wrangler secret put VERTEX_AI_MODEL       # Use: ${var.vertex_ai_model}
    
    The service account JSON is stored at:
    Secret: projects/${var.project_id}/secrets/${google_secret_manager_secret.service_account_key.secret_id}
  EOT
  sensitive   = false
}

# Workload Identity Federation Outputs
output "wif_provider" {
  description = "Workload Identity Federation provider resource name for GitHub Actions"
  value       = google_iam_workload_identity_pool_provider.github.name
  sensitive   = false
}

output "wif_service_account" {
  description = "Service account email for GitHub Actions (via WIF)"
  value       = google_service_account.github_actions.email
  sensitive   = false
}

output "wif_setup_instructions" {
  description = "Instructions for adding WIF values to GitHub Secrets"
  value       = <<-EOT
    ✅ Workload Identity Federation has been set up!
    
    Add these values to your GitHub repository secrets:
    
    1. Go to: https://github.com/${var.github_repository}/settings/secrets/actions
    
    2. Add secret 'WIF_PROVIDER':
       ${google_iam_workload_identity_pool_provider.github.name}
    
    3. Add secret 'WIF_SERVICE_ACCOUNT':
       ${google_service_account.github_actions.email}
    
    After adding these secrets, your GitHub Actions workflow will be able to authenticate to GCP!
    
    Workload Identity Pool: ${google_iam_workload_identity_pool.github_actions.name}
    Repository restriction: ${var.github_repository}
  EOT
  sensitive   = false
}

