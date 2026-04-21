#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [switch]$Json,
    [switch]$Help,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$IncidentDescription
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
    Write-Host 'Usage: ./create-hotfix.ps1 [-Json] <incident_description>'
    exit 0
}

if (-not $IncidentDescription -or $IncidentDescription.Count -eq 0) {
    Write-Error 'Usage: ./create-hotfix.ps1 [-Json] <incident_description>'
    exit 1
}

$incidentDescription = ($IncidentDescription -join ' ').Trim()

Resolve-CommonScript

$repoRoot = Get-RepoRoot
$hasGit = Test-HasGit

Set-Location $repoRoot

$specsDir = Join-Path $repoRoot 'specs'
New-Item -ItemType Directory -Path $specsDir -Force | Out-Null

$hotfixRoot = Join-Path $specsDir 'hotfix'
$highest = 0
if (Test-Path $hotfixRoot) {
    Get-ChildItem -Path $hotfixRoot -Directory | ForEach-Object {
        if ($_.Name -match '^(\d+)') {
            $num = [int]$matches[1]
            if ($num -gt $highest) { $highest = $num }
        }
    }
}

$next = $highest + 1
$hotfixNum = '{0:000}' -f $next
$words = Get-BranchNameFromDescription -Description $incidentDescription
$branchName = "hotfix/$hotfixNum-$words"
$hotfixId = "hotfix-$hotfixNum"

if ($hasGit) {
    try {
        git checkout -b $branchName | Out-Null
    } catch {
        Write-Warning "Failed to create git branch: $branchName"
    }
} else {
    Write-Warning "[hotfix] Warning: Git repository not detected; skipped branch creation for $branchName"
}

New-Item -ItemType Directory -Path $hotfixRoot -Force | Out-Null
$hotfixDir = Join-Path $hotfixRoot "$hotfixNum-$words"
New-Item -ItemType Directory -Path $hotfixDir -Force | Out-Null

$hotfixTemplate = Join-Path $repoRoot '.specify/extensions/workflows/templates/hotfix/hotfix-template.md'
$postmortemTemplate = Join-Path $repoRoot '.specify/extensions/workflows/templates/hotfix/post-mortem-template.md'

$hotfixFile = Join-Path $hotfixDir 'hotfix.md'
$postmortemFile = Join-Path $hotfixDir 'post-mortem.md'

if (Test-Path $hotfixTemplate) {
    Copy-Item $hotfixTemplate $hotfixFile -Force
} else {
    Set-Content -Path $hotfixFile -Value '# Hotfix'
}

if (Test-Path $postmortemTemplate) {
    Copy-Item $postmortemTemplate $postmortemFile -Force
} else {
    Set-Content -Path $postmortemFile -Value '# Post-Mortem'
}

$specLink = Join-Path $hotfixDir 'spec.md'
try {
    if (Test-Path $specLink) { Remove-Item $specLink -Force }
    New-Item -ItemType SymbolicLink -Path $specLink -Target 'hotfix.md' | Out-Null
} catch {
    Copy-Item $hotfixFile $specLink -Force
}

# Create plan.md and tasks.md as standard symlinks
$planLink = Join-Path $hotfixDir 'plan.md'
$tasksLink = Join-Path $hotfixDir 'tasks.md'
try {
    if (Test-Path $planLink) { Remove-Item $planLink -Force }
    if (Test-Path $tasksLink) { Remove-Item $tasksLink -Force }
    New-Item -ItemType SymbolicLink -Path $planLink -Target 'hotfix.md' | Out-Null
    New-Item -ItemType SymbolicLink -Path $tasksLink -Target 'hotfix.md' | Out-Null
} catch {
    Copy-Item $hotfixFile $planLink -Force
    Copy-Item $hotfixFile $tasksLink -Force
}

$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss 'UTC'")
if (Test-Path $hotfixFile) {
    $content = Get-Content -Path $hotfixFile -Raw
    $updated = [regex]::Replace($content, '\[YYYY-MM-DD HH:MM:SS UTC\]', $timestamp, 1)
    Set-Content -Path $hotfixFile -Value $updated
}

$reminderFile = Join-Path $hotfixDir 'POST_MORTEM_REMINDER.txt'
@"
POST-MORTEM REMINDER
====================

Hotfix ID: $hotfixId
Incident Start: $timestamp

⚠️  POST-MORTEM DUE WITHIN 48 HOURS ⚠️

Required Actions:
1. Complete post-mortem.md within 48 hours of incident resolution
2. Schedule post-mortem meeting with stakeholders
3. Create action items to prevent recurrence
4. Update monitoring and tests

Post-Mortem File: $postmortemFile

Do not delete this reminder until post-mortem is complete.
"@ | Set-Content -Path $reminderFile

$env:SPECIFY_HOTFIX = $hotfixId

if ($Json) {
    [PSCustomObject]@{
        HOTFIX_ID = $hotfixId
        BRANCH_NAME = $branchName
        HOTFIX_FILE = $hotfixFile
        POSTMORTEM_FILE = $postmortemFile
        HOTFIX_NUM = $hotfixNum
        TIMESTAMP = $timestamp
    } | ConvertTo-Json -Compress
} else {
    Write-Output "HOTFIX_ID: $hotfixId"
    Write-Output "BRANCH_NAME: $branchName"
    Write-Output "HOTFIX_FILE: $hotfixFile"
    Write-Output "POSTMORTEM_FILE: $postmortemFile"
    Write-Output "HOTFIX_NUM: $hotfixNum"
    Write-Output "INCIDENT_START: $timestamp"
    Write-Output ''
    Write-Output '⚠️  EMERGENCY HOTFIX - EXPEDITED PROCESS ⚠️'
    Write-Output 'Remember: Post-mortem due within 48 hours'
    Write-Output "SPECIFY_HOTFIX environment variable set to: $hotfixId"
}
