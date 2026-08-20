---
applyTo: ".domain/**,.arc42/**,.backlog/**,.tech/**,.design/**"
description: Common per-chapter and per-file metadata convention for .domain, .arc42, .backlog, .tech, and .design, so tooling can parse status, dependencies, and cross-references.
---

# Chapter and file metadata

`.domain`, `.arc42`, `.backlog`, `.tech`, and `.design` are intended to be read by a
visualization and indexing tooling, not just by humans. To make that
possible, every **chapter** in these folders carries a small, parseable
metadata block directly under its heading, in a fenced `meta` (YAML) code
block, and every **file** carries an equivalent block directly under its
top-level (`#`) heading describing the document as a whole.

A "chapter" here means any heading that these folders' own instructions
already treat as an addressable unit:

- `.domain/<context>/domain.md` — each Aggregate, Domain Service, Domain Event,
  and each Shared Value Objects / Shared Enums chapter. Entity/Value
  Object/Enum sub-chapters inside an Aggregate use the metadata block too if
  they need independent status/dependencies/cross-references; otherwise they
  can be covered by their parent Aggregate's block.
- `.domain/<context>/features.md` — each Feature and Sub-feature.
- `.domain/<context>/naming.md` — each `Term` chapter.
- `.arc42/<nn>-<name>.md` — the file's top-level chapter, and any ## section
  inside it that is independently trackable.
- `.backlog/<concern-type>-<concern-slug>.md` — each Item and Sub-item.
- `.tech/<layer>.md` — each `## <Technology Name>` chapter (one graph node per
  chapter).
- `.design/<name>.md` — the file's top-level chapter, and every `##` chapter
  inside it. `###` sub-headings are covered by their parent `##` chapter and
  carry a block only if they need independent status or cross-references.

- `.domain` `context-map.md`, `model.md`, `flow.md`, and `dependencies.md` and
  `.tech` `technology-graph.md` are strategic/structural artifacts; their `##`
  sections do **not** carry per-chapter metadata blocks.

## Chapter metadata block format

Place the block immediately after the heading, before any prose:

```markdown
## <Chapter Heading>

\`\`\`meta
status: active
\`\`\`

Prose for this chapter starts here.
```

Only `status` is required, so a chapter with no relations and no issue carries
just that one field. Optional fields (`related`, `issue`, `effort`, `roadmap`,
and folder-specific fields such as `depends-on`) are included only when they
have a value; empty collections and null values are omitted rather than written
out.

## File-level metadata block

In addition to per-chapter blocks, every file in `.domain`, `.arc42`,
`.backlog`, `.tech`, and `.design` carries one file-level metadata block
describing the document as a whole. This gives the tooling a
status/relations rollup for the
file itself, distinct from the status of any individual chapter inside it —
useful for files such as `.domain` `context-map.md`, `model.md`, `flow.md`,
and `dependencies.md`, whose `##` sections don't carry their own per-chapter
blocks.

Place the block immediately after the file's top-level (`#`) heading, before
any blockquote summary, prose, or first chapter:

```markdown
# <File Title>

\`\`\`meta
status: active
\`\`\`

> Optional blockquote summary, if the file has one.

Prose or the first chapter starts here.
```

The file-level block uses the same fields as a chapter block (`status`
required; `related`, `issue`, `effort`, and `roadmap` optional) and the same
omit-when-empty rule. Folder-specific fields defined for chapters
(`depends-on`, `implements`, `aliases`, `feature-flag`, `kind`, `version`,
`alternatives`) are chapter-scoped and are not used at file level — a file's
overall relationships are expressed through `related` only.

In `.arc42`, the file's top-level chapter heading (e.g. `# 01. Introduction
and Goals`) already carries a chapter metadata block as described above; for
these files that same block also serves as the file-level block, since an
`.arc42` file is always exactly one top-level chapter — no separate,
duplicate block is added.

Some folders define additional relation fields beyond `related` (e.g.
`depends-on`, `implements`) — see that folder's own instructions file for
which extra fields apply and what they mean. Most such fields use the same
reference format described below, but not every folder-specific field is a
reference field: in `.domain`, `aliases` (defined in
`knowledge-domain.instructions.md`) is a list of
plain-string surface names and `feature-flag` (same file) is a list of
application feature keys, neither of them `<path>#<heading-slug>` references,
and in `.tech`, `alternatives` (defined in
`knowledge-tech.instructions.md`) is likewise a
plain-string list. The universal `roadmap` field below behaves the same way.

### Chapter and file references

Chapters are not given a separate stored id. A chapter is addressed by its
file path (relative to the repository root) plus a GitHub-style anchor slug
of its heading text: `<path>#<heading-slug>`, e.g.
`.domain/order-management/domain.md#aggregate-order`. This is exactly what
renders as the heading's link target, so it stays correct automatically when
read in any Markdown viewer and never needs to be kept in sync by hand.

A file, addressed at the file-level metadata block, is referenced the same
way but without a heading slug: `<path>`, e.g.
`.domain/order-management/dependencies.md`. Use this bare-path form when a
`related` entry points at a file as a whole rather than one of its chapters.

Use the `<path>#<heading-slug>` (chapter) or `<path>` (file) form as the
entries in `related` and in any folder-specific relation field (`depends-on`,
`implements`, etc.).

### Fields

- **status** (required) — lifecycle state of this chapter's or file's
  content. The allowed values are folder-specific; see the `status` section
  in `knowledge-domain.instructions.md`,
  `knowledge-arc42.instructions.md`,
  `knowledge-backlog.instructions.md`,
  `knowledge-tech.instructions.md`, or
  `knowledge-design.instructions.md` for the value set
  that applies to the folder you're editing. A file-level `status` reflects
  the document as a whole and is set independently of its chapters' own
  `status` values (e.g. a file can be `active` overall while one chapter
  inside it is still `draft`).
- **related** (optional) — list of `<path>#<heading-slug>` or `<path>`
  references this chapter or file points to for context, without a hard
  dependency (e.g. a backlog item linking to the domain aggregate it
  changes, or an arc42 section linking to a domain feature it realizes).
  This is the general-purpose cross-folder tag mechanism, available in every
  folder. Omit the field entirely when there are no references.
- **issue** (optional) — URL (or `owner/repo#number`
  shorthand) of the GitHub issue tracking this chapter or file, if one
  exists. Keep this in sync when a chapter is published to, or synced from, an
  issue tracker. Omit the field entirely when no issue exists.
- **effort** (optional) — estimate of the work this chapter or file
  represents, in **story points**: a single non-negative integer. `effort: 0`
  is a deliberate "no work left" statement and is different from omitting the
  field, which means "not estimated". An effort is an estimate of size, not a
  measurement of time spent, and it is a legitimate outcome for an AI agent to
  derive it from the chapter's content rather than for a person to write it by
  hand — either way it stays an estimate and is revised as understanding
  changes. A file-level `effort` covers the document as a whole and is set
  independently of its chapters' values; it is not required to equal their sum.
  Available in every folder. Omit the field entirely when the chapter has not
  been estimated.
- **roadmap** (optional) — list of roadmap item tags this chapter or file
  contributes to, e.g. `roadmap: [sync-service, mobile-mvp]`. This lets a
  roadmap item gather its knowledge by tag instead of having to reference every
  contributing chapter explicitly. Entries are **plain lowercase kebab-case
  slugs, not `<path>#<heading-slug>` references** — like `.domain`'s `aliases`
  and `.tech`'s `alternatives`, they stay node attributes and produce no graph
  edges. The tag vocabulary belongs to the consuming repository's roadmap, so
  it is not validated here beyond the slug shape. A chapter may contribute to
  several roadmap items. Available in every folder. Omit the field entirely
  when the chapter belongs to no roadmap item.
- **order** (optional, **file-level blocks only**) — declares the reading
  order of the directory this document sits in. See
  "[Declaring reading order](#declaring-reading-order)" below.

Folder-specific fields (e.g. `depends-on` on features/backlog/tech chapters,
`feature-flag` on domain feature chapters, `implements` on backlog chapters,
`kind`/`version`/`alternatives` on tech chapters) are documented in that folder's
own instructions file, not here — this file only defines the fields common
to every folder.

A chapter that is estimated and carried by a roadmap item therefore reads:

```markdown
## Item: Offline Sync Queue

\`\`\`meta
status: ready
effort: 8
roadmap: [sync-service, mobile-mvp]
related: [.domain/sync/features.md#feature-offline-sync]
\`\`\`
```

## Authoring guidance

- If a chapter heading is renamed, update every relation field entry
  elsewhere (`related` or any folder-specific field) that references its
  old `<path>#<heading-slug>` in the same change.
- If a file is renamed or moved, update every relation field entry elsewhere
  that references its old bare `<path>` in the same change.
- Every new or edited file must have its file-level metadata block; every new
  or edited chapter must have its chapter metadata block. Do not add one
  without the other when creating a new file.
- Re-estimate `effort` when a chapter's scope changes, and drop the field again
  if the chapter stops being something worth estimating. Never raise or lower it
  to make a total come out at a wanted number — the estimate describes the
  chapter, not the report.
- Keep `roadmap` tags spelled exactly as the consuming repository's roadmap
  spells them; a mistyped tag silently drops the chapter out of that roadmap
  item's view rather than failing loudly.
- Do not invent additional top-level fields without updating either this
  file (for a universal field) or the relevant folder's instructions file
  (for a folder-specific field) first — the derived index tooling depends on a
  fixed schema.
- Optional fields are included only when they carry a value. Empty list-valued
  fields (`related: []`, `depends-on: []`, `roadmap: []`) and null values
  (`issue: null`, `effort: null`) are omitted rather than written out, so a
  chapter or file with no relations, no estimate, and no issue shows only
  `status`.

## Declaring reading order

Files in a knowledge folder have an intended reading order that alphabetical
sorting does not capture — `.domain` reads `domain` → `features` → `model`
before `naming`, not the other way round. That order is declared in Markdown
so it stays canonical, and compiled into `_meta/index.json` for viewers.

Per directory, exactly one file may be the **root document**: the one whose
file-level block carries `order`. It always sorts first, and its `order` lists
the remaining entries — plain names of sibling files (`shared.md`) or
subdirectories (`ordering`), never paths:

```markdown
# Technology Graph

\`\`\`meta
status: candidate
order: ["shared.md", "backend.md", "web.md", "tooling.md"]
\`\`\`
```

Rules:

- `order` is valid on a **file-level** block only. On a chapter block it is an
  error — chapters are already ordered by their position in the document.
- A directory with no root document falls back to filename sort. This is why
  the numbered `.arc42` chapters (`01-…`, `02-…`) need no declaration.
- An entry listed in `order` that does not exist is an error; a file or
  subdirectory that exists but is unlisted is a warning and gets appended
  alphabetically. Add it to `order` to pin its position.
- Two documents in one directory both declaring `order` is an error.

Update `order` whenever a file is added to or removed from a directory that
has a root document, then regenerate.

## Derived metadata index

These metadata blocks are compiled into derived indexes by
`.github/tools/knowledge-meta/build.mjs` — one pair per knowledge folder plus
a repository-wide rollup, placed per
`knowledge-derived-artifacts.instructions.md`:

```text
_meta/graph.json          # reference graph, all adopted folders
_meta/index.json          # reading outline, all adopted folders
.arc42/_meta/graph.json   # .arc42 only
.arc42/_meta/index.json
.domain/_meta/…
.backlog/_meta/…
.tech/_meta/…
.design/_meta/…
```

Only folders the repository actually has produce a scope.

Regenerate whenever a chapter or file is added, renamed, or re-linked:

```bash
node .github/tools/knowledge-meta/build.mjs
```

These are derived output — never edit them by hand. CI
(`.github/workflows/knowledge-meta.yml`) fails when a reference does not
resolve or when a committed index is stale. Open the **Knowledge graph**
canvas (optionally scoped to one folder) to explore it visually. See
the knowledge-meta tooling README (`.github/tools/knowledge-meta/README.md`) for the output shape.
