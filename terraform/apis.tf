# Enable Required Google Cloud APIs
# These APIs must be enabled for Vertex AI to function

resource "google_project_service" "apis" {
  for_each = toset([
    # Vertex AI API (required for Gemini models)
    "aiplatform.googleapis.com",

    # IAM (for service accounts)
    "iam.googleapis.com",

    # Cloud Resource Manager (for project operations)
    "cloudresourcemanager.googleapis.com",

    # Service Usage (for API management)
    "serviceusage.googleapis.com",

    # Secret Manager (for storing service account key)
    "secretmanager.googleapis.com",
  ])

  project = var.project_id
  service = each.value

  disable_on_destroy = false # Keep APIs enabled even if Terraform destroys resources

  timeouts {
    create = "10m"
    update = "10m"
  }
}

