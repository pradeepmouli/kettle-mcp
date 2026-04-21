# Fix cli-v1.5.2 Tag Issue

## Problem

The `cli-v1.5.2` tag was created at commit `259a288ce5cac4bf4f19aa758129c56af50be656`, but this commit had the versions updated in `pyproject.toml` and `specify_extend.py` WITHOUT updating the CHANGELOG.md file.

When the GitHub Actions release workflow ran, it failed at the "Validate versions are in sync" step because:
- Tag version: 1.5.2
- pyproject.toml version: 1.5.2 ✓
- specify_extend.py version: 1.5.2 ✓
- CHANGELOG.md version: 1.5.1 ❌ (should be 1.5.2)

Reference: https://github.com/pradeepmouli/spec-kit-extensions/actions/runs/20509560063/job/58928894267

## Solution

The CHANGELOG.md has since been updated in commit `3eea581ddf9131d50842d3c485980cb29dff0445` (which is now on the `main` branch). This commit has all three files in sync:
- pyproject.toml version: 1.5.2 ✓
- specify_extend.py version: 1.5.2 ✓
- CHANGELOG.md version: 1.5.2 ✓

To fix the issue, we need to:
1. Delete the existing `cli-v1.5.2` tag (both locally and remotely)
2. Create a new `cli-v1.5.2` tag at commit `3eea581` (which has the correct CHANGELOG)
3. Push the new tag to trigger the release workflow

## Automated Fix

Run the provided script:

```bash
./fix-tag-cli-v1.5.2.sh
```

This script will:
1. Verify that commit `3eea581` has all versions in sync
2. Delete the old tag locally and remotely
3. Create a new annotated tag at commit `3eea581`
4. Push the new tag to trigger the release workflow

## Manual Fix

If you prefer to do this manually:

```bash
# 1. Delete the old tag
git tag -d cli-v1.5.2
git push --delete origin cli-v1.5.2

# 2. Create new tag at the correct commit
git tag -a cli-v1.5.2 3eea581ddf9131d50842d3c485980cb29dff0445 -m "Release CLI v1.5.2

🐛 Fixed:
- Template Download - Fixed template download to use templates-v* tags
- Changed from fetching /releases/latest to /tags endpoint
- Filters for tags starting with templates-v prefix
- Downloads latest template release (templates-v2.5.1)
- Displays template version in UI during download

🧪 Testing:
- Added Unit Tests - Created comprehensive test suite for download functionality
- Tests template tag filtering and selection
- Mocks GitHub API responses
- Verifies correct tag is downloaded

📦 Components:
- CLI Tool Version: v1.5.2
- Compatible Spec Kit Version: v0.0.80+
- Extension Templates Version: v2.5.1"

# 3. Push the new tag
git push origin cli-v1.5.2
```

## Verification

After pushing the new tag, verify:

1. The release workflow runs successfully: https://github.com/pradeepmouli/spec-kit-extensions/actions/workflows/release.yml
2. The CLI package is published to PyPI
3. The GitHub release is created with the correct release notes

## Root Cause

The root cause was that the version bump process (in `bump-version.sh` or manual process) didn't follow the correct order:

**Wrong order (what happened):**
1. Update pyproject.toml and specify_extend.py
2. Commit version changes
3. Create and push tag ← Tag created before CHANGELOG update
4. Update CHANGELOG.md
5. Commit CHANGELOG

**Correct order (as documented in `.github/agents/bump-version.agent.md`):**
1. Update CHANGELOG.md first
2. Update pyproject.toml and specify_extend.py
3. Commit ALL changes together (CHANGELOG + version files)
4. Create and push tag ← Tag created after CHANGELOG is committed

## Prevention

To prevent this issue in the future, the bump-version agent has been updated to ensure the CHANGELOG is committed BEFORE creating tags. See commit `3eea581` for the updated agent instructions.
