#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [switch]$Json,
    [switch]$Help,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$EnhancementDescription
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
    Write-Host 'Usage: ./create-enhance.ps1 [-Json] <enhancement_description>'
    exit 0
}

if (-not $EnhancementDescription -or $EnhancementDescription.Count -eq 0) {
    Write-Error 'Usage: ./create-enhance.ps1 [-Json] <enhancement_description>'
    exit 1
}

$enhancementDescription = ($EnhancementDescription -join ' ').Trim()

Resolve-CommonScript

$repoRoot = Get-RepoRoot
$hasGit = Test-HasGit

Set-Location $repoRoot

$specsDir = Join-Path $repoRoot 'specs'
New-Item -ItemType Directory -Path $specsDir -Force | Out-Null

$enhanceDir = Join-Path $specsDir 'enhance'
$highest = 0
if (Test-Path $enhanceDir) {
    Get-ChildItem -Path $enhanceDir -Directory | ForEach-Object {
        if ($_.Name -match '^(\d+)') {
            $num = [int]$matches[1]
            if ($num -gt $highest) { $highest = $num }
        }
    }
}

$next = $highest + 1
$enhanceNum = '{0:000}' -f $next
$words = Get-BranchNameFromDescription -Description $enhancementDescription
$branchName = "enhance/$enhanceNum-$words"
$enhanceId = "enhance-$enhanceNum"

if ($hasGit) {
    try {
        git checkout -b $branchName | Out-Null
    } catch {
        Write-Warning "Failed to create git branch: $branchName"
    }
} else {
    Write-Warning "[enhance] Warning: Git repository not detected; skipped branch creation for $branchName"
}

New-Item -ItemType Directory -Path $enhanceDir -Force | Out-Null
$enhancementDir = Join-Path $enhanceDir "$enhanceNum-$words"
New-Item -ItemType Directory -Path $enhancementDir -Force | Out-Null

$template = Join-Path $repoRoot '.specify/extensions/workflows/templates/enhance/enhancement-template.md'
$enhancementFile = Join-Path $enhancementDir 'enhancement.md'

if (Test-Path $template) {
    Copy-Item $template $enhancementFile -Force
} else {
    Set-Content -Path $enhancementFile -Value '# Enhancement'
}

$specLink = Join-Path $enhancementDir 'spec.md'
try {
    if (Test-Path $specLink) { Remove-Item $specLink -Force }
    New-Item -ItemType SymbolicLink -Path $specLink -Target 'enhancement.md' | Out-Null
} catch {
    Copy-Item $enhancementFile $specLink -Force
}

# Create plan.md and tasks.md as standard symlinks
$planLink = Join-Path $enhancementDir 'plan.md'
$tasksLink = Join-Path $enhancementDir 'tasks.md'
try {
    if (Test-Path $planLink) { Remove-Item $planLink -Force }
    if (Test-Path $tasksLink) { Remove-Item $tasksLink -Force }
    New-Item -ItemType SymbolicLink -Path $planLink -Target 'enhancement.md' | Out-Null
    New-Item -ItemType SymbolicLink -Path $tasksLink -Target 'enhancement.md' | Out-Null
} catch {
    Copy-Item $enhancementFile $planLink -Force
    Copy-Item $enhancementFile $tasksLink -Force
}

$env:SPECIFY_ENHANCE = $enhanceId

if ($Json) {
    [PSCustomObject]@{
        ENHANCE_ID = $enhanceId
        BRANCH_NAME = $branchName
        ENHANCEMENT_FILE = $enhancementFile
        ENHANCE_NUM = $enhanceNum
    } | ConvertTo-Json -Compress
} else {
    Write-Output "ENHANCE_ID: $enhanceId"
    Write-Output "BRANCH_NAME: $branchName"
    Write-Output "ENHANCEMENT_FILE: $enhancementFile"
    Write-Output "ENHANCE_NUM: $enhanceNum"
    Write-Output "SPECIFY_ENHANCE environment variable set to: $enhanceId"
}
