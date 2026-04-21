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

# Ensure generate_branch_name is available from common.sh; provide a local fallback if missing
if ! declare -f generate_branch_name > /dev/null; then
    >&2 echo "[refactor] Warning: common.sh not found or missing generate_branch_name; using local fallback."
    generate_branch_name() {
        local description="$1"
        local stop_words="^(i|a|an|the|to|for|of|in|on|at|by|with|from|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|should|could|can|may|might|must|shall|this|that|these|those|my|your|our|their|want|need|add|get|set)$"
        local clean_name=$(echo "$description" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/ /g')

        local meaningful_words=()
        for word in $clean_name; do
            [ -z "$word" ] && continue
            if ! echo "$word" | grep -qiE "$stop_words"; then
                if [ ${#word} -ge 3 ]; then
                    meaningful_words+=("$word")
                elif echo "$description" | grep -q "\b${word^^}\b"; then
                    meaningful_words+=("$word")
                fi
            fi
        done

        if [ ${#meaningful_words[@]} -gt 0 ]; then
            local max_words=3
            if [ ${#meaningful_words[@]} -eq 4 ]; then max_words=4; fi
            local result=""
            local count=0
            for word in "${meaningful_words[@]}"; do
                if [ $count -ge $max_words ]; then break; fi
                if [ -n "$result" ]; then result="$result-"; fi
                result="$result$word"
                count=$((count + 1))
            done
            echo "$result"
        else
            local cleaned=$(echo "$description" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-//' | sed 's/-$//')
            echo "$cleaned" | tr '-' '\n' | grep -v '^$' | head -3 | tr '\n' '-' | sed 's/-$//'
        fi
    }
fi

JSON_MODE=false
ARGS=()
for arg in "$@"; do
    case "$arg" in
        --json) JSON_MODE=true ;;
        --help|-h) echo "Usage: $0 [--json] <refactoring_description>"; exit 0 ;;
        *) ARGS+=("$arg") ;;
    esac
done

REFACTOR_DESCRIPTION="${ARGS[*]}"
if [ -z "$REFACTOR_DESCRIPTION" ]; then
    echo "Usage: $0 [--json] <refactoring_description>" >&2
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
REFACTOR_NUM=$(printf "%03d" "$NEXT")

# Create branch name from description using smart filtering
WORDS=$(generate_branch_name "$REFACTOR_DESCRIPTION")
BRANCH_NAME="refactor/${REFACTOR_NUM}-${WORDS}"
REFACTOR_ID="refactor-${REFACTOR_NUM}"

# Create git branch
if [ "$HAS_GIT" = true ]; then
    git checkout -b "$BRANCH_NAME"
else
    >&2 echo "[refactor] Warning: Git repository not detected; skipped branch creation for $BRANCH_NAME"
fi

# Create refactor directory under refactor/ subdirectory
REFACTOR_SUBDIR="$SPECS_DIR/refactor"
mkdir -p "$REFACTOR_SUBDIR"
REFACTOR_DIR="$REFACTOR_SUBDIR/${REFACTOR_NUM}-${WORDS}"
mkdir -p "$REFACTOR_DIR"

# Copy template
REFACTOR_TEMPLATE=$(resolve_workflow_template "refactor/refactor-template.md" "$REPO_ROOT")
REFACTOR_SPEC_FILE="$REFACTOR_DIR/refactor-spec.md"

if [ -f "$REFACTOR_TEMPLATE" ]; then
    cp "$REFACTOR_TEMPLATE" "$REFACTOR_SPEC_FILE"
else
    echo "# Refactor Spec" > "$REFACTOR_SPEC_FILE"
fi

# Create symlink from spec.md to refactor-spec.md
ln -sf "refactor-spec.md" "$REFACTOR_DIR/spec.md"

# Create placeholder for metrics
METRICS_BEFORE="$REFACTOR_DIR/metrics-before.md"
METRICS_AFTER="$REFACTOR_DIR/metrics-after.md"

cat > "$METRICS_BEFORE" << 'EOF'
# Baseline Metrics (Before Refactoring)

**Status**: Automatically captured during workflow creation

Baseline metrics are automatically captured when the refactor workflow is created.

If you need to re-capture baseline metrics, run:

```bash
.specify/extensions/workflows/templates/refactor/measure-metrics.sh --before --dir "$REFACTOR_DIR"
```

This should be done BEFORE making any code changes.
EOF

cat > "$METRICS_AFTER" << 'EOF'
# Post-Refactoring Metrics (After Refactoring)

**Status**: Not yet captured

Run the following command to capture post-refactoring metrics:

```bash
.specify/extensions/workflows/templates/refactor/measure-metrics.sh --after --dir "$REFACTOR_DIR"
```

This should be done AFTER refactoring is complete and all tests pass.
EOF

# Create placeholder for testing gaps assessment
TESTING_GAPS="$REFACTOR_DIR/testing-gaps.md"
TESTING_GAPS_TEMPLATE=$(resolve_workflow_template "refactor/testing-gaps-template.md" "$REPO_ROOT")

if [ -f "$TESTING_GAPS_TEMPLATE" ]; then
    cp "$TESTING_GAPS_TEMPLATE" "$TESTING_GAPS"
else
    cat > "$TESTING_GAPS" << 'EOF'
# Testing Gaps Assessment

**Purpose**: Identify and address test coverage gaps BEFORE establishing baseline metrics.

**Status**: [ ] Assessment Complete | [ ] Gaps Identified | [ ] Tests Added | [ ] Ready for Baseline

## Phase 0: Pre-Baseline Testing Gap Analysis

### Step 1: Identify Affected Functionality
`[Document code areas that will be modified during refactoring]`

### Step 2: Assess Current Test Coverage
`[For each affected area, document current test coverage]`

### Step 3: Document Gaps
`[List critical, important, and nice-to-have testing gaps]`

### Step 4: Add Missing Tests
`[Add tests for critical gaps before proceeding to baseline]`

---
*Complete this assessment BEFORE running measure-metrics.sh --before*
EOF
fi

# Create placeholder for behavioral snapshot
BEHAVIORAL_SNAPSHOT="$REFACTOR_DIR/behavioral-snapshot.md"
cat > "$BEHAVIORAL_SNAPSHOT" << 'EOF'
# Behavioral Snapshot

**Purpose**: Document observable behavior before refactoring to verify it's preserved after.

## Key Behaviors to Preserve

### Behavior 1: [Description]
**Input**: [Specific input data/conditions]
**Expected Output**: [Exact expected result]
**Actual Output** (before): [Run and document]
**Actual Output** (after): [Re-run after refactoring - must match]

### Behavior 2: [Description]
**Input**: [Specific input data/conditions]
**Expected Output**: [Exact expected result]
**Actual Output** (before): [Run and document]
**Actual Output** (after): [Re-run after refactoring - must match]

### Behavior 3: [Description]
**Input**: [Specific input data/conditions]
**Expected Output**: [Exact expected result]
**Actual Output** (before): [Run and document]
**Actual Output** (after): [Re-run after refactoring - must match]

## Test Commands
```bash
# Commands to reproduce behaviors
npm test -- [specific test]
npm run dev # Manual testing steps...
```

---
*Update this file with actual behaviors before starting refactoring*
EOF

# Set environment variable
export SPECIFY_REFACTOR="$REFACTOR_ID"

# Capture baseline metrics automatically
MEASURE_SCRIPT="$REPO_ROOT/.specify/extensions/workflows/templates/refactor/measure-metrics.sh"
if [ -f "$MEASURE_SCRIPT" ]; then
    # Ensure script is executable
    chmod +x "$MEASURE_SCRIPT"

    if ! $JSON_MODE; then
        echo ""
        echo "=== Capturing Baseline Metrics ==="
        echo ""
    fi

    # Run the measure-metrics script to capture baseline
    if "$MEASURE_SCRIPT" --before --dir "$REFACTOR_DIR"; then
        if ! $JSON_MODE; then
            echo ""
            echo "✓ Baseline metrics captured successfully"
            echo ""
        fi
    else
        if ! $JSON_MODE; then
            echo ""
            echo "⚠ Warning: Failed to capture baseline metrics automatically"
            echo "  Run manually: .specify/extensions/workflows/templates/refactor/measure-metrics.sh --before --dir $REFACTOR_DIR"
            echo ""
        fi
    fi
else
    if ! $JSON_MODE; then
        echo ""
        echo "⚠ Warning: measure-metrics.sh not found at $MEASURE_SCRIPT"
        echo "  Baseline metrics must be captured manually"
        echo ""
    fi
fi

if $JSON_MODE; then
    printf '{"REFACTOR_ID":"%s","BRANCH_NAME":"%s","REFACTOR_SPEC_FILE":"%s","TESTING_GAPS":"%s","METRICS_BEFORE":"%s","METRICS_AFTER":"%s","BEHAVIORAL_SNAPSHOT":"%s","REFACTOR_NUM":"%s"}\n' \
        "$REFACTOR_ID" "$BRANCH_NAME" "$REFACTOR_SPEC_FILE" "$TESTING_GAPS" "$METRICS_BEFORE" "$METRICS_AFTER" "$BEHAVIORAL_SNAPSHOT" "$REFACTOR_NUM"
else
    echo "REFACTOR_ID: $REFACTOR_ID"
    echo "BRANCH_NAME: $BRANCH_NAME"
    echo "REFACTOR_SPEC_FILE: $REFACTOR_SPEC_FILE"
    echo "TESTING_GAPS: $TESTING_GAPS"
    echo "METRICS_BEFORE: $METRICS_BEFORE"
    echo "METRICS_AFTER: $METRICS_AFTER"
    echo "BEHAVIORAL_SNAPSHOT: $BEHAVIORAL_SNAPSHOT"
    echo "REFACTOR_NUM: $REFACTOR_NUM"
    echo "SPECIFY_REFACTOR environment variable set to: $REFACTOR_ID"
fi
