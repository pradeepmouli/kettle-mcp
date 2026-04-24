#!/usr/bin/env bash

set -euo pipefail

# Source common functions from spec-kit
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if we're in spec-kit repo (scripts/bash/common.sh) or extensions (need to go up to spec-kit)
if [ -f "$SCRIPT_DIR/common.sh" ]; then
    # Running from same directory (most common case)
    source "$SCRIPT_DIR/common.sh"
elif [ -f "$SCRIPT_DIR/../bash/common.sh" ]; then
    # Running from spec-kit integrated location: .specify/scripts/bash/
    source "$SCRIPT_DIR/../bash/common.sh"
elif [ -f "$SCRIPT_DIR/../../scripts/bash/common.sh" ]; then
    # Running from spec-kit repo root scripts
    source "$SCRIPT_DIR/../../scripts/bash/common.sh"
else
    # Fallback: try to find common.sh in parent directories
    COMMON_SH_FOUND=false
    SEARCH_DIR="$SCRIPT_DIR"
    for i in {1..5}; do
        if [ -f "$SEARCH_DIR/common.sh" ]; then
            source "$SEARCH_DIR/common.sh"
            COMMON_SH_FOUND=true
            break
        elif [ -f "$SEARCH_DIR/scripts/bash/common.sh" ]; then
            source "$SEARCH_DIR/scripts/bash/common.sh"
            COMMON_SH_FOUND=true
            break
        fi
        SEARCH_DIR="$(dirname "$SEARCH_DIR")"
    done

    if [ "$COMMON_SH_FOUND" = false ]; then
        echo "Error: Could not find common.sh. Please ensure spec-kit is properly installed." >&2
        exit 1
    fi
fi

# Source extension utilities (provides generate_branch_name, get_global_* functions)
if [ -f "$SCRIPT_DIR/bash/extension-utils.sh" ]; then
    source "$SCRIPT_DIR/bash/extension-utils.sh"
elif [ -f "$SCRIPT_DIR/extension-utils.sh" ]; then
    source "$SCRIPT_DIR/extension-utils.sh"
fi

# Verify generate_branch_name function is available
if ! declare -f generate_branch_name > /dev/null; then
    echo "Error: generate_branch_name function is not available in common.sh." >&2
    echo "Please ensure you have the latest version of spec-kit-extensions installed." >&2
    exit 1
fi

JSON_MODE=false
LIST_FEATURES=false
FEATURE_NUM=""
MOD_DESCRIPTION=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --json)
            JSON_MODE=true
            shift
            ;;
        --list-features)
            LIST_FEATURES=true
            JSON_MODE=true  # Always return JSON for list mode
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--json] [--list-features] [<feature-number>] <modification-description>"
            echo "Example: $0 014 \"Add phone number field to profile\""
            echo "         $0 --list-features \"Add phone number field\""
            exit 0
            ;;
        *)
            if [ -z "$FEATURE_NUM" ]; then
                FEATURE_NUM="$1"
            else
                MOD_DESCRIPTION="$MOD_DESCRIPTION $1"
            fi
            shift
            ;;
    esac
done

MOD_DESCRIPTION="${MOD_DESCRIPTION## }"  # Trim leading space

# Use spec-kit common functions
REPO_ROOT=$(get_repo_root)
HAS_GIT=$(has_git && echo "true" || echo "false")

cd "$REPO_ROOT"

SPECS_DIR="$REPO_ROOT/specs"

# List features mode
if $LIST_FEATURES; then
    if [ -z "$MOD_DESCRIPTION" ]; then
        echo '{"error":"Description required for --list-features mode"}' >&2
        exit 1
    fi

    # Find all feature directories
    FEATURES=()
    while IFS= read -r dir; do
        [ -d "$dir" ] || continue
        basename=$(basename "$dir")
        # Only include numbered features (skip bugfix-, refactor-, etc.)
        if [[ $basename =~ ^[0-9]{3}- ]]; then
            FEATURES+=("$basename")
        fi
    done < <(find "$SPECS_DIR" -maxdepth 1 -type d -name '[0-9][0-9][0-9]-*' | sort)

    # Build JSON array
    JSON_FEATURES="["
    FIRST=true
    for feature in "${FEATURES[@]}"; do
        if [ "$FIRST" = true ]; then
            FIRST=false
        else
            JSON_FEATURES="$JSON_FEATURES,"
        fi
        FEATURE_NUM_ONLY=$(echo "$feature" | grep -o '^[0-9]\+')
        FEATURE_NAME_ONLY=$(echo "$feature" | sed "s/^${FEATURE_NUM_ONLY}-//")
        JSON_FEATURES="$JSON_FEATURES{\"number\":\"$FEATURE_NUM_ONLY\",\"name\":\"$FEATURE_NAME_ONLY\",\"full\":\"$feature\"}"
    done
    JSON_FEATURES="$JSON_FEATURES]"

    printf '{"mode":"list","description":"%s","features":%s}\n' "$MOD_DESCRIPTION" "$JSON_FEATURES"
    exit 0
fi

# Normal mode - require feature number
if [ -z "$FEATURE_NUM" ] || [ -z "$MOD_DESCRIPTION" ]; then
    echo "Usage: $0 [--json] <feature-number> <modification-description>" >&2
    echo "   or: $0 --list-features <modification-description>" >&2
    exit 1
fi

# Find original feature directory
FEATURE_DIR=$(find "$SPECS_DIR" -maxdepth 1 -type d -name "${FEATURE_NUM}-*" | head -1)

if [ -z "$FEATURE_DIR" ]; then
    echo "Error: Could not find feature ${FEATURE_NUM} in specs/" >&2
    exit 1
fi

FEATURE_NAME=$(basename "$FEATURE_DIR")

# Find highest modification number for this feature
MODIFICATIONS_DIR="$FEATURE_DIR/modifications"
mkdir -p "$MODIFICATIONS_DIR"

HIGHEST_MOD=0
if [ -d "$MODIFICATIONS_DIR" ]; then
    for dir in "$MODIFICATIONS_DIR"/*; do
        [ -d "$dir" ] || continue
        dirname=$(basename "$dir")
        number=$(echo "$dirname" | grep -o '^[0-9]\+' || echo "0")
        number=$((10#$number))
        if [ "$number" -gt "$HIGHEST_MOD" ]; then HIGHEST_MOD=$number; fi
    done
fi

NEXT_MOD=$((HIGHEST_MOD + 1))
MOD_NUM=$(printf "%03d" "$NEXT_MOD")

# Create branch name from description using smart filtering
WORDS=$(generate_branch_name "$MOD_DESCRIPTION")
BRANCH_NAME="${FEATURE_NUM}-mod-${MOD_NUM}-${WORDS}"
MOD_ID="${FEATURE_NUM}-mod-${MOD_NUM}"

# Create git branch
if [ "$HAS_GIT" = true ]; then
    git checkout -b "$BRANCH_NAME"
else
    >&2 echo "[modify] Warning: Git repository not detected; skipped branch creation for $BRANCH_NAME"
fi

# Create modification directory
MOD_DIR="$MODIFICATIONS_DIR/${MOD_NUM}-${WORDS}"
mkdir -p "$MOD_DIR"
mkdir -p "$MOD_DIR/contracts"

# Copy template
MODIFY_TEMPLATE=$(resolve_workflow_template "modify/modification-template.md" "$REPO_ROOT")
MOD_SPEC_FILE="$MOD_DIR/modification-spec.md"

if [ -f "$MODIFY_TEMPLATE" ]; then
    cp "$MODIFY_TEMPLATE" "$MOD_SPEC_FILE"
else
    echo "# Modification Spec" > "$MOD_SPEC_FILE"
fi

# Create symlink from spec.md to modification-spec.md
ln -sf "modification-spec.md" "$MOD_DIR/spec.md"

# Run impact analysis
IMPACT_SCANNER="$REPO_ROOT/.specify/extensions/workflows/templates/modify/scan-impact.sh"
IMPACT_FILE="$MOD_DIR/impact-analysis.md"

if [ -x "$IMPACT_SCANNER" ]; then
    echo "# Impact Analysis for ${FEATURE_NAME}" > "$IMPACT_FILE"
    echo "" >> "$IMPACT_FILE"
    echo "**Generated**: $(date)" >> "$IMPACT_FILE"
    echo "**Modification**: ${MOD_DESCRIPTION}" >> "$IMPACT_FILE"
    echo "" >> "$IMPACT_FILE"
    "$IMPACT_SCANNER" "$FEATURE_NUM" >> "$IMPACT_FILE" 2>&1 || true
else
    echo "# Impact Analysis" > "$IMPACT_FILE"
    echo "Impact scanner not found - manual analysis required" >> "$IMPACT_FILE"
fi

# Set environment variable
export SPECIFY_MODIFICATION="$MOD_ID"

if $JSON_MODE; then
    printf '{"MOD_ID":"%s","BRANCH_NAME":"%s","MOD_SPEC_FILE":"%s","IMPACT_FILE":"%s","FEATURE_NAME":"%s","MOD_NUM":"%s"}\n' \
        "$MOD_ID" "$BRANCH_NAME" "$MOD_SPEC_FILE" "$IMPACT_FILE" "$FEATURE_NAME" "$MOD_NUM"
else
    echo "MOD_ID: $MOD_ID"
    echo "BRANCH_NAME: $BRANCH_NAME"
    echo "FEATURE_NAME: $FEATURE_NAME"
    echo "MOD_SPEC_FILE: $MOD_SPEC_FILE"
    echo "IMPACT_FILE: $IMPACT_FILE"
    echo "MOD_NUM: $MOD_NUM"
    echo "SPECIFY_MODIFICATION environment variable set to: $MOD_ID"
fi
