---
name: plugin-contracts
description: What a plugin resources/ contract carries, how it reaches a host, and why no plugin here ships path-scoped rules.
paths:
  - "plugins/*/resources/*.md"
---

# Plugin contracts

A plugin ships no `instructions/` folder and no rules component. Neither host auto-applies a
glob from inside a plugin — no manifest has an `instructions` or `rules` key — so a file that
carried `applyTo` there was one host's spelling on a file no host read it from.

Shared text a skill or an agent reads by path is a **contract** and lives in
`resources/<name>.md`:

- Frontmatter is `name` and `description`, and nothing else — never `applyTo` or `paths`. The
  frontmatter is what separates a contract from the templates and prompt fragments beside it,
  and it is what puts the file on the 60-line body budget.
- It reaches a session only through an explicit relative-path reference from a skill or an
  agent, in both hosts alike. Add that reference in the same change; an unreferenced contract
  silently does nothing. A rule that must apply with no reference is promoted to the plugin's
  `hooks.json` `sessionStart` prompt instead.
- Name the file for what it governs and cross-reference a sibling by bare filename.
- When it names a path in the consuming repository, carry every layout the convention supports
  — `.arc42/` and `.devbook/arc42/`, `.domain/` and `.devbook/domain/`, and so on. A layout
  the contract does not name is a layout the agent will not write to.

A rule for people working *in this repository* is different: it is authored once in
`.agents/rules/` and wrapped per host — see [README.md](README.md). A rule a plugin wants
applied on every matching read in a *consuming* repository would need an install skill that
writes it there with a wrapper per host, the way `devbook@jsdotnet` delivers its `rules/`;
no plugin here ships one, so no plugin here has a `rules/` folder.

Body budget 60 lines: `plugins/spec-builder/resources/spec-conciseness.md`.
