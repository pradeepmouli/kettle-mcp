#!/usr/bin/env bash
# create-enhance.sh — Initialize an enhancement workflow.
# Spec Kit Workflow Extensions (spec-kit >=0.3.1)

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
ARGS=()
for arg in "$@"; do
    case "$arg" in
        --json) JSON_MODE=true ;;
        --help|-h)
            echo "Usage: $0 [--json] <enhancement_description>"
            echo ""
            echo "Options:"
            echo "  --json    Emit JSON output instead of human-readable lines"
            echo ""
            echo "Config (highest priority wins):"
            echo "  SPECKIT_WORKFLOWS_ENHANCE_MAX_TASKS env var"
            echo "  .specify/extensions/workflows/workflows-config.yml  (enhance.max_tasks)"
            echo "  extension defaults (max_tasks=7, min_tasks=3)"
            exit 0 ;;
        *) ARGS+=("$arg") ;;
    esac
done

ENHANCEMENT_DESCRIPTION="${ARGS[*]:-}"
if [ -z "${ENHANCEMENT_DESCRIPTION}" ]; then
    echo "Usage: $0 [--json] <enhancement_description>" >&2
    exit 1
fi

# Use spec-kit common functions
REPO_ROOT=$(get_repo_root)
HAS_GIT=$(has_git && echo "true" || echo "false")

# ── Resolve max_tasks configuration ────────────────────────────────────────
# Priority: env var > project config file > extension defaults
DEFAULT_MAX_TASKS=7
DEFAULT_MIN_TASKS=3

# 1. Extension defaults
MAX_TASKS="$DEFAULT_MAX_TASKS"
MIN_TASKS="$DEFAULT_MIN_TASKS"

# 2. Project config file (.specify/extensions/workflows/workflows-config.yml)
CONFIG_FILE="${REPO_ROOT}/.specify/extensions/workflows/workflows-config.yml"
if [ -f "${CONFIG_FILE}" ]; then
    _cfg_max=$(grep -E '^[[:space:]]*max_tasks:[[:space:]]' "${CONFIG_FILE}" | tail -1 | sed 's/.*max_tasks:[[:space:]]*//' | tr -d '[:space:]' || true)
    _cfg_min=$(grep -E '^[[:space:]]*min_tasks:[[:space:]]' "${CONFIG_FILE}" | tail -1 | sed 's/.*min_tasks:[[:space:]]*//' | tr -d '[:space:]' || true)
    [[ "${_cfg_max}" =~ ^[0-9]+$ ]] && MAX_TASKS="${_cfg_max}"
    [[ "${_cfg_min}" =~ ^[0-9]+$ ]] && MIN_TASKS="${_cfg_min}"
fi

# 3. Environment variable override (SPECKIT_WORKFLOWS_ENHANCE_MAX_TASKS)
if [[ -n "${SPECKIT_WORKFLOWS_ENHANCE_MAX_TASKS:-}" ]]; then
    if [[ "${SPECKIT_WORKFLOWS_ENHANCE_MAX_TASKS}" =~ ^[0-9]+$ ]]; then
        MAX_TASKS="${SPECKIT_WORKFLOWS_ENHANCE_MAX_TASKS}"
    else
        echo "[enhance] Warning: SPECKIT_WORKFLOWS_ENHANCE_MAX_TASKS='${SPECKIT_WORKFLOWS_ENHANCE_MAX_TASKS}' is not a valid integer; ignoring." >&2
    fi
fi
# ───────────────────────────────────────────────────────────────────────────

cd "$REPO_ROOT"

SPECS_DIR="$REPO_ROOT/specs"
mkdir -p "$SPECS_DIR"

# Find next number using global numbering (spec-kit v0.2.0+)
NEXT=$(get_global_next_number "$SPECS_DIR")
ENHANCE_NUM=$(printf "%03d" "$NEXT")

# Create branch name from description using smart filtering
WORDS=$(generate_branch_name "$ENHANCEMENT_DESCRIPTION")
BRANCH_NAME="enhance/${ENHANCE_NUM}-${WORDS}"
ENHANCE_ID="enhance-${ENHANCE_NUM}"

# Create git branch if git available
if [ "$HAS_GIT" = true ]; then
    git checkout -b "$BRANCH_NAME"
else
    >&2 echo "[enhance] Warning: Git repository not detected; skipped branch creation for $BRANCH_NAME"
fi

# Create enhancement directory under enhance/ subdirectory
ENHANCE_SUBDIR="$SPECS_DIR/enhance"
mkdir -p "$ENHANCE_SUBDIR"
ENHANCE_DIR="$ENHANCE_SUBDIR/${ENHANCE_NUM}-${WORDS}"
mkdir -p "$ENHANCE_DIR"

# Copy template
ENHANCE_TEMPLATE=$(resolve_workflow_template "enhance/enhancement-template.md" "$REPO_ROOT")
ENHANCEMENT_FILE="$ENHANCE_DIR/enhancement.md"

if [ -f "$ENHANCE_TEMPLATE" ]; then
    cp "$ENHANCE_TEMPLATE" "$ENHANCEMENT_FILE"
else
    echo "# Enhancement" > "$ENHANCEMENT_FILE"
fi

# Create symlink from spec.md to enhancement.md
ln -sf "enhancement.md" "$ENHANCE_DIR/spec.md"

# Create plan.md and tasks.md as standard symlinks
ln -sf "enhancement.md" "$ENHANCE_DIR/plan.md"
ln -sf "enhancement.md" "$ENHANCE_DIR/tasks.md"

# Set environment variable for current session
export SPECIFY_ENHANCE="$ENHANCE_ID"

if $JSON_MODE; then
    printf '{"ENHANCE_ID":"%s","BRANCH_NAME":"%s","ENHANCEMENT_FILE":"%s","ENHANCE_NUM":"%s","MAX_TASKS":"%s","MIN_TASKS":"%s"}\n' \
        "${ENHANCE_ID}" "${BRANCH_NAME}" "${ENHANCEMENT_FILE}" "${ENHANCE_NUM}" "${MAX_TASKS}" "${MIN_TASKS}"
else
    echo "ENHANCE_ID: ${ENHANCE_ID}"
    echo "BRANCH_NAME: ${BRANCH_NAME}"
    echo "ENHANCEMENT_FILE: ${ENHANCEMENT_FILE}"
    echo "ENHANCE_NUM: ${ENHANCE_NUM}"
    echo "MAX_TASKS: ${MAX_TASKS}"
    echo "MIN_TASKS: ${MIN_TASKS}"
    echo "SPECIFY_ENHANCE environment variable set to: ${ENHANCE_ID}"
fi
