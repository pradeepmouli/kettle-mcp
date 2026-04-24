# Extension Development Guide

This guide explains how to create custom workflows for the Specify extension system.

## Overview

The extension system allows you to create specialized workflows that extend Specify beyond feature development. Each workflow consists of:

1. **Bash script** - Automates workflow initialization (branch creation, file setup)
2. **Templates** - Markdown templates for documentation (spec, tasks, etc.)
3. **Claude command** - Integration with Claude Code via slash commands
4. **Optional scripts** - Helper scripts for analysis, metrics, scanning, etc.

## Extension Structure

```
.specify/extensions/
├── README.md                    # User-facing docs
├── DEVELOPMENT.md              # This file (developer guide)
├── enabled.conf                # Which workflows are active
└── workflows/
    └── your-workflow/
        ├── template.md         # Main documentation template
        ├── tasks-template.md   # Task breakdown template
        ├── script.sh           # Optional helper scripts
        └── ...
```

```
.specify/scripts/bash/
└── create-your-workflow.sh     # Workflow initialization script
```

```
.claude/commands/
└── your-workflow.md            # Claude Code command definition
```

## Creating a New Workflow

### Step 1: Design Your Workflow

Answer these questions:

1. **What problem does it solve?** Define a specific use case not covered by existing workflows
2. **What are the phases?** Break down the workflow into logical stages
3. **What information needs tracking?** Identify what should be documented
4. **What quality gates apply?** Define checkpoints and validation criteria
5. **What makes it different?** How does it differ from `/specify`, `/bugfix`, etc.?

### Step 2: Create Directory Structure

```bash
# Create workflow directory
mkdir -p .specify/extensions/workflows/your-workflow

# Create script directory (if doesn't exist)
mkdir -p .specify/scripts/bash

# Create command directory (if doesn't exist)
mkdir -p .claude/commands
```

### Step 3: Write the Main Template

Create `.specify/extensions/workflows/your-workflow/template.md`:

```markdown
# Your Workflow: [TITLE]

**Workflow ID**: your-workflow-###
**Branch**: `your-workflow/###-description`
**Status**: [ ] Stage1 | [ ] Stage2 | [ ] Complete

## Overview
[What is being done and why]

## Phases

### Phase 1: [Name]
[Details, checklist items, documentation]

### Phase 2: [Name]
[Details, checklist items, documentation]

## Verification Checklist
- [ ] Criterion 1
- [ ] Criterion 2

---
*Created using `/your-workflow` workflow*
```

**Template Best Practices**:
- Use `###` as placeholder for workflow number (replaced by script)
- Include clear phases/sections
- Add checklists for tracking progress
- Link to related documentation
- Use markdown formatting for readability

### Step 4: Write the Tasks Template

Create `.specify/extensions/workflows/your-workflow/tasks-template.md`:

```markdown
# Tasks: Your Workflow - [DESCRIPTION]

**Workflow ID**: your-workflow-###
**Input**: Documentation from `specs/your-workflow-###-description/template.md`

## Format: `[ID] Description`

---

## Phase 1: [Name]

- [ ] **T001** First task
  - Details about the task
  - What to do
  - What to verify

- [ ] **T002** Second task
  - More details

## Phase 2: [Name]

- [ ] **T003** Third task

---

## Completion Criteria

✅ All tasks completed
✅ Quality gates passed
✅ Documentation updated
```

**Task Template Best Practices**:
- Number tasks sequentially (T001, T002, ...)
- Group tasks by phase
- Make tasks specific and actionable
- Include verification steps
- Define clear completion criteria

### Step 5: Create the Initialization Script

Create `.specify/scripts/bash/create-your-workflow.sh`:

```bash
#!/usr/bin/env bash

set -e

# Parse arguments
JSON_MODE=false
ARGS=()
for arg in "$@"; do
    case "$arg" in
        --json) JSON_MODE=true ;;
        --help|-h) echo "Usage: $0 [--json] <description>"; exit 0 ;;
        *) ARGS+=("$arg") ;;
    esac
done

DESCRIPTION="${ARGS[*]}"

if [ -z "$DESCRIPTION" ]; then
    echo "Usage: $0 [--json] <description>" >&2
    exit 1
fi

# Find repository root
find_repo_root() {
    local dir="$1"
    while [ "$dir" != "/" ]; do
        if [ -d "$dir/.git" ] || [ -d "$dir/.specify" ]; then
            echo "$dir"
            return 0
        fi
        dir="$(dirname "$dir")"
    done
    return 1
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if git rev-parse --show-toplevel >/dev/null 2>&1; then
    REPO_ROOT=$(git rev-parse --show-toplevel)
    HAS_GIT=true
else
    REPO_ROOT="$(find_repo_root "$SCRIPT_DIR")"
    if [ -z "$REPO_ROOT" ]; then
        echo "Error: Could not determine repository root" >&2
        exit 1
    fi
    HAS_GIT=false
fi

cd "$REPO_ROOT"

SPECS_DIR="$REPO_ROOT/specs"
mkdir -p "$SPECS_DIR"

# Find highest workflow number
HIGHEST=0
if [ -d "$SPECS_DIR" ]; then
    for dir in "$SPECS_DIR"/your-workflow-*; do
        [ -d "$dir" ] || continue
        dirname=$(basename "$dir")
        number=$(echo "$dirname" | sed 's/your-workflow-//' | grep -o '^[0-9]\+' || echo "0")
        number=$((10#$number))
        if [ "$number" -gt "$HIGHEST" ]; then HIGHEST=$number; fi
    done
fi

NEXT=$((HIGHEST + 1))
WORKFLOW_NUM=$(printf "%03d" "$NEXT")

# Create branch name from description
BRANCH_SUFFIX=$(echo "$DESCRIPTION" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-//' | sed 's/-$//')
WORDS=$(echo "$BRANCH_SUFFIX" | tr '-' '\n' | grep -v '^$' | head -3 | tr '\n' '-' | sed 's/-$//')
BRANCH_NAME="your-workflow/${WORKFLOW_NUM}-${WORDS}"
WORKFLOW_ID="your-workflow-${WORKFLOW_NUM}"

# Create git branch
if [ "$HAS_GIT" = true ]; then
    git checkout -b "$BRANCH_NAME"
else
    >&2 echo "[your-workflow] Warning: Git not detected; skipped branch creation"
fi

# Create workflow directory
WORKFLOW_DIR="$SPECS_DIR/${WORKFLOW_ID}-${WORDS}"
mkdir -p "$WORKFLOW_DIR"

# Copy templates
TEMPLATE="$REPO_ROOT/.specify/extensions/workflows/your-workflow/template.md"
TASKS_TEMPLATE="$REPO_ROOT/.specify/extensions/workflows/your-workflow/tasks-template.md"

TEMPLATE_FILE="$WORKFLOW_DIR/template.md"
TASKS_FILE="$WORKFLOW_DIR/tasks.md"

if [ -f "$TEMPLATE" ]; then
    cp "$TEMPLATE" "$TEMPLATE_FILE"
else
    echo "# Your Workflow" > "$TEMPLATE_FILE"
fi

if [ -f "$TASKS_TEMPLATE" ]; then
    cp "$TASKS_TEMPLATE" "$TASKS_FILE"
else
    echo "# Tasks" > "$TASKS_FILE"
fi

# Replace placeholders in templates
if [ -f "$TEMPLATE_FILE" ]; then
    sed -i.bak "s/your-workflow-###/${WORKFLOW_ID}/g" "$TEMPLATE_FILE" 2>/dev/null || \
    sed -i '' "s/your-workflow-###/${WORKFLOW_ID}/g" "$TEMPLATE_FILE" 2>/dev/null || true
    sed -i.bak "s|your-workflow/###-description|${BRANCH_NAME}|g" "$TEMPLATE_FILE" 2>/dev/null || \
    sed -i '' "s|your-workflow/###-description|${BRANCH_NAME}|g" "$TEMPLATE_FILE" 2>/dev/null || true
    rm -f "$TEMPLATE_FILE.bak"
fi

if [ -f "$TASKS_FILE" ]; then
    sed -i.bak "s/your-workflow-###/${WORKFLOW_ID}/g" "$TASKS_FILE" 2>/dev/null || \
    sed -i '' "s/your-workflow-###/${WORKFLOW_ID}/g" "$TASKS_FILE" 2>/dev/null || true
    rm -f "$TASKS_FILE.bak"
fi

# Set environment variable
export SPECIFY_WORKFLOW="$WORKFLOW_ID"

if $JSON_MODE; then
    printf '{\"WORKFLOW_ID\":\"%s\",\"BRANCH_NAME\":\"%s\",\"TEMPLATE_FILE\":\"%s\",\"TASKS_FILE\":\"%s\",\"WORKFLOW_NUM\":\"%s\"}\\n' \
        "$WORKFLOW_ID" "$BRANCH_NAME" "$TEMPLATE_FILE" "$TASKS_FILE" "$WORKFLOW_NUM"
else
    echo "WORKFLOW_ID: $WORKFLOW_ID"
    echo "BRANCH_NAME: $BRANCH_NAME"
    echo "TEMPLATE_FILE: $TEMPLATE_FILE"
    echo "TASKS_FILE: $TASKS_FILE"
    echo "WORKFLOW_NUM: $WORKFLOW_NUM"
    echo ""
    echo "✅ Your workflow initialized"
fi
```

Make the script executable:

```bash
chmod +x .specify/scripts/bash/create-your-workflow.sh
```

**Script Best Practices**:
- Support `--json` flag for AI agent consumption
- Find repository root dynamically (git or .specify)
- Generate sequential workflow numbers
- Create branch names from description (sanitized)
- Replace template placeholders
- Return all paths as absolute
- Set environment variable for tracking

### Step 6: Create the Claude Command

Create `.claude/commands/your-workflow.md`:

```markdown
---
description: Brief description of what this workflow does
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

The text the user typed after `/your-workflow` in the triggering message **is** the description. Assume you always have it available even if `$ARGUMENTS` appears literally below.

**[EMOJI] YOUR WORKFLOW - [TAGLINE]**

Given that description, do this:

1. Run the script `.specify/scripts/bash/create-your-workflow.sh --json "$ARGUMENTS"` from repo root and parse its JSON output for WORKFLOW_ID, BRANCH_NAME, TEMPLATE_FILE, TASKS_FILE, and WORKFLOW_NUM. All file paths must be absolute.
   **IMPORTANT** You must only ever run this script once. The JSON is provided in the terminal as output - always refer to it to get the actual content you're looking for.

2. Load `.specify/extensions/workflows/your-workflow/template.md` to understand required sections.

3. Write the workflow documentation to TEMPLATE_FILE using the template structure:
   - [Specific instructions for what to document]
   - [Phase-specific guidance]
   - [Quality gates to verify]

4. Review the tasks.md file and ensure it aligns with the documentation.

5. Report completion with:
   - **STATUS**: Workflow initialized
   - Workflow ID
   - Branch name
   - Template file path
   - Tasks file path
   - **NEXT STEPS**: [What to do next]
   - **REMINDER**: [Important notes]

Note: [Any special considerations for this workflow]
```

**Command Best Practices**:
- Clear description in frontmatter
- Parse $ARGUMENTS correctly
- Only run initialization script once
- Parse JSON output for file paths
- Load templates to understand structure
- Provide specific instructions for documentation
- Report completion with all relevant info
- Include reminders about workflow-specific rules

### Step 7: Enable Your Workflow

Add your workflow to `.specify/extensions/enabled.conf`:

```
# Enabled workflows
bugfix
modify
refactor
hotfix
deprecate
your-workflow
```

### Step 8: Document Your Workflow

Update `.specify/extensions/README.md` to include your workflow in the "Available Workflows" section:

```markdown
### `/your-workflow` - [Brief description]

**When to use**: [Specific scenarios]

**Process**:
1. [Phase 1 summary]
2. [Phase 2 summary]

**Key artifacts**: `template.md`, `tasks.md`

**Example**: `/your-workflow "description of work"`
```

### Step 9: Test Your Workflow

1. **Test script execution**:
```bash
cd /path/to/repo
.specify/scripts/bash/create-your-workflow.sh --json "test description"
```

Verify:
- JSON output is valid
- Branch created correctly
- Files created in right location
- Placeholders replaced

2. **Test Claude command**:
```
/your-workflow "test description"
```

Verify:
- Script runs once
- JSON parsed correctly
- Documentation populated
- Tasks created
- Status reported

3. **Test workflow end-to-end**:
- Complete all tasks
- Verify quality gates
- Ensure documentation is useful

## Helper Scripts

Some workflows benefit from additional automation scripts:

### Analysis Scripts

Example: Dependency scanner for deprecation workflow

```bash
#!/usr/bin/env bash
# .specify/extensions/workflows/your-workflow/analyze.sh

FEATURE_NUM="$1"
OUTPUT_FILE="$2"

# ... analysis logic ...

echo "# Analysis Results" > "$OUTPUT_FILE"
# Write findings to output file
```

### Metrics Scripts

Example: Metrics collector for refactor workflow

```bash
#!/usr/bin/env bash
# .specify/extensions/workflows/your-workflow/measure.sh

MODE="$1"  # "before" or "after"
OUTPUT_FILE="$2"

# Collect metrics (LOC, complexity, coverage, etc.)
echo "# Metrics ($MODE)" > "$OUTPUT_FILE"
# Write metrics to output file
```

### Validation Scripts

Example: Compliance checker

```bash
#!/usr/bin/env bash
# .specify/extensions/workflows/your-workflow/validate.sh

WORKFLOW_DIR="$1"

# Check if all required fields are filled
# Verify quality gates met
# Return 0 for pass, 1 for fail
```

## Advanced Topics

### Multi-File Templates

Some workflows need multiple documentation files:

```
.specify/extensions/workflows/your-workflow/
├── main-template.md
├── secondary-template.md
└── tasks-template.md
```

Update your initialization script to copy all templates.

### Workflow Variants

Create variants of workflows for different scenarios:

```
/your-workflow "description"           # Default variant
/your-workflow:variant "description"   # Specific variant
```

Parse the variant in your command file and load different templates.

### Integration with Constitution

Update `.specify/memory/constitution.md` to include your workflow:

1. Add to **Section VI: Workflow Selection**
2. Add quality gates to **Quality Gates by Workflow**
3. Document in **Extension Workflows** section

### Workflow Dependencies

If your workflow depends on another workflow's output:

```bash
# In create-your-workflow.sh

# Check for prerequisite
PREREQUISITE_DIR=$(find "$SPECS_DIR" -name "prerequisite-*" | head -1)
if [ -z "$PREREQUISITE_DIR" ]; then
    echo "Error: Must run /prerequisite first" >&2
    exit 1
fi
```

## Best Practices

### Naming Conventions

- **Workflow names**: lowercase, hyphenated (e.g., `your-workflow`)
- **Branch prefix**: matches workflow name (e.g., `your-workflow/001-description`)
- **File naming**: descriptive, not generic (e.g., `bug-report.md` not `report.md`)
- **Task IDs**: Sequential with prefix (e.g., `T001`, `T002`)

### Documentation Standards

- **Templates**: Comprehensive but not overwhelming
- **Checklists**: Specific and actionable
- **Placeholders**: Use `###` for numbers, `[UPPERCASE]` for text
- **Instructions**: Clear, imperative voice
- **Examples**: Include where helpful

### Code Quality

- **Error handling**: Check all prerequisites, fail fast
- **Portability**: Support both Linux and macOS
- **JSON output**: Valid, parseable by AI agents
- **Idempotency**: Safe to re-run (check before creating)

### User Experience

- **Clear purpose**: Workflow solves a specific problem
- **Minimal friction**: Few steps to get started
- **Good defaults**: Sensible placeholders
- **Helpful output**: Tell user what happened and what's next

## Troubleshooting

### Script fails with "repository root not found"

Ensure you're running from within the repo or have `.specify/` directory present.

### Placeholders not replaced

Check sed compatibility. The script includes both GNU and BSD sed syntax:

```bash
sed -i.bak "s/###/${NUM}/g" file 2>/dev/null || \
sed -i '' "s/###/${NUM}/g" file 2>/dev/null || true
```

### Claude command doesn't appear

Ensure:
1. File is in `.claude/commands/`
2. File has `.md` extension
3. Frontmatter has `description` field
4. Claude Code reloaded (restart if needed)

### Workflow enabled but not working

Check `.specify/extensions/enabled.conf`:
- Workflow name matches directory name
- No typos
- Not commented out with `#`

## Contributing Workflows

If you create a workflow that might benefit others:

1. Test thoroughly with real use cases
2. Document clearly (templates, command, README)
3. Follow all best practices in this guide
4. Submit PR to github/spec-kit
5. Include examples and rationale

## Examples

See the built-in workflows for reference:

- **Simple workflow**: `bugfix` (basic structure, regression tests)
- **Analysis workflow**: `modify` (impact analysis script)
- **Metrics workflow**: `refactor` (baseline/target metrics)
- **Complex workflow**: `hotfix` (multiple templates, post-mortem)
- **Multi-phase workflow**: `deprecate` (3 phases, dependency scanning)

## Resources

- [Specify Documentation](https://github.com/github/spec-kit)
- [Extension README](.specify/extensions/README.md)
- [Project Constitution](.specify/memory/constitution.md)
- [Claude Code Docs](https://docs.claude.com/claude-code)

---

*Extension Development Guide - Version 1.0.0*
