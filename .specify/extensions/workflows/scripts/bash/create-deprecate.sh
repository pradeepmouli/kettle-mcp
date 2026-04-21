#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source extension utilities (provides generate_branch_name, get_global_* functions)
if [ -f "$SCRIPT_DIR/bash/extension-utils.sh" ]; then
    source "$SCRIPT_DIR/bash/extension-utils.sh"
elif [ -f "$SCRIPT_DIR/extension-utils.sh" ]; then
    source "$SCRIPT_DIR/extension-utils.sh"
fi

JSON_MODE=false
LIST_FEATURES=false
ARGS=()
for arg in "$@"; do
    case "$arg" in
        --json) JSON_MODE=true ;;
        --list-features) LIST_FEATURES=true; JSON_MODE=true ;;
        --help|-h)
            echo "Usage: $0 [--json] [--list-features] [<feature_number>] <reason>"
            echo "Example: $0 014 \"low usage and high maintenance burden\""
            echo "         $0 --list-features \"low usage\""
            exit 0
            ;;
        *) ARGS+=("$arg") ;;
    esac
done

FEATURE_NUM="${ARGS[0]}"
REASON="${ARGS[*]:1}"

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

# List features mode
if $LIST_FEATURES; then
    if [ -z "$REASON" ]; then
        echo '{"error":"Reason required for --list-features mode"}' >&2
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

    printf '{"mode":"list","reason":"%s","features":%s}\n' "$REASON" "$JSON_FEATURES"
    exit 0
fi

# Normal mode - require feature number
if [ -z "$FEATURE_NUM" ] || [ -z "$REASON" ]; then
    echo "Usage: $0 [--json] <feature_number> <reason>" >&2
    echo "   or: $0 --list-features <reason>" >&2
    echo "Example: $0 014 \"low usage and high maintenance burden\"" >&2
    exit 1
fi

# Find the original feature directory
FEATURE_DIR=$(find "$SPECS_DIR" -maxdepth 1 -type d -name "${FEATURE_NUM}-*" | head -1)

if [ -z "$FEATURE_DIR" ] || [ ! -d "$FEATURE_DIR" ]; then
    echo "Error: Feature directory not found for feature number ${FEATURE_NUM}" >&2
    echo "Looked in: $SPECS_DIR/${FEATURE_NUM}-*" >&2
    exit 1
fi

FEATURE_NAME=$(basename "$FEATURE_DIR")

# Find next number using global numbering (spec-kit v0.2.0+)
NEXT=$(get_global_next_number "$SPECS_DIR")
DEPRECATE_NUM=$(printf "%03d" "$NEXT")

# Create branch name from feature name
FEATURE_SHORT=$(echo "$FEATURE_NAME" | sed "s/^${FEATURE_NUM}-//")
BRANCH_NAME="deprecate/${DEPRECATE_NUM}-${FEATURE_SHORT}"
DEPRECATE_ID="deprecate-${DEPRECATE_NUM}"

# Create git branch
if [ "$HAS_GIT" = true ]; then
    git checkout -b "$BRANCH_NAME"
else
    >&2 echo "[deprecate] Warning: Git repository not detected; skipped branch creation for $BRANCH_NAME"
fi

# Create deprecation directory under deprecate/ subdirectory
DEPRECATE_SUBDIR="$SPECS_DIR/deprecate"
mkdir -p "$DEPRECATE_SUBDIR"
DEPRECATE_DIR="$DEPRECATE_SUBDIR/${DEPRECATE_NUM}-${FEATURE_SHORT}"
mkdir -p "$DEPRECATE_DIR"

# Copy template
DEPRECATION_TEMPLATE=$(resolve_workflow_template "deprecate/deprecation-template.md" "$REPO_ROOT")

DEPRECATION_FILE="$DEPRECATE_DIR/deprecation.md"

if [ -f "$DEPRECATION_TEMPLATE" ]; then
    cp "$DEPRECATION_TEMPLATE" "$DEPRECATION_FILE"
else
    echo "# Deprecation Plan" > "$DEPRECATION_FILE"
fi

# Create symlink from spec.md to deprecation.md
ln -sf "deprecation.md" "$DEPRECATE_DIR/spec.md"

# Run dependency scan
DEPENDENCIES_FILE="$DEPRECATE_DIR/dependencies.md"
SCAN_SCRIPT="$REPO_ROOT/.specify/extensions/workflows/templates/deprecate/scan-dependencies.sh"

if [ -f "$SCAN_SCRIPT" ] && [ -x "$SCAN_SCRIPT" ]; then
    "$SCAN_SCRIPT" "$FEATURE_NUM" "$DEPENDENCIES_FILE" 2>/dev/null || true
else
    echo "# Dependencies" > "$DEPENDENCIES_FILE"
    echo "" >> "$DEPENDENCIES_FILE"
    echo "Dependency scan script not found. Please manually document dependencies." >> "$DEPENDENCIES_FILE"
fi

# Replace placeholders in deprecation.md
if [ -f "$DEPRECATION_FILE" ]; then
    # Replace [FEATURE NAME] with actual feature name
    sed -i.bak "s/\[FEATURE NAME\]/${FEATURE_SHORT}/g" "$DEPRECATION_FILE" 2>/dev/null || \
    sed -i '' "s/\[FEATURE NAME\]/${FEATURE_SHORT}/g" "$DEPRECATION_FILE" 2>/dev/null || \
    true

    # Replace deprecate-### with actual deprecate ID
    sed -i.bak "s/deprecate-###/${DEPRECATE_ID}/g" "$DEPRECATION_FILE" 2>/dev/null || \
    sed -i '' "s/deprecate-###/${DEPRECATE_ID}/g" "$DEPRECATION_FILE" 2>/dev/null || \
    true

    # Replace branch placeholder
    sed -i.bak "s|deprecate/###-short-description|${BRANCH_NAME}|g" "$DEPRECATION_FILE" 2>/dev/null || \
    sed -i '' "s|deprecate/###-short-description|${BRANCH_NAME}|g" "$DEPRECATION_FILE" 2>/dev/null || \
    true

    # Add link to original feature
    ORIGINAL_FEATURE_LINK="[Link to original feature spec, e.g., specs/${FEATURE_NAME}/]"
    sed -i.bak "s|\[Link to original feature spec.*\]|${ORIGINAL_FEATURE_LINK}|g" "$DEPRECATION_FILE" 2>/dev/null || \
    sed -i '' "s|\[Link to original feature spec.*\]|${ORIGINAL_FEATURE_LINK}|g" "$DEPRECATION_FILE" 2>/dev/null || \
    true

    # Add deprecation announcement date (today)
    TODAY=$(date -u +"%Y-%m-%d")
    sed -i.bak "0,/\[YYYY-MM-DD\]/s/\[YYYY-MM-DD\]/${TODAY}/" "$DEPRECATION_FILE" 2>/dev/null || \
    sed -i '' "0,/\[YYYY-MM-DD\]/s/\[YYYY-MM-DD\]/${TODAY}/" "$DEPRECATION_FILE" 2>/dev/null || \
    true

    # Clean up backup files
    rm -f "$DEPRECATION_FILE.bak"
fi

# Set environment variable
export SPECIFY_DEPRECATE="$DEPRECATE_ID"

if $JSON_MODE; then
    printf '{\"DEPRECATE_ID\":\"%s\",\"BRANCH_NAME\":\"%s\",\"DEPRECATION_FILE\":\"%s\",\"DEPENDENCIES_FILE\":\"%s\",\"DEPRECATE_NUM\":\"%s\",\"FEATURE_NUM\":\"%s\",\"FEATURE_NAME\":\"%s\",\"REASON\":\"%s\"}\\n' \
        "$DEPRECATE_ID" "$BRANCH_NAME" "$DEPRECATION_FILE" "$DEPENDENCIES_FILE" "$DEPRECATE_NUM" "$FEATURE_NUM" "$FEATURE_NAME" "$REASON"
else
    echo "DEPRECATE_ID: $DEPRECATE_ID"
    echo "BRANCH_NAME: $BRANCH_NAME"
    echo "DEPRECATION_FILE: $DEPRECATION_FILE"
    echo "DEPENDENCIES_FILE: $DEPENDENCIES_FILE"
    echo "DEPRECATE_NUM: $DEPRECATE_NUM"
    echo "FEATURE_NUM: $FEATURE_NUM"
    echo "FEATURE_NAME: $FEATURE_NAME"
    echo "REASON: $REASON"
    echo ""
    echo "📦 Deprecation workflow initialized for feature ${FEATURE_NUM}"
    echo "Please review the dependency scan and plan your 3-phase sunset."
    echo "SPECIFY_DEPRECATE environment variable set to: $DEPRECATE_ID"
fi
