---
applyTo: 'agents/**/*.agent.md'
description: Defines when and how to use the copilot-canvas-studio canvases for Mermaid-based wireframes, user flows, and design documents in this plugin.
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
- If unavailable, fall back silently to the existing SVG/Markdown file output. Do not
  block the task or ask the user to install the extension unless they ask how to preview
  diagrams interactively.

## When to Use `mermaid-diagram`

- Only applies to the Mermaid alternative described in `instructions/ux/wireframe-instructions.md`
  (navigation trees, screen-to-screen flows) and to `ux-user-flow` output. It does not
  apply to the default SVG wireframe output — the canvas cannot render raw SVG assets.
- Render the `flowchart` or `stateDiagram-v2` Mermaid source on the canvas so the user can
  preview navigation flows interactively before the file is saved.
- Use `mode: "push"` when drilling from an overview flow into a single screen's detailed
  transitions; use `replace` (default) when iterating on the same flow.

## When to Use `markdown-preview`

- When drafting or revising design guideline documents (`ux-design-guidelines`) or design
  review reports (`ux-design-review`), render the content on the `markdown-preview` canvas
  so the user can review formatted output while it is drafted.

## Quality Checks

- [ ] Canvas availability was checked before attempting to open one.
- [ ] The required SVG/Markdown artifact was still produced or updated regardless of
      canvas availability.
- [ ] The `mermaid-diagram` canvas was only used for Mermaid-based wireframes/flows, not
      claimed as a substitute for SVG wireframe output.
- [ ] The canvas was refreshed (re-invoked) whenever the underlying diagram or document
      content changed.
