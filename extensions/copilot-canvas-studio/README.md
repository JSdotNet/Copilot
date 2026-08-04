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

This folder is a standalone plugin (it has its own `.github/plugin/plugin.json` with an
`extensions` mapping), so install it the same way as any other plugin in this repo:

```bash
copilot plugin install JSdotNet/Copilot:extensions/copilot-canvas-studio
copilot plugin list
```

Reinstall after changes:

```bash
copilot plugin install JSdotNet/Copilot:extensions/copilot-canvas-studio
```

Uninstall:

```bash
copilot plugin uninstall copilot-canvas-studio
```

For local development/testing without installing, load it directly from disk:

```bash
copilot --plugin-dir extensions/copilot-canvas-studio
```

Alternatively, use the `install_extension` tool from within a Copilot CLI/App session with
`url: https://github.com/JSdotNet/Copilot/tree/main/extensions/copilot-canvas-studio` for a
user- or session-scoped install without going through `copilot plugin install`.

## Agent Usage

- `render_diagram` (mermaid-diagram): pass raw Mermaid source (the contents of a
  ` ```mermaid ` fenced block) plus an optional title/mode/explanation.
- `render_markdown` (markdown-preview): pass raw Markdown content plus an optional
  title/mode.
- Both canvases expose `get_state` and `clear` actions.

See each plugin's `instructions/common/canvas-usage.instructions.md` (or
`instructions/canvas-usage.instructions.md` where the plugin has no `common/` folder) for
the policy on when skills should prefer opening a canvas over emitting Markdown-only
output.
