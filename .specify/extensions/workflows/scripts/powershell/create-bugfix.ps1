#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [switch]$Json,
    [switch]$Help,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$BugDescription
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
    Write-Host 'Usage: ./create-bugfix.ps1 [-Json] <bug_description>'
    exit 0
}

if (-not $BugDescription -or $BugDescription.Count -eq 0) {
    Write-Error 'Usage: ./create-bugfix.ps1 [-Json] <bug_description>'
    exit 1
}

$bugDescription = ($BugDescription -join ' ').Trim()

Resolve-CommonScript

$repoRoot = Get-RepoRoot
$hasGit = Test-HasGit

Set-Location $repoRoot

$specsDir = Join-Path $repoRoot 'specs'
New-Item -ItemType Directory -Path $specsDir -Force | Out-Null

$bugfixDir = Join-Path $specsDir 'bugfix'
$highest = 0
if (Test-Path $bugfixDir) {
    Get-ChildItem -Path $bugfixDir -Directory | ForEach-Object {
        if ($_.Name -match '^(\d+)') {
            $num = [int]$matches[1]
            if ($num -gt $highest) { $highest = $num }
        }
    }
}

$next = $highest + 1
$bugNum = '{0:000}' -f $next
$words = Get-BranchNameFromDescription -Description $bugDescription
$branchName = "bugfix/$bugNum-$words"
$bugId = "bugfix-$bugNum"

if ($hasGit) {
    try {
        git checkout -b $branchName | Out-Null
    } catch {
        Write-Warning "Failed to create git branch: $branchName"
    }
} else {
    Write-Warning "[bugfix] Warning: Git repository not detected; skipped branch creation for $branchName"
}

New-Item -ItemType Directory -Path $bugfixDir -Force | Out-Null
$bugDir = Join-Path $bugfixDir "$bugNum-$words"
New-Item -ItemType Directory -Path $bugDir -Force | Out-Null

$template = Join-Path $repoRoot '.specify/extensions/workflows/templates/bugfix/bug-report-template.md'
$bugReportFile = Join-Path $bugDir 'bug-report.md'

if (Test-Path $template) {
    Copy-Item $template $bugReportFile -Force
} else {
    Set-Content -Path $bugReportFile -Value '# Bug Report'
}

$specLink = Join-Path $bugDir 'spec.md'
try {
    if (Test-Path $specLink) { Remove-Item $specLink -Force }
    New-Item -ItemType SymbolicLink -Path $specLink -Target 'bug-report.md' | Out-Null
} catch {
    Copy-Item $bugReportFile $specLink -Force
}

# Create plan.md and tasks.md as standard symlinks
$planLink = Join-Path $bugDir 'plan.md'
$tasksLink = Join-Path $bugDir 'tasks.md'
try {
    if (Test-Path $planLink) { Remove-Item $planLink -Force }
    if (Test-Path $tasksLink) { Remove-Item $tasksLink -Force }
    New-Item -ItemType SymbolicLink -Path $planLink -Target 'bug-report.md' | Out-Null
    New-Item -ItemType SymbolicLink -Path $tasksLink -Target 'bug-report.md' | Out-Null
} catch {
    Copy-Item $bugReportFile $planLink -Force
    Copy-Item $bugReportFile $tasksLink -Force
}

$env:SPECIFY_BUGFIX = $bugId

if ($Json) {
    [PSCustomObject]@{
        BUG_ID = $bugId
        BRANCH_NAME = $branchName
        BUG_REPORT_FILE = $bugReportFile
        BUG_NUM = $bugNum
    } | ConvertTo-Json -Compress
} else {
    Write-Output "BUG_ID: $bugId"
    Write-Output "BRANCH_NAME: $branchName"
    Write-Output "BUG_REPORT_FILE: $bugReportFile"
    Write-Output "BUG_NUM: $bugNum"
    Write-Output "SPECIFY_BUGFIX environment variable set to: $bugId"
}
