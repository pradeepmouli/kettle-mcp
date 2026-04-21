#!/usr/bin/env bash
set -euo pipefail

# Fetch upstream spec-kit into ./spec-kit for local reference.
# Usage: scripts/fetch-spec-kit.sh [ref]
# If no ref is provided, defaults to main. Set SPEC_KIT_REF to override.

REPO_URL="https://github.com/github/spec-kit"
REF="${1:-${SPEC_KIT_REF:-main}}"
TARGET_DIR="spec-kit"

if [[ -d "$TARGET_DIR" && -n "$(ls -A "$TARGET_DIR" 2>/dev/null)" ]]; then
  echo "spec-kit/ already exists and is not empty; refusing to overwrite." >&2
  echo "Delete or move it if you want to re-fetch." >&2
  exit 1
fi

rm -rf "$TARGET_DIR"

echo "Cloning $REPO_URL at ref '$REF' into $TARGET_DIR/" >&2

if ! git clone --depth 1 --branch "$REF" "$REPO_URL" "$TARGET_DIR" 2>/dev/null; then
  echo "Git clone failed for ref '$REF'." >&2
  echo "Hint: check that the ref exists (tag/branch) or set SPEC_KIT_REF." >&2
  exit 1
fi

echo "Done. spec-kit/ is ready for local reference (ignored by git)." >&2
