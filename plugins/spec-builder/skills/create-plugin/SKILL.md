---
name: create-plugin
description: Create or refine a Copilot plugin package with valid manifest paths, scope, and documentation.
---

# Create Plugin Skill

## Purpose

Use this skill to create or refine installable Copilot plugin package assets.

## Inputs

- Plugin name, version, and scope.
- Required components (agents, skills, optional config).
- Packaging or install constraints.

## Workflow

1. Define plugin intent and boundaries.
2. Draft or update `.github/plugin/plugin.json`.
3. Ensure component paths map to existing folders.
4. Update plugin `README.md` with install/reinstall guidance.
5. Verify metadata and scope consistency across files.
6. Run `pwsh ./scripts/Sync-ClaudePlugins.ps1` to generate the Claude manifest and hooks,
   then `-Check` to confirm the plugin loads in both hosts.

## Dual-host packaging

Plugins in this repository are authored once for Copilot and also load in Claude Code. Write
only the Copilot side; the sync script derives the rest.

| Authored | Generated |
|---|---|
| `.github/plugin/plugin.json` | `.claude-plugin/plugin.json` |
| `hooks.json` | `hooks/hooks.json` |
| — | `.claude-plugin/marketplace.json` (repo root) |

Never hand-edit the generated files. Skills, instructions, prompts, resources, and agents
are shared verbatim and have no generated counterpart.

A plugin whose core capability is a Copilot CLI canvas extension cannot load in Claude; add
it to `$ExcludedPlugins` in the sync script and say so in its README.

## Output

- Updated plugin package metadata and Markdown documentation.
- Regenerated Claude manifest, hooks, and marketplace entry.
