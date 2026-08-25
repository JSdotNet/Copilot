# Orchestration Dashboard (MCP Server / Desktop Extension)

The MCP server that gives `claude-desktop`'s `orch-*` orchestration skills and automation skills
a live progress and output dashboard instead of plain chat narration. It also serves the
Mermaid diagram and Markdown document viewers.

It has **two surfaces from one implementation**:

| Surface | How it renders | Where |
| --- | --- | --- |
| **MCP App** (`ui://` resources, [SEP-1865](https://modelcontextprotocol.io/extensions/apps/overview)) | inline in the conversation, in a sandboxed iframe | Claude Desktop, Claude web, and any host implementing `io.modelcontextprotocol/ui` |
| **HTTP** (`127.0.0.1`, ephemeral port) | a browser tab — the Claude Code in-app browser pane where the host has one, otherwise one the user opens | everywhere else, including Claude Code |

The App surface is what actually replaces the GitHub Copilot canvas: the panel is back, in
the conversation, rather than in a separate browser window. Extension support is negotiated,
so a host that does not implement MCP Apps never reads the `ui://` resources and simply gets
the URL instead.

An MCP server cannot open that URL itself — driving a browser is the host's job — so the
orchestration instructions tell the agent to hand `dashboardUrl` to the host's in-app
browser (`preview_start` in Claude Code) rather than only printing it. See **Surfacing the
Dashboard** in `instructions/orch-dashboard-contract.instructions.md`. That keeps the dashboard
beside the conversation on hosts without MCP Apps, which is as close to the App surface as
the HTTP one gets.

This is the Claude Code counterpart of the GitHub Copilot `orch-dashboard` canvas extension
in `plugins/copilot-app/extensions/orch-dashboard/`. The run model is identical:
`render.mjs` and `report.mjs` are byte-identical between the two, and `store.mjs` and
`insight.mjs` differ only in comments and in the tool names the category table matches. Keep
them in step when changing either copy.

| Copilot CLI | Claude Code |
| --- | --- |
| canvas panel embedded in the host | browser page served on `127.0.0.1` |
| canvas actions (`invoke_canvas_action`) | MCP tools (`mcp__plugin_claude-desktop_orch-dashboard__*`) |
| `diagram-canvas` extension | `/mermaid` route + `render_diagram` |
| `markdown-canvas` extension | `/markdown` route + `render_markdown` |
| session telemetry events | Claude Code hooks + session transcript |

## What It Shows

- A run list (left panel) with one entry per orchestration, each labeled with its skill and
  overall status. Selecting a run expands **stage navigation**: every stage declared in
  `start_run` with a status dot plus compact agent, model, and elapsed-time hints. A declared
  **GitHub Issue Update** stage is hidden when the run has no originating issue metadata.
  Stages with `links` render those links as quick-open buttons.
- A run detail view (right panel) with every stage, its status (`pending` / `in_progress` /
  `done` / `blocked` / `skipped` / `cancelled`), the assigned agents, captured output, and
  quick-action links. Stage output and the `finish_run` **Summary** render as a safe Markdown
  subset. Each stage output has an **Open rich view** action, and the run header links to an
  inline **HTML report**. When prompt history is provided to `start_run` or appended through
  `record_prompt`, the detail shows a **Prompt history** section. A stage that completes more
  than once — after Personal Validation requests changes, for example — shows a `Done Nx`
  count badge.
- An **Insight** panel: total tool calls, elapsed time, measured tool time, an estimated
  thinking remainder, and a time-by-category breakdown (Shell, Edit, Read,
  `QA (Playwright/Aspire)`, MCP tool, Agent tasks, Other), captured from the session's own
  tool activity while a run is `in_progress`. No reporting is required from the orchestrating
  agent. Caveat: hook telemetry is session-wide, so any tool call made while a run is active
  is attributed to it, including unrelated work in the same session.
- **Agent / MCP server / model usage**, overall and per stage, derived from the tool names
  observed (`mcp__<server>__<tool>`), from `Task`/`Agent` calls (which name the sub-agent
  type), and from the models recorded in the transcript. This reflects what actually ran, not
  just what `start_run` declared.
- A **Context** panel with the run-level context gauge and per-stage token deltas:
  - A **run-level context gauge** — the latest prompt size against the model's context limit
    as a percentage bar (amber from 75%, red from 90%), plus the peak observed during the
    run. This is the "am I about to be compacted mid-orchestration?" signal.
  - **Compaction counts** for the run, with the trigger that caused each.
  - A **per-stage token delta** — a `Token delta: …` badge totalling the input + output
    tokens of every model call that completed while that stage was `in_progress`. A delta is
    used rather than an absolute reading, because compaction resets the absolute figure.
    Note that input tokens count the whole prompt, most of which is normally served from the
    prompt cache — which is why a stage delta can legitimately exceed the context window. An
    **uncached** figure (`input − cache reads + output`) is reported next to it as the tokens
    the stage actually pushed through the model.
  - **Sub-agent attribution** — usage from sidechain (sub-agent) messages is folded into the
    parent stage's delta but kept as a separate subtotal, and is excluded from the run-level
    gauge because a sub-agent runs its own context window.
- **QA results** on any stage driven by the `qa` plugin: per-scenario Pass/Fail/Flaky badges
  with notes, inline thumbnails for screenshot evidence, click-to-enlarge previews, and
  download links for video/log/trace evidence, plus a runtime-monitoring findings list from
  Aspire log/trace/metric checks. Evidence is served from the **git worktree root** via
  `/api/runs/:id/evidence?path=...`, path-traversal guarded; a path resolving outside that
  root is refused. Unavailable images render an inline placeholder rather than a broken glyph.
- Live updates over server-sent events, including changes written by the telemetry hook in
  its own process (the server watches the run directory).

## Tools

Registered under the MCP server name `orch-dashboard`. The prefix Claude Code exposes them
under depends on how the server is registered: installed as part of this plugin they are
namespaced with the plugin, as `mcp__plugin_claude-desktop_orch-dashboard__<tool>`;
registered directly in a repository's `.mcp.json` they are `mcp__orch-dashboard__<tool>`.
Tool names and arguments are identical either way — resolve the prefix from the available
tool list rather than hardcoding one.

- `open_dashboard()` -> `{ dashboardUrl, diagramUrl, documentUrl, stateDir }`
  Starts the local HTTP server if it is not already running and returns the URLs. Call once
  per session and hand the user `dashboardUrl`; the page updates itself from then on.
- `start_run({ skillId, title, stages: [{ name, agents? }], originalPrompt?, promptHistory?, githubIssue?, changeKind?, resume? })` -> `{ runId, resumed, dashboardUrl }`
  Call once at the start of an orchestration, listing every stage up front — including a
  **Personal Validation** stage, a separate **Create Pull Request** stage after it (mark it
  `skipped` when there is no change set), and a final **Summary** stage. By default it
  **reattaches** to an existing `in_progress` run for the same `skillId` and returns
  `resumed: true`, so a resumed session continues instead of duplicating the run; pass
  `resume: false` to force a new one. `changeKind` is one of `new-functionality`, `bug-fix`,
  `dependency-update`, `none`. `githubIssue` stores originating issue metadata (for example
  `{ owner, repo, number, url, title }`); when omitted, a declared **GitHub Issue Update**
  stage is hidden as not relevant.
- `record_prompt({ runId, prompt, kind?, label?, createdAt? })` -> `{ ok, count }`
  Append a prompt to the run-level **Prompt history**.
- `set_run_context({ runId, changeKind?, approval?, approvalNote? })`
  Persist the run-level state that gates later phases: the change kind driving QA depth, and
  the Personal Validation decision (`pending` / `approved` / `rejected`). Because it lives in
  the run JSON, it survives compaction and session resume — a pull request must never be
  created while approval is `pending` or `rejected`. When Personal Validation requests
  changes, keep the same run, record `approval: "rejected"`, reopen the relevant earlier
  stage, and reset to `pending` before the revised handoff.
- `update_stage({ runId, stageIndex | stageName, status, output?, appendOutput?, links?, scenarios?, monitoring? })`
  Call at the start of a stage (`status: "in_progress"`) and again when it finishes. Each
  transition to `done` increments that stage's completion count. For Personal Validation,
  pass `links` such as the running app URL, Aspire dashboard, or a focused review route. For
  QA stages, also pass:
  - `scenarios: [{ name, status: "pass"|"fail"|"flaky", notes?, evidence?: [{ type?, path, description? }] }]`
    — `evidence[].path` is resolved against the **git worktree root** (for example
    `.wip/qa/<feature>/screenshots/...`). A path that escapes it is refused. Replaces any
    scenarios previously recorded for the stage.
  - `monitoring: { summary?, findings?: [{ level, resource?, message, timestamp? }] }`
    — replaces any monitoring previously recorded for the stage.
  Marking a stage `in_progress` also makes it the stage that telemetry is attributed to.
- `finish_run({ runId, status, summary? })`
  Call once the orchestration completes, is blocked, or is cancelled. Stops attributing
  further telemetry to the run.
- `list_runs()` / `get_run({ runId })`
  Read state back, e.g. to recover the current `runId` after a resume. `get_run` includes
  `insightSummary` and `contextSummary` alongside the run data.
- `render_diagram({ source, title?, mode?, explanation? })` -> `{ url, historyDepth }`
  Render Mermaid source in the diagram viewer. `mode: "push"` keeps the previous view in
  history behind a Back button; `"replace"` (default) updates in place.
- `render_markdown({ content, title?, mode? })` -> `{ url, historyDepth }`
  Render a Markdown document in the document viewer.
- `export_report({ runId, format?, outputPath? })` -> `{ path, format }`
  Write the run's report to disk as Markdown or self-contained HTML (evidence images inlined
  as data URIs). Use it to hand the user something to keep, or as the source for an Artifact.

Report endpoints remain available for automation at `/api/runs/:id/report` (Markdown) and
`/api/runs/:id/report.html` (self-contained HTML).

## State

Run state is stored as JSON files under a per-project directory **outside the repository**,
so runs survive a session restart and never show up in `git status`:

```text
<CLAUDE_CONFIG_DIR or ~/.claude>/orch-dashboard/<project>-<hash>/
  runs/<runId>.json        one orchestration run
  active.json              the run and stage currently receiving telemetry
  telemetry/<session>.json hook bookkeeping (pending tool starts, transcript cursor)
  reports/                 export_report output
```

Set `ORCH_DASHBOARD_STATE_DIR` to override the location. The run file — not the
conversation — is the source of truth for a run's position, change kind, and approval state.

## Telemetry

`telemetry-hook.mjs` is registered by the plugin for `SessionStart`, `PreToolUse`,
`PostToolUse`, `SubagentStop`, `PreCompact` and `Stop`. It records tool durations and
categories, sub-agent invocations, per-stage token usage, the context gauge, and compaction
events into the active run. It is best-effort by design: it exits 0 on any error and never
blocks a tool call.

The hook also runs one way **outward**. When a `PostToolUse` sample pushes the run-level
context gauge past a threshold, it answers with a warning rather than staying silent — a
`systemMessage` for the user and `additionalContext` for the orchestrator:

| Gauge | Signal | What the orchestrator is told to do |
| --- | --- | --- |
| 60% | `delegate` | Push the next heavy step to a sub-agent in the same worktree. |
| 75% | `prepare-handoff` | Persist gating decisions, finish the stage in flight, start nothing heavy inline. |
| 85% | `hand-off` | Mark the handoff and end the session so the run continues in a fresh context. |

Each threshold fires once per crossing, latched in `context.pressureNotified`. The latch
clears when the gauge falls back below a threshold, so the same run warns again after a
compaction or a handoff has reset its context. Without this the gauge was merely *observable*:
nothing read it on the agent's behalf, and the escalation stayed advice in a file. The
thresholds and their wording live in `CONTEXT_PRESSURE_THRESHOLDS` in `insight.mjs`.

Two accuracy caveats worth knowing:

- Tool durations pair `PreToolUse` with `PostToolUse` by tool name, so several concurrent
  calls to the *same* tool can swap durations between themselves. Totals stay correct.
- The context gauge is derived from the last root-agent message's prompt size in the
  transcript, which is the closest available equivalent of a live context reading.

## Session Model

The orchestrating session is the **sole owner** of a run: only it calls `start_run`,
`update_stage`, `set_run_context`, and `finish_run`. Heavy work should be delegated to
sub-agents in the **same worktree** so the change set and evidence paths stay valid. Reserve
`isolation: "worktree"` agents for genuinely concurrent work such as `qa:qa-monitor`; their
evidence must be written into — or copied back to — the owner's worktree root, because the
evidence endpoint refuses any path outside it. See
`plugins/claude-desktop/instructions/orch-execution-model.instructions.md` for the full Execution
Model.

A run outlives its session. When the owner session ends at a context threshold, it calls
`set_run_context` with `handoff: true` and a `handoffNote`, and the next session's
`start_run` for the same `skillId` reattaches instead of opening a duplicate. The marker
matters because a handed-off run and one abandoned at the Personal Validation gate look
identical to `isIdle` — session ended, nothing advancing — and `start_run` refuses the
second. `list_runs` reports `handoffPending`, the dashboard badges it **Handed off** rather
than **Idle**, and reattaching clears the marker while keeping the note.

## The App surface

Three `ui://` resources are published, one per page, each declared with the
`text/html;profile=mcp-app` MIME type and referenced from the tool that shows it:

| Tool | Resource |
| --- | --- |
| `open_dashboard` | `ui://orch-dashboard/dashboard.html` |
| `render_diagram` | `ui://orch-dashboard/diagram.html` |
| `render_markdown` | `ui://orch-dashboard/document.html` |

The pages themselves are **unchanged** — `render.mjs` and the two viewer pages are the same
files the Copilot canvas used, and stay that way. `app-bridge.js` is injected ahead of them
and adapts the environment instead:

- speaks the postMessage protocol (`ui/initialize`, `tools/call`, `ui/notifications/*`)
- replaces `fetch` for the pages' JSON routes, answering `/api/runs` from `list_runs`,
  `/mermaid/api/state` from `get_view`, and so on
- replaces `EventSource` with a poller, because the Apps protocol has no server-sent stream;
  polling a local stdio server every two seconds is cheap
- rewrites the two things JSON cannot carry — evidence images and the HTML report — to the
  dashboard's own HTTP origin, forces `loading="eager"` on thumbnails (lazy images never
  resolve inside an app iframe, because its viewport is not the user's), falls back to
  evidence data URIs from `get_run`, and routes outbound clicks through `ui/open-link`

`_meta.ui.csp` on each resource allows exactly two origins: the dashboard's own HTTP origin,
computed when the resource is read, and `cdn.jsdelivr.net` for Mermaid.

### Developing against it

`dev/test-host.mjs` is a minimal MCP Apps host — it spawns the server, reads the resource,
renders it in a sandboxed iframe and speaks the host half of the protocol, so the app can be
developed and debugged without Claude Desktop:

```bash
node plugins/claude-desktop/mcp/orch-dashboard/dev/test-host.mjs --tool open_dashboard
```

Add `--inspect` to drop the iframe's opaque origin so devtools can read the app's DOM. It is
excluded from the packed bundle.

`dev/handoff-test.mjs` drives the server over stdio the way Claude Code does and asserts the
session-handoff round trip end to end — mark, `SessionEnd`, reattach, and the abandoned-run
case that must still be refused:

```bash
node plugins/claude-desktop/mcp/orch-dashboard/dev/handoff-test.mjs
```

`dev/subagent-telemetry-test.mjs` drives the telemetry hook the same way — a payload on
stdin, transcripts laid out as Claude Code writes them — and asserts that delegated work is
attributed. Claude Code writes a sub-agent's messages to `<sessionId>/subagents/agent-*.jsonl`
rather than inlining them in the root transcript, so a hook that reads only the payload's
path reports `tokenUsage.subAgent` as zero however much a run delegates:

```bash
node plugins/claude-desktop/mcp/orch-dashboard/dev/subagent-telemetry-test.mjs
```

Both use a throwaway state directory and exit non-zero on the first failed check.

Set `ORCH_DASHBOARD_TOKEN_LIMIT` to override the context window the gauge is a percentage of,
for a session deliberately capped below its model's window. Left unset, the limit follows the
model and is raised to match any larger prompt actually observed — a limit below the real
window would put the gauge over 100% for a whole run, crossing and latching every pressure
threshold on the first sample.

## Install

**As part of the Claude Code plugin.** The server is registered by
`.claude-plugin/plugin.json`, so installing `claude-desktop` is all that is required. It
needs Node 18+ on `PATH` and has no npm dependencies.

**As a Claude Desktop extension.** Pack it as an `.mcpb` bundle and install it with one
click — Claude Desktop ships its own Node runtime, so nothing else is needed:

```bash
pwsh ./scripts/Build-DesktopExtension.ps1
```

That writes `dist/orch-dashboard-<version>.mcpb`. Double-click it, or use Settings →
Extensions → Advanced settings → Install Extension. `manifest.json` exposes two settings the
installer collects:

| Setting | Why |
| --- | --- |
| **Project directory** | The git worktree the dashboard reports on. QA evidence paths resolve against it. Claude Desktop has no working directory of its own, so set this. |
| **Run state directory** | Where run files live. Leave unset for the per-project default. |

To run it standalone (for debugging), start it over stdio:

```bash
node plugins/claude-desktop/mcp/orch-dashboard/mcp-server.mjs
```

## What works where

| | Claude Desktop | Claude Code |
| --- | --- | --- |
| Dashboard, viewers, reports | inline as an MCP App | `127.0.0.1` in the in-app browser pane |
| Run/stage/QA tracking | yes | yes |
| Insight and Context panels | **no** — they are fed by hooks, which Desktop does not have | yes |
| `orch-*` workflows that build, test and commit | **no** — no repository access | yes |

The dashboard is fully functional in Desktop as a viewer and as a place to drive runs from;
the parts that depend on a checkout and on hook telemetry only populate under Claude Code.

## Security

The HTTP server binds to `127.0.0.1` on an ephemeral port and is unauthenticated: reaching
it already requires local access to the machine. The App surface adds no network exposure of
its own — it runs in the host's sandboxed iframe and reaches the server only through
`tools/call`. The only path that reads arbitrary files is the evidence route, which resolves
every path against the git worktree root and refuses anything outside it.
