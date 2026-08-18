<#
.SYNOPSIS
    Keeps the Copilot plugins in this repository loadable by Claude Code.

.DESCRIPTION
    Each plugin under plugins/ is authored once and read by both hosts. Agent files stay in
    a single agents/<role>.agent.md per role: both hosts tolerate frontmatter they do not
    understand, so the 'tools' list carries the Copilot tool ids and their Claude equivalents
    side by side and each host keeps the entries it recognises.

    This script maintains the machine-derivable parts of that arrangement:

      in place   plugins/<name>/agents/<role>.agent.md   'name' and 'tools' frontmatter lines
      generated  plugins/<name>/.claude-plugin/plugin.json
      generated  plugins/<name>/hooks/hooks.json
      generated  .claude-plugin/marketplace.json          (repo root)

    Authored by hand and never rewritten: every agent body, 'description', 'handoffs',
    'agents', and the Copilot manifest at .github/plugin/plugin.json.

    The script also lints what it cannot fix: a missing description, a 'model' value Claude
    would reject, a tools list that resolves to nothing on one of the hosts, or a handoff
    whose target is not mentioned in the body.

.PARAMETER Check
    Report drift and exit 1 instead of writing. Used by CI.

.PARAMETER RepoRoot
    Repository root. Defaults to the parent of the folder holding this script.

.EXAMPLE
    ./scripts/Sync-ClaudePlugins.ps1

.EXAMPLE
    ./scripts/Sync-ClaudePlugins.ps1 -Check
#>

[CmdletBinding()]
param(
    [switch]$Check,
    [string]$RepoRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
    $RepoRoot = Split-Path -Parent $PSScriptRoot
}
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path

$SyncRoot     = Join-Path $PSScriptRoot 'claude-sync'
$ToolMapPath  = Join-Path $SyncRoot 'tool-map.json'
$PluginsRoot  = Join-Path $RepoRoot 'plugins'

# Plugins that stay Copilot-only. copilot-app is built around the Copilot CLI canvas
# extension API (diagram-canvas, markdown-canvas, orch-dashboard), which has no Claude
# Code counterpart, so generating a Claude manifest for it would advertise a broken plugin.
# Its Claude sibling is the hand-authored claude-desktop plugin below.
$ExcludedPlugins = @('copilot-app')

# Claude-native plugins: authored for Claude Code only, with a hand-written
# .claude-plugin/plugin.json and hooks/hooks.json. They have no Copilot manifest to generate
# from, so nothing under them is rewritten - they are only listed in the marketplace. Keeping
# them here (rather than relying on the "has a Copilot manifest" filter) makes the omission
# deliberate and visible.
$ClaudeNativePlugins = @('claude-desktop')

# Claude Code refuses to load an agent whose model it does not recognise, so a Copilot-only
# model id would take the agent down on one host. Pins must use a value both hosts accept,
# or be omitted so each host applies its own default.
$ClaudeModelAliases = @('opus', 'sonnet', 'haiku', 'fable', 'inherit')

$script:Drift    = [System.Collections.Generic.List[string]]::new()
$script:Written  = [System.Collections.Generic.List[string]]::new()
$script:Warnings = [System.Collections.Generic.List[string]]::new()
$script:Errors   = [System.Collections.Generic.List[string]]::new()

#region helpers

function Get-RelativePath {
    param([Parameter(Mandatory)][string]$Path)
    return [System.IO.Path]::GetRelativePath($RepoRoot, $Path).Replace('\', '/')
}

function Write-Generated {
    param([Parameter(Mandatory)][string]$Path, [Parameter(Mandatory)][string]$Content)

    # Normalise to LF so check mode is stable regardless of the host's line endings.
    $normalized = $Content -replace "`r`n", "`n"
    if (-not $normalized.EndsWith("`n")) { $normalized += "`n" }

    $relative = Get-RelativePath $Path

    $current = $null
    if (Test-Path -LiteralPath $Path) {
        $current = ([System.IO.File]::ReadAllText($Path)) -replace "`r`n", "`n"
    }

    if ($current -ceq $normalized) { return }

    if ($Check) {
        $verb = if ($null -eq $current) { 'missing' } else { 'out of date' }
        $script:Drift.Add("$relative ($verb)")
        return
    }

    $parent = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    [System.IO.File]::WriteAllText($Path, $normalized, [System.Text.UTF8Encoding]::new($false))
    $script:Written.Add($relative)
}

function ConvertTo-StableJson {
    param([Parameter(Mandatory)]$Value)
    ($Value | ConvertTo-Json -Depth 12).Replace("`r`n", "`n")
}

function Read-Frontmatter {
    <#
        Minimal YAML front-matter reader covering the shapes these agent files use: scalars
        (bare, single- or double-quoted), inline flow sequences (possibly wrapped across
        lines), block sequences, and nested blocks captured verbatim for re-emission.
    #>
    param([Parameter(Mandatory)][string]$Path)

    $text = [System.IO.File]::ReadAllText($Path)
    if ($text.Length -gt 0 -and $text[0] -eq [char]0xFEFF) { $text = $text.Substring(1) }
    $text = $text -replace "`r`n", "`n"

    if (-not $text.StartsWith("---`n")) { throw "No YAML front matter in $Path" }
    $end = $text.IndexOf("`n---", 3)
    if ($end -lt 0) { throw "Unterminated YAML front matter in $Path" }

    $rawFm = $text.Substring(4, $end - 3).TrimEnd("`n", '-')
    $body  = $text.Substring($end + 4).TrimStart("`n")

    $map   = [ordered]@{}
    $lines = $rawFm -split "`n"
    $i = 0

    function Unquote([string]$s) {
        $s = $s.Trim()
        if ($s.Length -ge 2 -and (($s[0] -eq "'" -and $s[-1] -eq "'") -or ($s[0] -eq '"' -and $s[-1] -eq '"'))) {
            return $s.Substring(1, $s.Length - 2)
        }
        return $s
    }

    while ($i -lt $lines.Count) {
        $line = $lines[$i]
        if ([string]::IsNullOrWhiteSpace($line) -or $line.TrimStart().StartsWith('#')) { $i++; continue }

        if ($line -notmatch '^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$') {
            throw "Unsupported front-matter line in ${Path}: $line"
        }
        $key   = $Matches[1]
        $value = $Matches[2]
        $i++

        if ($value.TrimStart().StartsWith('[')) {
            $buffer = $value
            while (($buffer -split '\]').Count -lt 2 -and $i -lt $lines.Count) {
                $buffer += ' ' + $lines[$i]; $i++
            }
            $inner = $buffer.Substring($buffer.IndexOf('[') + 1)
            $inner = $inner.Substring(0, $inner.LastIndexOf(']'))
            $items = @()
            foreach ($part in ($inner -split ',')) {
                $part = $part.Trim()
                if ($part) { $items += (Unquote $part) }
            }
            $map[$key] = $items
            continue
        }

        if ([string]::IsNullOrWhiteSpace($value)) {
            $block = @()
            while ($i -lt $lines.Count -and ($lines[$i] -match '^\s+\S' -or [string]::IsNullOrWhiteSpace($lines[$i]))) {
                $block += $lines[$i]; $i++
            }
            while ($block.Count -gt 0 -and [string]::IsNullOrWhiteSpace($block[-1])) {
                $block = $block[0..($block.Count - 2)]
            }

            $isScalarSequence = $block.Count -gt 0
            foreach ($b in $block) {
                if ($b -notmatch '^\s*-\s+[^:]+$') { $isScalarSequence = $false; break }
            }

            if ($isScalarSequence) {
                $items = @()
                foreach ($b in $block) {
                    if ($b -match '^\s*-\s+(.*)$') { $items += (Unquote $Matches[1]) }
                }
                $map[$key] = $items
            } else {
                $map[$key] = [pscustomobject]@{ RawBlock = ($block -join "`n") }
            }
            continue
        }

        if ($value.TrimStart().StartsWith('>') -or $value.TrimStart().StartsWith('|')) {
            $indented = @()
            while ($i -lt $lines.Count -and ($lines[$i] -match '^\s+\S' -or [string]::IsNullOrWhiteSpace($lines[$i]))) {
                $indented += $lines[$i].Trim(); $i++
            }
            $map[$key] = ($indented -join ' ').Trim()
            continue
        }

        $map[$key] = Unquote $value
    }

    return [pscustomobject]@{ Frontmatter = $map; Body = $body }
}

function Format-YamlScalar {
    param([string]$Value)
    if ($Value -match '^[\s]|[:#]\s|^[\[\{>|&*!%@`"''-]|[\s]$') {
        return "'" + ($Value -replace "'", "''") + "'"
    }
    return $Value
}

#endregion

#region translation

$toolMap = Get-Content -LiteralPath $ToolMapPath -Raw -Encoding UTF8 | ConvertFrom-Json

function Get-McpServerPatterns {
    <#
        Claude entries that grant every tool of one MCP server. A plugin-provided server is
        namespaced with the plugin that provides it, so its tools surface as
        mcp__plugin_<plugin>_<server>__*; the same server registered directly in a repository's
        .mcp.json surfaces as mcp__<server>__*. 'tools' is an allowlist matched against exact
        runtime names, so guessing one form costs every tool of that server - both are emitted.
    #>
    param([Parameter(Mandatory)][string]$PluginName, [Parameter(Mandatory)][string]$Server)

    return @("mcp__plugin_${PluginName}_${Server}", "mcp__$Server")
}

function Get-ClaudeTools {
    <#
        Translates Copilot tool ids into the Claude tools they correspond to. The result is
        appended to - never substituted for - the Copilot ids, so one list serves both hosts.
    #>
    param(
        [string[]]$Ids,
        [Parameter(Mandatory)][string]$Source,
        [Parameter(Mandatory)][string]$PluginName,
        [string[]]$DeclaredMcpServers
    )

    $resolved = [System.Collections.Generic.List[string]]::new()
    $unmapped = [System.Collections.Generic.List[string]]::new()

    foreach ($id in $Ids) {
        # Already a Claude entry (a previous run's output, or hand-added). Claude tool names
        # are PascalCase and MCP patterns are mcp__-prefixed, so the match must be
        # case-sensitive: -match would treat every lowercase Copilot id as Claude's.
        if ($id -cmatch '^(mcp__|[A-Z])') { continue }

        $direct = $toolMap.tools.PSObject.Properties[$id]
        if ($direct) {
            foreach ($t in $direct.Value) { $resolved.Add($t) }
            continue
        }

        $matched = $false
        foreach ($prefix in $toolMap.mcpPrefixes.PSObject.Properties) {
            if ($id -eq $prefix.Name -or $id.StartsWith($prefix.Name)) {
                $server = [string]$prefix.Value
                if ($DeclaredMcpServers -notcontains $server) {
                    $script:Errors.Add("$Source declares '$id', which tool-map.json routes to the MCP server '$server', but $PluginName's manifest declares no such server. The generated allowlist would name a server that never surfaces, and Claude filters out every tool it cannot match.")
                }
                foreach ($pattern in (Get-McpServerPatterns -PluginName $PluginName -Server $server)) {
                    $resolved.Add($pattern)
                }
                $matched = $true; break
            }
        }
        if (-not $matched) { $unmapped.Add($id) }
    }

    if ($unmapped.Count -gt 0) {
        throw "Unmapped Copilot tool id(s) in ${Source}: $($unmapped -join ', '). Add them to scripts/claude-sync/tool-map.json."
    }

    foreach ($t in $toolMap.alwaysInclude) { $resolved.Add($t) }
    return $resolved
}

function Update-AgentFile {
    <#
        Rewrites only the 'name' and 'tools' frontmatter lines of an authored agent file so
        it loads on both hosts, and lints the parts a script must not invent.
    #>
    param(
        [Parameter(Mandatory)][System.IO.FileInfo]$File,
        [Parameter(Mandatory)][string]$PluginName,
        [string[]]$DeclaredMcpServers
    )

    $agentName = $File.Name -replace '\.agent\.md$', ''
    $relSource = Get-RelativePath $File.FullName
    $parsed    = Read-Frontmatter -Path $File.FullName
    $fm        = $parsed.Frontmatter

    if (-not $fm.Contains('description')) {
        $script:Errors.Add("$relSource has no 'description'; Claude Code requires one.")
        return
    }

    if ($fm.Contains('model')) {
        $model = [string]$fm['model']
        if ($ClaudeModelAliases -notcontains $model -and $model -notmatch '^claude-[a-z0-9-]+$') {
            $script:Errors.Add("$relSource pins model '$model', which Claude Code rejects - the agent would fail to load. Remove the pin, or use one of: $($ClaudeModelAliases -join ', ').")
            return
        }
    }

    # Copilot ids stay first so the authored intent still reads top-to-bottom; the Claude
    # equivalents follow. Each host silently drops the entries it does not recognise.
    $copilotIds = @()
    if ($fm.Contains('tools')) { $copilotIds = @($fm['tools']) }

    $claudeTools = Get-ClaudeTools -Ids $copilotIds -Source $relSource -PluginName $PluginName -DeclaredMcpServers $DeclaredMcpServers

    # Copilot's 'agents' key whitelists delegation targets; Claude scopes the Agent tool.
    if ($fm.Contains('agents')) {
        $targets = @($fm['agents'])
        if ($targets.Count -gt 0) {
            $scoped = "Agent($($targets -join ', '))"
            $claudeTools = @($claudeTools | Where-Object { $_ -ne 'Agent' })
            $claudeTools += $scoped
        }
    }

    # Rebuild from the Copilot ids alone so the emitted list is a pure function of the
    # authored intent: any Claude entry already in the file is discarded and recomputed,
    # which keeps ordering stable no matter what a previous run left behind.
    $authored = @($copilotIds | Where-Object { $_ -cnotmatch '^(mcp__|[A-Z])' })

    $merged = @()
    $seen   = [System.Collections.Generic.HashSet[string]]::new()
    foreach ($t in (@($authored) + @($claudeTools))) {
        if ($t -and $seen.Add($t)) { $merged += $t }
    }

    if ($merged.Count -eq 0) {
        $script:Errors.Add("$relSource has no tools; add at least one Copilot tool id.")
        return
    }

    # Every handoff target must be discoverable from the body, because Claude ignores the
    # 'handoffs' key entirely and delegates from what it reads in the prose.
    if ($fm.Contains('handoffs')) {
        $block = $fm['handoffs']
        $raw = if ($block -is [string]) { $block } else { $block.RawBlock }
        foreach ($m in [regex]::Matches($raw, '(?m)^\s*agent:\s*(.+)$')) {
            $target = $m.Groups[1].Value.Trim().Trim("'", '"')
            if ($parsed.Body -notmatch [regex]::Escape($target)) {
                $script:Warnings.Add("$relSource declares a handoff to '$target' that the body never mentions - Claude ignores 'handoffs', so document it in the body.")
            }
        }
    }

    # Re-emit the frontmatter with a stable key order, preserving everything authored.
    $sb = [System.Text.StringBuilder]::new()
    [void]$sb.AppendLine('---')
    [void]$sb.AppendLine("name: $agentName")
    [void]$sb.AppendLine("description: $(Format-YamlScalar ([string]$fm['description']))")
    if ($fm.Contains('model')) { [void]$sb.AppendLine("model: $($fm['model'])") }

    [void]$sb.AppendLine('# Copilot tool ids and their Claude equivalents. Each host keeps the entries it knows.')
    [void]$sb.AppendLine('tools:')
    foreach ($t in $merged) { [void]$sb.AppendLine("  - '$t'") }

    foreach ($key in $fm.Keys) {
        if ($key -in @('name', 'description', 'model', 'tools')) { continue }
        $value = $fm[$key]
        if ($value -is [pscustomobject] -and $value.PSObject.Properties['RawBlock']) {
            [void]$sb.AppendLine("${key}:")
            [void]$sb.AppendLine($value.RawBlock)
        } elseif ($value -is [array]) {
            $quoted = ($value | ForEach-Object { "'$_'" }) -join ', '
            [void]$sb.AppendLine("${key}: [$quoted]")
        } else {
            [void]$sb.AppendLine("${key}: $(Format-YamlScalar ([string]$value))")
        }
    }

    [void]$sb.AppendLine('---')
    [void]$sb.AppendLine()
    [void]$sb.Append($parsed.Body)

    Write-Generated -Path $File.FullName -Content $sb.ToString()

    # The generator only touches frontmatter; Copilot tool ids left in prose need a human.
    $bodyHits = [regex]::Matches($parsed.Body, '(?:read/readFile|edit/editFiles|edit/createFile|terminal/runInTerminal|execute/createAndRunTask|search/codebase|web/fetch|vscode/[A-Za-z]+)')
    if ($bodyHits.Count -gt 0) {
        $names = ($bodyHits | ForEach-Object { $_.Value } | Select-Object -Unique) -join ', '
        $script:Warnings.Add("$relSource body still names Copilot tool ids ($names) - reword for host neutrality.")
    }
}

function Convert-Hooks {
    param([Parameter(Mandatory)][string]$Path)

    $source    = Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json
    $relSource = Get-RelativePath $Path

    # Copilot: { version, hooks: { sessionStart: [ { type, prompt } ] } }
    # Claude:  { hooks: { SessionStart: [ { hooks: [ { type, prompt } ] } ] } }
    $eventNames = @{
        'sessionStart'     = 'SessionStart'
        'userPromptSubmit' = 'UserPromptSubmit'
        'preToolUse'       = 'PreToolUse'
        'postToolUse'      = 'PostToolUse'
        'sessionEnd'       = 'SessionEnd'
        'stop'             = 'Stop'
    }

    $result = [ordered]@{}
    foreach ($evt in $source.hooks.PSObject.Properties) {
        if (-not $eventNames.ContainsKey($evt.Name)) {
            throw "Unmapped hook event '$($evt.Name)' in $relSource."
        }
        $entries = @()
        foreach ($entry in @($evt.Value)) {
            if ($entry.type -ne 'prompt') {
                throw "Unsupported hook type '$($entry.type)' in $relSource; only 'prompt' hooks are translated."
            }
            $entries += [ordered]@{ hooks = @([ordered]@{ type = 'prompt'; prompt = $entry.prompt }) }
        }
        $result[$eventNames[$evt.Name]] = $entries
    }

    return [ordered]@{ hooks = $result }
}

#endregion

#region generation

$pluginDirs = Get-ChildItem -LiteralPath $PluginsRoot -Directory |
    Where-Object { $ExcludedPlugins -notcontains $_.Name } |
    Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName '.github/plugin/plugin.json') } |
    Sort-Object Name

$marketplaceEntries = @()

foreach ($dir in $pluginDirs) {
    $pluginName   = $dir.Name
    $manifestPath = Join-Path $dir.FullName '.github/plugin/plugin.json'
    $source       = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json

    $manifest = [ordered]@{
        name        = $source.name
        version     = $source.version
        description = $source.description
    }
    foreach ($optional in 'author', 'license', 'keywords') {
        if ($source.PSObject.Properties[$optional]) { $manifest[$optional] = $source.$optional }
    }

    # agents-internal/ holds specialists Copilot does not surface directly but does reach
    # through handoffs. Claude has no "internal agent" flag, so they are listed alongside
    # the public ones - otherwise the handoff targets would dangle.
    $agentFiles = @()
    foreach ($sub in 'agents', 'agents-internal') {
        $agentDir = Join-Path $dir.FullName $sub
        if (Test-Path -LiteralPath $agentDir) {
            $agentFiles += @(Get-ChildItem -LiteralPath $agentDir -Filter '*.agent.md' -File | Sort-Object Name)
        }
    }

    # The MCP servers this plugin provides. An agent's MCP tool ids must resolve to one of
    # them, because the Claude allowlist names the server and Claude namespaces a
    # plugin-provided server with its plugin.
    $declaredMcpServers = @()
    if ($source.PSObject.Properties['mcpServers']) {
        $declaredMcpServers = @($source.mcpServers.PSObject.Properties.Name)
    }

    foreach ($file in $agentFiles) {
        Update-AgentFile -File $file -PluginName $pluginName -DeclaredMcpServers $declaredMcpServers
    }

    # 'skills' is omitted deliberately: Claude Code already scans skills/ by default and the
    # field adds to that default rather than replacing it. 'agents' lists the shared files
    # explicitly, which avoids depending on how Claude globs a directory of *.agent.md.
    if ($agentFiles.Count -gt 0) {
        $manifest['agents'] = @($agentFiles | ForEach-Object {
            './' + (Get-RelativePath $_.FullName).Substring("plugins/$pluginName/".Length)
        })
    }

    # 'hooks' is omitted deliberately: Claude Code loads hooks/hooks.json automatically, and
    # naming it in the manifest as well makes the plugin fail to load with "Duplicate hooks
    # file detected". The field is only for hook files beyond that standard one.
    $hooksPath = Join-Path $dir.FullName 'hooks.json'

    if ($source.PSObject.Properties['mcpServers']) {
        $manifest['mcpServers'] = $source.mcpServers
    }

    Write-Generated -Path (Join-Path $dir.FullName '.claude-plugin/plugin.json') -Content (ConvertTo-StableJson $manifest)

    if (Test-Path -LiteralPath $hooksPath) {
        Write-Generated -Path (Join-Path $dir.FullName 'hooks/hooks.json') -Content (ConvertTo-StableJson (Convert-Hooks -Path $hooksPath))
    }

    $marketplaceEntries += [ordered]@{
        name        = $source.name
        source      = "./plugins/$pluginName"
        description = $source.description
        version     = $source.version
    }
}

# Claude-native plugins contribute their marketplace entry from their own hand-authored
# manifest, so the marketplace stays the single list of everything installable from this
# repository without the generator touching plugins it does not own.
foreach ($pluginName in $ClaudeNativePlugins) {
    $manifestPath = Join-Path $PluginsRoot "$pluginName/.claude-plugin/plugin.json"
    if (-not (Test-Path -LiteralPath $manifestPath)) {
        $script:Errors.Add("$pluginName is listed as Claude-native but has no .claude-plugin/plugin.json")
        continue
    }
    $source = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $marketplaceEntries += [ordered]@{
        name        = $source.name
        source      = "./plugins/$pluginName"
        description = $source.description
        version     = $source.version
    }
}

# Sort by the 'name' key explicitly: Sort-Object -Property on an ordered dictionary sorts by
# something other than the key's value.
$marketplaceEntries = @($marketplaceEntries | Sort-Object -Property { $_['name'] })

$marketplace = [ordered]@{
    name    = 'jsdotnet-copilot'
    owner   = [ordered]@{ name = 'Job Schepers'; url = 'https://github.com/JSdotNet' }
    plugins = $marketplaceEntries
}
Write-Generated -Path (Join-Path $RepoRoot '.claude-plugin/marketplace.json') -Content (ConvertTo-StableJson $marketplace)

#endregion

#region report

foreach ($w in $script:Warnings) { Write-Warning $w }

if ($script:Errors.Count -gt 0) {
    Write-Host 'Agent definitions need a human fix:' -ForegroundColor Red
    foreach ($e in $script:Errors) { Write-Host "  - $e" }
    exit 1
}

if ($Check) {
    if ($script:Drift.Count -gt 0) {
        Write-Host 'Claude plugin assets are out of sync with their Copilot sources:' -ForegroundColor Red
        foreach ($d in $script:Drift) { Write-Host "  - $d" }
        Write-Host ''
        Write-Host 'Run ./scripts/Sync-ClaudePlugins.ps1 and commit the result.'
        exit 1
    }
    Write-Host "Claude plugin assets are in sync across $($pluginDirs.Count) plugins." -ForegroundColor Green
    exit 0
}

if ($script:Written.Count -eq 0) {
    Write-Host "Nothing to do - $($pluginDirs.Count) plugins already load on both hosts." -ForegroundColor Green
} else {
    Write-Host "Synced $($script:Written.Count) file(s) across $($pluginDirs.Count) plugins:" -ForegroundColor Green
    foreach ($f in $script:Written) { Write-Host "  $f" }
}

#endregion
