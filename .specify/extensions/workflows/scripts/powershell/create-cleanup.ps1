#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [switch]$Json,
    [switch]$DryRun,
    [switch]$AutoFix,
    [switch]$Help,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Reason
)
$ErrorActionPreference = 'Stop'

if ($Help) {
    Write-Host 'Usage: ./create-cleanup.ps1 [-Json] [-DryRun] [-AutoFix] [reason]'
    Write-Host ''
    Write-Host 'Validates spec-kit artifact structure and optionally fixes issues.'
    Write-Host ''
    Write-Host 'Options:'
    Write-Host '  -Json     Output in JSON format'
    Write-Host '  -DryRun   Show what would be done without making changes'
    Write-Host '  -AutoFix  Automatically fix numbering and organization issues'
    Write-Host '  reason    Optional: reason for cleanup (for documentation)'
    Write-Host ''
    Write-Host 'This script validates:'
    Write-Host '  - Sequential numbering of specs (001, 002, 003, etc.)'
    Write-Host '  - Correct directory structure under specs/'
    Write-Host '  - Presence of required files (spec.md, etc.)'
    Write-Host '  - No gaps or duplicate numbers'
    Write-Host ''
    Write-Host 'IMPORTANT: Only moves/renames docs in specs/, never touches code files'
    exit 0
}

$cleanupReason = if ($Reason -and $Reason.Count -gt 0) { ($Reason -join ' ').Trim() } else { 'Validate and organize spec-kit artifacts' }

function Find-RepositoryRoot {
    param(
        [string]$StartDir,
        [string[]]$Markers = @('.git', '.specify')
    )
    $current = Resolve-Path $StartDir
    while ($true) {
        foreach ($marker in $Markers) {
            if (Test-Path (Join-Path $current $marker)) {
                return $current
            }
        }
        $parent = Split-Path $current -Parent
        if ($parent -eq $current) {
            return $null
        }
        $current = $parent
    }
}

if (Test-Path (Join-Path $PSScriptRoot 'common.ps1')) {
    . (Join-Path $PSScriptRoot 'common.ps1')
}

$repoRoot = $null
$hasGit = $false
try {
    $repoRoot = git rev-parse --show-toplevel 2>$null
    if ($LASTEXITCODE -eq 0) {
        $hasGit = $true
    }
} catch {
    $repoRoot = $null
}

if (-not $repoRoot) {
    $repoRoot = Find-RepositoryRoot -StartDir $PSScriptRoot
    if (-not $repoRoot) {
        Write-Error 'Error: Could not determine repository root'
        exit 1
    }
}

Set-Location $repoRoot

$specsDir = Join-Path $repoRoot 'specs'

if (-not (Test-Path $specsDir)) {
    if ($Json) {
        [PSCustomObject]@{
            status = 'success'
            message = 'No specs directory found - nothing to clean up'
            issues = @()
        } | ConvertTo-Json -Compress
    } else {
        Write-Output '✓ No specs directory found - nothing to clean up'
    }
    exit 0
}

$issues = New-Object System.Collections.Generic.List[string]
$actions = New-Object System.Collections.Generic.List[string]
$misplacedDirs = New-Object System.Collections.Generic.List[object]
$hasErrors = $false
$hasUnfixableErrors = $false

function Add-Issue {
    param(
        [string]$Severity,
        [string]$Message,
        [bool]$AutoFixable = $false
    )
    $issues.Add("[$Severity] $Message")
    if ($Severity -eq 'ERROR' -and -not $AutoFixable) {
        $hasUnfixableErrors = $true
    }
    if ($Severity -eq 'ERROR') {
        $hasErrors = $true
    }
}

function Add-Action {
    param([string]$Action)
    $actions.Add($Action)
}

$workflowTypes = @('bugfix', 'modify', 'refactor', 'hotfix', 'deprecate', 'features')

function Add-MisplacedDir {
    param([string]$Source, [string]$Target)
    $misplacedDirs.Add([PSCustomObject]@{ Source = $Source; Target = $Target })
}

function Fix-MisplacedDirs {
    if ($misplacedDirs.Count -eq 0 -or $DryRun) {
        return
    }

    foreach ($entry in $misplacedDirs) {
        $targetDir = Split-Path $entry.Target -Parent
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }

        try {
            Move-Item -Path $entry.Source -Destination $entry.Target
            Add-Action "✓ Moved $(Split-Path $entry.Source -Leaf) to $($entry.Target)"
        } catch {
            Write-Error "Error: Failed to move $($entry.Source) to $($entry.Target)"
            exit 1
        }
    }
}

function Validate-WorkflowDirectory {
    param(
        [string]$WorkflowDir,
        [string]$WorkflowType,
        [bool]$SkipKnownSubdirs
    )

    if (-not (Test-Path $WorkflowDir)) {
        return
    }

    $numbers = New-Object System.Collections.Generic.List[int]
    $dirMap = @{}
    $dupCheck = @{}

    Get-ChildItem -Path $WorkflowDir -Directory | ForEach-Object {
        $dirName = $_.Name

        if ($SkipKnownSubdirs) {
            if ($workflowTypes -contains $dirName -or $dirName -eq 'cleanup') {
                return
            }

            if ($dirName -match '^(bugfix|modify|refactor|hotfix|deprecate)-(\d{3})-(.+)$') {
                $wrongWorkflow = $matches[1]
                $wrongNumber = $matches[2]
                $wrongSuffix = $matches[3]
                Add-Issue -Severity 'ERROR' -Message "Misplaced workflow directory: $dirName should be in $wrongWorkflow/$wrongNumber-$wrongSuffix/" -AutoFixable $true
                if ($AutoFix) {
                    Add-MisplacedDir -Source $_.FullName -Target (Join-Path $specsDir "$wrongWorkflow/$wrongNumber-$wrongSuffix")
                    Add-Action "Move $dirName to $wrongWorkflow/$wrongNumber-$wrongSuffix/"
                }
                return
            }

            if ($dirName -notmatch '^\d{3}-') {
                Add-Issue -Severity 'WARNING' -Message "Unrecognized directory in specs/: $dirName (not a numbered spec or known workflow type)"
                return
            }
        }

        if ($dirName -match '^(\d{3})-') {
            $numberInt = [int]$matches[1]
            if ($dupCheck.ContainsKey($numberInt)) {
                Add-Issue -Severity 'ERROR' -Message "Duplicate number in $WorkflowType/: {0:000} (found in $($dupCheck[$numberInt]) and $dirName)" -f $numberInt
            } else {
                $numbers.Add($numberInt)
                $dirMap[$numberInt] = $dirName
                $dupCheck[$numberInt] = $dirName
            }
        } elseif (-not $SkipKnownSubdirs) {
            Add-Issue -Severity 'ERROR' -Message "Invalid directory name in $WorkflowType/: $dirName (should start with 3-digit number)"
        }
    }

    if ($numbers.Count -eq 0) {
        return
    }

    $sortedNumbers = $numbers | Sort-Object
    $expected = 1
    $needsRenumber = $false
    foreach ($num in $sortedNumbers) {
        if ($num -ne $expected) {
            $needsRenumber = $true
            break
        }
        $expected++
    }

    if ($needsRenumber) {
        Add-Issue -Severity 'INFO' -Message "Non-sequential numbering in $WorkflowType/ (gaps detected)"
        if ($AutoFix) {
            if ($hasUnfixableErrors) {
                Add-Action "Cannot auto-fix $WorkflowType/: resolve ERROR-level issues first (e.g., duplicates)"
            } else {
                Add-Action "Renumber $WorkflowType/ directories to be sequential"
                if (-not $DryRun) {
                    $tempDir = Join-Path $WorkflowDir (".tmp." + [System.Guid]::NewGuid().ToString())
                    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

                    $counter = 1
                    foreach ($num in $sortedNumbers) {
                        $oldDir = Join-Path $WorkflowDir $dirMap[$num]
                        $newNum = '{0:000}' -f $counter
                        $suffix = $dirMap[$num] -replace '^\d{3}-', ''
                        $newDir = Join-Path $tempDir "$newNum-$suffix"
                        Move-Item -Path $oldDir -Destination $newDir
                        $counter++
                    }

                    Get-ChildItem -Path $tempDir -Directory | ForEach-Object {
                        Move-Item -Path $_.FullName -Destination $WorkflowDir
                    }

                    Remove-Item -Path $tempDir -Recurse -Force
                    Add-Action "✓ Renumbered $WorkflowType/ directories"
                }
            }
        } else {
            Add-Action "Run with --auto-fix to renumber $WorkflowType/ directories sequentially"
        }
    }

    foreach ($num in $sortedNumbers) {
        $dirPath = Join-Path $WorkflowDir $dirMap[$num]
        $hasSpec = $false

        switch ($WorkflowType) {
            'bugfix' { if (Test-Path (Join-Path $dirPath 'bug-report.md')) { $hasSpec = $true } }
            'refactor' { if (Test-Path (Join-Path $dirPath 'refactor-spec.md')) { $hasSpec = $true } }
            'hotfix' { if (Test-Path (Join-Path $dirPath 'hotfix.md')) { $hasSpec = $true } }
            'deprecate' {
                if (Test-Path (Join-Path $dirPath 'deprecation-plan.md')) { $hasSpec = $true }
                if (Test-Path (Join-Path $dirPath 'deprecation.md')) { $hasSpec = $true }
            }
            'modify' { if (Test-Path (Join-Path $dirPath 'modification-spec.md')) { $hasSpec = $true } }
            'features' { if (Test-Path (Join-Path $dirPath 'feature-spec.md')) { $hasSpec = $true } }
        }

        if (Test-Path (Join-Path $dirPath 'spec.md')) {
            $hasSpec = $true
        }

        if (-not $hasSpec) {
            Add-Issue -Severity 'WARNING' -Message "Missing spec file in $($dirMap[$num])"
        }
    }
}

Validate-WorkflowDirectory -WorkflowDir $specsDir -WorkflowType 'features' -SkipKnownSubdirs $true

foreach ($workflowType in $workflowTypes) {
    $workflowDir = Join-Path $specsDir $workflowType
    Validate-WorkflowDirectory -WorkflowDir $workflowDir -WorkflowType $workflowType -SkipKnownSubdirs $false
}

if ($AutoFix) {
    Fix-MisplacedDirs
}

if ($Json) {
    $status = if ($issues.Count -eq 0) { 'success' } else { 'issues_found' }
    $message = if ($issues.Count -eq 0) { 'Spec structure is valid' } else { "Found $($issues.Count) issue(s)" }

    [PSCustomObject]@{
        status = $status
        message = $message
        issues = $issues
        actions = $actions
    } | ConvertTo-Json -Compress
} else {
    Write-Output ''
    Write-Output '═══════════════════════════════════════════════════════════════'
    Write-Output '  Spec-Kit Cleanup Report'
    Write-Output '═══════════════════════════════════════════════════════════════'
    Write-Output ''

    if ($issues.Count -eq 0) {
        Write-Output '✓ No issues found - spec structure is valid'
    } else {
        Write-Output "Issues found: $($issues.Count)"
        Write-Output ''
        foreach ($issue in $issues) {
            Write-Output "  $issue"
        }
    }

    Write-Output ''

    if ($actions.Count -gt 0) {
        if ($DryRun) {
            Write-Output 'Actions suggested:'
        } else {
            Write-Output 'Actions taken:'
        }
        Write-Output ''
        foreach ($action in $actions) {
            Write-Output "  $action"
        }
        Write-Output ''
    }

    if ($DryRun) {
        Write-Output '💡 This was a dry run. Run without -DryRun to apply changes.'
    }

    if ($issues.Count -gt 0 -and -not $AutoFix) {
        Write-Output '💡 Run with -AutoFix to automatically fix numbering issues.'
    }
}

if ($issues.Count -eq 0) {
    exit 0
}

exit 1
