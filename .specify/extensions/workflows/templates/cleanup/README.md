# Cleanup Workflow

## Overview

The cleanup workflow validates the structure and organization of spec-kit artifacts, ensuring sequential numbering, proper directory structure, and presence of required files. It can detect and automatically fix common organizational issues **without touching any code files**.

## When to Use

Use `/speckit.cleanup` when:

- Spec directories are out of sequential order
- There are gaps in numbering (001, 002, 005 → missing 003, 004)
- Directories are in the wrong location (e.g., numbered dirs directly under `specs/` instead of under workflow types)
- You want to validate spec structure before a release
- After merging multiple branches with spec changes
- Periodically as maintenance to keep specs organized

**Do NOT use `/speckit.cleanup` for**:
- Fixing code issues → use appropriate workflow instead
- Changing spec content → edit files directly
- Deleting old specs → archive them manually first

## Process

### 1. Validation Phase
The cleanup script checks:
- **Sequential numbering**: Each workflow type should have 001, 002, 003, etc.
- **Directory structure**: Specs should be organized under workflow types (bugfix/, modify/, refactor/, hotfix/, deprecate/, features/)
- **Misplaced workflow directories**: Detects workflow-prefixed directories at wrong level (e.g., `bugfix-001-*` or `refactor-002-*` at root instead of in workflow subdirectories)
- **Unrecognized directories**: Flags unknown directories that don't match expected patterns
- **Required files**: Each spec directory should have its main spec file
- **No duplicates**: No two directories with the same number *within each workflow subdirectory* (bugfix/001 and refactor/001 are both valid)
- **No gaps**: Numbering should be continuous within each workflow type

### 2. Issue Detection
Reports issues in three severity levels:
- **ERROR**: Critical issues that prevent proper workflow operation (e.g., misplaced workflow directories, duplicates)
- **WARNING**: Issues that should be addressed but don't break functionality (e.g., unrecognized directories, missing spec files)
- **INFO**: Informational notices about non-critical inconsistencies (e.g., gaps in numbering)

#### Issue types detected
- **Misplaced workflow directories (ERROR, auto-fixable)**: Workflow-prefixed folders at the wrong level (e.g., `bugfix-001-*` under `specs/` instead of `specs/bugfix/001-*`).
- **Duplicate numbers within a workflow (ERROR)**: Same numeric prefix reused inside a workflow directory.
- **Invalid directory names (ERROR)**: Entries inside workflow folders that do not start with a 3-digit prefix.
- **Unrecognized directories (WARNING)**: Items in `specs/` that are neither numbered specs nor known workflow folders (e.g., `specs/copilot/`).
- **Non-sequential numbering / gaps (INFO, auto-fixable)**: Numbering within a workflow skips values (001, 002, 005...).
- **Missing spec file (WARNING)**: Required spec file for the workflow type is absent (e.g., `bug-report.md`, `refactor-spec.md`, `spec.md`).

### 3. Auto-Fix (Optional)
With `--auto-fix` flag, the script can:
- Move misplaced workflow directories to their correct locations
- Renumber directories to be sequential
- Fix gaps in numbering
- Create workflow subdirectories if needed
- Maintain original directory suffixes

**Important**: Auto-fix only affects directory names and organization in `specs/`. Code files are never moved or modified.

### 4. Output
Provides validation results with:
- All issues found (with severity levels)
- Actions taken or suggested
- Summary of validation checks performed
- JSON output mode available for programmatic use

## Quality Gates

- ✅ Only documentation in `specs/` directory is affected
- ✅ Code files are never moved or modified
- ✅ Original directory suffixes are preserved during renaming
- ✅ Output shows all issues and actions clearly
- ✅ Dry-run mode available to preview changes

## Output Only

The cleanup workflow **validates** and **reorganizes** but does not create any files or directories. It only:
- Outputs validation results to stdout (or JSON)
- Renames/renumbers existing directories when using `--auto-fix`

## Command Usage

### Basic validation (dry-run):
```bash
/speckit.cleanup --dry-run "regular maintenance"
```

### Validation and auto-fix:
```bash
/speckit.cleanup --auto-fix "fix numbering after merge"
```

### Just validate and report:
```bash
/speckit.cleanup "pre-release validation"
```

## Script Options

```bash
.specify/scripts/bash/create-cleanup.sh [--json] [--dry-run] [--auto-fix] [reason]
```

Options:
- `--json`: Output results in JSON format
- `--dry-run`: Show what would be done without making changes
- `--auto-fix`: Automatically fix numbering and organization issues
- `reason`: Optional reason for cleanup (for documentation)

## Examples

### Example 1: Pre-Release Validation

```bash
/speckit.cleanup "validate specs before v2.0 release"
```

Result:
- Scans all spec directories
- Reports any organizational issues
- Outputs validation results
- Suggests fixes if issues found

### Example 2: Fix After Merge

After merging branches that both added bugfix specs:

```bash
/speckit.cleanup --auto-fix "fix duplicates after feature merge"
```

Before:
```
specs/bugfix/
├── 001-login-bug/
├── 002-api-error/
├── 003-cache-issue/
├── 003-form-validation/  # Duplicate!
└── 005-timeout-error/     # Gap!
```

After:
```
specs/bugfix/
├── 001-login-bug/
├── 002-api-error/
├── 003-cache-issue/
├── 004-form-validation/   # Renumbered
└── 005-timeout-error/     # Now sequential
```

### Example 3: Dry-Run First

```bash
# See what would change
/speckit.cleanup --dry-run --auto-fix "monthly maintenance"

# Review the suggested changes, then apply
/speckit.cleanup --auto-fix "monthly maintenance"
```

### Example 4: Fix Misplaced Workflow Directories

When workflow directories are created at the wrong level:

```bash
/speckit.cleanup --auto-fix "reorganize misplaced directories"
```

Before:
```
specs/
├── bugfix-001-after-applying-bugfix/    # Wrong location!
├── refactor-001-migrate-project-to/     # Wrong location!
├── copilot/                             # Unrecognized workflow
├── bugfix/
│   └── 001-use-slowcommissioning/
└── refactor/
  └── 002-implement-more/
```

After:
```
specs/
├── copilot/                             # Remains (flagged as warning)
├── bugfix/
│   ├── 001-use-slowcommissioning/
│   └── 002-after-applying-bugfix/       # Moved and renumbered
└── refactor/
  ├── 001-migrate-project-to/          # Moved and renumbered
  └── 002-implement-more/
```

Issues detected:
- `[ERROR] Misplaced workflow directory: bugfix-001-after-applying-bugfix should be in bugfix/001-after-applying-bugfix/`
- `[ERROR] Misplaced workflow directory: refactor-001-migrate-project-to should be in refactor/001-migrate-project-to/`
- `[WARNING] Unrecognized directory in specs/: copilot (not a numbered spec or known workflow type)`

## Cleanup Output Example

```
═══════════════════════════════════════════════════════════════
  Spec-Kit Cleanup Report
═══════════════════════════════════════════════════════════════

Issues found: 3

  [ERROR] Duplicate number in bugfix/: 003
  [INFO] Non-sequential numbering in bugfix/ (gaps detected)
  [WARNING] Missing spec file in 004-form-validation

Actions suggested:

  Cannot auto-fix bugfix/: resolve ERROR-level issues first (e.g., duplicates)
  Review and verify 004-form-validation has required files

💡 Run with --auto-fix to automatically fix numbering issues.
```

**JSON output example:**
```json
{
  "status": "issues_found",
  "message": "Found 3 issue(s)",
  "issues": [
    "[ERROR] Duplicate number in bugfix/: 003",
    "[INFO] Non-sequential numbering in bugfix/ (gaps detected)",
    "[WARNING] Missing spec file in 004-form-validation"
  ],
  "actions": [
    "Cannot auto-fix bugfix/: resolve ERROR-level issues first (e.g., duplicates)",
    "Review and verify 004-form-validation has required files"
  ]
}
```

## Workflow Types Validated

The cleanup script validates these workflow subdirectories:

- `specs/bugfix/` - Bug fix workflows
- `specs/modify/` - Feature modification workflows
- `specs/refactor/` - Code refactoring workflows
- `specs/hotfix/` - Emergency hotfix workflows
- `specs/deprecate/` - Feature deprecation workflows

## Tips

### When to Run Cleanup

**Regularly:**
- Before releases
- After merging multiple branches
- Monthly as part of maintenance

**As Needed:**
- When numbering gets confusing
- After reorganizing specs
- When onboarding new team members (clean slate)

### Best Practices

1. **Always dry-run first**: Use `--dry-run` to preview changes
2. **Document reason**: Provide meaningful reason for cleanup runs
3. **Review output**: Check validation output to understand what changed
4. **Backup first**: Cleanup is safe, but backups never hurt
5. **Commit separately**: Commit cleanup changes separately from feature work

### Common Scenarios

**After Git Merge Conflicts:**
```bash
# Two branches both created bugfix-003
# After resolving conflict, cleanup to renumber
/speckit.cleanup --auto-fix "resolve numbering after merge conflict"
```

**Periodic Maintenance:**
```bash
# Monthly cleanup to keep specs organized
/speckit.cleanup --dry-run "monthly maintenance check"
# Review output, then apply if needed
/speckit.cleanup --auto-fix "monthly maintenance"
```

**Pre-Release Validation:**
```bash
# Ensure all specs are properly organized before release
/speckit.cleanup "validate specs for v3.0 release"
```

## Integration with Constitution

This workflow upholds:

- **Section VI: Workflow Selection** - Proper organization of workflow artifacts
- **Quality Gates** - Validation of spec structure and completeness
- **Documentation Standards** - Ensuring specs are properly numbered and located

## Safety Guarantees

### What Cleanup WILL Do:
- ✅ Rename directories in `specs/` to fix numbering
- ✅ Report organizational issues
- ✅ Output validation results
- ✅ Validate directory structure

### What Cleanup WILL NOT Do:
- ❌ Move or modify code files
- ❌ Change content of spec files
- ❌ Delete any files or directories
- ❌ Modify files outside `specs/` directory
- ❌ Affect git history or branches

## Related Workflows

All other workflows create and work within the structure that cleanup validates:

- **Bugfix** - Creates `specs/bugfix/NNN-*/`
- **Modify** - Creates `specs/modify/NNN-*/`
- **Refactor** - Creates `specs/refactor/NNN-*/`
- **Hotfix** - Creates `specs/hotfix/NNN-*/`
- **Deprecate** - Creates `specs/deprecate/NNN-*/`

## Troubleshooting

### "Duplicate number" Error
**Cause**: Two directories with the same number prefix
**Fix**: Run with `--auto-fix` to renumber sequentially

### "Gap detected" Info
**Cause**: Missing numbers in sequence (e.g., 001, 002, 005)
**Fix**: Either acceptable if specs deleted, or run `--auto-fix` to close gaps

### "Invalid directory name" Error
**Cause**: Directory doesn't follow `NNN-description` format
**Fix**: Manually rename to proper format, then run cleanup

### "Missing spec file" Warning
**Cause**: Directory exists but doesn't have its main spec file
**Fix**: Add the required spec file (bug-report.md, refactor-spec.md, etc.)

## Metrics

Track these for continuous improvement:

- Frequency of cleanup runs needed
- Number of issues found per cleanup
- Time since last cleanup
- Most common issue types

---

*Cleanup Workflow Documentation - Part of Specify Extension System*
