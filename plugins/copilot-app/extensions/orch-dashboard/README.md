# Orchestration Dashboard Canvas

A canvas extension that gives copilot-app `orch-*` orchestration skills
(`orch-feature`, `orch-bug`, `orch-adr`, `orch-arc42`, `orch-blueprint`,
`orch-tdr`, `orch-architecture`, `orch-project`, `orch-repo`,
`orch-create-mvp`, `orch-update-packages`, `orch-aspire-update`,
`orch-structure`, `orch-create-module`, `orch-create-service`) and the copilot-app automation
skills (`automation-bug-fix`, `automation-package-update`,
`automation-performance-review`, `automation-review`, `automation-week-starter`,
`automation-weekly-cost-analysis`, `automation-whats-new`,
`azure-sre-to-github-issue`, `start-session-from-issue`,
`update-open-sessions`) a live progress and output dashboard in GitHub Copilot
App, instead of plain chat narration.

## What It Shows

- A run list (left panel) with one entry per orchestration in the current
  session, each labeled with its skill and overall status. Selecting a run
  expands an always-visible **stage navigation** beneath it: every relevant
  stage declared in `start_run` is listed with a status dot/badge and jumps to
  that stage in the detail view when clicked. A declared **GitHub Issue Update**
  stage is hidden when the run has no originating GitHub issue metadata. Stages
  with `links` render those links as quick-open buttons in the stage detail.
- A run detail view (right panel) with every relevant workflow stage, its status
  (`pending` / `in_progress` / `done` / `blocked` / `skipped` / `cancelled`),
  the agent(s) assigned, captured output text, and any quick-action links for
  that stage. Stage output and the `finish_run` **Summary** render as a safe
  Markdown subset so headings, paragraphs, bullet lists, ordered lists, links,
  inline code, fenced code, and emphasis appear as readable sections instead of
  compressed monospace text. Each stage output also includes an **Open rich view**
  action for a focused rich-text reading panel, and the run header links to an
  inline **HTML report** with the same rich rendering for sharing or browser
  review. When the original user prompt is provided to `start_run`, it is shown
  near the top of the run detail and included in exported reports. The elapsed
  time for each stage is shown on its own second line when timing data is
  available. When a stage completes more than once in the same run, such as after
  Personal Validation requests changes and implementation validation repeats, the
  stage shows a `Done Nx` count badge. The `finish_run` **Summary** is rendered as a highlighted block at
  the end of the run, includes the total token cost/usage when telemetry is
  available, and is reachable from the stage navigation.
- An **Insight** panel showing total tool calls, elapsed time, measured tool
  time, an estimated thinking/reasoning remainder, and a time-by-category
  breakdown (Shell, Edit, Read, `QA (Playwright/Aspire)`, MCP tool, Agent
  tasks, Other) — the same categories the CLI's own agent-activity view
  uses. This is captured automatically from the session's own tool-call
  telemetry while a run is `in_progress`; no extra reporting is required
  from the orchestrating agent. Caveat: telemetry is session-wide, so any
  tool call made while a run is active gets attributed to it, including
  unrelated work happening in the same session.
- **Agent / MCP server / model usage**, both overall (in the Insight panel)
  and per stage (a tag row beneath each stage's declared `agents`), captured
  from `tool.execution_start`/`tool.execution_complete` (MCP server name and
  model per tool call) and `subagent.completed`/`subagent.failed` (custom
  agent name, model, tokens, duration for Task-tool/custom-agent
  invocations). Calls and sub-agent runs are attributed to whichever stage
  is currently `in_progress` for the active run when they happen, so this
  reflects what actually ran, not just the agents declared up front in
  `start_run`. Same session-wide-telemetry caveat as the rest of Insight
  applies.
- A **Context** panel showing the run-level context gauge and per-stage token
  deltas, captured automatically from the session's own telemetry:
  - A **run-level context gauge** — the latest `currentTokens` against the
    model's `tokenLimit` as a percentage bar (e.g. `128.4k / 200k (64%)`, amber
    from 75%, red from 90%), plus the component breakdown (**system**,
    **conversation**, **tool definitions** tokens and message count) and the
    peak observed during the run. This is the "am I about to be compacted
    mid-orchestration?" signal.
  - **Compaction and truncation counts** for the run, with the compaction
    reasons (`threshold`, `context_limit_retry`, `manual`, `memory_pressure`,
    `model_switch`) and the number of tokens truncation removed.
  - A **per-stage token delta** — a `Token delta: …` badge on each stage
    totalling the input + output tokens of every model call that completed
    while that stage was `in_progress`, so it is visible which phase is the
    context hog. A delta is used rather than an absolute reading at the stage
    boundary, because compaction can reset the absolute figure mid-stage.
    Reasoning and prompt cache read/write tokens are tracked separately and
    reported alongside. Note that `inputTokens` counts the whole prompt, most
    of which is normally served from the prompt cache on later turns — which is
    why a stage delta can legitimately exceed the model's context window. An
    **uncached** figure (`input − cache reads + output`) is reported next to it
    as the "fresh" tokens the stage actually pushed through the model.
  - **Sub-agent attribution** — token usage carrying an `agentId` (Task-tool or
    custom-agent work) is folded into the parent stage's token delta, because
    the delegated work is still part of what the stage cost, but is also kept
    as a separate sub-agent subtotal (`… (42.5k sub-agent)`) so it stays visible
    that the cost came from delegated work. The run-level context gauge
    deliberately ignores sub-agent samples: a sub-agent runs its own context
    window.

  Sources: `assistant.usage` (per model call), `session.usage_info` (gauge,
  persisted throttled because the event is ephemeral and high-frequency),
  `session.compaction_start`, and `session.truncation`. Caveat: exactly as with
  the tool insights, this telemetry is session-wide and not run-scoped, so any
  model call or context change that happens while a run is `in_progress` gets
  attributed to that run, including unrelated work happening in the same
  session. Runs recorded before context tracking existed simply omit the new
  fields; the panel, the per-stage badge, and the report section are omitted
  entirely for them rather than rendered as `0` or `NaN`.
- **QA results** on any stage driven by the `qa` plugin (`qa:qa`,
  `qa:qa-monitor`): per-scenario Pass/Fail/Flaky badges with notes, inline
  thumbnails for screenshot evidence, click-to-enlarge image previews, and download links for
  video/log/trace evidence, and a runtime-monitoring findings list (Error/
  Critical/Warning/Info) from Aspire log/trace/metric checks. Evidence
  files are served from `<worktree root>/<evidence path>` via
  `/api/runs/:id/evidence?path=...` (path-traversal guarded). The worktree
  root is the git checkout the agent operates in — read from the session
  state directory's `workspace.yaml` (`git_root`/`cwd`), **not** the
  infinite-sessions state directory itself. When an image cannot be served
  (deleted, moved, or forbidden) the thumbnail is replaced with an inline
  "Evidence unavailable" placeholder rather than a broken-image glyph.
- Report endpoints remain available for automation at `/api/runs/:id/report`
  (Markdown) and `/api/runs/:id/report.html` (self-contained HTML).
- Live updates over server-sent events, so the panel refreshes automatically
  as the orchestrating agent moves through stages.

## Canvas Contract

Canvas id: `orch-dashboard`. Actions:

- `start_run({ skillId, title, stages: [{ name, agents? }], originalPrompt?, githubIssue?, changeKind?, resume? })` ->
  `{ runId, resumed }`
  Call once at the start of an orchestration, listing every stage up front —
  including a **Personal Validation** stage, a separate **Create Pull Request**
  stage after it (for skills that open a PR; mark it `skipped` when there is no
  change set), and a final **Summary** stage. Marks the run as the one currently
  receiving tool-activity insight. By default it **reattaches** to an existing
  `in_progress` run for the same `skillId` and returns `resumed: true` with the
  stored run, so a resumed session continues instead of duplicating the run; pass
  `resume: false` to force a new one. `changeKind` is one of `new-functionality`,
  `bug-fix`, `dependency-update`, `none`. `originalPrompt` stores the user text
  that initiated the run. `githubIssue` stores originating issue metadata (for
  example `{ owner, repo, number, url, title }`); when omitted, a declared
  **GitHub Issue Update** stage is hidden because it is not relevant.
- `set_run_context({ runId, changeKind?, approval?, approvalNote? })`
  Persist the run-level state that gates later phases: the change kind driving QA
  depth, and the Personal Validation decision (`pending` / `approved` /
  `rejected`). Because it lives in the run JSON, it survives compaction and
  session resume — a pull request must never be created while approval is
  `pending` or `rejected`. When Personal Validation requests changes, keep the
  same run, record `approval: "rejected"`, reopen the relevant earlier stage, and
  reset to `approval: "pending"` before the revised Personal Validation handoff.
- `update_stage({ runId, stageIndex | stageName, status, output?, appendOutput?, links?, scenarios?, monitoring? })`
  Call at the start of a stage (`status: "in_progress"`) and again when it
  finishes, with the result captured in `output`. Each transition to `done` increments
  that stage's completion count, which is shown in the live dashboard and exported
  reports. For Personal Validation, pass `links` such as the running app URL, Aspire
  dashboard URL, health page, or focused review route so the dashboard renders direct
  open buttons. For QA/validation stages,
  also pass:
  - `scenarios: [{ name, status: "pass"|"fail"|"flaky", notes?, evidence?: [{ type?, path, description? }] }]`
    — one entry per tested scenario. `evidence[].path` is resolved against the
    **git worktree root** the owner session operates in (e.g. a
    `.qa-evidence/...` folder in the repo root, or the `qa` plugin's
    `.wip/qa/<feature>/screenshots/...` convention) — not the infinite-sessions
    state directory. A path that escapes the worktree root is refused. Replaces
    any scenarios previously recorded for this stage.
  - `monitoring: { summary?, findings?: [{ level: "error"|"critical"|"warning"|"info", resource?, message, timestamp? }] }`
    — a runtime log/trace/metric summary, e.g. from the `qa` plugin's
    `aspire-log-monitor` skill. Replaces any monitoring previously recorded
    for this stage.
- `finish_run({ runId, status, summary? })`
  Call once the orchestration completes, is blocked, or is cancelled — from the
  **Summary** stage, once the pull request is created (or the run concludes
  without one). The `summary` is shown as a highlighted block at the end of the
  run detail. Stops attributing further tool activity to this run.
- `list_runs()` / `get_run({ runId })`
  Read back state, e.g. to recover the current `runId` after a session resume.
  Both include an `insightSummary` and a `contextSummary` (or, for `get_run`,
  the full per-call `insights` log) alongside the run data. `contextSummary` is
  `null` for runs recorded before context tracking existed.

State is stored as JSON files under `<session workspace>/orchestration-runs/`,
so each orchestration run persists for the life of the session and is
inspectable on disk. This file — not the conversation — is the source of truth
for a run's position, change kind, and approval state.

## Session Model

The orchestrating session is the **sole owner** of a run: only it calls
`start_run`, `update_stage`, `set_run_context`, and `finish_run`. Heavy work
(build, test, Playwright) should be delegated to sub-agents in the **same
worktree** so the change set and evidence paths stay valid. A child session
(`create_session`) gets a different worktree and should be used only for
genuinely concurrent work such as `qa:qa-monitor`; its evidence must be written
into — or copied back to — the owner session's **worktree root**, because the
evidence endpoint refuses any path that resolves outside it. See
`plugins/copilot-app/instructions/orch-shared-phases.instructions.md` for the
full Execution Model.

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

Copilot App orchestration agents should inspect and open this dashboard with the
full plugin provider ID `plugin:copilot-app:orch-dashboard`. Do not use shortened
provider IDs such as `plugin:copilot-app` or `user`. If the host reports duplicate
`orch-dashboard` providers, remove stale user-scope copies from
`%USERPROFILE%\.copilot\extensions` after confirming they are not needed.

## Reference

Source: `plugins/copilot-app/extensions/orch-dashboard/`
