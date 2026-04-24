#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [switch]$Json,
    [switch]$ListFeatures,
    [switch]$Help,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Args
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
    Write-Host 'Usage: ./create-modification.ps1 [-Json] [-ListFeatures] [<feature-number>] <modification-description>'
    Write-Host 'Example: ./create-modification.ps1 014 "Add phone number field to profile"'
    Write-Host '         ./create-modification.ps1 -ListFeatures "Add phone number field"'
    exit 0
}

if ($ListFeatures) {
    $Json = $true
}

Resolve-CommonScript

$repoRoot = Get-RepoRoot
$hasGit = Test-HasGit

Set-Location $repoRoot

$specsDir = Join-Path $repoRoot 'specs'

if ($ListFeatures) {
    if (-not $Args -or $Args.Count -eq 0) {
        Write-Error '{"error":"Description required for -ListFeatures mode"}'
        exit 1
    }

    $description = ($Args -join ' ').Trim()
    $features = @()

    if (Test-Path $specsDir) {
        Get-ChildItem -Path $specsDir -Directory | Where-Object { $_.Name -match '^\d{3}-' } | Sort-Object Name | ForEach-Object {
            if ($_.Name -match '^(\d{3})-(.+)$') {
                $features += [PSCustomObject]@{
                    number = $matches[1]
                    name = $matches[2]
                    full = $_.Name
                }
            }
        }
    }

    [PSCustomObject]@{
        mode = 'list'
        description = $description
        features = $features
    } | ConvertTo-Json -Compress
    exit 0
}

if (-not $Args -or $Args.Count -lt 2) {
    Write-Error 'Usage: ./create-modification.ps1 [-Json] <feature-number> <modification-description>'
    Write-Error '   or: ./create-modification.ps1 -ListFeatures <modification-description>'
    exit 1
}

$featureNum = $Args[0]
$modDescription = ($Args[1..($Args.Count - 1)] -join ' ').Trim()

$featureDir = Get-ChildItem -Path $specsDir -Directory -Filter "$featureNum-*" | Select-Object -First 1
if (-not $featureDir) {
    Write-Error "Error: Could not find feature $featureNum in specs/"
    exit 1
}

$featureName = $featureDir.Name
$modificationsDir = Join-Path $featureDir.FullName 'modifications'
New-Item -ItemType Directory -Path $modificationsDir -Force | Out-Null

$highestMod = 0
if (Test-Path $modificationsDir) {
    Get-ChildItem -Path $modificationsDir -Directory | ForEach-Object {
        if ($_.Name -match '^(\d+)') {
            $num = [int]$matches[1]
            if ($num -gt $highestMod) { $highestMod = $num }
        }
    }
}

$nextMod = $highestMod + 1
$modNum = '{0:000}' -f $nextMod
$words = Get-BranchNameFromDescription -Description $modDescription
$branchName = "$featureNum-mod-$modNum-$words"
$modId = "$featureNum-mod-$modNum"

if ($hasGit) {
    try {
        git checkout -b $branchName | Out-Null
    } catch {
        Write-Warning "Failed to create git branch: $branchName"
    }
} else {
    Write-Warning "[modify] Warning: Git repository not detected; skipped branch creation for $branchName"
}

$modDir = Join-Path $modificationsDir "$modNum-$words"
New-Item -ItemType Directory -Path $modDir -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $modDir 'contracts') -Force | Out-Null

$template = Join-Path $repoRoot '.specify/extensions/workflows/templates/modify/modification-template.md'
$modSpecFile = Join-Path $modDir 'modification-spec.md'

if (Test-Path $template) {
    Copy-Item $template $modSpecFile -Force
} else {
    Set-Content -Path $modSpecFile -Value '# Modification Spec'
}

$specLink = Join-Path $modDir 'spec.md'
try {
    if (Test-Path $specLink) { Remove-Item $specLink -Force }
    New-Item -ItemType SymbolicLink -Path $specLink -Target 'modification-spec.md' | Out-Null
} catch {
    Copy-Item $modSpecFile $specLink -Force
}

# Create plan.md and tasks.md as standard symlinks
$planLink = Join-Path $modDir 'plan.md'
$tasksLink = Join-Path $modDir 'tasks.md'
try {
    if (Test-Path $planLink) { Remove-Item $planLink -Force }
    if (Test-Path $tasksLink) { Remove-Item $tasksLink -Force }
    New-Item -ItemType SymbolicLink -Path $planLink -Target 'modification-spec.md' | Out-Null
    New-Item -ItemType SymbolicLink -Path $tasksLink -Target 'modification-spec.md' | Out-Null
} catch {
    Copy-Item $modSpecFile $planLink -Force
    Copy-Item $modSpecFile $tasksLink -Force
}

# NOTE:
# The impact scanner is currently implemented as a bash script
# located at `.specify/extensions/workflows/templates/modify/scan-impact.sh`.
# This PowerShell workflow will invoke it via `bash` when available.
# If bash is not installed or the script is missing, this script will
# still succeed but will note in the impact file that manual analysis
# is required.

$impactFile = Join-Path $modDir 'impact-analysis.md'
$impactScanner = Join-Path $repoRoot '.specify/extensions/workflows/templates/modify/scan-impact.sh'

if (Test-Path $impactScanner) {
    $header = @(
        "# Impact Analysis for $featureName",
        '',
        "**Generated**: $(Get-Date)",
        "**Modification**: $modDescription",
        ''
    )
    $header | Set-Content -Path $impactFile

    $bash = Get-Command bash -ErrorAction SilentlyContinue
    if ($bash) {
        try {
            & $bash.Path $impactScanner $featureNum | Add-Content -Path $impactFile
        } catch {
            Write-Warning 'Impact scanner failed; manual analysis required.'
        }
    } else {
        Add-Content -Path $impactFile -Value 'Impact scanner requires bash; manual analysis required.'
    }
} else {
    @(
        '# Impact Analysis',
        'Impact scanner not found - manual analysis required'
    ) | Set-Content -Path $impactFile
}

$env:SPECIFY_MODIFICATION = $modId

if ($Json) {
    [PSCustomObject]@{
        MOD_ID = $modId
        BRANCH_NAME = $branchName
        MOD_SPEC_FILE = $modSpecFile
        IMPACT_FILE = $impactFile
        FEATURE_NAME = $featureName
        MOD_NUM = $modNum
    } | ConvertTo-Json -Compress
} else {
    Write-Output "MOD_ID: $modId"
    Write-Output "BRANCH_NAME: $branchName"
    Write-Output "FEATURE_NAME: $featureName"
    Write-Output "MOD_SPEC_FILE: $modSpecFile"
    Write-Output "IMPACT_FILE: $impactFile"
    Write-Output "MOD_NUM: $modNum"
    Write-Output "SPECIFY_MODIFICATION environment variable set to: $modId"
}
