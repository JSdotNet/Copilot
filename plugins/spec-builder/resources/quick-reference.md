# Quick Reference — Customization Assets

Concise decision guide and troubleshooting checklist for authoring customization assets.

## When To Use Which Asset Type

| Asset | File pattern | Use when | Hosts |
|---|---|---|---|
| Repository instructions | `.github/copilot-instructions.md` | Repository-wide standards that apply to every conversation | Copilot |
| Path-specific instructions | `.github/instructions/*.instructions.md` | Rules that apply only to specific file paths or asset types | Both, but `applyTo` is Copilot-only |
| Agent | `.github/agents/*.agent.md` | You need a named persona with specific tools, tone, and handoff behavior | Both |
| Skill | `.github/skills/<skill>/SKILL.md` | You have a reusable multi-step workflow with defined inputs, steps, and outputs | Both |
| Prompt | `.github/prompts/*.prompt.md` | You want a slash-command-style shortcut for a specific, repeatable request | Copilot |
| Canvas extension | `.github/extensions/<name>/extension.mjs` | You need an interactive side-panel surface the agent can open and drive with actions | Copilot only |
| GitHub Actions workflow | `.github/workflows/*.yml` | You need CI/CD automation triggered by repository events, schedules, or manual dispatch | n/a |

## Dual-Host Cheat Sheet

Plugin assets in this repository load in both GitHub Copilot and Claude Code from one copy.

| Rule | Why |
|---|---|
| Never pin `model` in an agent | Claude refuses to load an agent whose model id it does not recognise |
| Author `tools` as Copilot ids only | `Sync-ClaudePlugins.ps1` appends the Claude equivalents; hand-added ones are reverted |
| Give every agent a `name` | Required by Claude, honoured by Copilot |
| Document handoff targets in the body | Claude ignores the `handoffs` key |
| Reference instruction files by path | Claude does not auto-apply `applyTo` |
| Keep host-specific tool names out of skill prose | Describe the action, not the tool |
| Hooks may only use `type: "prompt"` | The only hook type with a cross-host translation |
| Run the sync script before committing | CI fails on drift between the two manifests |

Full rules: `docs/copilot/claude-code-compatibility.md`.

## Troubleshooting: Asset Not Being Picked Up

Work through this checklist when a customization file is not applied by Copilot:

- [ ] File is in the correct location for its type (see table above).
- [ ] File name and extension follow the required pattern (e.g. `*.agent.md`, `*.instructions.md`).
- [ ] Frontmatter is valid YAML with no syntax errors.
- [ ] `applyTo` glob matches the file currently open in the editor.
- [ ] Check Chat diagnostics (Copilot Chat → `...` menu → Show Diagnostics) to see which files were loaded.
- [ ] Verify relevant VS Code settings are enabled:
  - `chat.useAgentsMdFile`
  - `chat.includeApplyingInstructions`
  - `chat.instructionsFilesLocations`
