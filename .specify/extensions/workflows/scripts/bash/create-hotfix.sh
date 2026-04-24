#!/usr/bin/env bash

set -euo pipefail

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Try to find and source common.sh
COMMON_SH_FOUND=false
# First try same directory (when installed to .specify/scripts/bash/)
if [ -f "$SCRIPT_DIR/common.sh" ]; then
    source "$SCRIPT_DIR/common.sh"
    COMMON_SH_FOUND=true
# Then try parent directory
elif [ -f "$SCRIPT_DIR/../common.sh" ]; then
    source "$SCRIPT_DIR/../common.sh"
    COMMON_SH_FOUND=true
# Then try spec-kit nested location
elif [ -f "$SCRIPT_DIR/../bash/common.sh" ]; then
    source "$SCRIPT_DIR/../bash/common.sh"
    COMMON_SH_FOUND=true
# Then try spec-kit repo root scripts
elif [ -f "$SCRIPT_DIR/../../scripts/bash/common.sh" ]; then
    source "$SCRIPT_DIR/../../scripts/bash/common.sh"
    COMMON_SH_FOUND=true
fi

# Source extension utilities (provides generate_branch_name, get_global_* functions)
if [ -f "$SCRIPT_DIR/bash/extension-utils.sh" ]; then
    source "$SCRIPT_DIR/bash/extension-utils.sh"
elif [ -f "$SCRIPT_DIR/extension-utils.sh" ]; then
    source "$SCRIPT_DIR/extension-utils.sh"
fi

# Ensure generate_branch_name is available
if ! declare -f generate_branch_name > /dev/null; then
    echo "Error: generate_branch_name is not available." >&2
    echo "Please ensure spec-kit-extensions is properly installed." >&2
    exit 1
fi

JSON_MODE=false
ARGS=()
for arg in "$@"; do
    case "$arg" in
        --json) JSON_MODE=true ;;
        --help|-h) echo "Usage: $0 [--json] <incident_description>"; exit 0 ;;
        *) ARGS+=("$arg") ;;
    esac
done

INCIDENT_DESCRIPTION="${ARGS[*]}"
if [ -z "$INCIDENT_DESCRIPTION" ]; then
    echo "Usage: $0 [--json] <incident_description>" >&2
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

# Find next number using global numbering (spec-kit v0.2.0+)
NEXT=$(get_global_next_number "$SPECS_DIR")
HOTFIX_NUM=$(printf "%03d" "$NEXT")

# Create branch name from description using smart filtering
WORDS=$(generate_branch_name "$INCIDENT_DESCRIPTION")
BRANCH_NAME="hotfix/${HOTFIX_NUM}-${WORDS}"
HOTFIX_ID="hotfix-${HOTFIX_NUM}"

# Create git branch
if [ "$HAS_GIT" = true ]; then
    git checkout -b "$BRANCH_NAME"
else
    >&2 echo "[hotfix] Warning: Git repository not detected; skipped branch creation for $BRANCH_NAME"
fi

# Create hotfix directory under hotfix/ subdirectory
HOTFIX_SUBDIR="$SPECS_DIR/hotfix"
mkdir -p "$HOTFIX_SUBDIR"
HOTFIX_DIR="$HOTFIX_SUBDIR/${HOTFIX_NUM}-${WORDS}"
mkdir -p "$HOTFIX_DIR"

# Copy templates
HOTFIX_TEMPLATE=$(resolve_workflow_template "hotfix/hotfix-template.md" "$REPO_ROOT")
POSTMORTEM_TEMPLATE=$(resolve_workflow_template "hotfix/post-mortem-template.md" "$REPO_ROOT")

HOTFIX_FILE="$HOTFIX_DIR/hotfix.md"
POSTMORTEM_FILE="$HOTFIX_DIR/post-mortem.md"

if [ -f "$HOTFIX_TEMPLATE" ]; then
    cp "$HOTFIX_TEMPLATE" "$HOTFIX_FILE"
else
    echo "# Hotfix" > "$HOTFIX_FILE"
fi

if [ -f "$POSTMORTEM_TEMPLATE" ]; then
    cp "$POSTMORTEM_TEMPLATE" "$POSTMORTEM_FILE"
else
    echo "# Post-Mortem" > "$POSTMORTEM_FILE"
fi

# Create symlink from spec.md to hotfix.md
ln -sf "hotfix.md" "$HOTFIX_DIR/spec.md"

# Create plan.md and tasks.md as standard symlinks
ln -sf "hotfix.md" "$HOTFIX_DIR/plan.md"
ln -sf "hotfix.md" "$HOTFIX_DIR/tasks.md"

# Add incident start timestamp to hotfix file
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
if grep -q "\[YYYY-MM-DD HH:MM:SS UTC\]" "$HOTFIX_FILE" 2>/dev/null; then
    # Replace first occurrence of placeholder with actual timestamp
    sed -i.bak "0,/\[YYYY-MM-DD HH:MM:SS UTC\]/s/\[YYYY-MM-DD HH:MM:SS UTC\]/$TIMESTAMP/" "$HOTFIX_FILE" 2>/dev/null || \
    sed -i '' "0,/\[YYYY-MM-DD HH:MM:SS UTC\]/s/\[YYYY-MM-DD HH:MM:SS UTC\]/$TIMESTAMP/" "$HOTFIX_FILE" 2>/dev/null || \
    true
fi

# Create reminder file for post-mortem
REMINDER_FILE="$HOTFIX_DIR/POST_MORTEM_REMINDER.txt"
cat > "$REMINDER_FILE" << EOF
POST-MORTEM REMINDER
====================

Hotfix ID: $HOTFIX_ID
Incident Start: $TIMESTAMP

⚠️  POST-MORTEM DUE WITHIN 48 HOURS ⚠️

Required Actions:
1. Complete post-mortem.md within 48 hours of incident resolution
2. Schedule post-mortem meeting with stakeholders
3. Create action items to prevent recurrence
4. Update monitoring and tests

Post-Mortem File: $POSTMORTEM_FILE

Do not delete this reminder until post-mortem is complete.
EOF

# Set environment variable
export SPECIFY_HOTFIX="$HOTFIX_ID"

if $JSON_MODE; then
    printf '{"HOTFIX_ID":"%s","BRANCH_NAME":"%s","HOTFIX_FILE":"%s","POSTMORTEM_FILE":"%s","HOTFIX_NUM":"%s","TIMESTAMP":"%s"}\n' \
        "$HOTFIX_ID" "$BRANCH_NAME" "$HOTFIX_FILE" "$POSTMORTEM_FILE" "$HOTFIX_NUM" "$TIMESTAMP"
else
    echo "HOTFIX_ID: $HOTFIX_ID"
    echo "BRANCH_NAME: $BRANCH_NAME"
    echo "HOTFIX_FILE: $HOTFIX_FILE"
    echo "POSTMORTEM_FILE: $POSTMORTEM_FILE"
    echo "HOTFIX_NUM: $HOTFIX_NUM"
    echo "INCIDENT_START: $TIMESTAMP"
    echo ""
    echo "⚠️  EMERGENCY HOTFIX - EXPEDITED PROCESS ⚠️"
    echo "Remember: Post-mortem due within 48 hours"
    echo "SPECIFY_HOTFIX environment variable set to: $HOTFIX_ID"
fi
