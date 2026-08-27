---
name: create-plugin
description: Create or refine a Copilot plugin package with valid manifest paths, scope, and documentation. Use when adding a plugin, adding components to one, or fixing its manifest.
---

# Create Plugin Skill

## Inputs

- Plugin name, version, and scope.
- Required components (agents, skills, hooks, optional config).
- Packaging or install constraints.

## Workflow

1. Define plugin intent and boundaries.
2. Draft or update `.github/plugin/plugin.json`, and confirm every component path maps to an
   existing folder.
3. Update the plugin `README.md` with install and reinstall guidance.
4. Verify metadata and scope consistency across the manifest, README, and components.
5. Prune against
   [spec-conciseness.instructions.md](../../instructions/authoring/spec-conciseness.instructions.md):
   state each rule once and point at its owner from everywhere else.
6. Run `pwsh ./scripts/Sync-ClaudePlugins.ps1` to generate the Claude manifest, hooks, and
   marketplace entry, then `-Check` to confirm the plugin loads in both hosts.

## Output

- Updated plugin package metadata and Markdown documentation.
- Regenerated Claude manifest, hooks, and marketplace entry.

## References

- [create-plugin.instructions.md](../../instructions/authoring/create-plugin.instructions.md)
- [Claude Code Compatibility](../../../../docs/copilot/claude-code-compatibility.md) — which
  files are authored, which are generated, and how a Copilot-only plugin is excluded.
