---
applyTo: 'skills/orch-*/SKILL.md'
description: Defines when and how orch-* orchestration skills use the orch-dashboard content viewers (render_diagram, render_markdown) on behalf of the content plugins they coordinate.
---

# Dashboard Usage Instructions (Orchestration-Owned)

## Purpose

- The `architecture`, `domain-design`, `ux-design`, and `documentation`
  plugins have **no dependency** on the dashboard. Their agents and skills only produce
  Markdown/Mermaid file artifacts and never reference a viewer.
- `claude-desktop`'s `orch-*` skills own viewer usage instead: when an orchestrated stage hands
  off to one of those plugins' agents and the stage produces a diagram or document, the
  orchestrating skill — not the content plugin — is responsible for rendering it alongside
  the required file-based artifact.
- Keep the file-based artifact as the source of truth; a rendered view is always an
  additional live preview, never a replacement for it.

## What Replaced the Copilot Canvases

The GitHub Copilot version of this plugin shipped two separate canvas extensions,
`diagram-canvas` (`mermaid-diagram`) and `markdown-canvas` (`markdown-preview`). Claude
Code has no embedded canvas panel, so both are served by the same `orch-dashboard` MCP
server that already backs the run dashboard — the original viewer pages, unchanged, on
their own routes:

| Copilot canvas | Claude Code |
| --- | --- |
| `mermaid-diagram` (`render_diagram` action) | `render_diagram` tool → `<dashboardUrl>mermaid` |
| `markdown-preview` (`render_markdown` action) | `render_markdown` tool → `<dashboardUrl>markdown` |

Both viewers keep the drill-down history the canvases had: pass `mode: "push"` to open a
related view with a working Back button, or omit it to replace the current view in place.

## Availability Check

- The viewers are part of the `orch-dashboard` MCP server, so they are available exactly
  when the dashboard is. There is nothing extra to install.
- If the `orch-dashboard` tools are absent, skip the viewer calls and continue producing
  file-based output only. Never block a workflow stage on a missing viewer.

## When to Use `render_diagram`

Render after a coordinated agent produces Mermaid diagram output:

- `architecture:architect` — C4, sequence, state, and deployment diagrams.
- `domain-design:domain-architect` — aggregate, context-map, domain-event-flow, and
  subdomain-landscape diagrams.
- `ux-design:ux-designer` — Mermaid-based wireframes and user flows (SVG wireframe output
  is unaffected; the viewer cannot render raw SVG assets).

Render the same Mermaid source the agent wrote to its file artifact — do not regenerate or
reinterpret it for the viewer.

## When to Use `render_markdown`

Render after a coordinated agent drafts or revises a Markdown document:

- `architecture:architect` — ADRs, TDRs, arc42 sections, and blueprints.
- `domain-design:domain-architect` — domain model and interaction documentation.
- `ux-design:ux-designer` — design guideline and design review documents.
- `documentation:documentation` / `documentation:profile` — how-tos, explanations,
  articles, proposals, ideas, and profile artifacts.

Render the same Markdown content the agent wrote to its file artifact.

## Relationship to the Run Dashboard

- The run dashboard reports **orchestration progress** (stage status, QA results, run
  summaries). The viewers render the **content** a stage produced. Use them together: the
  dashboard tab for the run timeline, the viewer tabs for that run's diagrams and
  documents.
- **Open viewer URLs the same way the dashboard is opened** — in the host's inline browser
  pane where it has one, falling back to a plain link otherwise. See **Surfacing the
  Dashboard** in `instructions/orch-dashboard-contract.instructions.md`. A rendered view the user
  never sees is no better than no view at all.
- For a finished run, `export_report` writes the whole run — stages, output, QA evidence —
  to a self-contained Markdown or HTML file. Use it when the user wants something to keep
  or share rather than a live view; it is also the natural source for publishing the run as
  an Artifact.

## Quality Checks

- [ ] Viewer calls are skipped gracefully when the dashboard is unavailable.
- [ ] A rendered view never becomes the sole source of truth — file artifacts are always
      produced regardless of viewer availability.
- [ ] The content plugin whose agent produced the diagram/document is not modified to add
      viewer awareness — that responsibility stays in this orchestration layer.
