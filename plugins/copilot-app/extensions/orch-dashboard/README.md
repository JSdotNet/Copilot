# Orchestration Dashboard Canvas

A canvas extension that gives copilot-app `orch-*` orchestration skills
(`orch-feature`, `orch-bug`, `orch-adr`, `orch-arc42`, `orch-blueprint`,
`orch-tdr`, `orch-architecture`, `orch-project`, `orch-repo`,
`orch-create-mvp`, `orch-update-packages`, `orch-aspire-update`,
`orch-create-module`, `orch-create-service`) a live progress and output
dashboard in GitHub Copilot App, instead of plain chat narration.

## What It Shows

- A run list (left panel) with one entry per orchestration in the current
  session, each labeled with its skill and overall status.
- A run detail view (right panel) with every workflow stage, its status
  (`pending` / `in_progress` / `done` / `blocked` / `skipped` / `cancelled`),
  the agent(s) assigned, and the captured output text for that stage.
- An **Insight** panel showing total tool calls, elapsed time, measured tool
  time, an estimated thinking/reasoning remainder, and a time-by-category
  breakdown (Shell, Edit, Read, MCP tool, Agent tasks, Other) — the same
  categories the CLI's own agent-activity view uses. This is captured
  automatically from the session's own tool-call telemetry while a run is
  `in_progress`; no extra reporting is required from the orchestrating
  agent. Caveat: telemetry is session-wide, so any tool call made while a
  run is active gets attributed to it, including unrelated work happening
  in the same session.
- A **Download report** button on each run that downloads a Markdown report
  (stages, output, summary, and the insight breakdown) via
  `/api/runs/:id/report`.
- Live updates over server-sent events, so the panel refreshes automatically
  as the orchestrating agent moves through stages.

## Canvas Contract

Canvas id: `orch-dashboard`. Actions:

- `start_run({ skillId, title, stages: [{ name, agents? }] })` -> `{ runId }`
  Call once at the start of an orchestration, listing every stage up front.
  Marks the run as the one currently receiving tool-activity insight.
- `update_stage({ runId, stageIndex | stageName, status, output?, appendOutput? })`
  Call at the start of a stage (`status: "in_progress"`) and again when it
  finishes, with the result captured in `output`.
- `finish_run({ runId, status, summary? })`
  Call once the orchestration completes, is blocked, or is cancelled. Stops
  attributing further tool activity to this run.
- `list_runs()` / `get_run({ runId })`
  Read back state, e.g. to recover the current `runId` after a session resume.
  Both include an `insightSummary` (or, for `get_run`, the full per-call
  `insights` log) alongside the run data.

State is stored as JSON files under `<session workspace>/orchestration-runs/`,
so each orchestration run persists for the life of the session and is
inspectable on disk.

## Install

This extension can be installed from this repo folder using the
`install_extension` tool (or the "Install extension from gist…" flow after
sharing it):

```text
https://github.com/JSdotNet/Copilot/tree/main/plugins/copilot-app/extensions/orch-dashboard
```

Choose `project`, `user`, or `session` scope depending on whether you want it
committed to a repo, available for you across projects, or scoped to one
session. See `.github/instructions/customization-structure.instructions.md`
for repository-wide customization conventions.

## Reference

Source: `plugins/copilot-app/extensions/orch-dashboard/`
