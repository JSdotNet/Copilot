---
applyTo: 'agents/spec-*.agent.md'
description: Defines the single-agent authoring workflow for GitHub customization assets.
---

# Spec Workflow Instructions

## Purpose

- Enforce one predictable workflow for customization asset authoring.
- Keep the plugin to a single agent that uses the plugin `create-*` skills.

## Required Sequence

1. Scope — determine asset type, target files, and acceptance criteria.
2. Plan — present ordered changes with file targets and confirm non-trivial scope.
3. Build — apply changes using the matching `create-*` skill.
4. Verify — check frontmatter, naming, structure, references, and instruction compliance.
5. Report — summarize changed files, findings, and unresolved items.

## Role Boundaries

- `spec-builder.agent.md` owns planning, execution, and verification.
- Asset-specific rules stay in `instructions/authoring/*.instructions.md` and the `create-*` skills.
- Do not add planning-only or review-only agents to this plugin.

## Tool Policy

- The agent may include read, search, and edit tools required to author assets.
- Canvas work requires `extensions_manage` and `extensions_reload`.

## Handoff Policy

- Handoff to another plugin's agent is optional and only when the request leaves customization authoring scope.
- Every handoff requires explicit user approval using the wording:
  - "I recommend handing this off to `<agent>` because `<reason>`. Do you approve this handoff?"

## Validation Checklist

- [ ] The plugin exposes exactly one agent, named `spec-builder`.
- [ ] The agent maps each asset type to a `create-*` skill.
- [ ] The five workflow phases are followed in order.
- [ ] Changed file paths are reported.
- [ ] Any cross-plugin handoff is approval-gated.
