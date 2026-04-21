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

if ($Help) {
    Write-Host 'Usage: ./create-deprecate.ps1 [-Json] [-ListFeatures] [<feature_number>] <reason>'
    Write-Host 'Example: ./create-deprecate.ps1 014 "low usage and high maintenance burden"'
    Write-Host '         ./create-deprecate.ps1 -ListFeatures "low usage"'
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
New-Item -ItemType Directory -Path $specsDir -Force | Out-Null

if ($ListFeatures) {
    if (-not $Args -or $Args.Count -eq 0) {
        Write-Error '{"error":"Reason required for -ListFeatures mode"}'
        exit 1
    }

    $reason = ($Args -join ' ').Trim()
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
        reason = $reason
        features = $features
    } | ConvertTo-Json -Compress
    exit 0
}

if (-not $Args -or $Args.Count -lt 2) {
    Write-Error 'Usage: ./create-deprecate.ps1 [-Json] <feature_number> <reason>'
    Write-Error '   or: ./create-deprecate.ps1 -ListFeatures <reason>'
    Write-Error 'Example: ./create-deprecate.ps1 014 "low usage and high maintenance burden"'
    exit 1
}

$featureNum = $Args[0]
$reason = ($Args[1..($Args.Count - 1)] -join ' ').Trim()

$featureDir = Get-ChildItem -Path $specsDir -Directory -Filter "$featureNum-*" | Select-Object -First 1
if (-not $featureDir) {
    Write-Error "Error: Feature directory not found for feature number $featureNum"
    Write-Error "Looked in: $specsDir/$featureNum-*"
    exit 1
}

$featureName = $featureDir.Name

$deprecateRoot = Join-Path $specsDir 'deprecate'
$highest = 0
if (Test-Path $deprecateRoot) {
    Get-ChildItem -Path $deprecateRoot -Directory | ForEach-Object {
        if ($_.Name -match '^(\d+)') {
            $num = [int]$matches[1]
            if ($num -gt $highest) { $highest = $num }
        }
    }
}

$next = $highest + 1
$deprecateNum = '{0:000}' -f $next
$featureShort = $featureName -replace "^$featureNum-", ''
$branchName = "deprecate/$deprecateNum-$featureShort"
$deprecateId = "deprecate-$deprecateNum"

if ($hasGit) {
    try {
        git checkout -b $branchName | Out-Null
    } catch {
        Write-Warning "Failed to create git branch: $branchName"
    }
} else {
    Write-Warning "[deprecate] Warning: Git repository not detected; skipped branch creation for $branchName"
}

New-Item -ItemType Directory -Path $deprecateRoot -Force | Out-Null
$deprecateDir = Join-Path $deprecateRoot "$deprecateNum-$featureShort"
New-Item -ItemType Directory -Path $deprecateDir -Force | Out-Null

$template = Join-Path $repoRoot '.specify/extensions/workflows/templates/deprecate/deprecation-template.md'
$deprecationFile = Join-Path $deprecateDir 'deprecation.md'

if (Test-Path $template) {
    Copy-Item $template $deprecationFile -Force
} else {
    Set-Content -Path $deprecationFile -Value '# Deprecation Plan'
}

$specLink = Join-Path $deprecateDir 'spec.md'
try {
    if (Test-Path $specLink) { Remove-Item $specLink -Force }
    New-Item -ItemType SymbolicLink -Path $specLink -Target 'deprecation.md' | Out-Null
} catch {
    Copy-Item $deprecationFile $specLink -Force
}

# Create plan.md and tasks.md as standard symlinks
$planLink = Join-Path $deprecateDir 'plan.md'
$tasksLink = Join-Path $deprecateDir 'tasks.md'
try {
    if (Test-Path $planLink) { Remove-Item $planLink -Force }
    if (Test-Path $tasksLink) { Remove-Item $tasksLink -Force }
    New-Item -ItemType SymbolicLink -Path $planLink -Target 'deprecation.md' | Out-Null
    New-Item -ItemType SymbolicLink -Path $tasksLink -Target 'deprecation.md' | Out-Null
} catch {
    Copy-Item $deprecationFile $planLink -Force
    Copy-Item $deprecationFile $tasksLink -Force
}

# NOTE:
# The dependency scanner is currently implemented as a bash script
# located at `.specify/extensions/workflows/templates/deprecate/scan-dependencies.sh`.
# This PowerShell workflow will invoke it via `bash` when available.
# If bash is not installed or the script is missing, this script will
# still succeed but will note in the dependencies file that manual analysis
# is required.

$dependenciesFile = Join-Path $deprecateDir 'dependencies.md'
$scanScript = Join-Path $repoRoot '.specify/extensions/workflows/templates/deprecate/scan-dependencies.sh'

if (Test-Path $scanScript) {
    $bash = Get-Command bash -ErrorAction SilentlyContinue
    if ($bash) {
        try {
            & $bash.Path $scanScript $featureNum $dependenciesFile | Out-Null
        } catch {
            Write-Warning 'Dependency scan failed; manual analysis required.'
        }
    } else {
        @(
            '# Dependencies',
            '',
            'Dependency scan script requires bash. Please manually document dependencies.'
        ) | Set-Content -Path $dependenciesFile
    }
} else {
    @(
        '# Dependencies',
        '',
        'Dependency scan script not found. Please manually document dependencies.'
    ) | Set-Content -Path $dependenciesFile
}

if (Test-Path $deprecationFile) {
    $content = Get-Content -Path $deprecationFile -Raw
    $content = $content -replace '\[FEATURE NAME\]', $featureShort
    $content = $content -replace 'deprecate-###', $deprecateId
    $content = $content -replace 'deprecate/###-short-description', $branchName

    $originalFeatureLink = "[Link to original feature spec, e.g., specs/$featureName/]"
    $content = [regex]::Replace($content, '\[Link to original feature spec.*\]', $originalFeatureLink)

    $today = (Get-Date).ToUniversalTime().ToString('yyyy-MM-dd')
    $content = [regex]::Replace($content, '\[YYYY-MM-DD\]', $today, 1)

    Set-Content -Path $deprecationFile -Value $content
}

$env:SPECIFY_DEPRECATE = $deprecateId

if ($Json) {
    [PSCustomObject]@{
        DEPRECATE_ID = $deprecateId
        BRANCH_NAME = $branchName
        DEPRECATION_FILE = $deprecationFile
        DEPENDENCIES_FILE = $dependenciesFile
        DEPRECATE_NUM = $deprecateNum
        FEATURE_NUM = $featureNum
        FEATURE_NAME = $featureName
        REASON = $reason
    } | ConvertTo-Json -Compress
} else {
    Write-Output "DEPRECATE_ID: $deprecateId"
    Write-Output "BRANCH_NAME: $branchName"
    Write-Output "DEPRECATION_FILE: $deprecationFile"
    Write-Output "DEPENDENCIES_FILE: $dependenciesFile"
    Write-Output "DEPRECATE_NUM: $deprecateNum"
    Write-Output "FEATURE_NUM: $featureNum"
    Write-Output "FEATURE_NAME: $featureName"
    Write-Output "REASON: $reason"
    Write-Output ''
    Write-Output "📦 Deprecation workflow initialized for feature $featureNum"
    Write-Output 'Please review the dependency scan and plan your 3-phase sunset.'
    Write-Output "SPECIFY_DEPRECATE environment variable set to: $deprecateId"
}
