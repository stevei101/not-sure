#!/bin/bash

# Script to help split PR #17 into an epic of smaller PRs
# Usage: ./scripts/split-pr-epic.sh <pr-number> [base-branch]

set -e

PR_NUMBER=${1:-17}
BASE_BRANCH=${2:-main}
FEATURE_BRANCH="feature/new-work"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 PR Epic Split Helper${NC}"
echo ""
echo "This script will help you create branches for each PR in the epic."
echo "PR #${PR_NUMBER} will be split into multiple smaller PRs."
echo ""

# Check if we're on the feature branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$FEATURE_BRANCH" ]; then
    echo -e "${YELLOW}⚠️  Warning: You're not on ${FEATURE_BRANCH} branch${NC}"
    echo "Current branch: $CURRENT_BRANCH"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Ensure we're up to date
echo -e "${BLUE}📥 Fetching latest changes...${NC}"
git fetch origin

# Check if base branch exists
if ! git rev-parse --verify "origin/$BASE_BRANCH" > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Base branch 'origin/$BASE_BRANCH' not found${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Ready to split PR #${PR_NUMBER}${NC}"
echo ""
echo "The following PR branches will be created:"
echo ""
echo "1.  pr/terraform-infrastructure      - Terraform Infrastructure Setup"
echo "2.  pr/terraform-ci                  - Terraform Validation and CI/CD"
echo "3.  pr/vertex-ai-iam                 - Vertex AI Service Account and IAM"
echo "4.  pr/vertex-ai-worker              - Vertex AI Worker Integration (Initial)"
echo "5.  pr/vertex-ai-auth                - Vertex AI Authentication Methods"
echo "6.  pr/gemini-models                 - Gemini Model Updates"
echo "7.  pr/ai-gateway                    - Cloudflare AI Gateway Integration"
echo "8.  pr/wif-setup                     - Workload Identity Federation"
echo "9.  pr/terraform-cloud-creds         - Terraform Cloud Credentials Setup"
echo "10. pr/terraform-workflow            - Terraform Workflow Improvements"
echo "11. pr/documentation                 - Documentation and References"
echo "12. pr/security-quality              - Security and Quality"
echo "13. pr/bugfixes                      - Bug Fixes and Improvements"
echo ""
read -p "Create all branches now? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Exiting. You can create branches manually using:"
    echo "  git checkout -b pr/<branch-name> $BASE_BRANCH"
    exit 0
fi

echo ""
echo -e "${BLUE}🌿 Creating PR branches...${NC}"
echo ""

# Create branches (without commits yet - user will cherry-pick manually)
BRANCHES=(
    "pr/terraform-infrastructure"
    "pr/terraform-ci"
    "pr/vertex-ai-iam"
    "pr/vertex-ai-worker"
    "pr/vertex-ai-auth"
    "pr/gemini-models"
    "pr/ai-gateway"
    "pr/wif-setup"
    "pr/terraform-cloud-creds"
    "pr/terraform-workflow"
    "pr/documentation"
    "pr/security-quality"
    "pr/bugfixes"
)

for branch in "${BRANCHES[@]}"; do
    if git rev-parse --verify "$branch" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Branch $branch already exists, skipping...${NC}"
    else
        echo -e "${GREEN}✓${NC} Creating $branch"
        git checkout -b "$branch" "$BASE_BRANCH" > /dev/null 2>&1
        git checkout "$FEATURE_BRANCH" > /dev/null 2>&1
    fi
done

echo ""
echo -e "${GREEN}✅ All branches created!${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo ""
echo "1. For each branch, checkout and cherry-pick the relevant commits:"
echo "   git checkout pr/terraform-infrastructure"
echo "   git cherry-pick <commit-hash-1> <commit-hash-2> ..."
echo ""
echo "2. Push the branch and create a PR:"
echo "   git push -u origin pr/terraform-infrastructure"
echo ""
echo "3. See PR_EPIC_PLAN.md for detailed commit mappings and PR order."
echo ""
echo -e "${YELLOW}💡 Tip:${NC} Use 'git log --oneline $BASE_BRANCH..$FEATURE_BRANCH' to see all commits."
echo ""

