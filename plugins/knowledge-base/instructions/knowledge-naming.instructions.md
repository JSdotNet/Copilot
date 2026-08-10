---
applyTo: ".arc42/**,.domain/**,.backlog/**,.tech/**,.design/**,**/_meta/**"
description: File and folder naming conventions inside the knowledge folders, including the underscore prefix that marks tooling assets.
---

# File and folder naming in knowledge folders

## Underscore prefix marks tooling assets

Anything that exists **for tooling rather than for reading** carries a leading
underscore, so a human scanning a folder can tell content from machinery at a
glance.

- **Tooling folders** are prefixed: `_meta/` (derived artifacts). Files
  *inside* such a folder are not prefixed again — the folder already carries
  the signal, so it is `_meta/graph.json`, never `_meta/_graph.json`.
- **Tooling files** sitting alongside content are prefixed individually:
  `_template.md`, `_schema.json`.

Use the prefix when the asset is a template, a schema, a generated artifact, or
input consumed only by a generator or viewer. Do not use it for documents meant
to be read as content, even if tooling also parses them — the `.domain`,
`.arc42`, `.backlog`, `.tech`, and `.design` Markdown files are read by both
humans and tooling and stay unprefixed.

## Area folders keep their dot prefix

Top-level knowledge areas keep the leading-dot convention and are **not**
renamed: `.arc42/`, `.domain/`, `.backlog/`, `.tech/`, `.design/`. The dot marks
a repository-level area; the underscore marks tooling within one.

## No redundant suffixes

A name should not repeat what its location already says.

- Derived artifacts are named after what they are, not their scope:
  `.tech/_meta/graph.json`, not `.tech/_meta/tech-graph.json`.
- Files within a bounded context are named after their role, not the context:
  `.domain/ordering/features.md`, not `.domain/ordering/ordering-features.md`.

## Casing

Use kebab-case for files and folders (`.domain/order-management/`,
`technology-graph.md`). Keep any casing that an external tool requires, such as
`README.md`.

## Reference

- `knowledge-derived-artifacts.instructions.md` — placement, naming,
  and envelope rules for generated artifacts under `_meta/`.
