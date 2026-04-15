# Quick Reference — GitHub Copilot Customization Assets

Concise decision guide and troubleshooting checklist for authoring GitHub Copilot customization assets.

## When To Use Which Asset Type

| Asset | File pattern | Use when |
|---|---|---|
| Repository instructions | `.github/copilot-instructions.md` | Repository-wide standards that apply to every conversation |
| Path-specific instructions | `.github/instructions/*.instructions.md` | Rules that apply only to specific file paths or asset types |
| Agent | `.github/agents/*.agent.md` | You need a named persona with specific tools, tone, and handoff behavior |
| Skill | `.github/skills/<skill>/SKILL.md` | You have a reusable multi-step workflow with defined inputs, steps, and outputs |
| Prompt | `.github/prompts/*.prompt.md` | You want a slash-command-style shortcut for a specific, repeatable request |

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
