# Security Guidelines

## ⚠️ This is a PUBLIC Repository

**Never commit secrets, API keys, credentials, or sensitive data to this repository.**

## What NOT to Commit

### ❌ Never Commit:
- **API Keys** (OpenAI, Gemini, Google Cloud, etc.)
- **Service Account JSON files** (`.json` files containing credentials)
- **Environment files with secrets** (`.env`, `.env.local`, `.dev.vars`)
- **Private keys** (`.pem`, `.key` files)
- **Passwords or tokens**
- **Database connection strings with credentials**
- **Archives containing secrets** (`.zip`, `.tar.gz` files)

### ✅ Safe to Commit:
- **Resource IDs** (KV namespace IDs, Account IDs, Gateway IDs - these are public identifiers)
- **Placeholder values** (`your-gcp-project-id`, `PLACEHOLDER_API_KEY`)
- **Configuration templates** (`.example` files)
- **Documentation** (as long as it doesn't contain actual secrets)

## How Secrets Are Managed

### Cloudflare Workers
- Use `wrangler secret put SECRET_NAME` to store secrets
- Secrets are stored in Cloudflare's secure secret management
- Never put secrets in `wrangler.jsonc` - use comments or placeholders

### GitHub Actions
- Store secrets in **GitHub Repository Settings → Secrets and variables → Actions**
- Never hardcode secrets in workflow files
- Use `${{ secrets.SECRET_NAME }}` syntax in workflows

### Terraform
- Store sensitive values in **Terraform Cloud variables** (marked as sensitive)
- Never commit `terraform.tfvars` files with real values
- Use `terraform.tfvars.example` as a template only

### Google Cloud
- Service account keys stored in **Google Secret Manager**
- Access via service account with IAM roles
- Never commit service account JSON files

## Verification Checklist

Before committing, verify:
- [ ] No `.env` files (except `.env.example`)
- [ ] No `*key.json` or `*credentials*.json` files
- [ ] No actual API keys or tokens (only placeholders)
- [ ] No `.zip` files containing sensitive code
- [ ] No `terraform.tfvars` with real values
- [ ] All secrets referenced in documentation use placeholders

## Quick Security Scan

Run these commands before committing:

```bash
# Check for potentially sensitive files
git status
git diff

# Look for common secret patterns (false positives possible)
grep -r "AIza[0-9A-Za-z_-]" . 2>/dev/null | grep -v ".git"
grep -r "sk-[0-9A-Za-z]" . 2>/dev/null | grep -v ".git"
grep -r "Bearer [A-Za-z0-9_-]" . 2>/dev/null | grep -v ".git"

# Verify .gitignore is working
git check-ignore -v *.zip *.env *.json
```

## If You Accidentally Committed a Secret

1. **Rotate the secret immediately** - consider it compromised
2. **Remove from git history**:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch PATH_TO_SECRET_FILE" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push** (coordinate with team)
4. **Update the secret** in all services using it

## Current Safe Values in Repository

These are **public identifiers**, not secrets:
- `wrangler.jsonc`: KV namespace ID, Account ID, Gateway ID (Cloudflare resource IDs)
- Configuration placeholders like `your-gcp-project-id`
- Documentation references to secret names

These are **NOT secrets**:
- Cloudflare KV namespace IDs
- Cloudflare Account IDs  
- Cloudflare Gateway IDs
- Resource names and identifiers

## Questions?

When in doubt, ask before committing. It's always better to be cautious with a public repository.

