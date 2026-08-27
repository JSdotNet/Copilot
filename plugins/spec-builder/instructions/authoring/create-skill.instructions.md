---
applyTo: 'skills/**/SKILL.md'
description: Dedicated rules for creating and refining GitHub Copilot skills.
---

# Create Skill Instructions

## Purpose

- Define a consistent approach for skill authoring.
- Ensure each skill is focused and easy for the model to discover.

## Minimum Structure

Required: YAML frontmatter with `name` and `description`, a title, and the workflow steps.

Add inputs, outputs, and quality checks when the steps do not already make them obvious.

## Rules

- Keep one primary workflow per skill.
- Put explicit trigger language in `description`, naming each distinct case the skill handles.
- Describe the action — "read the file", "search the codebase" — so each host picks its own
  tool; skills are read verbatim by Copilot and Claude Code alike.
- Reference instruction and resource files by relative path. Claude does not auto-apply
  `applyTo`, so the explicit reference is what loads the guidance in both hosts.
- Note optional MCP dependencies in the body, with a fallback for when the server is absent.
- Follow [spec-conciseness.instructions.md](spec-conciseness.instructions.md) for pruning and
  the 40-line budget.

## Validation Checklist

- [ ] Skill folder and `name` are aligned.
- [ ] No host-specific tool names appear in the body.
- [ ] Description is discoverable and task-specific.
- [ ] Workflow is actionable and complete.
- [ ] Every line changes behavior versus the model default, and no meaning appears twice.
