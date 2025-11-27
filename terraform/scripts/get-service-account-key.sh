#!/bin/bash
# Retrieve service account key from Secret Manager and set as Cloudflare Worker secret
# Usage: ./terraform/scripts/get-service-account-key.sh [PROJECT_ID]

set -e

PROJECT_ID="${1:-${GCP_PROJECT_ID}}"
SECRET_NAME="VERTEX_AI_SERVICE_ACCOUNT_JSON"

if [ -z "$PROJECT_ID" ]; then
  echo "Error: PROJECT_ID must be provided as argument or GCP_PROJECT_ID environment variable"
  echo "Usage: $0 [PROJECT_ID]"
  exit 1
fi

echo "📥 Retrieving service account key from Secret Manager..."
echo "   Project: $PROJECT_ID"
echo "   Secret: $SECRET_NAME"

# Retrieve the key from Secret Manager and pipe directly to wrangler
gcloud secrets versions access latest \
  --secret="$SECRET_NAME" \
  --project="$PROJECT_ID" | \
wrangler secret put VERTEX_AI_SERVICE_ACCOUNT_JSON

echo ""
echo "✅ Service account key has been set as Cloudflare Worker secret: VERTEX_AI_SERVICE_ACCOUNT_JSON"
echo ""
echo "📋 Next steps:"
echo "   1. Set other required secrets:"
echo "      wrangler secret put GCP_PROJECT_ID"
echo "      wrangler secret put VERTEX_AI_LOCATION"
echo "      wrangler secret put VERTEX_AI_MODEL"
echo ""
echo "   2. Deploy and test:"
echo "      wrangler deploy"
echo "      curl https://lornu.ai/status"

