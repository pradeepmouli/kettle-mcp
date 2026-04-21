<#
    BranchUtils.ps1
    Provides Get-BranchNameFromDescription for PowerShell workflows.
    If a function with the same name already exists, this file will not override it.
#>

if (-not (Get-Command Get-BranchNameFromDescription -ErrorAction SilentlyContinue)) {
    function Get-BranchNameFromDescription {
        param([string]$Description)

        $stopWords = @(
            'i','a','an','the','to','for','of','in','on','at','by','with','from',
            'is','are','was','were','be','been','being','have','has','had',
            'do','does','did','will','would','should','could','can','may','might','must','shall',
            'this','that','these','those','my','your','our','their',
            'want','need','add','get','set'
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
}
