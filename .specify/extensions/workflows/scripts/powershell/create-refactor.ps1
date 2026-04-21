#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [switch]$Json,
    [switch]$Help,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$RefactorDescription
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

function Get-BranchNameFromDescription {
    param([string]$Description)

    $stopWords = @(
        'i', 'a', 'an', 'the', 'to', 'for', 'of', 'in', 'on', 'at', 'by', 'with', 'from',
        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall',
        'this', 'that', 'these', 'those', 'my', 'your', 'our', 'their',
        'want', 'need', 'add', 'get', 'set'
    )

    $cleanName = ($Description.ToLower() -replace '[^a-z0-9]', ' ')
    $words = $cleanName -split '\s+' | Where-Object { $_ }

    $meaningfulWords = @()
    foreach ($word in $words) {
        if ($stopWords -contains $word) { continue }
        if ($word.Length -ge 3) {
            $meaningfulWords += $word
        } elseif ($Description -match "\b$($word.ToUpper())\b") {
            $meaningfulWords += $word
        }
    }

    if ($meaningfulWords.Count -gt 0) {
        $maxWords = if ($meaningfulWords.Count -eq 4) { 4 } else { 3 }
        return ($meaningfulWords | Select-Object -First $maxWords) -join '-'
    }

    $cleaned = $Description.ToLower() -replace '[^a-z0-9]', '-' -replace '-{2,}', '-' -replace '^-', '' -replace '-$', ''
    $fallbackWords = $cleaned -split '-' | Where-Object { $_ } | Select-Object -First 3
    return ($fallbackWords -join '-')
}

if ($Help) {
    Write-Host 'Usage: ./create-refactor.ps1 [-Json] <refactoring_description>'
    exit 0
}

if (-not $RefactorDescription -or $RefactorDescription.Count -eq 0) {
    Write-Error 'Usage: ./create-refactor.ps1 [-Json] <refactoring_description>'
    exit 1
}

$refactorDescription = ($RefactorDescription -join ' ').Trim()

Resolve-CommonScript

$repoRoot = Get-RepoRoot
$hasGit = Test-HasGit

Set-Location $repoRoot

$specsDir = Join-Path $repoRoot 'specs'
New-Item -ItemType Directory -Path $specsDir -Force | Out-Null

$refactorRoot = Join-Path $specsDir 'refactor'
$highest = 0
if (Test-Path $refactorRoot) {
    Get-ChildItem -Path $refactorRoot -Directory | ForEach-Object {
        if ($_.Name -match '^(\d+)') {
            $num = [int]$matches[1]
            if ($num -gt $highest) { $highest = $num }
        }
    }
}

$next = $highest + 1
$refactorNum = '{0:000}' -f $next
$words = Get-BranchNameFromDescription -Description $refactorDescription
$branchName = "refactor/$refactorNum-$words"
$refactorId = "refactor-$refactorNum"

if ($hasGit) {
    try {
        git checkout -b $branchName | Out-Null
    } catch {
        Write-Warning "Failed to create git branch: $branchName"
    }
} else {
    Write-Warning "[refactor] Warning: Git repository not detected; skipped branch creation for $branchName"
}

New-Item -ItemType Directory -Path $refactorRoot -Force | Out-Null
$refactorDir = Join-Path $refactorRoot "$refactorNum-$words"
New-Item -ItemType Directory -Path $refactorDir -Force | Out-Null

$template = Join-Path $repoRoot '.specify/extensions/workflows/templates/refactor/refactor-template.md'
$refactorSpecFile = Join-Path $refactorDir 'refactor-spec.md'

if (Test-Path $template) {
    Copy-Item $template $refactorSpecFile -Force
} else {
    Set-Content -Path $refactorSpecFile -Value '# Refactor Spec'
}

$specLink = Join-Path $refactorDir 'spec.md'
try {
    if (Test-Path $specLink) { Remove-Item $specLink -Force }
    New-Item -ItemType SymbolicLink -Path $specLink -Target 'refactor-spec.md' | Out-Null
} catch {
    Copy-Item $refactorSpecFile $specLink -Force
}

# Create plan.md and tasks.md as standard symlinks
$planLink = Join-Path $refactorDir 'plan.md'
$tasksLink = Join-Path $refactorDir 'tasks.md'
try {
    if (Test-Path $planLink) { Remove-Item $planLink -Force }
    if (Test-Path $tasksLink) { Remove-Item $tasksLink -Force }
    New-Item -ItemType SymbolicLink -Path $planLink -Target 'refactor-spec.md' | Out-Null
    New-Item -ItemType SymbolicLink -Path $tasksLink -Target 'refactor-spec.md' | Out-Null
} catch {
    Copy-Item $refactorSpecFile $planLink -Force
    Copy-Item $refactorSpecFile $tasksLink -Force
}

$metricsBefore = Join-Path $refactorDir 'metrics-before.md'
$metricsAfter = Join-Path $refactorDir 'metrics-after.md'
@"
# Baseline Metrics (Before Refactoring)

**Status**: Automatically captured during workflow creation

Baseline metrics are automatically captured when the refactor workflow is created.

If you need to re-capture baseline metrics, run:

```bash
.specify/extensions/workflows/templates/refactor/measure-metrics.sh --before --dir "$refactorDir"
```

This should be done BEFORE making any code changes.
"@ | Set-Content -Path $metricsBefore

# NOTE:
# The metrics measurement is currently implemented as a bash script
# located at `.specify/extensions/workflows/templates/refactor/measure-metrics.sh`.
# When using this PowerShell workflow, you will need to invoke the bash script
# manually (as shown in the instructions above) or ensure bash is available
# on your system to run the script via `bash measure-metrics.sh`.

@"
# Post-Refactoring Metrics (After Refactoring)

**Status**: Not yet captured

Run the following command to capture post-refactoring metrics:

```bash
.specify/extensions/workflows/templates/refactor/measure-metrics.sh --after --dir "$refactorDir"
```

This should be done AFTER refactoring is complete and all tests pass.
"@ | Set-Content -Path $metricsAfter

$behavioralSnapshot = Join-Path $refactorDir 'behavioral-snapshot.md'
@"
# Behavioral Snapshot

**Purpose**: Document observable behavior before refactoring to verify it's preserved after.

## Key Behaviors to Preserve

### Behavior 1: [Description]
**Input**: [Specific input data/conditions]
**Expected Output**: [Exact expected result]
**Actual Output** (before): [Run and document]
**Actual Output** (after): [Re-run after refactoring - must match]

### Behavior 2: [Description]
**Input**: [Specific input data/conditions]
**Expected Output**: [Exact expected result]
**Actual Output** (before): [Run and document]
**Actual Output** (after): [Re-run after refactoring - must match]

### Behavior 3: [Description]
**Input**: [Specific input data/conditions]
**Expected Output**: [Exact expected result]
**Actual Output** (before): [Run and document]
**Actual Output** (after): [Re-run after refactoring - must match]

## Test Commands
```bash
# Commands to reproduce behaviors
npm test -- [specific test]
npm run dev # Manual testing steps...
```

---
*Update this file with actual behaviors before starting refactoring*
"@ | Set-Content -Path $behavioralSnapshot

$env:SPECIFY_REFACTOR = $refactorId

# Capture baseline metrics automatically
$measureScript = Join-Path $repoRoot '.specify/extensions/workflows/templates/refactor/measure-metrics.sh'
if (Test-Path $measureScript) {
    if (-not $Json) {
        Write-Output ""
        Write-Output "=== Capturing Baseline Metrics ==="
        Write-Output ""
    }

    # Try to run the bash script
    try {
        $bashAvailable = Get-Command bash -ErrorAction SilentlyContinue
        if ($bashAvailable) {
            # Make script executable (Unix-like systems)
            if ($IsLinux -or $IsMacOS) {
                chmod +x $measureScript
            }

            # Run the measure-metrics script
            $metricsResult = bash $measureScript --before --dir $refactorDir
            if ($LASTEXITCODE -eq 0) {
                if (-not $Json) {
                    Write-Output ""
                    Write-Output "✓ Baseline metrics captured successfully"
                    Write-Output ""
                }
            } else {
                if (-not $Json) {
                    Write-Output ""
                    Write-Warning "Failed to capture baseline metrics automatically"
                    Write-Output "  Run manually: bash .specify/extensions/workflows/templates/refactor/measure-metrics.sh --before --dir $refactorDir"
                    Write-Output ""
                }
            }
        } else {
            if (-not $Json) {
                Write-Output ""
                Write-Warning "Bash not found. Please run baseline metrics manually:"
                Write-Output "  bash .specify/extensions/workflows/templates/refactor/measure-metrics.sh --before --dir $refactorDir"
                Write-Output ""
            }
        }
    } catch {
        if (-not $Json) {
            Write-Output ""
            Write-Warning "Failed to capture baseline metrics automatically: $($_.Exception.Message)"
            Write-Output "  Run manually: bash .specify/extensions/workflows/templates/refactor/measure-metrics.sh --before --dir $refactorDir"
            Write-Output ""
        }
    }
} else {
    if (-not $Json) {
        Write-Output ""
        Write-Warning "measure-metrics.sh not found at $measureScript"
        Write-Output "  Baseline metrics must be captured manually"
        Write-Output ""
    }
}

if ($Json) {
    [PSCustomObject]@{
        REFACTOR_ID = $refactorId
        BRANCH_NAME = $branchName
        REFACTOR_SPEC_FILE = $refactorSpecFile
        METRICS_BEFORE = $metricsBefore
        METRICS_AFTER = $metricsAfter
        BEHAVIORAL_SNAPSHOT = $behavioralSnapshot
        REFACTOR_NUM = $refactorNum
    } | ConvertTo-Json -Compress
} else {
    Write-Output "REFACTOR_ID: $refactorId"
    Write-Output "BRANCH_NAME: $branchName"
    Write-Output "REFACTOR_SPEC_FILE: $refactorSpecFile"
    Write-Output "METRICS_BEFORE: $metricsBefore"
    Write-Output "METRICS_AFTER: $metricsAfter"
    Write-Output "BEHAVIORAL_SNAPSHOT: $behavioralSnapshot"
    Write-Output "REFACTOR_NUM: $refactorNum"
    Write-Output "SPECIFY_REFACTOR environment variable set to: $refactorId"
}
