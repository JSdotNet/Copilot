---
applyTo: 'skills/**/SKILL.md'
description: Dedicated rules for creating and refining GitHub Copilot skills.
---

# Create Skill Instructions

## Purpose

- Define a consistent approach for skill authoring.
- Ensure each skill is focused and easy for the model to discover.

## Required Structure

1. YAML frontmatter with `name` and `description`.
2. Skill title.
3. Purpose and trigger conditions.
4. Input expectations.
5. Step-by-step workflow.
6. Output expectations and quality checks.

## Rules

- Keep one primary workflow per skill.
- Use explicit trigger language in `description`.
- Keep content in English.
- Avoid embedding unrelated responsibilities.
- Reference reusable resources instead of duplicating long guidance.

## Validation Checklist

- [ ] Skill folder and `name` are aligned.
- [ ] Description is discoverable and task-specific.
- [ ] Workflow is actionable and complete.
- [ ] Scope is narrow and unambiguous.
