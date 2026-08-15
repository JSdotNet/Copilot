<#
.SYNOPSIS
    Packs the orch-dashboard MCP server as a Claude Desktop extension (.mcpb).

.DESCRIPTION
    The server in plugins/claude-desktop/mcp/orch-dashboard is both the MCP server the
    Claude Code plugin registers and the payload of the Desktop extension - the same files,
    two delivery mechanisms. This script produces the second one.

    A .mcpb is a zip of the server plus its manifest.json. The server has no npm
    dependencies, so there is nothing to install before packing.

    Requires the MCPB CLI, which the script fetches through npx on demand:
    https://github.com/modelcontextprotocol/mcpb

.PARAMETER OutputDirectory
    Where to write the bundle. Defaults to dist/ at the repository root.

.PARAMETER Validate
    Only validate the manifest; do not pack.

.EXAMPLE
    ./scripts/Build-DesktopExtension.ps1

.EXAMPLE
    ./scripts/Build-DesktopExtension.ps1 -Validate
#>

[CmdletBinding()]
param(
    [string]$OutputDirectory,
    [switch]$Validate
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot  = Split-Path -Parent $PSScriptRoot
$SourceDir = Join-Path $RepoRoot 'plugins/claude-desktop/mcp/orch-dashboard'
$Manifest  = Join-Path $SourceDir 'manifest.json'

if (-not (Test-Path -LiteralPath $Manifest)) {
    throw "No manifest at $Manifest"
}

if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
    $OutputDirectory = Join-Path $RepoRoot 'dist'
}

# Keep the bundle version in step with the plugin's own version rather than letting the two
# drift: the extension and the plugin ship the same server.
$pluginManifest = Get-Content -LiteralPath (Join-Path $RepoRoot 'plugins/claude-desktop/.claude-plugin/plugin.json') -Raw | ConvertFrom-Json
$bundleManifest = Get-Content -LiteralPath $Manifest -Raw | ConvertFrom-Json
if ($bundleManifest.version -ne $pluginManifest.version) {
    Write-Warning "manifest.json version ($($bundleManifest.version)) differs from the plugin version ($($pluginManifest.version))."
}

if ($Validate) {
    npx --yes @anthropic-ai/mcpb validate $Manifest
    exit $LASTEXITCODE
}

if (-not (Test-Path -LiteralPath $OutputDirectory)) {
    New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
}

$output = Join-Path $OutputDirectory "orch-dashboard-$($bundleManifest.version).mcpb"
npx --yes @anthropic-ai/mcpb pack $SourceDir $output
if ($LASTEXITCODE -ne 0) { throw "mcpb pack failed with exit code $LASTEXITCODE" }

Write-Host "Built $output" -ForegroundColor Green
Write-Host 'Install it by double-clicking the file, or through Claude Desktop: Settings > Extensions > Advanced settings > Install Extension.'
