---
applyTo: 'agents/**/*.agent.md'
description: Defines when and how to use the diagram-canvas and markdown-canvas canvases for domain design diagrams and documents in this plugin.
---

# Canvas Usage Instructions

## Purpose

- Prefer live canvas previews over Markdown-only output when the `diagram-canvas` and/or
  `markdown-canvas` canvas extensions are available in the current session.
- Keep the required file-based artifact as the source of truth; canvas rendering is an
  additional live preview, never a replacement for it.

## Availability Check

- Canvas support depends on separately installed extensions:
  `diagram-canvas` (`JSdotNet/Copilot:plugins/copilot-app/extensions/diagram-canvas`) for
  the `mermaid-diagram` canvas, and `markdown-canvas`
  (`JSdotNet/Copilot:plugins/copilot-app/extensions/markdown-canvas`) for the
  `markdown-preview` canvas. Never assume either is present, and check them independently
  — one may be installed without the other.
- Before using a canvas, confirm it is available in the current session (for example via
  `list_canvas_capabilities` for `mermaid-diagram` / `markdown-preview`, or by checking
  whether `open_canvas` / `invoke_canvas_action` are exposed).
- If unavailable, fall back silently to Markdown file output. Do not block the task or ask
  the user to install the extension unless they ask how to preview diagrams
  interactively.

## When to Use `mermaid-diagram`

- After generating an aggregate class diagram (`aggregate-diagram`), domain event flow
  diagram (`domain-event-flow-diagram`), context map or ACL translation diagram
  (`context-mapping`, `domain-interaction-diagram`), or subdomain landscape diagram
  (`subdomain-landscape-diagram`), render the same Mermaid source (per
  `instructions/diagrams/ddd-diagram-instructions.md`) on the canvas.
- Use `mode: "push"` when drilling from a subdomain landscape view into a specific bounded
  context's aggregate diagram, or from a context map into an ACL translation diagram, so
  the user can navigate back. Use `replace` (default) when iterating on the same diagram.

## When to Use `markdown-preview`

- When drafting or revising the tactical/strategic domain model documentation produced by
  `domain-model-design` or `domain-interaction-model`, render the document content on the
  `markdown-preview` canvas so the user can review formatted output while it is drafted.
- Use `mode: "push"` when switching to review a related document (e.g., a bounded context
  document referenced from the context map); use `replace` for iterative edits to the same
  document.

## Quality Checks

- [ ] Canvas availability was checked before attempting to open one.
- [ ] The required Markdown artifact was still produced or updated regardless of canvas
      availability.
- [ ] `push` mode was used only for genuine drill-down or document-switch, not routine
      edits.
- [ ] The canvas was refreshed (re-invoked) whenever the underlying diagram or document
      content changed.
