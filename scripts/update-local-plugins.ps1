[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-CopilotCommand {
    if (Get-Command copilot -ErrorAction SilentlyContinue) {
        return @{ Command = 'copilot'; Prefix = @() }
    }

    if (Get-Command gh -ErrorAction SilentlyContinue) {
        return @{ Command = 'gh'; Prefix = @('copilot') }
    }

    throw "Neither 'copilot' nor 'gh' CLI command was found in PATH."
}

function Invoke-CopilotPlugin {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Cli,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    $fullArgs = @($Cli.Prefix) + $Arguments
    & $Cli.Command @fullArgs
    return ($LASTEXITCODE -eq 0)
}

$cli = Get-CopilotCommand

$pluginNames = @(
    'architecture',
    'copilot-plugin-manager',
    'copilot-spec-builder',
    'development',
    'documentation',
    'product-owner',
    'review',
    'wip-convention',
    'worktree-parallel'
)

$failed = @()

foreach ($pluginName in $pluginNames) {
    Write-Host "Updating plugin $pluginName ..."

    if (-not (Invoke-CopilotPlugin -Cli $cli -Arguments @('plugin', 'update', $pluginName))) {
        $failed += $pluginName
        Write-Host "Failed: $pluginName"
    }
}

Write-Host ''
if ($failed.Count -gt 0) {
    Write-Host 'Update finished with failures:'
    $failed | ForEach-Object { Write-Host "- $_" }
    exit 1
}

Write-Host 'All local plugins updated successfully.'
exit 0
