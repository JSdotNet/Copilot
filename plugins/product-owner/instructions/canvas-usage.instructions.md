---
applyTo: 'agents/**/*.agent.md'
description: Defines when and how to use the markdown-canvas markdown-preview canvas for backlog artifacts in this plugin.
---

# Canvas Usage Instructions

## Purpose

- Prefer a live canvas preview over Markdown-only output when the `markdown-canvas`
  canvas extension is available in the current session.
- Keep the required Markdown file as the source of truth; canvas rendering is an
  additional live preview, never a replacement for it.

## Availability Check

- Canvas support depends on an installed extension (`markdown-canvas`, see
  `JSdotNet/Copilot:plugins/copilot-app/extensions/markdown-canvas`). Never assume it is present.
- Before using a canvas, confirm it is available in the current session (for example via
  `list_canvas_capabilities` for `markdown-preview`, or by checking whether
  `open_canvas` / `invoke_canvas_action` are exposed).
- If unavailable, fall back silently to Markdown file output. Do not block the task or ask
  the user to install the extension unless they ask how to preview a backlog artifact
  interactively.

## When to Use `markdown-preview`

- When drafting or revising an epic (`write-epic`), story (`write-story`), or bug
  (`write-bug`), render the drafted content on the `markdown-preview` canvas so the user
  can review formatted output live before it is synced to GitHub or Jira.
- Use `mode: "push"` when switching to review a related artifact (e.g., a story linked
  from its parent epic); use `replace` (default) for iterative edits to the same artifact.

## Quality Checks

- [ ] Canvas availability was checked before attempting to open one.
- [ ] The required Markdown artifact was still produced or updated regardless of canvas
      availability.
- [ ] The canvas was refreshed (re-invoked) whenever the underlying artifact content
      changed.
