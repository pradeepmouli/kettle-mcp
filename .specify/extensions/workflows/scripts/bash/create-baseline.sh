#!/usr/bin/env bash

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

JSON_MODE=false
for arg in "$@"; do
    case "$arg" in
        --json) JSON_MODE=true ;;
        --help|-h)
            echo "Usage: $0 [--json]"
            echo "Creates baseline documentation for the project state"
            exit 0
            ;;
        *)
            echo "Unknown argument: $arg" >&2
            echo "Usage: $0 [--json]" >&2
            exit 1
            ;;
    esac
done

# Use spec-kit common functions
REPO_ROOT=$(get_repo_root)
HAS_GIT=$(has_git && echo "true" || echo "false")

cd "$REPO_ROOT"

SPECS_DIR="$REPO_ROOT/specs"
HISTORY_DIR="$SPECS_DIR/history"
mkdir -p "$HISTORY_DIR"

# Determine baseline commit
BASELINE_COMMIT=""
FIRST_SPECKIT_COMMIT=""
HAS_EXISTING_SPECS=false

if [ "$HAS_GIT" = true ]; then
    # Check if specs directory has any commits
    if [ -d "$SPECS_DIR" ]; then
        # Find first commit that created or modified anything in specs/
        FIRST_SPECKIT_COMMIT=$(git log --reverse --format="%H" -- "$SPECS_DIR" 2>/dev/null | head -1 || echo "")

        if [ -n "$FIRST_SPECKIT_COMMIT" ]; then
            HAS_EXISTING_SPECS=true
            # Get the commit before the first spec-kit commit
            BASELINE_COMMIT=$(git rev-parse "${FIRST_SPECKIT_COMMIT}^" 2>/dev/null || echo "")

            # If we can't get parent (first commit in repo), use the first commit itself
            if [ -z "$BASELINE_COMMIT" ]; then
                BASELINE_COMMIT="$FIRST_SPECKIT_COMMIT"
            fi
        fi
    fi

    # If no baseline found yet, use current HEAD
    if [ -z "$BASELINE_COMMIT" ]; then
        BASELINE_COMMIT=$(git rev-parse HEAD)
    fi
fi

# Create baseline-spec.md
BASELINE_SPEC="$HISTORY_DIR/baseline-spec.md"
BASELINE_TEMPLATE=$(resolve_workflow_template "baseline/baseline-spec-template.md" "$REPO_ROOT")

if [ -f "$BASELINE_TEMPLATE" ]; then
    cp "$BASELINE_TEMPLATE" "$BASELINE_SPEC"
else
    cat > "$BASELINE_SPEC" << 'EOF'
# Project Baseline Specification

**Generated**: [DATE]
**Baseline Commit**: [COMMIT]
**Purpose**: Establish context for all future specifications and modifications

## Executive Summary

[High-level description of what the project does and its primary purpose]

## Project Structure

### Directory Layout
```
[Project directory structure]
```

### Key Components
- **[Component 1]**: [Description]
- **[Component 2]**: [Description]
- **[Component 3]**: [Description]

## Architecture

### System Overview
[Architectural diagram or description]

### Technology Stack
- **Language(s)**: [Languages used]
- **Framework(s)**: [Frameworks]
- **Database**: [Database technology]
- **Infrastructure**: [Deployment/hosting]

### Design Patterns
[Key architectural patterns used]

## Core Functionality

### Primary Features
1. **[Feature 1]**: [Description]
2. **[Feature 2]**: [Description]
3. **[Feature 3]**: [Description]

### User Workflows
[Description of main user journeys]

## Data Model

### Core Entities
[Key data structures/models]

### Relationships
[How entities relate to each other]

## External Dependencies

### Third-party Libraries
[List of major dependencies]

### External Services
[APIs, services the project depends on]

## Build and Deployment

### Build Process
[How to build the project]

### Testing Strategy
[Testing approach and test coverage]

### Deployment Process
[How the project is deployed]

## Configuration

### Environment Variables
[Key configuration options]

### Feature Flags
[Any feature flags or toggles]

## Known Issues and Technical Debt

### Current Limitations
[Known limitations]

### Technical Debt
[Areas needing improvement]

## Future Considerations

### Planned Improvements
[Known future work]

### Scalability Concerns
[Performance/scaling considerations]

---
*Baseline spec created using `/speckit.baseline` workflow*
EOF
fi

# Create current-state.md
CURRENT_STATE="$HISTORY_DIR/current-state.md"
CURRENT_STATE_TEMPLATE=$(resolve_workflow_template "baseline/current-state-template.md" "$REPO_ROOT")

if [ -f "$CURRENT_STATE_TEMPLATE" ]; then
    cp "$CURRENT_STATE_TEMPLATE" "$CURRENT_STATE"
else
    cat > "$CURRENT_STATE" << 'EOF'
# Current Project State

**Generated**: [DATE]
**Last Updated**: [DATE]

## Purpose

This document tracks all changes to the project, organized by specification and workflow type. It provides a comprehensive view of project evolution from the baseline.

## Change Summary

### By Workflow Type
- **Features**: [Count] new features implemented
- **Modifications**: [Count] feature modifications
- **Bugfixes**: [Count] bugs fixed
- **Refactors**: [Count] code quality improvements
- **Hotfixes**: [Count] emergency fixes
- **Deprecations**: [Count] features deprecated
- **Unspecified**: [Count] changes without specs

### By Status
- **Completed**: [Count]
- **In Progress**: [Count]
- **Planned**: [Count]

## Features (New Development)

### Completed Features
[List of completed features from specs/###-* directories]

### In Progress Features
[Features currently being developed]

## Modifications

### Feature Modifications
[List from specs/###-*/modifications/ directories]

## Bugfixes

### Fixed Bugs
[List from specs/bugfix/ directory]

### Known Bugs
[Open bug reports]

## Refactors

### Code Quality Improvements
[List from specs/refactor/ directory]

## Hotfixes

### Production Fixes
[List from specs/hotfix/ directory]

## Deprecations

### Sunset Features
[List from specs/deprecate/ directory]

## Unspecified Changes

### Changes Without Specs
[Git commits not associated with any spec - requires analysis]

## Statistics

### Code Metrics
- **Total Commits**: [Count]
- **Files Changed**: [Count]
- **Lines Added**: [Count]
- **Lines Removed**: [Count]

### Specification Coverage
- **Specified Changes**: [Percentage]%
- **Unspecified Changes**: [Percentage]%

---
*Current state document maintained by `/speckit.baseline` workflow*
EOF
fi

# Create symlinks for standard spec-kit artifact names
ln -sf "baseline-spec.md" "$HISTORY_DIR/spec.md"
ln -sf "current-state.md" "$HISTORY_DIR/plan.md"
ln -sf "current-state.md" "$HISTORY_DIR/tasks.md"

BASELINE_ID="baseline-$(date +%Y%m%d)"

if $JSON_MODE; then
    printf '{"BASELINE_ID":"%s","BASELINE_SPEC":"%s","CURRENT_STATE":"%s","HISTORY_DIR":"%s","HAS_EXISTING_SPECS":"%s","BASELINE_COMMIT":"%s"}\n' \
        "$BASELINE_ID" "$BASELINE_SPEC" "$CURRENT_STATE" "$HISTORY_DIR" "$HAS_EXISTING_SPECS" "$BASELINE_COMMIT"
else
    echo "BASELINE_ID: $BASELINE_ID"
    echo "BASELINE_SPEC: $BASELINE_SPEC"
    echo "CURRENT_STATE: $CURRENT_STATE"
    echo "HISTORY_DIR: $HISTORY_DIR"
    echo "HAS_EXISTING_SPECS: $HAS_EXISTING_SPECS"
    if [ -n "$BASELINE_COMMIT" ]; then
        echo "BASELINE_COMMIT: $BASELINE_COMMIT"
        if [ "$HAS_EXISTING_SPECS" = true ]; then
            echo "Note: Using project state before first spec-kit commit"
        fi
    fi
fi
