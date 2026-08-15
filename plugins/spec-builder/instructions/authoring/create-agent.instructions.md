---
applyTo: 'agents/**/*.agent.md'
description: Dedicated rules for creating and refining GitHub Copilot agent files.
---

# Create Agent Instructions

## Purpose

- Define a consistent standard for agent authoring.
- Ensure agent files are discoverable, maintainable, and safe.

## Required Structure

1. YAML frontmatter with `name` and `description`.
2. Title with agent name.
3. Purpose section.
4. Expected behavior section.
5. Constraints and priorities section.
6. References section.
7. Custom instructions section when needed.

## Rules

- Agent files must be written in English.
- Do not pin `model`. Agent files load in both Copilot and Claude Code, and neither host
  accepts the other's model ids — a pin breaks the agent on one of them. Record the model
  preference in a `## Model` section in the body instead.
- Author `tools` as Copilot tool ids only; `scripts/Sync-ClaudePlugins.ps1` appends the
  Claude equivalents. Hand-added Claude entries are reverted on the next run.
- Keep scope explicit and avoid broad, ambiguous responsibilities.
- Document every `handoffs` target in the body. Claude ignores the `handoffs` key and
  delegates from the prose.
- Define handoff behavior only when needed and require explicit approval.
- Do not embed runtime application code implementation guidance.

## Validation Checklist

- [ ] File name follows `<role>.agent.md`.
- [ ] Frontmatter is valid YAML and `name` matches the file name.
- [ ] No `model` pin.
- [ ] `pwsh ./scripts/Sync-ClaudePlugins.ps1 -Check` passes.
- [ ] Role, scope, and constraints are explicit.
- [ ] References point to existing files.
- [ ] No conflicting instructions are present.
