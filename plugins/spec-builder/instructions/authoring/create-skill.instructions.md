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

## Dual-Host Rules

Skills are the most portable asset type: `skills/<name>/SKILL.md` with `name` and
`description` frontmatter is read identically by GitHub Copilot and Claude Code, at the same
path, with no generated counterpart. Keep them that way.

- Stick to `name` and `description` in frontmatter. Both hosts understand them; anything
  else is honoured by at most one.
- Do not name host-specific tools in the body (`read/readFile`, `Read`, `edit/editFiles`).
  Describe the *action* — "read the file", "search the codebase" — and let each host pick
  its own tool.
- Reference instruction and resource files by relative path. Claude does not auto-apply
  `applyTo`, so an explicit reference is what makes the guidance load in both hosts.
- Note optional MCP dependencies in a `compatibility` field or in the body, with a fallback
  for when the server is absent.

## Validation Checklist

- [ ] Skill folder and `name` are aligned.
- [ ] No host-specific tool names appear in the body.
- [ ] Description is discoverable and task-specific.
- [ ] Workflow is actionable and complete.
- [ ] Scope is narrow and unambiguous.
