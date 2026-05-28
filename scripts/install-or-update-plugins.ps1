[CmdletBinding()]
param(
    [ValidateSet('install', 'update', 'install-or-update')]
    [string]$Mode = 'install-or-update',

    [string]$PluginsRoot = (Join-Path $PSScriptRoot 'plugins'),

    [switch]$ContinueOnError
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# PowerShell 5.1 compatibility: these automatic variables exist in PowerShell 7,
# but not always in Windows PowerShell. Some CLI wrappers reference them.
if (-not (Get-Variable -Name IsWindows -Scope Global -ErrorAction SilentlyContinue)) {
    Set-Variable -Name IsWindows -Scope Global -Value $true
}

if (-not (Get-Variable -Name IsLinux -Scope Global -ErrorAction SilentlyContinue)) {
    Set-Variable -Name IsLinux -Scope Global -Value $false
}

if (-not (Get-Variable -Name IsMacOS -Scope Global -ErrorAction SilentlyContinue)) {
    Set-Variable -Name IsMacOS -Scope Global -Value $false
}

function Invoke-CopilotPluginCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    if ($script:UseStandaloneCopilot) {
        & copilot @Arguments
    }
    else {
        & gh copilot @Arguments
    }

    return ($LASTEXITCODE -eq 0)
}

$script:UseStandaloneCopilot = $false

if (Get-Command copilot -ErrorAction SilentlyContinue) {
    $script:UseStandaloneCopilot = $true
}
elseif (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "Neither 'copilot' nor 'gh' CLI commands were found in PATH."
    exit 1
}

if (-not (Test-Path -LiteralPath $PluginsRoot -PathType Container)) {
    Write-Error "Plugins directory not found: $PluginsRoot"
    exit 1
}

$pluginDirs = Get-ChildItem -LiteralPath $PluginsRoot -Directory | Sort-Object Name

if ($pluginDirs.Count -eq 0) {
    Write-Host "No plugin folders found under '$PluginsRoot'."
    exit 0
}

$results = @()

foreach ($pluginDir in $pluginDirs) {
    $pluginName = $pluginDir.Name
    $pluginPath = $pluginDir.FullName

    Write-Host ""
    Write-Host "=== [$pluginName] mode: $Mode ==="

    $status = 'failed'

    if ($Mode -eq 'install') {
        if (Invoke-CopilotPluginCommand -Arguments @('plugin', 'install', "JSdotNet/Copilot:plugins/$pluginName")) {
            $status = 'installed'
        }
    }
    elseif ($Mode -eq 'update') {
        if (Invoke-CopilotPluginCommand -Arguments @('plugin', 'update', $pluginName)) {
            $status = 'updated'
        }
    }
    else {
        # Try update first. If plugin is not installed yet, install from local path.
        if (Invoke-CopilotPluginCommand -Arguments @('plugin', 'update', $pluginName)) {
            $status = 'updated'
        }
        else {
            Write-Host "Update failed for '$pluginName'. Trying install from GitHub..."
            if (Invoke-CopilotPluginCommand -Arguments @('plugin', 'install', "JSdotNet/Copilot:plugins/$pluginName")) {
                $status = 'installed'
            }
        }
    }

    $results += [PSCustomObject]@{
        Plugin = $pluginName
        Status = $status
    }

    if ($status -eq 'failed') {
        Write-Error "Failed to process plugin '$pluginName'."
        if (-not $ContinueOnError) {
            Write-Host "Stopping because -ContinueOnError was not specified."
            $results | Format-Table -AutoSize
            exit 1
        }
    }
}

Write-Host ""
Write-Host '=== Summary ==='
$results | Format-Table -AutoSize

if ($results.Status -contains 'failed') {
    exit 1
}

exit 0
