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
- Keep content in English.
- Avoid embedding unrelated responsibilities.
- Reference reusable resources instead of duplicating long guidance.

## Invocation Mode

Choose the mode before writing the description; it decides what the description is for.

- **Model-invoked** (omit `disable-model-invocation`) — the model may fire the skill, and another skill or agent may reach it. Use explicit trigger language in `description`. The description is loaded on every turn, so it is a permanent cost.
- **User-invoked** (`disable-model-invocation: true`) — only the human typing the name can invoke it; nothing else can reach it. Write `description` as one human-facing line and strip the trigger lists.

The test: could the model usefully reach for this skill on its own, or must another skill or agent reach it? If neither, make it user-invoked and pay no context load. Never make a skill user-invoked when an agent, a hook prompt, or another skill invokes it by name.

## Dual-Host Rules

Skills are the most portable asset type: `skills/<name>/SKILL.md` with `name` and
`description` frontmatter is read identically by GitHub Copilot and Claude Code, at the same
path, with no generated counterpart. Keep them that way.

- Stick to `name` and `description` in frontmatter. Both hosts understand them; anything
  else is honoured by at most one. The one sanctioned exception is
  `disable-model-invocation: true`: Claude Code honours it, GitHub Copilot ignores unknown
  keys, so a user-invoked skill stays model-invocable on the Copilot side. That degrades
  safely, and it is why a shortened description must still be accurate prose — on Copilot it
  remains the model's only signal.
- Do not name host-specific tools in the body (`read/readFile`, `Read`, `edit/editFiles`).
  Describe the *action* — "read the file", "search the codebase" — and let each host pick
  its own tool.
- Reference instruction and resource files by relative path. Claude does not auto-apply
  `applyTo`, so an explicit reference is what makes the guidance load in both hosts.
- Note optional MCP dependencies in a `compatibility` field or in the body, with a fallback
  for when the server is absent.

## Validation Checklist

- [ ] Skill folder and `name` are aligned.
- [ ] Invocation mode is chosen deliberately, and the description matches it — trigger language when model-invoked, one human-facing line when user-invoked.
- [ ] No skill reached by an agent, a hook prompt, or another skill is marked user-invoked.
- [ ] No host-specific tool names appear in the body.
- [ ] Description is discoverable and task-specific.
- [ ] Workflow is actionable and complete.
- [ ] Scope is narrow and unambiguous.
