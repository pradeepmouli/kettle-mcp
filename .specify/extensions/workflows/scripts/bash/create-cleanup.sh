#!/usr/bin/env bash

set -euo pipefail

# Cleanup workflow - validates and reorganizes spec-kit artifacts
# IMPORTANT: This script only moves/renames documentation in specs/, never code files

JSON_MODE=false
DRY_RUN=false
AUTO_FIX=false
ARGS=()

for arg in "$@"; do
    case "$arg" in
        --json) JSON_MODE=true ;;
        --dry-run) DRY_RUN=true ;;
        --auto-fix) AUTO_FIX=true ;;
        --help|-h)
            echo "Usage: $0 [--json] [--dry-run] [--auto-fix] [reason]"
            echo ""
            echo "Validates spec-kit artifact structure and optionally fixes issues."
            echo ""
            echo "Options:"
            echo "  --json       Output in JSON format"
            echo "  --dry-run    Show what would be done without making changes"
            echo "  --auto-fix   Automatically fix numbering and organization issues"
            echo "  reason       Optional: reason for cleanup (for documentation)"
            echo ""
            echo "This script validates:"
            echo "  - Sequential numbering of specs (001, 002, 003, etc.)"
            echo "  - Correct directory structure under specs/"
            echo "  - Presence of required files (spec.md, etc.)"
            echo "  - No gaps or duplicate numbers"
            echo ""
            echo "IMPORTANT: Only moves/renames docs in specs/, never touches code files"
            exit 0
            ;;
        *) ARGS+=("$arg") ;;
    esac
done

CLEANUP_REASON="${ARGS[*]}"
if [ -z "$CLEANUP_REASON" ]; then
    CLEANUP_REASON="Validate and organize spec-kit artifacts"
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

# Check if specs directory exists
if [ ! -d "$SPECS_DIR" ]; then
    if $JSON_MODE; then
        echo '{"status":"success","message":"No specs directory found - nothing to clean up","issues":[]}'
    else
        echo "✓ No specs directory found - nothing to clean up"
    fi
    exit 0
fi

# Array to store issues found
declare -a ISSUES=()
declare -a ACTIONS=()
HAS_ERRORS=false
HAS_UNFIXABLE_ERRORS=false

# Function to add an issue
add_issue() {
    local severity="$1"
    local message="$2"
        local auto_fixable="${3:-false}"
    ISSUES+=("[$severity] $message")
    if [[ "$severity" == "ERROR" ]] && [[ "$auto_fixable" != "true" ]]; then
        HAS_UNFIXABLE_ERRORS=true
    fi
    if [[ "$severity" == "ERROR" ]]; then
        HAS_ERRORS=true
    fi
}

# Function to add an action
add_action() {
    local action="$1"
    ACTIONS+=("$action")
}

# Validate numbered spec directories under a given path. When skip_known_subdirs is true,
# we ignore workflow subdirectories like bugfix/, modify/, etc. to allow processing
# top-level numbered specs (features) independently.
validate_workflow_directory() {
    local workflow_dir="$1"
    local workflow_type="$2"
    local skip_known_subdirs="$3"

    [ -d "$workflow_dir" ] || return 0

    # Collect all numbered directories (scoped per workflow_dir)
    local numbers=()
    declare -A dir_map=()
    declare -A dup_check=()

    for dir in "$workflow_dir"/*/; do
        [ -d "$dir" ] || continue
        local dirname
        dirname=$(basename "$dir")

        # Skip other workflow directories when scanning the root specs/ directory
        if [[ "$skip_known_subdirs" == "true" ]]; then
            if [[ " ${WORKFLOW_TYPES[@]} " =~ " ${dirname} " ]] || [[ "$dirname" == "cleanup" ]]; then
                continue
            fi

            # Detect workflow-prefixed directories at wrong level (e.g., bugfix-001-*, refactor-002-*)
            if [[ "$dirname" =~ ^(bugfix|modify|refactor|hotfix|deprecate)-([0-9]{3})-(.+)$ ]]; then
                local wrong_workflow="${BASH_REMATCH[1]}"
                local wrong_number="${BASH_REMATCH[2]}"
                local wrong_suffix="${BASH_REMATCH[3]}"
                add_issue "ERROR" "Misplaced workflow directory: $dirname should be in $wrong_workflow/$wrong_number-$wrong_suffix/" "true"
                if $AUTO_FIX; then
                    add_misplaced_dir "$dir" "$SPECS_DIR/$wrong_workflow/$wrong_number-$wrong_suffix"
                    add_action "Move $dirname to $wrong_workflow/$wrong_number-$wrong_suffix/"
                fi
                continue
            fi

            # Detect unrecognized workflow directories
            if [[ ! "$dirname" =~ ^([0-9]{3})- ]]; then
                add_issue "WARNING" "Unrecognized directory in specs/: $dirname (not a numbered spec or known workflow type)"
            fi
        fi

        # Extract number from directory name (001, 002, etc.)
        if [[ "$dirname" =~ ^([0-9]{3})- ]]; then
            local number="${BASH_REMATCH[1]}"
            local number_int=$((10#$number))

            # Check for duplicates within this workflow directory only
            if [[ -n "${dup_check[$number_int]}" ]]; then
                add_issue "ERROR" "Duplicate number in $workflow_type/: $(printf "%03d" $number_int) (found in ${dup_check[$number_int]} and $dirname)"
            else
                numbers+=($number_int)
                dir_map[$number_int]="$dirname"
                dup_check[$number_int]="$dirname"
            fi
        else
            # For top-level scan, ignore non-numbered directories; for workflow dirs flag errors
            if [[ "$skip_known_subdirs" == "true" ]]; then
                continue
            else
                add_issue "ERROR" "Invalid directory name in $workflow_type/: $dirname (should start with 3-digit number)"
            fi
        fi
    done

    # Skip if no numbered directories
    [ ${#numbers[@]} -eq 0 ] && return 0

    # Sort numbers
    IFS=$'\n' sorted_numbers=($(sort -n <<<"${numbers[*]}"))
    unset IFS

    # Check for gaps and suggest renumbering
    local expected=1
    local needs_renumber=false
    for num in "${sorted_numbers[@]}"; do
        if [ $num -ne $expected ]; then
            needs_renumber=true
            break
        fi
        expected=$((num + 1))
    done

    if $needs_renumber; then
        add_issue "INFO" "Non-sequential numbering in $workflow_type/ (gaps detected)"
        if $AUTO_FIX; then
            # Don't auto-fix if there are ERROR-level issues (like duplicates)
            if $HAS_UNFIXABLE_ERRORS; then
                add_action "Cannot auto-fix $workflow_type/: resolve ERROR-level issues first (e.g., duplicates)"
            else
                add_action "Renumber $workflow_type/ directories to be sequential"

                # Perform renumbering if not dry-run
                if ! $DRY_RUN; then
                    # Create temp directory for safe renaming
                    temp_dir=$(mktemp -d "$workflow_dir/.tmp.XXXXXX")

                    # Move all numbered directories to temp with new numbers
                    counter=1
                    for num in "${sorted_numbers[@]}"; do
                        old_dir="$workflow_dir/${dir_map[$num]}"
                        new_num=$(printf "%03d" $counter)

                        # Extract suffix (everything after the number and dash)
                        old_name="${dir_map[$num]}"
                        suffix="${old_name#*-}"
                        new_name="${new_num}-${suffix}"

                        mv "$old_dir" "$temp_dir/$new_name"
                        counter=$((counter + 1))
                    done

                    # Move back from temp to workflow directory
                    shopt -s nullglob
                    move_error=false
                    for item in "$temp_dir"/*; do
                        if ! mv "$item" "$workflow_dir/"; then
                            move_error=true
                        fi
                    done
                    shopt -u nullglob

                    if ! rmdir "$temp_dir"; then
                        echo "Error: Failed to remove temporary directory '$temp_dir'" >&2
                        move_error=true
                    fi

                    if $move_error; then
                        echo "Error: One or more operations failed while renumbering '$workflow_type/' directories." >&2
                        exit 1
                    fi

                    add_action "✓ Renumbered $workflow_type/ directories"
                fi
            fi
        else
            add_action "Run with --auto-fix to renumber $workflow_type/ directories sequentially"
        fi
    fi

    # Validate required files in each directory
    for num in "${sorted_numbers[@]}"; do
        dir_path="$workflow_dir/${dir_map[$num]}"

        # Check for spec.md or workflow-specific spec files
        has_spec=false
        case "$workflow_type" in
            bugfix)
                [ -f "$dir_path/bug-report.md" ] && has_spec=true
                ;;
            refactor)
                [ -f "$dir_path/refactor-spec.md" ] && has_spec=true
                ;;
            hotfix)
                [ -f "$dir_path/hotfix.md" ] && has_spec=true
                ;;
            deprecate)
                [ -f "$dir_path/deprecation-plan.md" ] && has_spec=true
                ;;
            modify)
                [ -f "$dir_path/modification-spec.md" ] && has_spec=true
                ;;
            features)
                [ -f "$dir_path/feature-spec.md" ] && has_spec=true
                ;;
        esac

        # Also check for generic spec.md
        [ -f "$dir_path/spec.md" ] && has_spec=true

        if ! $has_spec; then
            add_issue "WARNING" "Missing spec file in ${dir_map[$num]}"
        fi
    done
}

# Array to track misplaced directories for auto-fix
declare -a MISPLACED_DIRS=()

# Function to add misplaced directory for later fix
add_misplaced_dir() {
    local source="$1"
    local target="$2"
    MISPLACED_DIRS+=("$source|$target")
}

# Function to move misplaced directories
fix_misplaced_directories() {
    if [ ${#MISPLACED_DIRS[@]} -eq 0 ]; then
        return 0
    fi

    if $DRY_RUN; then
        return 0
    fi

    for entry in "${MISPLACED_DIRS[@]}"; do
        IFS='|' read -r source target <<< "$entry"

        # Ensure target workflow directory exists
        target_workflow_dir=$(dirname "$target")
        if [ ! -d "$target_workflow_dir" ]; then
            mkdir -p "$target_workflow_dir"
        fi

        # Move the directory
        if mv "$source" "$target"; then
            add_action "✓ Moved $(basename "$source") to $target"
        else
            echo "Error: Failed to move $source to $target" >&2
            exit 1
        fi
    done
}

# Validate workflow subdirectories
# Expected: bugfix/, modify/, refactor/, hotfix/, deprecate/, features/
WORKFLOW_TYPES=("bugfix" "modify" "refactor" "hotfix" "deprecate" "features")

# Collect all directories in specs/
declare -A WORKFLOW_DIRS
for workflow_type in "${WORKFLOW_TYPES[@]}"; do
    if [ -d "$SPECS_DIR/$workflow_type" ]; then
        WORKFLOW_DIRS[$workflow_type]=1
    fi
done

# Validate numbered directories directly under specs/ (features stored at root)
validate_workflow_directory "$SPECS_DIR" "features" true

# Validate each workflow subdirectory
for workflow_type in "${WORKFLOW_TYPES[@]}"; do
    workflow_dir="$SPECS_DIR/$workflow_type"
    validate_workflow_directory "$workflow_dir" "$workflow_type" false
done

# Apply auto-fixes for misplaced directories if enabled
if $AUTO_FIX; then
    fix_misplaced_directories
fi

# Output results
if $JSON_MODE; then
    # Build JSON array of issues
    issues_json="["
    first=true
    for issue in "${ISSUES[@]}"; do
        if $first; then
            first=false
        else
            issues_json+=","
        fi
        # Properly escape JSON special characters (backslash first, then quotes)
        escaped_issue="${issue//\\/\\\\}"
        escaped_issue="${escaped_issue//\"/\\\"}"
        escaped_issue="${escaped_issue//$'\n'/\\n}"
        escaped_issue="${escaped_issue//$'\r'/\\r}"
        escaped_issue="${escaped_issue//$'\t'/\\t}"
        issues_json+="\"$escaped_issue\""
    done
    issues_json+="]"

    # Build JSON array of actions
    actions_json="["
    first=true
    for action in "${ACTIONS[@]}"; do
        if $first; then
            first=false
        else
            actions_json+=","
        fi
        # Properly escape JSON special characters (backslash first, then quotes)
        escaped_action="${action//\\/\\\\}"
        escaped_action="${escaped_action//\"/\\\"}"
        escaped_action="${escaped_action//$'\n'/\\n}"
        escaped_action="${escaped_action//$'\r'/\\r}"
        escaped_action="${escaped_action//$'\t'/\\t}"
        actions_json+="\"$escaped_action\""
    done
    actions_json+="]"

    if [ ${#ISSUES[@]} -eq 0 ]; then
        status="success"
        message="Spec structure is valid"
    else
        status="issues_found"
        message="Found ${#ISSUES[@]} issue(s)"
    fi

    printf '{"status":"%s","message":"%s","issues":%s,"actions":%s}\n' \
        "$status" "$message" "$issues_json" "$actions_json"
else
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  Spec-Kit Cleanup Report"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""

    if [ ${#ISSUES[@]} -eq 0 ]; then
        echo "✓ No issues found - spec structure is valid"
    else
        echo "Issues found: ${#ISSUES[@]}"
        echo ""
        for issue in "${ISSUES[@]}"; do
            echo "  $issue"
        done
    fi

    echo ""

    if [ ${#ACTIONS[@]} -gt 0 ]; then
        if $DRY_RUN; then
            echo "Actions suggested:"
        else
            echo "Actions taken:"
        fi
        echo ""
        for action in "${ACTIONS[@]}"; do
            echo "  $action"
        done
        echo ""
    fi

    if $DRY_RUN; then
        echo "💡 This was a dry run. Run without --dry-run to apply changes."
    fi

    if [ ${#ISSUES[@]} -gt 0 ] && ! $AUTO_FIX; then
        echo "💡 Run with --auto-fix to automatically fix numbering issues."
    fi
fi

# Exit with appropriate code
if [ ${#ISSUES[@]} -eq 0 ]; then
    exit 0
else
    exit 1
fi
