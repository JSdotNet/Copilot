---
applyTo: 'agents/**/*.agent.md'
description: Defines plugin-local naming conventions for agent-related instruction assets.
---

# Agent Naming Instructions

## Purpose

- Define plugin-local naming conventions for instruction files that steer common agent behavior.
- Keep plugin instruction files easy to recognize and maintain.

## Naming Convention

- Use the pattern: `agent-<topic>.instructions.md`.
- Use lowercase letters and hyphens in `<topic>`.
- Keep `<topic>` short and specific.

## Grouping Convention

- Keep plugin agent-governance instructions in `instructions/agent/`.
- Keep plugin asset-authoring instructions in `instructions/authoring/`.
- Keep names explicit and topic-scoped.

## Examples

- Authoring group:
  - `authoring/create-agent.instructions.md`
  - `authoring/create-instruction.instructions.md`
  - `authoring/create-plugin.instructions.md`
  - `authoring/create-skill.instructions.md`

## Scope Note

- This convention applies only to the plugin-local `instructions/` folder.
- Repository-wide grouping conventions are defined in project-level `.github/instructions/` assets.

## IMPORTANT: English Enforcement for Agent and Instruction Files

- Plugin agent and instruction assets must always be written in English.

## Quick Compliance Check

- [ ] Common agent behavior instruction files follow `agent-<topic>.instructions.md`.
- [ ] Plugin governance instructions are in `instructions/agent/`.
- [ ] Plugin authoring instructions are in `instructions/authoring/`.
- [ ] Topic names are specific and readable.
- [ ] The file purpose is clearly agent-behavior related.
- [ ] Plugin instruction and agent content is in English.