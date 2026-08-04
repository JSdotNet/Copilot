# diagram-canvas

Installable GitHub Copilot CLI canvas extension. Renders live, interactive Mermaid
diagrams instead of only writing Markdown fenced code blocks.

## Canvas

- **`mermaid-diagram`** — Mermaid Diagram Viewer. Renders C4, sequence, state, deployment,
  and DDD diagrams (aggregate, context map, event flow, subdomain landscape), plus UX
  wireframes/user-flows, as an interactive, pannable/zoomable live preview. Supports
  drill-down navigation (`push`/`replace` modes with a Back button) and an optional
  explanation side panel.

Served by a local HTTP server bound to `127.0.0.1` on an ephemeral port, with a random
per-instance token required on every request. Loads `mermaid.js` from a CDN
(`cdn.jsdelivr.net`) to render diagrams.

## Install

This folder is a standalone plugin (it has its own `.github/plugin/plugin.json` with an
`extensions` mapping), so install it the same way as any other plugin in this repo:

```bash
copilot plugin install JSdotNet/Copilot:plugins/copilot-app/extensions/diagram-canvas
copilot plugin list
```

Reinstall after changes:

```bash
copilot plugin install JSdotNet/Copilot:plugins/copilot-app/extensions/diagram-canvas
```

Uninstall:

```bash
copilot plugin uninstall diagram-canvas
```

For local development/testing without installing, load it directly from disk:

```bash
copilot --plugin-dir plugins/copilot-app/extensions/diagram-canvas
```

Alternatively, use the `install_extension` tool from within a Copilot CLI/App session with
`url: https://github.com/JSdotNet/Copilot/tree/main/plugins/copilot-app/extensions/diagram-canvas`
for a user- or session-scoped install without going through `copilot plugin install`.

## Agent Usage

- `render_diagram`: pass raw Mermaid source (the contents of a ` ```mermaid ` fenced block)
  plus an optional title/mode/explanation. `open_canvas` also accepts
  `source`/`title`/`explanation` directly to render on first open in a single call.
- `show_explanation`, `get_state`, and `clear` are also available.

### Interactivity

- **Pan/zoom** works on every diagram (drag to pan, scroll/`+`/`-`/`Reset` to zoom).
- **Click-to-inspect**: for diagram types Mermaid renders with per-node identity
  (`flowchart`, `classDiagram`, `stateDiagram`, `sequenceDiagram`), every node is clickable —
  clicking highlights it and shows its label (plus any native Mermaid tooltip set via
  `click NodeId "tooltip text"`) in the side panel. A "Click a node for details" hint
  appears automatically whenever a diagram exposes clickable nodes.
- Skills can drive the side panel explicitly by embedding
  `click NodeId call showNodeDetails("Title","Explanation text")` in the Mermaid source.
- **C4 diagrams (`C4Context`/`C4Container`/`C4Component`) are not clickable** — Mermaid's C4
  renderer does not emit per-element ids/classes in its SVG output, so neither the generic
  click-to-inspect nor `click` directives have any effect there. Use the Color Conventions
  (`UpdateElementStyle`) instead to convey information visually, and `push`/`replace` mode
  with the Back button for drill-down navigation between separate C4 diagrams.

See each plugin's `instructions/common/canvas-usage.instructions.md` (or
`instructions/canvas-usage.instructions.md` where the plugin has no `common/` folder) for
the policy on when skills should prefer opening a canvas over emitting Markdown-only
output.

## Related

- `../markdown-canvas/` — sibling extension for live Markdown document previews (ADRs,
  TDRs, arc42 sections, backlog items). Install separately; the two canvases do not share a
  process.
