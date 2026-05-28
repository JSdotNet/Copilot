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
    'JSdotNet/Copilot:plugins/architecture',
    'JSdotNet/Copilot:plugins/copilot-plugin-manager',
    'JSdotNet/Copilot:plugins/copilot-spec-builder',
    'JSdotNet/Copilot:plugins/development',
    'JSdotNet/Copilot:plugins/documentation',
    'JSdotNet/Copilot:plugins/product-owner',
    'JSdotNet/Copilot:plugins/review',
    'JSdotNet/Copilot:plugins/wip-convention',
    'JSdotNet/Copilot:plugins/worktree-parallel'
)

$failed = @()

foreach ($pluginPath in $pluginPaths) {
    Write-Host "Installing plugin $pluginPath ..."

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

Write-Host 'All plugins installed successfully.'
exit 0
