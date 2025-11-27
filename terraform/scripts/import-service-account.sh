#!/bin/bash
# Import existing service account into Terraform Cloud
#
# This script imports the existing Google Cloud service account
# into Terraform state using Terraform Cloud's remote execution.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$TERRAFORM_DIR"

# Set project ID (adjust if needed)
PROJECT_ID="${TF_VAR_project_id:-vertex-ai-rag-search-p0}"
SERVICE_ACCOUNT_ID="cloudflare-workers-vertex-ai"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_ID}@${PROJECT_ID}.iam.gserviceaccount.com"
RESOURCE_ADDRESS="projects/${PROJECT_ID}/serviceAccounts/${SERVICE_ACCOUNT_EMAIL}"

echo "=== Importing Service Account into Terraform Cloud ==="
echo ""
echo "Project ID: $PROJECT_ID"
echo "Service Account: $SERVICE_ACCOUNT_EMAIL"
echo "Resource Address: $RESOURCE_ADDRESS"
echo ""

# Check if terraform is authenticated with Terraform Cloud
if ! terraform version &>/dev/null; then
    echo "❌ Error: Terraform not found. Please install Terraform first."
    exit 1
fi

echo "📋 Running terraform import (this will execute in Terraform Cloud)..."
echo ""

# Run import command - Terraform Cloud will execute this remotely
terraform import \
    -var="project_id=${PROJECT_ID}" \
    google_service_account.vertex_ai \
    "${RESOURCE_ADDRESS}"

echo ""
echo "✅ Import complete!"
echo ""
echo "Next steps:"
echo "1. Run 'terraform plan' to verify the import"
echo "2. Check Terraform Cloud UI to see the import run"
echo ""

