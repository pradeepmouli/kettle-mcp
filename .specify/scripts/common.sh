#!/usr/bin/env bash
# Common utilities for spec-kit scripts

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print colored messages
error() {
    echo -e "${RED}ERROR: $1${NC}" >&2
}

success() {
    echo -e "${GREEN}$1${NC}"
}

warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

info() {
    echo "$1"
}

# Get repository root
get_repo_root() {
    git rev-parse --show-toplevel 2>/dev/null || echo "."
}

# Get current branch name
get_current_branch() {
    git branch --show-current 2>/dev/null || echo "main"
}

# Extract feature number and name from branch
get_feature_info() {
    local branch=$(get_current_branch)
    if [[ $branch =~ ^([0-9]+)-(.+)$ ]]; then
        echo "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"
    else
        echo "" ""
    fi
}
