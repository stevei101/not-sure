#!/bin/bash
# Helper script to retrieve Vertex AI service account key from Secret Manager
# and set it as a Cloudflare Workers secret
#
# Usage:
#   ./terraform/scripts/get-service-account-key.sh [PROJECT_ID]
#
# If PROJECT_ID is not provided, it will try to get it from:
#   1. TF_VAR_project_id environment variable
#   2. terraform output project_id (if in terraform directory)
#   3. Prompt for input

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Secret Manager secret ID (matches terraform/secret_manager.tf)
SECRET_ID="vertex-ai-service-account-key"
WRANGLER_SECRET_NAME="VERTEX_AI_SERVICE_ACCOUNT_JSON"

# Determine project ID
PROJECT_ID="${1:-${TF_VAR_project_id}}"

if [ -z "$PROJECT_ID" ]; then
  # Try to get from terraform output if we're in the terraform directory
  if [ -f "$TERRAFORM_DIR/terraform.tfstate" ] || [ -d "$TERRAFORM_DIR/.terraform" ]; then
    cd "$TERRAFORM_DIR"
    # Try secret_project output first, then fall back to variable lookup
    PROJECT_ID=$(terraform output -raw secret_project 2>/dev/null || echo "")
    if [ -z "$PROJECT_ID" ]; then
      # If no output, try to get from terraform variables
      PROJECT_ID=$(terraform output -json 2>/dev/null | grep -o '"secret_project"[^}]*' | grep -o '"[^"]*"' | head -1 | tr -d '"' || echo "")
    fi
  fi
fi

if [ -z "$PROJECT_ID" ]; then
  echo "Error: Project ID not found."
  echo ""
  echo "Usage:"
  echo "  $0 [PROJECT_ID]"
  echo ""
  echo "Or set environment variable:"
  echo "  export TF_VAR_project_id=\"your-project-id\""
  echo "  $0"
  echo ""
  echo "Or provide as argument:"
  echo "  $0 your-project-id"
  exit 1
fi

echo "=== Retrieving Service Account Key ==="
echo ""
echo "Project ID: $PROJECT_ID"
echo "Secret ID: $SECRET_ID"
echo "Cloudflare Secret: $WRANGLER_SECRET_NAME"
echo ""

# Check if gcloud is available
if ! command -v gcloud &> /dev/null; then
  echo "Error: gcloud CLI is not installed or not in PATH"
  echo "Install it from: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Check if wrangler is available
if ! command -v wrangler &> /dev/null; then
  echo "Warning: wrangler CLI is not installed or not in PATH"
  echo "The key will be retrieved but not set as a Cloudflare secret"
  echo ""
  echo "Install wrangler: npm install -g wrangler"
  echo ""
  read -p "Continue to retrieve key only? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
  WRANGLER_AVAILABLE=false
else
  WRANGLER_AVAILABLE=true
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1 &> /dev/null; then
  echo "Error: No active gcloud authentication found"
  echo "Run: gcloud auth login"
  exit 1
fi

# Retrieve the secret
echo "Retrieving secret from Secret Manager..."
SECRET_VALUE=$(gcloud secrets versions access latest \
  --secret="$SECRET_ID" \
  --project="$PROJECT_ID" 2>&1)

if [ $? -ne 0 ]; then
  echo "Error: Failed to retrieve secret"
  echo "$SECRET_VALUE"
  exit 1
fi

echo "✅ Secret retrieved successfully"
echo ""

# Set as Cloudflare Workers secret
if [ "$WRANGLER_AVAILABLE" = true ]; then
  echo "Setting Cloudflare Workers secret..."
  echo "$SECRET_VALUE" | wrangler secret put "$WRANGLER_SECRET_NAME"
  
  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully set Cloudflare Workers secret: $WRANGLER_SECRET_NAME"
    echo ""
    echo "You can verify it exists with:"
    echo "  wrangler secret list"
  else
    echo ""
    echo "⚠️  Failed to set Cloudflare Workers secret"
    echo "Secret was retrieved but not set. You can set it manually:"
    echo ""
    echo "  echo '...secret value...' | wrangler secret put $WRANGLER_SECRET_NAME"
    exit 1
  fi
else
  echo "Secret value retrieved (not setting Cloudflare secret - wrangler not available):"
  echo ""
  echo "$SECRET_VALUE" | head -c 100
  echo "..."
  echo ""
  echo "To set it manually, run:"
  echo "  echo '...' | wrangler secret put $WRANGLER_SECRET_NAME"
fi

echo ""
echo "=== Complete ==="

