#!/bin/bash

# Quick script to set up Terraform Cloud GCP credentials
# This creates a service account and outputs instructions for Terraform Cloud

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Terraform Cloud GCP Credentials Setup${NC}"
echo ""

# Get project ID
if [ -z "$GCP_PROJECT_ID" ]; then
    read -p "Enter your GCP Project ID: " GCP_PROJECT_ID
fi

echo -e "${GREEN}Using Project ID: ${GCP_PROJECT_ID}${NC}"
echo ""

# Service account details
SA_NAME="terraform-cloud"
SA_EMAIL="${SA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
KEY_FILE="terraform-cloud-key.json"

echo -e "${YELLOW}Step 1: Creating service account...${NC}"
gcloud iam service-accounts create ${SA_NAME} \
    --display-name="Terraform Cloud Service Account" \
    --project=${GCP_PROJECT_ID} 2>/dev/null || echo "Service account already exists (that's okay)"

echo -e "${YELLOW}Step 2: Granting IAM roles...${NC}"
gcloud projects add-iam-policy-binding ${GCP_PROJECT_ID} \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/editor" \
    --condition=None \
    --quiet 2>/dev/null || echo "Editor role already granted"

gcloud projects add-iam-policy-binding ${GCP_PROJECT_ID} \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/aiplatform.admin" \
    --condition=None \
    --quiet 2>/dev/null || echo "AI Platform Admin role already granted"

gcloud projects add-iam-policy-binding ${GCP_PROJECT_ID} \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountAdmin" \
    --condition=None \
    --quiet 2>/dev/null || echo "IAM Service Account Admin role already granted"

gcloud projects add-iam-policy-binding ${GCP_PROJECT_ID} \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/secretmanager.admin" \
    --condition=None \
    --quiet 2>/dev/null || echo "Secret Manager Admin role already granted"

echo -e "${YELLOW}Step 3: Creating service account key...${NC}"
gcloud iam service-accounts keys create ${KEY_FILE} \
    --iam-account=${SA_EMAIL} \
    --project=${GCP_PROJECT_ID}

echo ""
echo -e "${GREEN}✅ Service account created successfully!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Go to Terraform Cloud workspace:"
echo "   https://app.terraform.io/app/[ORGANIZATION]/not-sure/variables"
echo ""
echo "2. Click 'Add variable'"
echo ""
echo "3. Configure the variable:"
echo "   - Type: ${GREEN}Environment variable${NC}"
echo "   - Key: ${GREEN}GOOGLE_CREDENTIALS${NC}"
echo "   - Value: ${GREEN}Paste contents of ${KEY_FILE}${NC}"
echo "   - Mark as sensitive: ${GREEN}✓${NC}"
echo ""
echo -e "${YELLOW}To copy the key file contents:${NC}"
echo ""
echo "   cat ${KEY_FILE}"
echo ""
echo "   Or on Mac:"
echo "   pbcopy < ${KEY_FILE}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}⚠️  Security Note:${NC}"
echo "The key file (${KEY_FILE}) contains sensitive credentials."
echo "After adding to Terraform Cloud, you can safely delete it:"
echo ""
echo "   rm ${KEY_FILE}"
echo ""
echo "Or keep it secure for future reference."
echo ""

