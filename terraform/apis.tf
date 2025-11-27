# Enable Required Google Cloud APIs
# These APIs must be enabled for Vertex AI to function

resource "google_project_service" "apis" {
  for_each = toset([
    # Vertex AI API (required for Gemini models)
    "aiplatform.googleapis.com",

    # IAM (for service accounts and Workload Identity Federation)
    "iam.googleapis.com",

    # Cloud Resource Manager (for project operations)
    "cloudresourcemanager.googleapis.com",

    # Service Usage (for API management)
    "serviceusage.googleapis.com",

    # Secret Manager (for storing service account key)
    "secretmanager.googleapis.com",

    # IAM Credentials API (required for Workload Identity Federation)
    "iamcredentials.googleapis.com",

    # STS API (Security Token Service - required for Workload Identity Federation)
    "sts.googleapis.com",
  ])

  project = var.project_id
  service = each.value

  # Prevent accidental deletion of essential APIs when the workspace is destroyed.
  # Set to true to avoid disabling APIs that may be used by other resources.
  disable_on_destroy = true

  timeouts {
    create = "10m"
    update = "10m"
  }
}

