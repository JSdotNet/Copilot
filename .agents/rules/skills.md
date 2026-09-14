---
name: skills
description: Frontmatter and prose rules for a plugin skill.
paths:
  - "plugins/*/skills/**/SKILL.md"
---

# Skills

`skills/<name>/SKILL.md` with `name` and `description` frontmatter, plus
`disable-model-invocation: true` when [skill-invocation.md](skill-invocation.md) says the skill
is user-invoked. Nothing else goes in the frontmatter: both hosts read the same file and one
ignores what the other needs.

The description is the trigger — say when to use it, in the words a user would use, and what it
is not for. Keep host-specific tool names out of the prose: describe the action ("read the
file", "search the codebase") so each host picks its own tool.

Reference contracts in `resources/` by relative path. Neither host auto-applies a file from
inside a plugin, so the explicit reference is what loads the guidance — in both. See
[plugin-contracts.md](plugin-contracts.md).

A skill names another plugin's asset as `<plugin>:<name>` and states what happens when that
plugin is absent; a plugin is installable on its own.

Body budget 40 lines: `plugins/spec-builder/resources/spec-conciseness.md`.
