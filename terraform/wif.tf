# Workload Identity Federation for GitHub Actions
# This allows GitHub Actions to authenticate to GCP without storing service account keys

# Workload Identity Pool
resource "google_iam_workload_identity_pool" "github_actions" {
  project                   = var.project_id
  workload_identity_pool_id = "github-actions-pool"
  display_name              = "GitHub Actions Pool"
  description               = "Workload Identity Pool for GitHub Actions to access GCP resources"
  location                  = "global"

  depends_on = [google_project_service.apis]
}

# Workload Identity Provider (OIDC for GitHub Actions)
resource "google_iam_workload_identity_pool_provider" "github" {
  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_actions.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  location                           = "global"
  display_name                       = "GitHub Provider"
  description                        = "OIDC provider for GitHub Actions"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
  }

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }

  depends_on = [google_iam_workload_identity_pool.github_actions]
}

# Service Account for GitHub Actions
resource "google_service_account" "github_actions" {
  account_id   = "github-actions"
  display_name = "GitHub Actions Service Account"
  description  = "Service account for GitHub Actions to manage GCP resources via Terraform"
  project      = var.project_id

  depends_on = [google_project_service.apis]
}

# IAM roles for GitHub Actions service account
# These roles allow Terraform to manage GCP resources
resource "google_project_iam_member" "github_actions_iam_admin" {
  project = var.project_id
  role    = "roles/iam.serviceAccountAdmin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_project_iam_member" "github_actions_project_iam_admin" {
  project = var.project_id
  role    = "roles/resourcemanager.projectIamAdmin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_project_iam_member" "github_actions_service_usage_admin" {
  project = var.project_id
  role    = "roles/serviceusage.serviceUsageAdmin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_project_iam_member" "github_actions_secret_manager_admin" {
  project = var.project_id
  role    = "roles/secretmanager.admin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Allow GitHub Actions to create/manage service accounts for Vertex AI
resource "google_project_iam_member" "github_actions_vertex_ai_admin" {
  project = var.project_id
  role    = "roles/aiplatform.admin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Allow GitHub Actions to manage Vertex AI service account (the one used by Cloudflare Workers)
resource "google_service_account_iam_member" "github_actions_impersonate_vertex_ai_sa" {
  service_account_id = google_service_account.vertex_ai.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.github_actions.email}"

  depends_on = [google_service_account.vertex_ai]
}

# Allow GitHub Actions to impersonate the service account via Workload Identity
# This binding allows the GitHub Actions workflow to assume the service account identity
resource "google_service_account_iam_member" "github_actions_workload_identity_user" {
  service_account_id = google_service_account.github_actions.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_actions.name}/attribute.repository/${var.github_repository}"

  depends_on = [
    google_iam_workload_identity_pool_provider.github,
    google_service_account.github_actions
  ]
}

