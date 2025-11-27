config {
  # Allow unused declarations for variables that will be used in future PRs
  # This is a foundational PR (PR 1.1) that declares variables for PR 2.1+
  force = false
}

# Disable unused declarations warnings for variables declared for future PRs
# These variables will be used in:
# - PR 2.1: Service Account and IAM resources (service_account_id, service_account_display_name)
# - PR 2.2: Vertex AI configuration (vertex_ai_location, vertex_ai_model)
# - PR 3.x: Workflow integration (environment, github_repository)
rule "terraform_unused_declarations" {
  enabled = false
}

