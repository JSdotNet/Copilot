# Repository routing snippet

The `knowledge-base` plugin ships the *structure and authoring rules* for the
knowledge folders. It deliberately does **not** ship repository routing policy —
which orchestration skill, specialist agent, or MCP server a repository prefers
is repository-specific, and belongs in that repository's own instruction files.

Copy the relevant parts below into the target repository, then edit them to name
the orchestrations, agents, and MCP servers that repository actually has
installed. Delete any knowledge folder the repository did not adopt.

The plugin does ship per-folder orchestration skills — `orch-arc42-content`,
`orch-domain`, `orch-tech`, `orch-design`, and `orch-backlog` — so a routing
policy can name them directly as the entry point for each folder.

## For `.github/copilot-instructions.md`

```markdown
## Guardrails

- Treat checked-in knowledge folders such as `.arc42/`, `.domain/`, `.tech/`,
  `.design/`, and `.backlog/` as **task-scoped context**, not baseline context.
  Load only the relevant chapters after routing to the correct orchestration or
  specialist agent, or when the user explicitly asks for that knowledge.
- Files under any `_meta/` folder are generated. Never hand-edit them; regenerate
  with `node .github/tools/knowledge-meta/build.mjs`.
```

## For a repository routing instructions file

```markdown
## Context loading by orchestration and agent

- Architecture, arc42, blueprint, ADR, and TDR workflows may load `.arc42/` as
  working context, but should load only the chapter(s) relevant to the requested
  scope. Route direct `.arc42/` chapter edits through `orch-arc42-content`.
- Domain modeling workflows may load `.domain/` as working context, but should
  load only the relevant bounded-context chapters. Route `.domain/` edits through
  `orch-domain`.
- Design and UX workflows may load `.design/`, and stack, dependency, or upgrade
  workflows may load `.tech/` — in both cases only the relevant file(s). Route
  edits through `orch-design` and `orch-tech`.
- Backlog-writing and issue-writing workflows may load `.backlog/`, but should
  load only the relevant work-item chapters. Route `.backlog/` edits through
  `orch-backlog`.
- Non-architecture implementation, bug-fix, package-update, documentation, and UX
  flows should not load `.arc42/` by default. Consult it only when the user
  explicitly asks for architecture context or when implementation depends on a
  specific documented decision, view, constraint, or glossary term.
```

## For an MCP authority section

```markdown
Checked-in knowledge folders are **task-scoped local fallbacks**, not default
context. Load `.arc42/`, `.domain/`, `.backlog/`, `.tech/`, or `.design/` only
when the selected orchestration or specialist agent needs that knowledge, and
then prefer only the relevant chapter(s) over whole-folder reads.
```

## Documentation-drift checkpoint

Repositories that run an orchestrated delivery flow should check these folders
for staleness after a change lands, and update them in the same pull request
when architecture, technology, design, domain behavior, or planned work moved.
