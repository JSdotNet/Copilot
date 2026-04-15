---
applyTo: '.github/plugin/plugin.json,README.md'
description: Dedicated rules for creating and refining Copilot plugin package assets.
---

# Create Plugin Instructions

## Purpose

- Standardize plugin-style Copilot customization bundle composition.
- Ensure plugins are installable via Copilot CLI and maintainable over time.
- Keep plugin assets modular, discoverable, and maintainable.
- Keep project-wide naming/grouping conventions in root `.github/instructions/` files instead of duplicating them here.

## When To Apply

- Apply when a request asks to create or evolve a plugin package.
- Apply when a request combines multiple customization assets into one reusable capability.

## Required Plugin Composition Flow

1. Define plugin intent:
   - Name, target audience, and primary outcomes.
2. Define asset set:
   - Which agents, skills, hooks, and MCP/LSP configurations are required.
3. Define resource strategy:
   - Which reusable templates/checklists/examples should be added as resource files.
4. Define component paths:
   - How `plugin.json` maps `agents`, `skills`, `hooks`, and `mcpServers`.
5. Define maintenance metadata:
   - Ownership, update triggers, and semantic version notes.
6. Validate installability:
   - `copilot plugin install <local-path>` then verify with `copilot plugin list`.

## Required Files

- `.github/plugin/plugin.json`
- `README.md` with install and usage notes
- Referenced component folders (`agents/`, `skills/`, and optional config assets)

## Mandatory Copilot CLI Requirements

- A plugin must include a manifest in a GitHub-compatible location.
- For this repository, supported manifest locations include:
  - `plugin.json`
  - `.plugin/plugin.json`
  - `.github/plugin/plugin.json`
- `plugin.json` must include:
  - Required: `name` (kebab-case).
  - Recommended: `description`, `version`, `author`, `license`, `keywords`.
  - Component paths where used: `agents`, `skills`, `hooks`, `mcpServers`, `lspServers`, `commands`.
- Component folders should follow CLI defaults unless there is a strong reason to override.
- Reinstall local plugins after changes because CLI uses cached plugin components.

## Recommended Asset Layout

- `plugins/<plugin-name>/.github/plugin/plugin.json`
- `plugins/<plugin-name>/agents/*.agent.md`
- `plugins/<plugin-name>/skills/<skill-name>/SKILL.md`
- Optional plugin config files:
  - `plugins/<plugin-name>/hooks.json`
  - `plugins/<plugin-name>/.mcp.json`
  - `plugins/<plugin-name>/lsp.json`
- Optional marketplace:
  - `.github/plugin/marketplace.json`
- Optional plugin overview page:
  - `.github/plugins/<plugin-name>.md`

## Rules

- Use kebab-case plugin `name` and semantic `version`.
- Keep manifest description aligned with actual scope.
- Ensure all manifest paths map to existing directories.
- Keep plugin scope explicit and avoid hidden capabilities.
- Reinstall plugin after changes for local validation.

## Resource Rules

- Prefer reusable resources over repeated inline guidance.
- Keep resources focused and single-purpose.
- Reference resources by relative path from each consuming skill or agent.
- Keep examples realistic and safe; do not include secrets.
- Update resources when process behavior changes.

## Validation Checklist

- [ ] `plugin.json` contains valid JSON.
- [ ] Required fields are present.
- [ ] Component paths resolve correctly.
- [ ] README scope matches manifest scope.
- [ ] Documentation is fully in English.
- [ ] Required assets are enumerated and linked.
- [ ] Agents and skills reference resources instead of duplicating content when applicable.
- [ ] Local install test was executed (`copilot plugin install <path>`).

## Quality Checklist

- [ ] Plugin intent and scope are explicit.
- [ ] `plugin.json` exists and uses valid fields.
- [ ] Component paths in `plugin.json` match on-disk directories.
- [ ] Required assets are enumerated and linked.
- [ ] Agents and skills reference resources instead of duplicating content when applicable.
- [ ] Local install test was executed (`copilot plugin install <path>`).
- [ ] Documentation is fully in English.
