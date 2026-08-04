# markdown-canvas

Installable GitHub Copilot CLI canvas extension. Live-renders Markdown documents so the
user can review formatted output while the agent drafts or revises them.

## Canvas

- **`markdown-preview`** — Markdown Document Preview. Live-renders ADRs, TDRs, arc42
  sections, blueprints, and backlog artifacts (epics/stories/bugs) as formatted HTML while
  the agent drafts or revises them.

Served by a local HTTP server bound to `127.0.0.1` on an ephemeral port, with a random
per-instance token required on every request. Uses a small dependency-free renderer and
needs no network access.

## Install

This folder is a standalone plugin (it has its own `.github/plugin/plugin.json` with an
`extensions` mapping), so install it the same way as any other plugin in this repo:

```bash
copilot plugin install JSdotNet/Copilot:plugins/copilot-app/extensions/markdown-canvas
copilot plugin list
```

Reinstall after changes:

```bash
copilot plugin install JSdotNet/Copilot:plugins/copilot-app/extensions/markdown-canvas
```

Uninstall:

```bash
copilot plugin uninstall markdown-canvas
```

For local development/testing without installing, load it directly from disk:

```bash
copilot --plugin-dir plugins/copilot-app/extensions/markdown-canvas
```

Alternatively, use the `install_extension` tool from within a Copilot CLI/App session with
`url: https://github.com/JSdotNet/Copilot/tree/main/plugins/copilot-app/extensions/markdown-canvas`
for a user- or session-scoped install without going through `copilot plugin install`.

## Agent Usage

- `render_markdown`: pass raw Markdown content plus an optional title/mode. `open_canvas`
  also accepts `content`/`title` directly to render on first open in a single call.
- `get_state` and `clear` are also available.

See each plugin's `instructions/common/canvas-usage.instructions.md` (or
`instructions/canvas-usage.instructions.md` where the plugin has no `common/` folder) for
the policy on when skills should prefer opening a canvas over emitting Markdown-only
output.

## Related

- `../diagram-canvas/` — sibling extension for interactive Mermaid diagrams (C4, DDD,
  sequence, state, wireframe). Install separately; the two canvases do not share a process.
