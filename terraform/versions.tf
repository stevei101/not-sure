terraform {
  # Pin to the current major version to avoid breaking changes in CI.
  required_version = ">= 1.5.0, < 2.0.0"

  required_providers {
    google = {
      source = "hashicorp/google"
      # Keep within the 5.x series; newer major versions may introduce breaking changes.
      version = "~> 5.0"
    }
  }
}

