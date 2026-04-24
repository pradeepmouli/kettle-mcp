#!/usr/bin/env bash
set -euo pipefail

# Sync a linked GitHub issue with the current workflow event.
#
# Usage:
#   update-linked-issue.sh --event before_specify
#
# Optional env vars:
#   SPECKIT_LINKED_ISSUE=123
#   SPECKIT_ISSUE_SYNC_REPO=owner/repo
#   SPECKIT_ISSUE_SYNC_BOOTSTRAP_LABELS=true|false
#   SPECKIT_ISSUE_SYNC_COMMENT=true|false
#   SPECKIT_ISSUE_SYNC_LABEL_<EVENT>=custom-label
#   SPECKIT_ISSUE_SYNC_STATUS_<EVENT>=custom-status-text

EVENT=""

# Load common.sh early so get_repo_root is available for path resolution.
# This also gives us get_current_branch and find_feature_dir_by_prefix.
_COMMON_SH_LOADED=false
_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for _candidate in \
    "$_SCRIPT_DIR/common.sh" \
    "$_SCRIPT_DIR/../bash/common.sh" \
    ".specify/scripts/bash/common.sh"
do
    if [[ -f "$_candidate" ]]; then
        # shellcheck disable=SC1090
        source "$_candidate"
        _COMMON_SH_LOADED=true
        break
    fi
done

# Resolve repo root using get_repo_root() when available, otherwise fall back.
if [[ "$_COMMON_SH_LOADED" == "true" ]] && declare -f get_repo_root >/dev/null 2>&1; then
    _REPO_ROOT="$(get_repo_root 2>/dev/null || git rev-parse --show-toplevel 2>/dev/null || pwd)"
else
    _REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
fi

ISSUE_SYNC_ENV_FILE="$_REPO_ROOT/.specify/extensions/workflows/issue-sync.env"
ISSUE_SYNC_ENV_LOCAL_FILE="$_REPO_ROOT/.specify/extensions/workflows/issue-sync.local.env"

if [[ -f "$ISSUE_SYNC_ENV_FILE" ]]; then
    # shellcheck disable=SC1090
    source "$ISSUE_SYNC_ENV_FILE"
fi

if [[ -f "$ISSUE_SYNC_ENV_LOCAL_FILE" ]]; then
    # shellcheck disable=SC1090
    source "$ISSUE_SYNC_ENV_LOCAL_FILE"
fi

while [[ $# -gt 0 ]]; do
    case "$1" in
        --event)
            EVENT="${2:-}"
            shift 2
            ;;
        *)
            echo "Unknown argument: $1" >&2
            exit 2
            ;;
    esac
done

if [[ -z "$EVENT" ]]; then
    echo "Missing required --event argument" >&2
    exit 2
fi

if ! command -v gh >/dev/null 2>&1; then
    echo "GitHub CLI (gh) is not installed; skipping issue sync."
    exit 0
fi

if ! gh auth status >/dev/null 2>&1; then
    echo "GitHub CLI is not authenticated; skipping issue sync."
    exit 0
fi

EVENT_TO_VAR() {
    echo "$1" | tr '[:lower:]-' '[:upper:]_' | tr -cd 'A-Z0-9_'
}

default_label_for_event() {
    case "$1" in
        before_specify) echo "speckit:before-specify" ;;
        after_specify) echo "speckit:after-specify" ;;
        before_plan) echo "speckit:before-plan" ;;
        after_plan) echo "speckit:after-plan" ;;
        before_tasks) echo "speckit:before-tasks" ;;
        after_tasks) echo "speckit:after-tasks" ;;
        before_implement) echo "speckit:before-implement" ;;
        after_implement) echo "speckit:after-implement" ;;
        *) echo "speckit:${1}" ;;
    esac
}

default_status_for_event() {
    case "$1" in
        before_specify) echo "discovering requirements" ;;
        after_specify) echo "spec ready" ;;
        before_plan) echo "planning started" ;;
        after_plan) echo "plan approved" ;;
        before_tasks) echo "task breakdown started" ;;
        after_tasks) echo "tasks ready" ;;
        before_implement) echo "implementation started" ;;
        after_implement) echo "implementation completed" ;;
        *) echo "$1" ;;
    esac
}

get_event_label() {
    local event="$1"
    local event_var
    event_var="$(EVENT_TO_VAR "$event")"
    local key="SPECKIT_ISSUE_SYNC_LABEL_${event_var}"
    local configured="${!key:-}"
    if [[ -n "$configured" ]]; then
        echo "$configured"
    else
        default_label_for_event "$event"
    fi
}

get_event_status() {
    local event="$1"
    local event_var
    event_var="$(EVENT_TO_VAR "$event")"
    local key="SPECKIT_ISSUE_SYNC_STATUS_${event_var}"
    local configured="${!key:-}"
    if [[ -n "$configured" ]]; then
        echo "$configured"
    else
        default_status_for_event "$event"
    fi
}

all_known_labels() {
    local events=(
        before_specify
        after_specify
        before_plan
        after_plan
        before_tasks
        after_tasks
        before_implement
        after_implement
    )

    for event in "${events[@]}"; do
        get_event_label "$event"
    done | awk '!seen[$0]++'
}

resolve_repo() {
    if [[ -n "${SPECKIT_ISSUE_SYNC_REPO:-}" ]]; then
        echo "$SPECKIT_ISSUE_SYNC_REPO"
        return
    fi

    local repo
    repo="$(gh repo view --json nameWithOwner --jq '.nameWithOwner' 2>/dev/null || true)"
    if [[ -z "$repo" ]]; then
        repo="$(git config --get remote.origin.url 2>/dev/null | sed -E 's#^git@github.com:##; s#^https://github.com/##; s#\.git$##' || true)"
    fi

    echo "$repo"
}

resolve_linked_issue() {
    # 1. Explicit override always wins.
    if [[ -n "${SPECKIT_LINKED_ISSUE:-}" ]]; then
        echo "$SPECKIT_LINKED_ISSUE"
        return
    fi

    # 2. Open PR with a closing-issue reference.
    local issue_from_pr
    issue_from_pr="$(gh pr view --json closingIssuesReferences --jq '.closingIssuesReferences[0].number' 2>/dev/null || true)"
    if [[ -n "$issue_from_pr" && "$issue_from_pr" != "null" ]]; then
        echo "$issue_from_pr"
        return
    fi

    # 3. Use get_feature_paths (common.sh) to locate the spec directory.
    #    Also try find_feature_dir_by_prefix for extension branch patterns
    #    (bugfix/NNN, refactor/NNN, etc.) when common.sh is loaded.
    local feature_dir=""
    if [[ "$_COMMON_SH_LOADED" == "true" ]]; then
        if declare -f get_feature_paths >/dev/null 2>&1; then
            get_feature_paths >/dev/null 2>&1 || true
            feature_dir="${FEATURE_DIR:-}"
        fi

        if [[ -z "$feature_dir" ]] && declare -f get_current_branch >/dev/null 2>&1 && declare -f find_feature_dir_by_prefix >/dev/null 2>&1; then
            local branch
            branch="$(get_current_branch 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
            # Match leading number in extension branch patterns: bugfix/004-*, refactor/003-*, 001-*
            if [[ "$branch" =~ /([0-9]{3,})[^/] ]] || [[ "$branch" =~ ^([0-9]{3,})- ]]; then
                local prefix="${BASH_REMATCH[1]}"
                local found
                found="$(find_feature_dir_by_prefix "$prefix" 2>/dev/null || true)"
                [[ -n "$found" && -d "$found" ]] && feature_dir="$found"
            fi
        fi
    fi

    # 4. Check spec.md front-matter for an explicit linked-issue declaration.
    #    Accepts: "linked-issue: 123", "linked_issue: 123", or "issue: 123".
    if [[ -n "$feature_dir" && -d "$feature_dir" ]]; then
        local spec_file="$feature_dir/spec.md"
        if [[ -f "$spec_file" ]]; then
            local issue_from_spec
            issue_from_spec="$(awk '
                /^---/{if(fm==0){fm=1;next}else{exit}}
                fm && /^(linked[-_]?issue|issue)[[:space:]]*:[[:space:]]*[0-9]+/{
                    match($0,/[0-9]+/); print substr($0,RSTART,RLENGTH); exit
                }
            ' "$spec_file" 2>/dev/null || true)"
            if [[ -n "$issue_from_spec" ]]; then
                echo "$issue_from_spec"
                return
            fi
        fi

        # 5. Scan all docs in the spec dir for GitHub issue references.
        local issue_from_docs
        issue_from_docs="$(grep -r -h -o 'issues/[0-9]\+\|#[0-9]\+' "$feature_dir" 2>/dev/null \
            | head -n1 | sed -E 's#issues/##; s#[^0-9]##g' || true)"
        if [[ -n "$issue_from_docs" ]]; then
            echo "$issue_from_docs"
            return
        fi
    fi

    # 6. Last resort: parse the leading number from the branch name.
    #    Require 3+ digits to reduce false-positive matches.
    local branch
    branch="$(
        if [[ "$_COMMON_SH_LOADED" == "true" ]] && declare -f get_current_branch >/dev/null 2>&1; then
            get_current_branch 2>/dev/null
        else
            git rev-parse --abbrev-ref HEAD 2>/dev/null
        fi || true
    )"
    if [[ "$branch" =~ (^|[^0-9])([0-9]{3,7})([^0-9]|$) ]]; then
        echo "${BASH_REMATCH[2]}"
        return
    fi

    echo ""
}

ensure_label_exists() {
    local repo="$1"
    local label="$2"

    if gh label list --repo "$repo" --limit 200 --json name --jq '.[].name' 2>/dev/null | grep -Fxq "$label"; then
        return
    fi

    gh label create "$label" --repo "$repo" --color "0E8A16" --description "Spec Kit workflow status label" >/dev/null 2>&1 || true
}

bootstrap_labels_if_enabled() {
    local repo="$1"
    local enabled="${SPECKIT_ISSUE_SYNC_BOOTSTRAP_LABELS:-true}"

    if [[ "$enabled" != "true" ]]; then
        return
    fi

    while IFS= read -r label; do
        [[ -n "$label" ]] || continue
        ensure_label_exists "$repo" "$label"
    done < <(all_known_labels)
}

main() {
    local repo
    repo="$(resolve_repo)"
    if [[ -z "$repo" ]]; then
        echo "Could not resolve repository; skipping issue sync."
        exit 0
    fi

    local issue
    issue="$(resolve_linked_issue)"
    if [[ -z "$issue" ]]; then
        echo "No linked issue detected; set SPECKIT_LINKED_ISSUE to force syncing."
        exit 0
    fi

    local target_label
    target_label="$(get_event_label "$EVENT")"
    local target_status
    target_status="$(get_event_status "$EVENT")"

    bootstrap_labels_if_enabled "$repo"

    while IFS= read -r label; do
        [[ -n "$label" ]] || continue
        if [[ "$label" != "$target_label" ]]; then
            gh issue edit "$issue" --repo "$repo" --remove-label "$label" >/dev/null 2>&1 || true
        fi
    done < <(all_known_labels)

    gh issue edit "$issue" --repo "$repo" --add-label "$target_label" >/dev/null

    local add_comment="${SPECKIT_ISSUE_SYNC_COMMENT:-false}"
    if [[ "$add_comment" == "true" ]]; then
        gh issue comment "$issue" --repo "$repo" --body "[spec-kit] Workflow event: $EVENT (status: $target_status)." >/dev/null || true
    fi

    echo "Synced issue #$issue to event '$EVENT' with label '$target_label' in $repo"
}

main
