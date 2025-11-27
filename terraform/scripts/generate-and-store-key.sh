#!/bin/bash
# Generate service account key and store it in Secret Manager
# This script automates the post-terraform setup steps

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required variables are set
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: PROJECT_ID environment variable is not set${NC}"
    echo "Usage: PROJECT_ID=your-project-id ./scripts/generate-and-store-key.sh"
    exit 1
fi

if [ -z "$SERVICE_ACCOUNT_EMAIL" ]; then
    echo -e "${RED}Error: SERVICE_ACCOUNT_EMAIL environment variable is not set${NC}"
    echo "You can get this from Terraform output: terraform output service_account_email"
    exit 1
fi

SECRET_NAME="VERTEX_AI_SERVICE_ACCOUNT_JSON"
KEY_FILE="vertex-ai-key.json"

echo -e "${YELLOW}Generating service account key for: ${SERVICE_ACCOUNT_EMAIL}${NC}"

# Generate the service account key
gcloud iam service-accounts keys create "$KEY_FILE" \
    --iam-account="$SERVICE_ACCOUNT_EMAIL" \
    --project="$PROJECT_ID"

if [ ! -f "$KEY_FILE" ]; then
    echo -e "${RED}Error: Failed to generate service account key${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Service account key generated${NC}"

# Add the key to Secret Manager
echo -e "${YELLOW}Storing key in Secret Manager: ${SECRET_NAME}${NC}"
cat "$KEY_FILE" | gcloud secrets versions add "$SECRET_NAME" \
    --data-file=- \
    --project="$PROJECT_ID"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Key stored in Secret Manager${NC}"
else
    echo -e "${RED}Error: Failed to store key in Secret Manager${NC}"
    rm -f "$KEY_FILE"
    exit 1
fi

# Clean up the key file
rm -f "$KEY_FILE"
echo -e "${GREEN}✓ Key file removed${NC}"

echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Set Cloudflare Worker secrets:"
echo "   wrangler secret put VERTEX_AI_PROJECT_ID"
echo "   wrangler secret put VERTEX_AI_LOCATION"
echo "   wrangler secret put VERTEX_AI_MODEL"
echo "   wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON"
echo ""
echo "2. Test the Vertex AI integration with your worker"

