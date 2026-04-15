---
applyTo: '.github/**/*.md'
description: Defines repository-wide naming, grouping, and handoff artifact conventions for customization assets.
---

# Customization Structure Instructions

## Purpose

- Define repository-wide structure conventions that should not be duplicated inside individual plugins.
- Keep agent and instruction assets grouped consistently across this project.

## Instruction Grouping Convention

- Agent-specific instruction files should be grouped in `.github/instructions/agent/`.
- Documentation-specific instruction files should be grouped in `.github/instructions/documentation/`.
- Profile-specific instruction files should be grouped in `.github/instructions/profile/`.
- Work instruction files (stories, epics, bugs) should be grouped in `.github/instructions/work/`.
- Idea guidance should be grouped with documentation instructions.

## Agent Naming Convention

- Common agent behavior instruction files should follow `agent-<topic>.instructions.md`.
- Agent files should be stored directly under `.github/agents/`.
- When grouping is needed for agent names, use a single prefix and avoid repeating it.

## Handoff Artifact Convention

- When a handoff requires saved context, store temporary planning artifacts under `.wip/`.
- Handoff summaries should include links or paths to those artifacts.

## Language Convention

- Files under `.github/agents/**/*.md` must be written in English.
- Files under `.github/instructions/**/*.md` must be written in English.
