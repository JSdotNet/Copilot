---
applyTo: 'agents/**/*.agent.md'
description: Dedicated rules for creating and refining GitHub Copilot agent files.
---

# Create Agent Instructions

## Purpose

- Define a consistent standard for agent authoring.
- Ensure agent files are discoverable, maintainable, and safe.

## Required Structure

1. YAML frontmatter with `description` and `model`.
2. Title with agent name.
3. Purpose section.
4. Expected behavior section.
5. Constraints and priorities section.
6. References section.
7. Custom instructions section when needed.

## Rules

- Agent files must be written in English.
- Prefer `GPT-5.3-Codex` for tool-heavy workflows.
- Keep scope explicit and avoid broad, ambiguous responsibilities.
- Define handoff behavior only when needed and require explicit approval.
- Do not embed runtime application code implementation guidance.

## Validation Checklist

- [ ] File name follows `<role>.agent.md`.
- [ ] Frontmatter is valid YAML.
- [ ] Role, scope, and constraints are explicit.
- [ ] References point to existing files.
- [ ] No conflicting instructions are present.
