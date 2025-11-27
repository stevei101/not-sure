variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
  # This will be set via environment variable or terraform.tfvars
}

variable "default_region" {
  description = "Default GCP region"
  type        = string
  default     = "us-central1"
}

variable "vertex_ai_location" {
  description = "GCP region for Vertex AI (e.g., us-central1, us-east1, europe-west1)"
  type        = string
  default     = "us-central1"
}

variable "vertex_ai_model" {
  description = "Vertex AI Gemini model name (e.g., gemini-1.5-pro, gemini-1.5-flash, gemini-1.0-pro)"
  type        = string
  default     = "gemini-1.5-pro"
}

variable "service_account_id" {
  description = "Service account ID for Cloudflare Workers Vertex AI access"
  type        = string
  default     = "not-sure-vertex-ai"
}

variable "service_account_display_name" {
  description = "Display name for the service account"
  type        = string
  default     = "Not Sure - Vertex AI Service Account"
}

# Note: The following variables are not used in backend.tf, as backend configuration cannot use variables.
# They are included here for documentation and reference purposes only; actual values are hardcoded in backend.tf.

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "github_repository" {
  description = "GitHub repository in format 'owner/repo' (e.g., 'stevei101/not-sure')"
  type        = string
  default     = "stevei101/not-sure"
}
