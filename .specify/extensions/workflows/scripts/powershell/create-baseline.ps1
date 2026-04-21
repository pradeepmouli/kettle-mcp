#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [switch]$Json,
    [switch]$Help
)
$ErrorActionPreference = 'Stop'

function Resolve-CommonScript {
    $searchDir = $PSScriptRoot
    $commonScript = $null

    for ($i = 0; $i -lt 6 -and -not $commonScript; $i++) {
        $direct = Join-Path $searchDir 'common.ps1'
        if (Test-Path $direct) {
            $commonScript = $direct
            break
        }

        $nested = Join-Path $searchDir 'scripts/powershell/common.ps1'
        if (Test-Path $nested) {
            $commonScript = $nested
            break
        }

        $searchDir = Split-Path $searchDir -Parent
    }

    if (-not $commonScript) {
        Write-Error 'Error: Could not find common.ps1. Please ensure spec-kit is properly installed.'
        exit 1
    }

    . $commonScript

    if (-not (Get-Command Get-RepoRoot -ErrorAction SilentlyContinue)) {
        Write-Error 'Error: Get-RepoRoot is not available in common.ps1.'
        exit 1
    }
}

if ($Help) {
    Write-Host 'Usage: ./create-baseline.ps1 [-Json]'
    Write-Host 'Creates baseline documentation for the project state'
    exit 0
}

Resolve-CommonScript

$repoRoot = Get-RepoRoot
$hasGit = Test-HasGit

Set-Location $repoRoot

$specsDir = Join-Path $repoRoot 'specs'
$historyDir = Join-Path $specsDir 'history'
New-Item -ItemType Directory -Path $historyDir -Force | Out-Null

$baselineCommit = ''
$firstSpecCommit = ''
$hasExistingSpecs = $false

if ($hasGit) {
    if (Test-Path $specsDir) {
        try {
            $firstSpecCommit = git log --reverse --format="%H" -- $specsDir 2>$null | Select-Object -First 1
            if ($firstSpecCommit) {
                $hasExistingSpecs = $true
                $baselineCommit = git rev-parse "$firstSpecCommit^" 2>$null
                if (-not $baselineCommit) {
                    $baselineCommit = $firstSpecCommit
                }
            }
        } catch {
            $baselineCommit = ''
        }
    }

    if (-not $baselineCommit) {
        $baselineCommit = git rev-parse HEAD
    }
}

$baselineSpec = Join-Path $historyDir 'baseline-spec.md'
$baselineTemplate = Join-Path $repoRoot '.specify/extensions/workflows/templates/baseline/baseline-spec-template.md'

if (Test-Path $baselineTemplate) {
    Copy-Item $baselineTemplate $baselineSpec -Force
} else {
    @'
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
'@ | Set-Content -Path $baselineSpec
}

$currentState = Join-Path $historyDir 'current-state.md'
$currentStateTemplate = Join-Path $repoRoot '.specify/extensions/workflows/templates/baseline/current-state-template.md'

if (Test-Path $currentStateTemplate) {
    Copy-Item $currentStateTemplate $currentState -Force
} else {
    @'
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
'@ | Set-Content -Path $currentState
}

# Create symlinks for standard spec-kit artifact names
$specLink = Join-Path $historyDir 'spec.md'
$planLink = Join-Path $historyDir 'plan.md'
$tasksLink = Join-Path $historyDir 'tasks.md'
try {
    if (Test-Path $specLink) { Remove-Item $specLink -Force }
    if (Test-Path $planLink) { Remove-Item $planLink -Force }
    if (Test-Path $tasksLink) { Remove-Item $tasksLink -Force }
    New-Item -ItemType SymbolicLink -Path $specLink -Target 'baseline-spec.md' | Out-Null
    New-Item -ItemType SymbolicLink -Path $planLink -Target 'current-state.md' | Out-Null
    New-Item -ItemType SymbolicLink -Path $tasksLink -Target 'current-state.md' | Out-Null
} catch {
    Copy-Item $baselineSpec $specLink -Force
    Copy-Item $currentState $planLink -Force
    Copy-Item $currentState $tasksLink -Force
}

$baselineId = "baseline-$(Get-Date -Format 'yyyyMMdd')"

if ($Json) {
    [PSCustomObject]@{
        BASELINE_ID = $baselineId
        BASELINE_SPEC = $baselineSpec
        CURRENT_STATE = $currentState
        HISTORY_DIR = $historyDir
        HAS_EXISTING_SPECS = $hasExistingSpecs
        BASELINE_COMMIT = $baselineCommit
    } | ConvertTo-Json -Compress
} else {
    Write-Output "BASELINE_ID: $baselineId"
    Write-Output "BASELINE_SPEC: $baselineSpec"
    Write-Output "CURRENT_STATE: $currentState"
    Write-Output "HISTORY_DIR: $historyDir"
    Write-Output "HAS_EXISTING_SPECS: $hasExistingSpecs"
    if ($baselineCommit) {
        Write-Output "BASELINE_COMMIT: $baselineCommit"
        if ($hasExistingSpecs) {
            Write-Output 'Note: Using project state before first spec-kit commit'
        }
    }
}
