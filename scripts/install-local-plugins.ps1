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

$pluginPaths = @(
    './plugins/architecture',
    './plugins/copilot-plugin-manager',
    './plugins/copilot-spec-builder',
    './plugins/development',
    './plugins/documentation',
    './plugins/product-owner',
    './plugins/review',
    './plugins/wip-convention',
    './plugins/worktree-parallel'
)

$failed = @()

foreach ($pluginPath in $pluginPaths) {
    Write-Host "Installing plugin from $pluginPath ..."

    if (-not (Invoke-CopilotPlugin -Cli $cli -Arguments @('plugin', 'install', $pluginPath))) {
        $failed += $pluginPath
        Write-Host "Failed: $pluginPath"
    }
}

Write-Host ''
if ($failed.Count -gt 0) {
    Write-Host 'Install finished with failures:'
    $failed | ForEach-Object { Write-Host "- $_" }
    exit 1
}

Write-Host 'All local plugins installed successfully.'
exit 0
