# Knowledge Base Plugin

Encapsulates the `.arc42` / `.domain` / `.tech` / `.design` / `.backlog`
knowledge-folder convention: durable, cross-linked Markdown knowledge with
machine-readable `meta` blocks, derived `_meta/` indexes, a graph canvas, and a
CI check that keeps references honest.

## Installation

```bash
copilot plugin install JSdotNet/Copilot:plugins/knowledge-base
```

Re-run the same command after changing the plugin.

## What the convention is

Each knowledge folder holds Markdown chapters. Every chapter carries a `meta`
block declaring its identity, status, reading order, and its relationships to
other chapters. A generator walks the corpus and writes derived indexes under
`_meta/`, which CI validates on every pull request and a scheduled job keeps
current.

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
the generator to `.github/tools/knowledge-meta/`, installs the CI workflow and
the two refresh paths, offers repository routing policy, and generates the
first indexes.

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

### Skills: `capture-<kind>` and `build-<kind>`

Two directions between a knowledge chapter and the code that implements it:

- **`capture-<kind>`** — something exists in the application and the
  chapter is missing, thin, or stale, so read the implementation and write the
  chapter. Source and tests are the only evidence; comments, TODOs, and disabled
  tests are not. The write routes through the folder's own orchestration skill.
- **`build-<kind>`** — a chapter is agreed but unbuilt, so turn it
  into a change brief (outcomes, invariants, ubiquitous language, out of scope,
  acceptance checks) plus a change category, then stop. It never edits a source
  or test tree, and never names a code-side orchestration — which delivery flow
  picks the brief up is the user's decision, made after reading it.

**`build` covers both from scratch and update**, despite the name. The change
category is that axis, and counterpart resolution picks between them before the
brief is written: `new functionality` when no counterpart exists at all, `change
to existing behaviour` when one exists and the chapter asks for more, and
`defect` when one was believed to already satisfy an agreed chapter and does not.
That is why a build skill reads code — not to change it, but to establish what is
already there so the brief asks only for the delta, and an update brief lists
where the current behaviour lives.

Seven kinds, two directions each:

| Kind | Target | `type` value(s) | Spec-side write |
|------|--------|-----------------|-----------------|
| `aggregate` | `.domain/<context>/domain.md` | `aggregate`, `entity`, `value-object`, `enum`, `shared-value-objects`, `shared-enums`, `domain-event` | `orch-domain` |
| `domain-service` | `.domain/<context>/domain.md` | `domain-service`, plus `domain-event` for events the service itself raises | `orch-domain` |
| `feature` | `.domain/<context>/features.md` | `feature`, `sub-feature` | `orch-domain` |
| `bounded-context` | `.domain/<context>/` — the whole folder | file-level `domain`, `features`, `model`, `flow`, `dependencies`, `naming`, plus `context-map` at the `.domain` root | `orch-domain` |
| `building-block` | `.arc42/05-building-block-view.md` | none — `.arc42` defines no value set | `orch-arc42-content` |
| `deployment` | `.arc42/07-deployment-view.md` | none — `.arc42` defines no value set | `orch-arc42-content` |
| `design-component` | `.design/component-libraries.md` | none — `.design` defines no value set | `orch-design` |

**The aggregate is the unit, not its parts.** One pass covers the root, every
entity, value object, and enum it owns, the shared value-object and enum
groupings, and the domain events it raises. An aggregate is a consistency
boundary and its parts are only meaningful in terms of that boundary, so
capturing them separately would mean reading the same root several times and
deciding the boundary several times, with several chances to decide it
differently — and building them separately would produce work items that cannot
land independently.

A **domain service** is the deliberate exception: it is defined by coordinating
across boundaries rather than living in one, so folding it into a boundary's pass
would be backwards. It keeps its own pair, and owns the events it raises itself.

**`capture-feature` runs the application.** `features.md` is the one knowledge
file written from the user's point of view, so that pass starts the app, walks
the feature, and captures a screenshot per step — reading a controller tells you
a route exists, while using the feature tells you what the product lets someone
do, in what order, with what wording. It prefers the repository's own runtime and
QA workflows (`qa:aspire-run`, `qa:playwright-screenshot`) where installed, runs
only against a local or disposable environment, never exercises a destructive
step to document it, and keeps the screenshots as report evidence rather than
committing them to a knowledge folder.

**`naming.md` term chapters have no pair of their own.** They are written through
`orch-domain`, and populated incrementally by the capture passes: whenever one
resolves a counterpart by inference rather than by an existing alias, it proposes
a term with the discovered code name as an `alias`, which turns a one-off
inference into a durable pairing for the next pass. A `bounded-context` capture
creates the file as part of the context folder.

`.tech` has no pair here — `knowledge-tech-update` already covers that direction
— and neither does `.backlog`.

The shared rules live once in `assets/code-sync-protocol.md`, which all 14 skills
reference and none repeats: counterpart resolution, the evidence rules (including
why unit tests are first-class evidence for capture rather than a cross-check), a
five-way drift verdict (`aligned`, `code-ahead`, `spec-ahead`, `conflict`,
`unresolved`, where `conflict` always stops and asks), the status rules, index
regeneration, and a shared report table.

Counterpart resolution deliberately uses **no metadata field** linking a chapter
to a code path — a path in a `meta` block rots on the first refactor and gives no
signal when it does. It goes through `naming.md` `aliases`, then the `.arc42`
building-block view, then the observed naming convention, and reports
`unresolved` rather than guessing.

The dependency on the `orch-*` skills is one-way. A capture skill names its
folder's orchestration and hands over grounded input; no `orch-*` skill knows
these skills exist.

**Trigger keywords:** `document what we built`, `capture from code`,
`.domain is stale`, `build the aggregate we agreed`, `build this chapter`,
`change brief`, `spec code drift`, `the code has an invariant the chapter omits`

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

```powershell
./build/Update-KnowledgeIndex.ps1                      # refresh, and say what moved
./build/Update-KnowledgeIndex.ps1 -Scope .tech
./build/Update-KnowledgeIndex.ps1 -Check               # validate, write nothing
```

```bash
node .github/tools/knowledge-meta/build.mjs            # write every adopted scope
node .github/tools/knowledge-meta/build.mjs --check    # CI: verify only
node .github/tools/knowledge-meta/build.mjs --scope .tech
node .github/tools/knowledge-meta/build.mjs --root ../other-repo
```

Output is deterministic — no timestamps — so a clean `git diff` proves the
committed indexes are current. See `tools/knowledge-meta/README.md` for the
output shape and for when to refresh.

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
| `assets/workflows/knowledge-meta.yml` | CI workflow template installed by the init skill: fails on broken references, warns on drifted indexes |
| `assets/workflows/knowledge-meta-nightly.yml` | Scheduled index refresh; opens one pull request when the output drifted, nothing when it did not |
| `assets/build/Update-KnowledgeIndex.ps1` | On-demand index refresh, with `-Scope` and `-Check`; reports which index files moved |
| `assets/routing-snippet.md` | Optional repository-local context-loading and routing policy |
| `assets/code-sync-protocol.md` | Shared rules for the `capture-*` / `build-*` skills: counterpart resolution, evidence rules including why unit tests are first-class evidence for capture, the five-way drift verdict, status rules, index regeneration, and the report table. An asset rather than an instruction, because an honest `applyTo` glob for these rules would have to cover source trees and would break the plugin's silence in non-adopting repositories |

### Hook configuration

- `hooks.json` adds a session-start guardrail: knowledge folders are task-scoped
  context rather than baseline context, `meta` blocks are mandatory on every
  chapter, and `_meta/` is never hand-edited.

## Migrating to schema version 3

Schema version 3 is **additive** over 2 and needs no authoring changes. A `file`
entry in `index.json` may now carry two optional fields — `summary`, the
document's lede, and `diagrams`, how many mermaid blocks and images it embeds —
so a viewer can render a knowledge folder's list view without opening any
Markdown. `graph.json` is unchanged apart from the version number.

Re-sync `.github/tools/knowledge-meta/` from this plugin and regenerate; the
diff is the new fields and the bumped `schemaVersion`. Also install the two
refresh assets that ship with this version — `assets/build/Update-KnowledgeIndex.ps1`
and `assets/workflows/knowledge-meta-nightly.yml` — and re-copy
`assets/workflows/knowledge-meta.yml`, whose staleness step now warns instead of
failing. See `knowledge-derived-artifacts.instructions.md` for the policy and
for the freshness contract a runtime consumer of these indexes has to honour.

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
   name to fall back to, so prefer titling it after the system the map covers
   (`# Backlog`), with `type: context-map` carrying the kind; a plain
   `# Context Map` is also accepted. If it already has a sensible title, leave
   it — this step is about stripping *kind prefixes*, and that file never had
   one.
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
build/
└── Update-KnowledgeIndex.ps1          # on-demand index refresh
.github/
├── tools/knowledge-meta/              # the generator
├── tools/knowledge-tech/              # deterministic package inventory scripts
├── workflows/knowledge-meta.yml       # the CI check
└── workflows/knowledge-meta-nightly.yml   # the scheduled index refresh
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
5. **The CI workflow** fails the pull request on broken references or
   inconsistent reading order. Drifted `_meta/` indexes are reported as a
   warning, not a failure — making every knowledge pull request carry a
   regenerated index is what turns those files into merge conflicts. Refresh is
   deliberate instead: `build/Update-KnowledgeIndex.ps1` on demand, the nightly
   workflow on a schedule. A consumer that reads an index at runtime owes the
   other half of that contract — re-read any source newer than the index.

## License

MIT
