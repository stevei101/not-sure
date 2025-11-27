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
  description = "Vertex AI Gemini model name (e.g., gemini-1.5-pro, gemini-1.5-flash)"
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

# Note: These variables are not used in backend.tf (backend cannot use variables)
# They are kept for reference/documentation purposes only
# The actual values are hardcoded in backend.tf
# Note: Terraform Cloud backend configuration (organization/workspace) cannot use variables
# These values must be hardcoded in backend.tf - see backend.tf for current configuration
# Variables removed to avoid TFLint warnings about unused declarations

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

