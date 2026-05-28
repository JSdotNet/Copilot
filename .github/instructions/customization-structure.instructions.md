---
applyTo: '.github/**/*.md'
description: Defines repository-wide naming, grouping, and handoff artifact conventions for customization assets.
---

# Customization Structure Instructions

## Purpose

- Define repository-wide structure conventions that should not be duplicated inside individual plugins.
- Keep agent and instruction assets grouped consistently across this project.
- Apply conventions in this order when trade-offs exist: grouping location, naming pattern, then language.
- Apply only the conventions relevant to the current artifact type; do not combine unrelated grouping rules.

## Instruction Grouping Convention

- Agent-specific instruction files should be grouped in `.github/instructions/agent/`.
- Documentation-specific instruction files should be grouped in `.github/instructions/documentation/`.
- Profile-specific instruction files should be grouped in `.github/instructions/profile/`.
- Work instruction files (stories, epics, bugs) should be grouped in `.github/instructions/work/`.
- Idea guidance files, such as brainstorming notes or conceptual outlines, should be grouped with documentation instructions.

## Agent Naming Convention

- Common agent behavior instruction files should follow `agent-<topic>.instructions.md`.
- Agent files should be stored directly under `.github/agents/`.
- When grouping is needed for agent names, use one consistent prefix (for example, `agent-`) and avoid redundant patterns such as `agent-agent-<topic>`.

## Handoff Artifact Convention

- When a handoff requires saved context, store temporary planning artifacts under `.wip/`.
- Handoff summaries should include links or paths to those artifacts.

## Language Convention

- Files under `.github/agents/**/*.md` must be written in English.
- Files under `.github/instructions/**/*.md` must be written in English.
