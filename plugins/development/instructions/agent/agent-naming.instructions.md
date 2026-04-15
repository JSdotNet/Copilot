---
applyTo: '.github/agents/copilot.agent.md'
description: Defines naming and grouping conventions for agent-related instruction assets.
---

# Agent Naming Instructions

## Purpose

- Define a clear naming convention for instruction files that steer common agent behavior.
- Keep these files easy to recognize and maintain.
- Primary use is alongside the Copilot agent.

## Naming Convention

- Use the pattern: `agent-<topic>.instructions.md`.
- Use lowercase letters and hyphens in `<topic>`.
- Keep `<topic>` short and specific.

## Grouping Convention

- Agent-specific instruction files must be grouped in `.github/instructions/agent/`.
- Documentation-specific instruction files must be grouped in `.github/instructions/documentation/`.
- Idea-specific instruction files must be grouped in `.github/instructions/idea/`.
- Profile-specific instruction files must be grouped in `.github/instructions/profile/`.
- Work instruction files (stories, epics, bugs) must be grouped in `.github/instructions/work/`.
- Agent files must be stored directly under `.github/agents/` and use prefixes in filenames when grouping is needed.
- Do not repeat a prefix in the remaining name segment (for example, `profile.agent.md`, not `profile-profile.agent.md`).

## IMPORTANT: English Enforcement for Agent and Instruction Files

- Files under `.github/agents/**/*.md` must always be written in English.
- Files under `.github/instructions/*.md` must always be written in English.
- Files under `.github/instructions/**/*.md` must always be written in English.
- This rule overrides project-specific language preferences for those folders.
- The Copilot agent must enforce this rule when creating or editing these files.
