# Terraform Formatting Guide

## Automatic Formatting

Terraform files are automatically formatted before every push via a git pre-push hook.

### Git Pre-Push Hook

A pre-push hook (`.git/hooks/pre-push`) automatically runs `terraform fmt` before each push:

- ✅ Formats all `.tf` files in the `terraform/` directory
- ✅ Blocks push if formatting changes files (so you can commit them)
- ✅ Allows push if files are already formatted

### Manual Formatting

You can also format Terraform files manually:

```bash
# Format all Terraform files
terraform fmt -recursive terraform/

# Or use the helper script
./scripts/format-terraform.sh
```

## CI/CD Format Check

The GitHub Actions workflow (`.github/workflows/terraform.yml`) also runs a format check:

```yaml
- name: Terraform Format Check
  run: terraform fmt -check -recursive terraform/
```

This ensures all Terraform files in the repository are properly formatted.

## Formatting Rules

Terraform `fmt` automatically formats files according to:
- Consistent indentation (2 spaces)
- Standardized spacing
- Alphabetical sorting of arguments
- Consistent style conventions

## Troubleshooting

### Hook Not Running

If the pre-push hook doesn't run:

1. Ensure it's executable:
   ```bash
   chmod +x .git/hooks/pre-push
   ```

2. Check if hooks are enabled:
   ```bash
   git config core.hooksPath
   ```

### Skip Hook (Not Recommended)

If you need to skip the hook temporarily:

```bash
git push --no-verify
```

**Note:** This bypasses formatting checks and may cause CI to fail.

## Best Practices

1. ✅ Always run `terraform fmt` before committing
2. ✅ Let the pre-push hook catch formatting issues
3. ✅ Commit formatted changes separately if needed
4. ❌ Don't use `--no-verify` to skip formatting

## References

- [Terraform fmt Documentation](https://developer.hashicorp.com/terraform/cli/commands/fmt)
- [Git Hooks Documentation](https://git-scm.com/docs/githooks)

