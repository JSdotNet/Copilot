# copilot-canvas-studio

Installable GitHub Copilot CLI canvas extension. Bundles two canvases used across this
repository's plugins so the agent can render live, interactive previews instead of only
writing Markdown files.

## Canvases

- **`mermaid-diagram`** — Mermaid Diagram Viewer. Renders C4, sequence, state, deployment,
  and DDD diagrams (aggregate, context map, event flow, subdomain landscape), plus UX
  wireframes/user-flows, as an interactive, pannable/zoomable live preview. Supports
  drill-down navigation (`push`/`replace` modes with a Back button) and an optional
  explanation side panel.
- **`markdown-preview`** — Markdown Document Preview. Live-renders ADRs, TDRs, arc42
  sections, blueprints, and backlog artifacts (epics/stories/bugs) as formatted HTML while
  the agent drafts or revises them.

Both canvases are served by a single local HTTP server bound to `127.0.0.1` on an
ephemeral port, with a random per-instance token required on every request. The Mermaid
canvas loads `mermaid.js` from a CDN (`cdn.jsdelivr.net`) to render diagrams; the Markdown
canvas uses a small dependency-free renderer and needs no network access.

## Install

As a project-scoped extension (recommended for this repository):

```bash
copilot
# inside the CLI:
# use the install_extension tool with:
#   url: https://github.com/JSdotNet/Copilot/tree/main/extensions/copilot-canvas-studio
#   scope: project
```

Or copy `extensions/copilot-canvas-studio/` into `.github/extensions/copilot-canvas-studio/`
in the target repository and reload extensions.

## Agent Usage

- `render_diagram` (mermaid-diagram): pass raw Mermaid source (the contents of a
  ` ```mermaid ` fenced block) plus an optional title/mode/explanation.
- `render_markdown` (markdown-preview): pass raw Markdown content plus an optional
  title/mode.
- Both canvases expose `get_state` and `clear` actions.

See `.github/instructions/canvas-usage.instructions.md` in this repository's plugins for
the policy on when skills should prefer opening a canvas over emitting Markdown-only
output.
