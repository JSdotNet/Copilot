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

## Output

- Updated plugin package metadata and Markdown documentation.
