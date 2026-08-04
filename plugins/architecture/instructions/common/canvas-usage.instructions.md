---
applyTo: 'agents/**/*.agent.md'
description: Defines when and how to use the copilot-canvas-studio canvases for architecture diagrams and documents in this plugin.
---

# Canvas Usage Instructions

## Purpose

- Prefer live canvas previews over Markdown-only output when the `copilot-canvas-studio`
  canvas extension is available in the current session.
- Keep the required file-based artifact as the source of truth; canvas rendering is an
  additional live preview, never a replacement for it.

## Availability Check

- Canvas support depends on an installed extension (`copilot-canvas-studio`, see
  `JSdotNet/Copilot:extensions/copilot-canvas-studio`). Never assume it is present.
- Before using a canvas, confirm it is available in the current session (for example via
  `list_canvas_capabilities` for `mermaid-diagram` / `markdown-preview`, or by checking
  whether `open_canvas` / `invoke_canvas_action` are exposed).
- If unavailable, fall back silently to Markdown/SVG file output. Do not block the task or
  ask the user to install the extension unless they ask how to preview diagrams
  interactively.

## When to Use `mermaid-diagram`

- After generating a C4 diagram (`c4-diagram-generator`), sequence diagram
  (`sequence-diagram-generator`), state diagram (`state-diagram-generator`), or deployment
  diagram (`deployment-diagram-generator`), open or update the `mermaid-diagram` canvas
  with the same Mermaid source before or alongside writing the SVG via
  `scripts/generate-diagram-svgs.ps1`.
- Use `mode: "push"` when drilling from one C4 level to a more detailed level (e.g.,
  Level 1 System Context to Level 2 Container), so the user can navigate back through the
  levels. Use `replace` (default) when iterating on the same diagram.
- Use the `explanation` field or `show_explanation` action to surface the prose summary
  required by each diagram skill's Output section.

## When to Use `markdown-preview`

- When drafting or revising an ADR (`create-architectural-decision-record`), TDR
  (`create-technical-debt-record`), arc42 section (`architecture-arc42-generator`), or
  blueprint (`architecture-blueprint-generator`), render the document content on the
  `markdown-preview` canvas so the user can review formatted output while it is drafted.
- Use `mode: "push"` when switching to review a different, related document (e.g., an ADR
  referenced from a blueprint); use `replace` for iterative edits to the same document.

## Quality Checks

- [ ] Canvas availability was checked before attempting to open one.
- [ ] The required Markdown/SVG artifact was still produced or updated regardless of
      canvas availability.
- [ ] `push` mode was used only for genuine drill-down or document-switch, not routine
      edits.
- [ ] The canvas was refreshed (re-invoked) whenever the underlying diagram or document
      content changed.
