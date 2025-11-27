#!/bin/bash

# Script to format Terraform files
# Usage: ./scripts/format-terraform.sh

set -e

TERRAFORM_DIR="terraform"

if [ ! -d "$TERRAFORM_DIR" ]; then
    echo "Error: $TERRAFORM_DIR directory not found"
    exit 1
fi

echo "🔧 Formatting Terraform files in $TERRAFORM_DIR..."

# Format all Terraform files recursively
terraform fmt -recursive "$TERRAFORM_DIR"

echo "✅ Terraform formatting complete!"

