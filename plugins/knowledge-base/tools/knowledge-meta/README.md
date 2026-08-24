# Knowledge metadata tooling

Derives machine-readable indexes from the `meta` blocks embedded in
`.arc42/`, `.domain/`, `.backlog/`, `.tech/`, and `.design/`:

- **`graph.json`** — the reference graph between chapters and files.
- **`index.json`** — the ordered reading outline of each area.

Markdown stays canonical; these indexes are **derived output** — never edit
them by hand. Placement and naming follow
the `knowledge-derived-artifacts` instructions.

## Usage

Prefer the wrapper — it reports which index files actually moved, so a refresh
that changed nothing is visibly a no-op:

```powershell
./build/Update-KnowledgeIndex.ps1                 # every adopted scope
./build/Update-KnowledgeIndex.ps1 -Scope .tech    # one scope only
./build/Update-KnowledgeIndex.ps1 -Check          # validate, write nothing
```

The generator underneath, for CI and for anywhere pwsh is not available:

```bash
# Regenerate every adopted scope
node .github/tools/knowledge-meta/build.mjs

# One scope only
node .github/tools/knowledge-meta/build.mjs --scope .tech

# Validate references without writing (exit 1 on a broken reference)
node .github/tools/knowledge-meta/build.mjs --check

# Point at a repository other than the working directory
node .github/tools/knowledge-meta/build.mjs --root ../other-repo
```

The repository root defaults to the working directory. Only knowledge folders
that actually exist produce a scope, so a repository that adopts just `.domain`
and `.arc42` never grows `_meta/` folders for the rest. The generator exits `2`
when no knowledge folder is present at all.

### When to run it

**Not on every edit.** Regenerating the indexes in the same pull request that
edits a chapter is what makes them conflict on merge: two branches that each
touch one chapter both rewrite the same JSON, and the only way to resolve it is
to re-run the generator. So refresh is deliberate and happens in two places:

| Path | What it is | When |
|---|---|---|
| `./build/Update-KnowledgeIndex.ps1` | on demand | You want the indexes current in your own branch — before a release, or because something reads them locally. |
| `.github/workflows/knowledge-meta-nightly.yml` | scheduled | Reconciles the default branch, opening one pull request when the output drifted and nothing when it did not. |

`.github/workflows/knowledge-meta.yml` **fails** on a broken reference or an
inconsistent reading order — those are errors in the authored Markdown and they
do not fix themselves — and only **warns** when the committed indexes have
drifted.

That is safe because a consumer reading these indexes at runtime is required to
compare each entry's source file against the index it came from and re-read the
entries that are newer. See `knowledge-derived-artifacts.instructions.md` for
both halves of the contract.

## Outputs

Two artifacts per adopted scope, each co-located with what it describes:

| Path | Scope |
|---|---|
| `_meta/graph.json`, `_meta/index.json` | repository-wide rollup across all adopted knowledge folders |
| `.arc42/_meta/*.json` | `.arc42` only |
| `.domain/_meta/*.json` | `.domain` only |
| `.backlog/_meta/*.json` | `.backlog` only |
| `.tech/_meta/*.json` | `.tech` only |
| `.design/_meta/*.json` | `.design` only |

A scoped graph contains every node in its folder, plus any node **outside** it
that an in-scope node references. Those boundary nodes are flagged
`outOfScope: true` so a viewer can draw them as stubs instead of pretending
they belong to the scope. Inbound references from other folders are not
followed, so a scoped graph stays about its own folder.

## Files

| File | Role |
|---|---|
| `metadata.mjs` | Parses the `meta` blocks — the single implementation of the schema defined by the `knowledge-chapter-metadata` instructions. Shared with the `knowledge-graph` canvas. |
| `graph.mjs` | Graph construction, scope discovery, and scope projection. Imported by the CLI *and* by the `knowledge-graph` canvas, so the written indexes and the live view can never disagree. |
| `outline.mjs` | Reading-order resolution from the `order` field on each directory's root document, plus the per-file lede and diagram count a list view needs. |
| `build.mjs` | CLI wrapper: writes both artifacts per scope, prints stats, exits non-zero on errors. |

This folder is self-contained — copy it into a repository as
`.github/tools/knowledge-meta/` and it runs with no other files installed.

## Output shape: `graph.json`

The required envelope from the derived-index convention, followed by
Cytoscape.js `elements` JSON — consumable directly by Cytoscape and trivially
mappable to D3, vis.js, or Sigma.

```jsonc
{
  "schemaVersion": 3,
  "generatedBy": ".github/tools/knowledge-meta/build.mjs",
  "scope": ".tech",
  "sources": [".tech"],
  "stats": { "nodes": 57, "edges": 120, "nodesByFolder": { }, "nodesByKind": { }, "nodesByStatus": { } },
  "problems": [],
  "elements": {
    "nodes": [
      { "data": {
          "id": ".tech/desktop.md#winui-3",
          "label": "WinUI 3",
          "type": "chapter",
          "kind": "framework",
          "folder": "tech",
          "path": ".tech/desktop.md",
          "status": "candidate",
          "depends-on": [".tech/desktop.md#windows-app-sdk"]
      } }
    ],
    "edges": [
      { "data": {
          "id": "depends-on:.tech/desktop.md#winui-3->.tech/desktop.md#windows-app-sdk",
          "source": ".tech/desktop.md#winui-3",
          "target": ".tech/desktop.md#windows-app-sdk",
          "type": "depends-on"
      } }
    ]
  }
}
```

Output is deterministic — no timestamp — so re-running it on unchanged Markdown
produces byte-identical files.

### `type` vs `kind` on a node

Two different questions, two different keys:

| Key | Answers | Values |
|---|---|---|
| `type` | What **role** does this node play in the document structure? | `file`, `chapter`, `heading`, `external` |
| `kind` | What **kind of thing** is it? | The authored `type` metadata field — `aggregate`, `feature`, `framework`, … |

The authored field is called `type` in Markdown but lands on the node as
`kind`, because `type` was already the structural discriminator and renaming it
would break every existing consumer. `.tech` nodes have always carried `kind`;
the unification means every folder that defines a value set now populates it.
Nodes in `.arc42`, `.backlog`, and `.design` carry no `kind`, because those
folders deliberately define no value set.

### Node types

| Type | Meaning |
|---|---|
| `file` | A knowledge document. `id` is the repo-relative path. |
| `chapter` | A heading that carries a `meta` block. `id` is `<path>#<heading-slug>`. |
| `heading` | A structural heading with no `meta` block, materialized only when something references it. |
| `external` | A reference target outside the knowledge folders. |

Nodes carrying `outOfScope: true` sit outside the current scope and are
included only because an in-scope node references them.

### File node labels

Heading text carries the name only, so all six files of a `.domain` bounded
context are titled with the bare context name. A file node's label is therefore
composed as `<title> (<kind>)`, and the suffix is dropped when the title
already slugifies to the kind:

| File | Title | `type` | Node label |
|---|---|---|---|
| `.domain/order-management/domain.md` | `Order Management` | `domain` | `Order Management (domain)` |
| `.domain/order-management/features.md` | `Order Management` | `features` | `Order Management (features)` |
| `.domain/context-map.md` | `Backlog` | `context-map` | `Backlog (context-map)` |
| `.domain/context-map.md` | `Context Map` | `context-map` | `Context Map` |
| `.arc42/01-introduction-and-goals.md` | `01. Introduction and Goals` | none | `01. Introduction and Goals` |

Node `id` is the path and was always unique; this only fixes the display label.

The two `context-map.md` rows are the recommended shape and the fallback: title
that file after the system it maps, and reach for the literal `Context Map` only
when there is no meaningful system name. The suppression branch exists so the
fallback does not render as `Context Map (context-map)`.

### Edge types

| Type | Source |
|---|---|
| `contains` | Document structure (file → chapter, chapter → sub-chapter). |
| `depends-on` | The `depends-on` metadata field. |
| `related` | The `related` metadata field. |
| `implements` | The `implements` metadata field (`.backlog`). |

`aliases` (`.domain`), `alternatives` (`.tech`), `feature-flag` (`.domain`),
and `roadmap` (every folder) are plain-string fields, not references, so they
stay node attributes and produce no edges. `feature-flag` and `roadmap` accept
a scalar or a list but are always emitted as a list, so a consumer never has to
branch on shape. `effort` is emitted as a number rather than the authored
string, so a viewer can total or threshold it directly; a value that is not a
non-negative integer is left off the node and reported as a lint error instead.

## Validation

`--check` exits `1` on any `problems` entry at `error` severity:

| Problem | Severity |
|---|---|
| A `related` / `depends-on` / `implements` reference that resolves to nothing inside a knowledge folder | error |
| Two headings in one file that slugify identically | error |
| A block missing `type` where its folder defines a value set for that level | error |
| A `type` value outside its folder's value set | error |
| A reference pointing outside the knowledge folders | warning |
| A `type` set in a folder that defines no value set | warning |
| A literal `` `r`n `` / `\r\n` / `\n` escape sequence in body text | warning |
| `.tech` still using the old `kind` field name | warning |
| An `order` entry that is missing, duplicated, or names a non-sibling | error |

### Literal escape sequences

A tool writing Markdown through a shell can emit an escape sequence instead of
the newline it stands for. The result is silent and out of proportion: a
`## Heading` glued onto the end of the previous line stops being a heading, so
the chapter vanishes from the outline, the graph, and every check that reasons
about headings — including all of the `type` validation above. Nothing else here
can see it, because by then the heading is prose.

So the generator scans body text for a literal `` `r`n ``, `\r\n`, or `\n` and
reports a warning. Fenced code blocks are skipped, as are backticked spans, so
documentation that discusses escape sequences does not trip it. `\t` is
deliberately not matched: it breaks no structure and collides with unformatted
Windows paths. `node escape-lint.test.mjs` covers the cases.

## Output shape: `index.json`

The same envelope, followed by `entries` — a nested, **ordered** tree of the
area's readable content. A viewer walks `entries` top to bottom instead of
sorting filenames.

```jsonc
{
  "schemaVersion": 3,
  "generatedBy": ".github/tools/knowledge-meta/build.mjs",
  "scope": ".domain",
  "sources": [".domain"],
  "problems": [],
  "entries": [
    { "type": "file", "name": "context-map.md", "path": ".domain/context-map.md",
      "title": "Shop", "kind": "context-map", "status": "draft",
      "summary": "How the shop's bounded contexts relate.", "root": true },
    { "type": "directory", "name": "ordering", "path": ".domain/ordering",
      "title": "Ordering",
      "children": [
        { "type": "file", "name": "domain.md", "path": ".domain/ordering/domain.md",
          "title": "Ordering", "kind": "domain", "status": "draft",
          "summary": "Owns the lifecycle of a customer order.", "diagrams": 1,
          "root": true },
        { "type": "file", "name": "features.md", "path": ".domain/ordering/features.md",
          "title": "Ordering", "kind": "features", "status": "draft" }
      ] }
  ]
}
```

On a `file` entry, `kind` is the authored `type` field — what distinguishes six
identically-titled files of a bounded context. It is omitted for folders that
define no value set. On an `area` entry it is the knowledge folder itself
(`domain`, `arc42`, …), which is that entry's equivalent answer to "what kind of
thing is this".

### `summary` and `diagrams`

Two optional fields on a `file` entry, both omitted when they would be empty.
They exist so a viewer can render a knowledge folder's **list view** — a lede
under each title, a "3 diagrams" badge beside a chapter — without opening a
single Markdown file. Without them a consumer has to parse the whole corpus to
draw a list, which is the exact cost the index was built to avoid. Both fall
out of the parse the generator already performs, so they cost nothing to emit.

**`summary`** — the document's lede. That is the blockquote the
`knowledge-chapter-metadata` instructions place directly after the file-level
`meta` block; a document with no blockquote falls back to its first paragraph
of prose. Either way it is the text before the first `##`, reduced to plain
text (links and emphasis flattened to their content) and capped at 300
characters on a word boundary with an ellipsis. Omitted when the document opens
straight into a chapter.

**`diagrams`** — how many diagrams the document embeds, counting mermaid code
fences and Markdown image embeds across the whole file. Both are diagrams to a
reader, and the knowledge folders use images for nothing else. A fence nested
inside a wider fence is content, not a diagram, and is not counted. Omitted when
the document embeds none.

Neither field is a reference, so neither produces a graph edge; they do not
appear in `graph.json` at all.

At the repository scope the top level is `type: "area"` — one entry per
knowledge folder, in canonical area order.

Ordering comes from the `order` field on the file-level `meta` block of each
directory's **root document**, which always sorts first. A directory with no
root document falls back to filename sort — which is why the numbered `.arc42`
chapters need no declaration. Entries listed but missing are errors; entries
present but unlisted are warnings and get appended alphabetically. See
the `knowledge-chapter-metadata` instructions.

`_`-prefixed folders (such as `_meta/` itself) are tooling, not content, and
are excluded from the outline.

## Viewing

Open the **Knowledge graph** canvas in Copilot CLI for an Obsidian-style
force-directed view with folder colouring, status shading, search, filters, and
click-to-inspect neighbourhoods. Open it scoped to one folder:

```text
open the knowledge graph canvas with scope .tech
```

The canvas has a scope selector, rebuilds from disk on open (so it never shows
a stale index), and exposes `refresh_graph` and `set_scope` actions. It also
serves the live outline at `/api/outline?scope=<scope>` for tools that want the
reading order without reading the committed `index.json`.
