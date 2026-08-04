---
applyTo: 'skills/orch-*/SKILL.md'
description: Defines when and how orch-* orchestration skills use the diagram-canvas and markdown-canvas extensions on behalf of the content plugins they coordinate.
---

# Canvas Usage Instructions (Orchestration-Owned)

## Purpose

- The `architecture`, `domain-design`, `ux-design`, `documentation`, and `product-owner`
  plugins have **no dependency** on any canvas extension. Their agents and skills only
  produce Markdown/Mermaid file artifacts and never reference a canvas.
- `copilot-app`'s `orch-*` skills own canvas usage instead: when an orchestrated stage
  hands off to one of those plugins' agents and the stage produces a diagram or document,
  the orchestrating skill — not the content plugin — is responsible for opening/updating
  the matching canvas alongside the required file-based artifact.
- Keep the file-based artifact as the source of truth; canvas rendering is always an
  additional live preview, never a replacement for it.

## Availability Check

- Canvas support depends on two separately installed extensions: `diagram-canvas`
  (`mermaid-diagram` canvas) and `markdown-canvas` (`markdown-preview` canvas). Neither is
  installed by `copilot-app` itself — treat both as optional.
- Before using either canvas, check whether it is available in the current session (for
  example, via `list_canvas_capabilities` or a prior successful `open_canvas` call).
- If unavailable, skip the canvas calls below and continue producing file-based output
  only. Never block a workflow stage on a missing canvas extension.

## When to Use `mermaid-diagram` (diagram-canvas)

Open or update this canvas after a coordinated agent produces Mermaid diagram output:

- `architecture:architect` — C4, sequence, state, and deployment diagrams.
- `domain-design:domain-architect` — aggregate, context-map, domain-event-flow, and
  subdomain-landscape diagrams.
- `ux-design:ux-designer` — Mermaid-based wireframes and user flows (SVG wireframe output
  is unaffected; the canvas cannot render raw SVG assets).

Render the same Mermaid source the agent wrote to its file artifact — do not regenerate
or reinterpret it for the canvas.

## When to Use `markdown-preview` (markdown-canvas)

Open or update this canvas after a coordinated agent drafts or revises a Markdown
document:

- `architecture:architect` — ADRs, TDRs, arc42 sections, and blueprints.
- `domain-design:domain-architect` — domain model and interaction documentation.
- `ux-design:ux-designer` — design guideline and design review documents.
- `documentation:documentation` / `documentation:profile` — how-tos, explanations,
  articles, proposals, ideas, and profile artifacts.
- `product-owner:product-owner` — epics, stories, and bugs.

Render the same Markdown content the agent wrote to its file artifact.

## Relationship to `orch-dashboard`

- `orch-dashboard` reports **orchestration progress** (stage status, run summaries) and is
  independent of `diagram-canvas`/`markdown-canvas`, which render the **content** a stage
  produced. Use all three together when installed: `orch-dashboard` for the run timeline,
  plus `diagram-canvas`/`markdown-canvas` for live previews of that run's diagrams and
  documents.

## Quality Checks

- [ ] Canvas calls are skipped gracefully when the extension is not installed.
- [ ] The canvas never becomes the sole source of truth — file artifacts are always
      produced regardless of canvas availability.
- [ ] The content plugin whose agent produced the diagram/document is not modified to add
      canvas awareness — that responsibility stays in this orchestration layer.
