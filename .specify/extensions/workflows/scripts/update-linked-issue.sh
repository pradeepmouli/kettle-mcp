#!/usr/bin/env bash
set -euo pipefail

# Compatibility wrapper for installations that place shared scripts under
# .specify/extensions/workflows/scripts/ instead of scripts/bash/.
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

if [[ -f "$SCRIPT_DIR/bash/update-linked-issue.sh" ]]; then
    exec bash "$SCRIPT_DIR/bash/update-linked-issue.sh" "$@"
fi

echo "Could not locate bash/update-linked-issue.sh from $SCRIPT_DIR" >&2
exit 1
