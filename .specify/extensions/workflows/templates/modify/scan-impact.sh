#!/usr/bin/env bash

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <feature-number>" >&2
    echo "Example: $0 014" >&2
    exit 1
fi

FEATURE_NUM="$1"

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
REPO_ROOT="$(find_repo_root "$SCRIPT_DIR")"

if [ -z "$REPO_ROOT" ]; then
    echo "Error: Could not find repository root" >&2
    exit 1
fi

cd "$REPO_ROOT"

# Find feature directory
FEATURE_DIR=$(find "$REPO_ROOT/specs" -maxdepth 1 -type d -name "${FEATURE_NUM}-*" | head -1)

if [ -z "$FEATURE_DIR" ]; then
    echo "Error: Could not find feature ${FEATURE_NUM} in specs/" >&2
    exit 1
fi

FEATURE_NAME=$(basename "$FEATURE_DIR")

echo "Scanning impact for feature: $FEATURE_NAME"
echo ""

# Parse tasks.md to find files created/modified
TASKS_FILE="$FEATURE_DIR/tasks.md"
FILES_AFFECTED=()

if [ -f "$TASKS_FILE" ]; then
    echo "=== Files from Original Implementation ==="
    # Extract file paths from tasks (look for patterns like app/*, tests/*, etc.)
    while IFS= read -r line; do
        # Match common path patterns
        if echo "$line" | grep -qE '(app/|tests/|src/|lib/).*\.(ts|tsx|js|jsx|py|go|rs)'; then
            file=$(echo "$line" | grep -oE '(app/|tests/|src/|lib/)[^ ]*\.(ts|tsx|js|jsx|py|go|rs)' | head -1)
            if [ -n "$file" ] && [ -f "$REPO_ROOT/$file" ]; then
                FILES_AFFECTED+=("$file")
                echo "  - $file"
            fi
        fi
    done < "$TASKS_FILE"
    echo ""
fi

# Find contracts
CONTRACTS_DIR="$FEATURE_DIR/contracts"
if [ -d "$CONTRACTS_DIR" ]; then
    echo "=== Contracts from Original Feature ==="
    find "$CONTRACTS_DIR" -type f -name "*.json" -o -name "*.schema.*" | while read contract; do
        echo "  - $(basename "$contract")"
    done
    echo ""
fi

# Search codebase for references to feature-related terms
echo "=== References in Codebase ==="
# Extract feature-specific identifiers from spec
SPEC_FILE="$FEATURE_DIR/spec.md"
if [ -f "$SPEC_FILE" ]; then
    # Look for common patterns like function names, component names
    # This is a basic implementation - can be enhanced
    echo "  (Scan for feature-specific imports/references)"
    echo "  Run: grep -r '<feature-terms>' app/ tests/"
    echo ""
fi

# Check for database schema
echo "=== Database Schema Check ==="
DATA_MODEL="$FEATURE_DIR/data-model.md"
if [ -f "$DATA_MODEL" ]; then
    echo "  Original feature has data model - check for schema changes needed"
    echo "  File: $DATA_MODEL"
else
    echo "  No data model in original feature"
fi
echo ""

# Output summary
echo "=== Summary ==="
echo "Feature: $FEATURE_NAME"
echo "Files tracked: ${#FILES_AFFECTED[@]}"
echo "Tasks file: $TASKS_FILE"
echo "Contracts: $CONTRACTS_DIR"
echo ""
echo "Next steps:"
echo "1. Review files above for modification needs"
echo "2. Check which tests will break"
echo "3. Identify new contracts needed"
echo "4. Document in modification-spec.md"
