# Knowledge Base Plugin

Encapsulates the `.arc42` / `.domain` / `.tech` / `.design` / `.backlog`
knowledge-folder convention: durable, cross-linked Markdown knowledge with
machine-readable `meta` blocks, derived `_meta/` indexes, a graph canvas, and a
CI check that keeps references and indexes honest.

## Installation

```bash
copilot plugin install JSdotNet/Copilot:plugins/knowledge-base
```

Re-run the same command after changing the plugin.

## What the convention is

Each knowledge folder holds Markdown chapters. Every chapter carries a `meta`
block declaring its identity, status, reading order, and its relationships to
other chapters. A generator walks the corpus and writes derived indexes under
`_meta/`, which CI validates on every pull request.

| Folder | Holds |
|--------|-------|
| `.arc42/` | arc42 architecture chapters, ADRs, TDRs |
| `.domain/` | Bounded contexts, ubiquitous language, aggregates, domain flows |
| `.tech/` | Technology graph: platforms, runtimes, frameworks, versions, maturity |
| `.design/` | UX and visual design guidelines, tokens, design rules |
| `.backlog/` | Durable work-item chapters |

Adoption is partial by design — a repository may take only `.domain` and
`.arc42`, and the tooling emits scopes for the folders that actually exist.

## Features

### Skill: `knowledge-base-init`

Scaffolds the convention into a repository: creates the chosen folders, installs
the generator to `.github/tools/knowledge-meta/`, installs the CI workflow,
offers repository routing policy, and generates the first indexes.

**Trigger keywords:** `knowledge base`, `knowledge folders`, `scaffold .arc42`,
`scaffold .domain`, `set up .tech`, `set up .design`, `knowledge-meta`,
`adopt knowledge convention`

### Skill: `knowledge-base-validate`

Runs the check and repairs what it reports — broken references, missing or
malformed `meta` blocks, inconsistent reading order, stale committed indexes.

**Trigger keywords:** `knowledge-meta failed`, `broken reference`, `stale _meta`,
`validate knowledge folders`, `knowledge base check`, `build.mjs --check`

### Skill: `orch-arc42-content`

Orchestrates direct content edits to `.arc42/` chapters — refreshing a chapter,
section, or diagram — with metadata enforcement and a consistency review. Defers
decision-record and blueprint-scale work to `orch-adr`, `orch-tdr`,
`orch-blueprint`, and `orch-architecture`.

**Trigger keywords:** `update arc42 chapter`, `refresh runtime view`,
`arc42 diagram`, `add glossary term`, `edit .arc42`, `quality requirements`

### Skill: `orch-domain`

Orchestrates `.domain/` changes — bounded-context model, features, model and
flow diagrams, dependencies, and naming — through `domain-design:domain-architect`
with template and metadata enforcement.

**Trigger keywords:** `bounded context`, `context map`, `new aggregate`,
`domain model`, `ubiquitous language`, `domain flow`, `edit .domain`

### Skill: `orch-backlog`

Orchestrates `.backlog/` work-item chapters — Items and Sub-items grouped by
concern — drafting through `write-epic` / `write-story` / `write-bug` and
publishing through `create-github-issue` / `update-github-issue`.

**Trigger keywords:** `backlog item`, `add sub-item`, `work item chapter`,
`publish to issue`, `edit .backlog`, `concern file`

### Skill: `orch-tech`

Orchestrates `.tech/` technology-graph changes — adding a technology, pinning a
version, promoting or retiring a status, adding a layer — and keeps the graph
diagram in sync with the `depends-on` edges.

**Trigger keywords:** `technology graph`, `add technology`, `pin version`,
`promote to adopted`, `retire technology`, `edit .tech`

### Skill: `orch-design`

Orchestrates `.design/` guideline changes — principles, tokens, typography and
layout, interaction, accessibility, component libraries — grounded in the
repository's authoritative design source, through `ux-design:ux-designer`.

**Trigger keywords:** `design tokens`, `color scheme`, `design guideline`,
`interaction rule`, `accessibility guideline`, `component library`, `edit .design`

### Instructions (auto-applied)

| File | Pattern | Purpose |
|------|---------|---------|
| `knowledge-chapter-metadata.instructions.md` | all five folders | Required `meta` block fields and value ladders |
| `knowledge-domain.instructions.md` | `.domain/**` | Bounded-context structure and ubiquitous language |
| `knowledge-arc42.instructions.md` | `.arc42/**` | arc42 chapter, ADR, and TDR structure |
| `knowledge-tech.instructions.md` | `.tech/**` | Technology graph, versions, maturity ladder |
| `knowledge-design.instructions.md` | `.design/**` | Design guideline scope and token rules |
| `knowledge-backlog.instructions.md` | `.backlog/**` | Work-item chapter structure |
| `knowledge-derived-artifacts.instructions.md` | `**/_meta/**` | Placement, naming, and envelope rules for generated files |
| `knowledge-naming.instructions.md` | knowledge folders and `_meta` | Underscore and dot prefixes, kebab-case, no redundant suffixes |

Every glob is scoped to the knowledge folders, so the plugin stays silent in
repositories and files that have not adopted the convention.

### Extension: `knowledge-canvas`

Renders the knowledge graph as an interactive canvas — chapters as nodes,
`related` / `depends-on` / `refines` as edges — using the same graph code the
generator writes, so the live view and the committed indexes never disagree.

### Tooling: `knowledge-meta`

```bash
node .github/tools/knowledge-meta/build.mjs            # write every adopted scope
node .github/tools/knowledge-meta/build.mjs --check    # CI: verify only
node .github/tools/knowledge-meta/build.mjs --scope .tech
node .github/tools/knowledge-meta/build.mjs --root ../other-repo
```

Output is deterministic — no timestamps — so a clean `git diff` proves the
committed indexes are current. See `tools/knowledge-meta/README.md` for the
output shape.

### Assets

| File | Purpose |
|------|---------|
| `assets/workflows/knowledge-meta.yml` | CI workflow template installed by the init skill |
| `assets/routing-snippet.md` | Optional repository-local context-loading and routing policy |

### Hook configuration

- `hooks.json` adds a session-start guardrail: knowledge folders are task-scoped
  context rather than baseline context, `meta` blocks are mandatory on every
  chapter, and `_meta/` is never hand-edited.

## Folder structure

After running `knowledge-base-init`, a repository that adopted everything has:

```
.arc42/
├── _meta/{graph.json,index.json}
└── <chapter>.md
.domain/
├── _meta/{graph.json,index.json}
└── <bounded-context>/<chapter>.md
.tech/
├── _meta/{graph.json,index.json}
├── technology-graph.md
└── <layer>.md
.design/
├── _meta/{graph.json,index.json}
└── <guideline>.md
.backlog/
├── _meta/{graph.json,index.json}
└── <item>.md
_meta/{graph.json,index.json}          # repository-wide rollup
.github/
├── tools/knowledge-meta/              # the generator
└── workflows/knowledge-meta.yml       # the CI check
```

## Enforcement

Five layers, weakest to strongest:

1. **Instructions** auto-apply on the governed paths in every repository where
   the plugin is installed.
2. **The session-start hook** stops agents treating knowledge folders as baseline
   context or hand-editing derived files.
3. **`meta` block rules** make every chapter's relationships explicit and
   checkable.
4. **`build.mjs --check`** fails on unresolved references and inconsistent order.
5. **The CI workflow** fails the pull request on broken references or stale
   indexes.

## License

MIT
