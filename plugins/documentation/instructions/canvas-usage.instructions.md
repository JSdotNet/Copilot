---
applyTo: 'agents/**/*.agent.md'
description: Defines when and how to use the copilot-canvas-studio markdown-preview canvas for documentation and profile artifacts in this plugin.
---

# Canvas Usage Instructions

## Purpose

- Prefer a live canvas preview over Markdown-only output when the `copilot-canvas-studio`
  canvas extension is available in the current session.
- Keep the required Markdown file as the source of truth; canvas rendering is an
  additional live preview, never a replacement for it.

## Availability Check

- Canvas support depends on an installed extension (`copilot-canvas-studio`, see
  `JSdotNet/Copilot:extensions/copilot-canvas-studio`). Never assume it is present.
- Before using a canvas, confirm it is available in the current session (for example via
  `list_canvas_capabilities` for `markdown-preview`, or by checking whether
  `open_canvas` / `invoke_canvas_action` are exposed).
- If unavailable, fall back silently to Markdown file output. Do not block the task or ask
  the user to install the extension unless they ask how to preview a document
  interactively.

## When to Use `markdown-preview`

- Applies to every document-producing skill in this plugin: `create-howto`,
  `create-explanation`, `create-article`, `create-proposal`, `create-idea`,
  `create-infographic` (render the surrounding Markdown narrative, not the image itself),
  `create-github-profile`, `create-linkedin-profile`, and `create-project-profile`.
- Render the drafted content on the `markdown-preview` canvas so the user can review
  formatted output live while the document is being written or revised.
- Use `mode: "push"` when switching to preview a different, related document (e.g., moving
  from a proposal to a linked idea); use `replace` (default) for iterative edits to the
  same document.

## Quality Checks

- [ ] Canvas availability was checked before attempting to open one.
- [ ] The required Markdown artifact was still produced or updated regardless of canvas
      availability.
- [ ] The canvas was refreshed (re-invoked) whenever the underlying document content
      changed.
