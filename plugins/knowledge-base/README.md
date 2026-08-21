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

### Skill: `knowledge-tech-update`

Refreshes a repository's `.tech/` technology graph from deterministic package
inventories for .NET and frontend dependencies, then analyzes the repository for
non-package technologies such as runtimes, services, platforms, protocols, and
tooling before delegating graph authoring through `orch-tech`.

**Trigger keywords:** `update technology graph`, `refresh .tech`,
`technology inventory`, `.NET packages`, `frontend packages`, `package graph`

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
| `knowledge-chapter-metadata.instructions.md` | all five folders | Required `meta` block fields, `status` ladders, and `type` value sets |
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

### Tooling: `knowledge-tech`

```bash
node .github/tools/knowledge-tech/dotnet-packages.mjs --root .
node .github/tools/knowledge-tech/frontend-packages.mjs --root .
```

The inventory scripts emit deterministic JSON from repository manifests. Use them
as the source of truth for package-derived `.tech` facts; use repository analysis
for technologies that do not appear in package manifests.

### Assets

| File | Purpose |
|------|---------|
| `assets/workflows/knowledge-meta.yml` | CI workflow template installed by the init skill |
| `assets/routing-snippet.md` | Optional repository-local context-loading and routing policy |

### Hook configuration

- `hooks.json` adds a session-start guardrail: knowledge folders are task-scoped
  context rather than baseline context, `meta` blocks are mandatory on every
  chapter, and `_meta/` is never hand-edited.

## Migrating to schema version 2

Schema version 2 moves the *kind* of a chapter out of its heading and into a
`type` metadata field. A repository written against version 1 keeps parsing,
but `build.mjs --check` reports errors until it is migrated. Re-sync
`.github/tools/knowledge-meta/` from this plugin first, then:

1. **Strip kind prefixes from `.domain` headings.** `## Aggregate: Order`
   becomes `## Order`; the same for `Domain Service:`, `Domain Event:`,
   `Feature:`, `Sub-feature:`, and `Term:`. File titles lose theirs too —
   `# Domain: Order Management`, `# Features: Order Management`, and
   `# Naming: Order Management` all become `# Order Management`.
   `## Shared Value Objects` and `## Shared Enums` keep their headings: those
   name a grouping, not a single thing. `.domain/context-map.md` has no context
   name to fall back to, so title it after the system the map covers
   (`# Backlog`); its `type: context-map` carries the kind.
2. **Add `type` to every `meta` block.** Values come from the folder's own
   instructions file — `knowledge-domain.instructions.md` for `.domain`,
   `knowledge-tech.instructions.md` for `.tech`. File-level blocks take a
   file-level value (`domain`, `features`, `model`, …) matching the filename.
   `.arc42`, `.backlog`, and `.design` define no value set and take no `type`.
3. **Promote Entity, Value Object, and Enum sub-chapters one level.** Delete
   the `### Entities`, `### Value Objects`, and `### Enums` grouping headings
   and lift their `#### <Name>` children to `### <Name>` directly under the
   aggregate. Each now carries its own `meta` block with `type: entity`,
   `type: value-object`, or `type: enum` — they are no longer covered by the
   parent aggregate's block.
4. **Rewrite every anchor.** Any `related` / `depends-on` entry pointing at a
   prefixed heading now points at the bare name:
   `#aggregate-order` → `#order`, `#feature-checkout` → `#checkout`,
   `#term-basket` → `#basket`. Anchors in prose links need the same treatment.
5. **Rename `.tech`'s `kind` field to `type`.** Easy to miss, because it is a
   separate mechanical edit in a different folder from all the work above, and
   nothing fails if you skip it. Values are unchanged — only the field name
   moves, so this is a find-and-replace of `kind:` to `type:` across
   `.tech/*.md`. `kind` remains supported as a deprecated alias that reports a
   **warning, never an error**, so `.domain` can be migrated and landed on its
   own and `.tech` can follow in a later commit.
6. **Regenerate and check.**

   ```bash
   node .github/tools/knowledge-meta/build.mjs
   node .github/tools/knowledge-meta/build.mjs --check
   ```

   Run `knowledge-base-validate` for anything still reported.

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
├── tools/knowledge-tech/              # deterministic package inventory scripts
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
