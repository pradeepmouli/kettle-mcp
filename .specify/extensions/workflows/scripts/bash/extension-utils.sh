#!/usr/bin/env bash
# spec-kit-extensions utility functions
#
# Provides functions that extend spec-kit's common.sh for extension workflows.
# This file is sourced by create-* scripts and can be used standalone in native
# extension installs (where the monkey patch of common.sh is not applied).
#
# Functions provided:
#   generate_branch_name()       - Smart branch naming with stop word filtering
#   get_global_highest_number()  - Get highest spec number across all workflows
#   get_global_next_number()     - Get next available spec number globally
#   check_feature_branch()       - Extended branch validation for extension patterns

# --- generate_branch_name ---
# Only define if not already available (e.g., from spec-kit's common.sh patch)
if ! declare -f generate_branch_name > /dev/null 2>&1; then
generate_branch_name() {
    local description="$1"

    # Common stop words to filter out
    local stop_words="^(i|a|an|the|to|for|of|in|on|at|by|with|from|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|should|could|can|may|might|must|shall|this|that|these|those|my|your|our|their|want|need|add|get|set)$"

    # Convert to lowercase and split into words
    local clean_name=$(echo "$description" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/ /g')

    # Filter words: remove stop words and words shorter than 3 chars (unless uppercase acronym in original)
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
        # Fallback to a simple normalized hyphenated slug of first 3 words
        local cleaned=$(echo "$description" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-//' | sed 's/-$//')
        echo "$cleaned" | tr '-' '\n' | grep -v '^$' | head -3 | tr '\n' '-' | sed 's/-$//'
    fi
}
fi

# --- get_global_highest_number ---
# Get the global highest spec number across ALL workflows and feature branches.
# This mirrors spec-kit v0.2.0's global branch numbering approach to avoid
# number collisions between feature branches and extension workflow branches.
if ! declare -f get_global_highest_number > /dev/null 2>&1; then
get_global_highest_number() {
    local specs_dir="${1:-$(get_repo_root)/specs}"
    local highest=0

    # Check all spec directories recursively (features, bugfix/, modify/, etc.)
    if [[ -d "$specs_dir" ]]; then
        while IFS= read -r -d '' dir; do
            local dirname
            dirname=$(basename "$dir")
            if [[ "$dirname" =~ ^([0-9]+) ]]; then
                local number=$((10#${BASH_REMATCH[1]}))
                if [[ "$number" -gt "$highest" ]]; then
                    highest=$number
                fi
            fi
        done < <(find "$specs_dir" -mindepth 1 -maxdepth 2 -type d -print0 2>/dev/null)
    fi

    # Also check all local git branches for NNN- or workflow/NNN- patterns
    if git rev-parse --git-dir >/dev/null 2>&1; then
        while IFS= read -r branch; do
            local clean
            clean=$(echo "$branch" | sed 's|^[* ]*||; s|^remotes/[^/]*/||')
            # Match: 001-foo OR bugfix/001-foo OR modify/001^002-foo etc.
            if [[ "$clean" =~ ^[0-9]{3}- ]]; then
                local number
                number=$(echo "$clean" | grep -o '^[0-9]\+')
                number=$((10#$number))
                if [[ "$number" -gt "$highest" ]]; then highest=$number; fi
            elif [[ "$clean" =~ ^[a-z]+/([0-9]+) ]]; then
                local number=$((10#${BASH_REMATCH[1]}))
                if [[ "$number" -gt "$highest" ]]; then highest=$number; fi
            fi
        done < <(git branch -a 2>/dev/null)
    fi

    echo "$highest"
}
fi

# --- get_global_next_number ---
# Get the next available spec number globally.
if ! declare -f get_global_next_number > /dev/null 2>&1; then
get_global_next_number() {
    local specs_dir="${1:-$(get_repo_root)/specs}"
    local highest
    highest=$(get_global_highest_number "$specs_dir")
    echo $((highest + 1))
}
fi

# --- resolve_workflow_template ---
# Resolve a workflow template file path using spec-kit's preset priority stack
# when available (spec-kit >=0.3.0), otherwise falls back to the bundled
# extension templates directory.
#
# Priority order (spec-kit 0.3.0+ preset system):
#   user overrides → installed presets → this extension → spec-kit core
#
# Usage: resolve_workflow_template <template-relative-path> <repo-root>
# Example: TMPL=$(resolve_workflow_template "enhance/enhancement-template.md" "$REPO_ROOT")
resolve_workflow_template() {
    local template_rel="$1"
    local repo_root="${2:-$(get_repo_root)}"
    local fallback="${repo_root}/.specify/extensions/workflows/templates/${template_rel}"

    # Delegate to spec-kit's resolve_template() if present (requires >=0.3.0)
    if declare -f resolve_template > /dev/null 2>&1; then
        local resolved
        resolved=$(resolve_template "${template_rel}" "${repo_root}" 2>/dev/null) || true
        if [[ -n "$resolved" && -f "$resolved" ]]; then
            echo "$resolved"
            return 0
        fi
    fi

    echo "$fallback"
}

# --- check_feature_branch ---
# Extended branch validation supporting spec-kit-extensions branch patterns
# and AI agent branch patterns.
if ! declare -f check_feature_branch > /dev/null 2>&1; then
check_feature_branch() {
    # Support both parameterized and non-parameterized calls
    local branch="${1:-}"
    local has_git_repo="${2:-}"

    # If branch not provided as parameter, get current branch
    if [[ -z "$branch" ]]; then
        if git rev-parse --git-dir > /dev/null 2>&1; then
            branch=$(git branch --show-current)
            has_git_repo="true"
        else
            return 0
        fi
    fi

    # For non-git repos, skip validation if explicitly specified
    if [[ "$has_git_repo" != "true" && -n "$has_git_repo" ]]; then
        echo "[specify] Warning: Git repository not detected; skipped branch validation" >&2
        return 0
    fi

    # AI agent branch patterns - allow any branch created by AI agents
    local agent_prefixes=(
        "claude/"
        "copilot/"
        "cursor/"
        "vscode/"
        "windsurf/"
        "gemini/"
        "qwen/"
        "trae/"         # Added in spec-kit 0.3.1 (#1817)
        "codex/"
        "opencode/"
    )

    # Check if branch starts with any agent prefix
    for prefix in "${agent_prefixes[@]}"; do
        if [[ "$branch" == "$prefix"* ]]; then
            return 0
        fi
    done

    # Extension branch patterns (spec-kit-extensions)
    local extension_patterns=(
        "^baseline/[0-9]{3}-"
        "^bugfix/[0-9]{3}-"
        "^enhance/[0-9]{3}-"
        "^modify/[0-9]{3}\^[0-9]{3}-"
        "^refactor/[0-9]{3}-"
        "^hotfix/[0-9]{3}-"
        "^deprecate/[0-9]{3}-"
        "^cleanup/[0-9]{3}-"
    )

    # Check extension patterns first
    for pattern in "${extension_patterns[@]}"; do
        if [[ "$branch" =~ $pattern ]]; then
            return 0
        fi
    done

    # Check standard spec-kit pattern (###-)
    if [[ "$branch" =~ ^[0-9]{3}- ]]; then
        return 0
    fi

    # No match - show helpful error
    echo "ERROR: Not on a feature branch. Current branch: $branch" >&2
    echo "Feature branches must follow one of these patterns:" >&2
    echo "  Standard:    ###-description (e.g., 001-add-user-authentication)" >&2
    echo "  Agent:       agent/description (e.g., claude/add-feature, copilot/fix-bug)" >&2
    echo "  Baseline:    baseline/###-description" >&2
    echo "  Bugfix:      bugfix/###-description" >&2
    echo "  Enhance:     enhance/###-description" >&2
    echo "  Modify:      modify/###^###-description" >&2
    echo "  Refactor:    refactor/###-description" >&2
    echo "  Hotfix:      hotfix/###-description" >&2
    echo "  Deprecate:   deprecate/###-description" >&2
    echo "  Cleanup:     cleanup/###-description" >&2
    return 1
}
fi
