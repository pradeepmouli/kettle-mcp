#!/usr/bin/env bash

set -euo pipefail

print_usage() {
    cat <<'USAGE'
Usage: mark-task-status.sh --task-id TXXX --status <done|pending> [--tasks-file path]

Marks a task entry in tasks.md with the desired checkbox state.
- If --tasks-file is omitted, the current feature's tasks.md is used via common.sh helpers.
- Updates the first matching task ID only; aborts if no entry is found.
USAGE
}

TASK_ID=""
STATUS=""
TASKS_FILE=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --task-id)
            TASK_ID="$2"
            shift 2
            ;;
        --status)
            STATUS="$2"
            shift 2
            ;;
        --tasks-file)
            TASKS_FILE="$2"
            shift 2
            ;;
        --help|-h)
            print_usage
            exit 0
            ;;
        *)
            echo "Unknown argument: $1" >&2
            print_usage >&2
            exit 1
            ;;
    esac
done

if [[ -z "$TASK_ID" ]]; then
    echo "--task-id is required" >&2
    exit 1
fi

if [[ -z "$STATUS" ]]; then
    echo "--status is required" >&2
    exit 1
fi

case "$STATUS" in
    done|pending)
        ;;
    *)
        echo "--status must be 'done' or 'pending'" >&2
        exit 1
        ;;
esac

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source common.sh from spec-kit installation
# Note: When installed via specify-extend, this script is placed in .specify/scripts/bash/
# alongside spec-kit's common.sh (at .specify/scripts/bash/common.sh)
if [ -f "$SCRIPT_DIR/../bash/common.sh" ]; then
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

eval $(get_feature_paths)

if [[ -z "$TASKS_FILE" ]]; then
    TASKS_FILE="$TASKS"
fi

if [[ ! -f "$TASKS_FILE" ]]; then
    echo "tasks file not found: $TASKS_FILE" >&2
    exit 1
fi

python3 - "$TASK_ID" "$STATUS" "$TASKS_FILE" <<'PY'
import re
import sys
from pathlib import Path

task_id, status, path = sys.argv[1:]
path = Path(path)
text = path.read_text()

# Pattern matches task entries with various whitespace styles:
# - Handles leading whitespace before dash: "  - [ ]" or "    - [ ]"
# - Handles whitespace around dash: "- [ ]" or "-[ ]" or "  -  [ ]"
# - Matches checkboxes: [ ], [x], [X]
# - Handles whitespace after checkbox: "[ ] T001" or "[ ]  T001"
pattern = re.compile(rf"^(\s*-\s*)\[[ xX]\]\s+({re.escape(task_id)})(\b.*)$", re.MULTILINE)
box = "[X]" if status == "done" else "[ ]"

def repl(match):
    return f"{match.group(1)}{box} {match.group(2)}{match.group(3)}"

new_text, count = pattern.subn(repl, text, count=1)
if count == 0:
    sys.stderr.write(f"Task ID {task_id} not found in {path}\n")
    sys.exit(1)

path.write_text(new_text)
PY

echo "Updated $TASK_ID to $STATUS in $TASKS_FILE"
