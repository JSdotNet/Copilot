---
applyTo: 'skills/**/SKILL.md'
description: Resolves the orch-dashboard canvas provider and defines the run reporting cadence a skill follows when it reports through the canvas.
---

# Dashboard Reporting Contract

A skill that reports progress does so through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). First check the canvas with
`list_canvas_capabilities` using `extensionId: "plugin:copilot-app:orch-dashboard"` and
`canvasId: "orch-dashboard"`. That full provider ID is the canonical provider for the
dashboard shipped by this plugin and avoids ambiguity when a stale user-scope copy is also
installed. If the plugin provider is unavailable, retry without `extensionId` only to
discover whether one unambiguous fallback provider exists. When the host reports multiple
matching providers, use the exact advertised provider identifier for the intended
dashboard, normally `plugin:copilot-app:orch-dashboard`. Do not use shortened identifiers
such as `plugin:copilot-app` or `user` as a canvas `extensionId`, because they do not
identify a registered canvas provider.

- If `orch-dashboard` is not installed or not advertised, skip the canvas calls and
  continue through standard chat interaction.
- If `orch-dashboard` is advertised but `open_canvas`, `invoke_canvas_action`, or any
  required dashboard action (`start_run`, `update_stage`, `set_run_context`,
  `finish_run`) is unavailable, treat it as a tooling/runtime capability issue. Do not
  silently fall back to chat-only tracking; block the run and report the missing capability.

## Cadence

- **Open** canvas `orch-dashboard` with the fixed `instanceId` `orch-dashboard` and the
  resolved provider identifier. Re-opening that same instance focuses the existing panel;
  a new instance ID opens another tab. Then call `start_run` against the same instance with
  the skill's `skillId` and the full ordered stage list. `start_run` reattaches to an
  existing `in_progress` run for the same skill and returns `resumed: true`; continue from
  the first stage that is not `done` instead of restarting.
- **Before each stage**, call `update_stage` with `status: "in_progress"`.
- **After each stage**, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary. The dashboard increments the stage's
  completion count every time it transitions to `done`.
- **Call `finish_run`** with the final status and summary once the run concludes.
- **Never invent, estimate, or hand-write token numbers** into stage output or the run
  summary. The extension captures context and token telemetry itself; a written-in figure
  would conflict with the captured one.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract, and `instructions/canvas-usage.instructions.md` for when to also open the
`markdown-canvas`/`diagram-canvas` content previews.
