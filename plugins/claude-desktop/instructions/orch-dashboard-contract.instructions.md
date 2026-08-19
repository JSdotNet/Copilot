---
applyTo: 'skills/orch-*/SKILL.md'
description: Defines how an orch-* orchestration reports to the orch-dashboard MCP server — the stage reporting contract, how the dashboard is surfaced to the user, and how to read the automatically captured context and token insight.
---

# Dashboard Reporting Contract (Orchestration-Owned)

Part of the shared `orch-*` contract indexed by `orch-shared-phases.instructions.md`.
Read this file once, before the first `update_stage` call.

## Dashboard Reporting Contract (Shared)

Every `orch-*` skill reports progress through the `orch-dashboard` MCP server
(`plugins/claude-desktop/mcp/orch-dashboard/`), which this plugin registers. Its tools appear
under the names `open_dashboard`, `start_run`, `record_prompt`, `set_run_context`,
`update_stage`, `finish_run`, `list_runs`, `get_run`, `render_diagram`, `render_markdown`,
and `export_report`.

**The tool prefix depends on how the server is registered, so resolve it from the available
tool list rather than assuming it.** A plugin-provided MCP server is namespaced with the
plugin that provides it, so installing this plugin surfaces the tools as
`mcp__plugin_claude-desktop_orch-dashboard__<tool>`. The same server registered directly in a
repository's `.mcp.json` surfaces as `mcp__orch-dashboard__<tool>`. The tool names and
arguments are identical either way; only the prefix differs. An agent that hardcodes one
spelling — in an `mcp__` tool allowlist especially, which matches exact runtime names — loses
every dashboard tool under the other.

- If the `orch-dashboard` tools are not available at all — the plugin is installed without
  its MCP server, or the server failed to start — skip the dashboard calls and continue
  through standard chat interaction.
- If some tools resolve but a required one (`start_run`, `update_stage`,
  `set_run_context`, `finish_run`) errors, treat it as a tooling/runtime capability issue.
  Do not silently fall back to chat-only tracking; block the orchestration and report the
  missing capability, including the tool's error text.
- The server writes run state to a per-project directory outside the repository, so runs
  survive a session restart and never appear in `git status`. `stateDir` in the
  `open_dashboard` result names that directory.

- **Open** the dashboard once per session with `open_dashboard` and surface it per
  **Surfacing the Dashboard** below — the page updates live over server-sent
  events, so it is opened once and left open. Then call `start_run` with the skill's
  `skillId`, the full ordered stage list (its skill-specific stages followed by the shared
  phase names for its tier), and the `changeKind` when it is already known. `start_run`
  reattaches to an existing `in_progress` run for the same skill and returns
  `resumed: true`; continue from the first stage that is not `done` instead of restarting
  the orchestration.
- **Persist gating state** with `set_run_context`: the `changeKind` as soon as it is
  determined, and the `approval` decision recorded in Personal Validation.
- **Before each stage**, call `update_stage` with `status: "in_progress"`.
- **After each stage**, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary. The dashboard increments the stage's
  completion count every time it transitions to `done`, so repeated Build & Test, QA
  Validation, or Personal Validation passes after requested changes remain visible.
- **For the Personal Validation phase**, pass `links` for the started app and any dashboard or review target URLs, so the dashboard renders direct buttons next to the stage output instead of making the user copy commands.
- **When Personal Validation requests changes**, record the rejected decision, move the
  relevant earlier stage back to `in_progress`, and continue the same run through the repeated
  phases instead of starting a new run. Before handing back for the revised Personal
  Validation pass, record `approval: "pending"`; only `approval: "approved"` unlocks Create
  Pull Request.
- **For the QA Validation phase**, also pass `scenarios` (one entry per tested scenario
  with `status: "pass"|"fail"|"flaky"`, `notes`, and optional Playwright
  screenshot/recording `evidence` paths) and `monitoring` (the Aspire log/trace summary
  and any Error/Critical/Warning findings) so the dashboard renders QA results with
  evidence inline when it exists.
- **Keep Personal Validation and Create Pull Request as separate stages**: gate Create
  Pull Request on explicit user approval recorded in Personal Validation (mark it
  `skipped` when there is no change set to submit), and record all PR-time changes under
  the Create Pull Request stage output. Before invoking any PR creation command, the Create
  Pull Request stage must stop the orchestration-started runtime, close only
  orchestration-owned QA/review browser windows, keep the `orch-dashboard` and viewer tabs
  open, and record that cleanup in the stage output — never create the pull request
  before personal validation or cleanup.
- **For the Documentation Update phase** (code-modifying tier only), run it after Create
  Pull Request: mark it `in_progress`, then `done` with an `output` naming the governed docs
  updated and the new commit pushed onto the existing PR branch, or `done` describing what was
  checked when no update was needed, or `skipped` when Create Pull Request was skipped. It
  adds a new commit only — never amend, rebase, squash, or force-push the PR branch — and it
  never creates a commit when no documentation is stale. If the commit or push is rejected,
  mark the stage `blocked` with the actual error in the `output`, never `done`.
- **For the GitHub Issue Update phase**, run it after Documentation Update for code-modifying
  orchestrations and after Create Pull Request for documentation/config orchestrations. Mark
  it `done` after adding the result and QA report comment to the originating issue, `skipped`
  when the session was not started from a GitHub issue, or `blocked` with the actual error
  when the comment cannot be posted.
- **Mark the Summary stage** `in_progress` then `done`, and call `finish_run` with the final
  status and summary once the pull request and any applicable GitHub issue update are complete
  (or the run concludes without one).

### Surfacing the Dashboard

A run the user cannot see is a run they cannot steer. Show the dashboard where the host can
display it, and only fall back to a bare link when it cannot.

1. **Inline panel.** In a host that supports MCP Apps, `open_dashboard` renders the
   dashboard inline on its own. Nothing further is needed — do not also open a browser tab.
2. **Inline browser pane.** Otherwise, if the host exposes an in-app browser, open
   `dashboardUrl` there so the dashboard sits beside the conversation instead of in a
   separate window. In Claude Code that is `preview_start` with `{ url: dashboardUrl }`
   (`mcp__Claude_Browser__preview_start`); resolve the exact name from the available tool
   list, since a host may namespace or omit it.
3. **Plain link.** With neither available, give the user `dashboardUrl` to open themselves.

- **Open it once.** The page updates live over server-sent events, so re-opening the pane on
  later stages just steals focus. If the tab was closed, reopening is fine; routine stage
  transitions are not a reason to.
- **Do not block on it.** Failing to open the pane is a presentation problem, never a run
  problem: report that the pane could not be opened, give the URL, and continue the
  orchestration.
- **The viewers follow the same rule.** `render_diagram` and `render_markdown` serve
  `<dashboardUrl>mermaid` and `<dashboardUrl>markdown`; open those in the inline browser too
  when a stage renders content, and leave them open alongside the dashboard tab.

See `plugins/claude-desktop/mcp/orch-dashboard/README.md` for the full dashboard tool
contract, and `instructions/dashboard-usage.instructions.md` for when to also open the
`render_markdown`/`render_diagram` content viewers.

## Context and Token Insight (Shared)

The dashboard's **Context** panel reports context-window and token consumption alongside
the tool-activity Insight panel. Both are captured automatically by the plugin’s
telemetry hooks from the session’s own tool calls and transcript; the orchestrating agent
does not report them.

- **Per-stage token delta** (the `Token delta:` badge on each stage) — the tokens of every model
  call that completed while that stage was `in_progress`, with reasoning and prompt cache
  read/write tracked separately, plus a subtotal for sub-agent usage so delegated cost stays
  visible. It is a delta rather than an absolute reading at the stage boundary, because
  compaction can reset the absolute mid-stage. Two figures are shown:
  - **Input + output** — the headline total. `inputTokens` counts the *whole* prompt, most
    of which is normally served from the prompt cache on later turns, so this figure can
    legitimately run to several times the model's context window. It measures throughput,
    **not** context occupancy.
  - **Uncached** (`input − cache reads + output`) — the fresh tokens the stage actually
    pushed through the model. This is the figure that approximates real context pressure.
- **Run-level context gauge** — the latest `currentTokens` against `tokenLimit` as a
  percentage, the component breakdown (system, conversation, tool definitions), the peak
  observed during the run, and the count and reasons of compaction and truncation events.
  The gauge deliberately **ignores sub-agent samples**, because a sub-agent runs in its own
  context window.

How to use these:

- **Never invent, estimate, or hand-write token numbers** into `update_stage` output,
  `set_run_context`, or the run summary. The extension owns these values; a written-in
  figure would conflict with the captured one. Keep stage `output` focused on what the
  stage did and produced.
- **Never read the headline input + output figure as context consumption.** A stage showing
  a multi-million-token total against a 200k window is normal cache behavior, not an
  emergency. Compare stages on the **uncached** figure, and read occupancy off the run-level
  gauge.
- **Read the uncached per-stage figure as the signal for which phase is expensive.** A stage
  whose uncached delta dwarfs the rest — especially one with a large sub-agent subtotal — is
  evidence that the stage should be split into smaller stages or delegated, and is worth
  naming in the Summary phase as a qualitative observation.
- **Act on the run-level gauge before it forces compaction.** The telemetry hook announces
  each threshold it crosses, and `orch-execution-model.instructions.md` defines the ladder:
  **Delegation Order** to push the next heavy step to a sub-agent in the same worktree, and
  **Session Handoff** to continue the run in a fresh session once delegation is no longer
  enough. Because the gauge ignores sub-agent samples, delegating genuinely relieves the
  owner session's context rather than just relabelling the cost. Compaction and truncation
  counts rising during a run mean the mitigation came too late.
- **Runs that predate this capture simply omit the panel and its fields** — treat their
  absence as "not recorded", not as zero.

**Caveat — attribution is session-wide.** Token telemetry, like the existing tool-activity
insight, is captured per session, not per run. Any model call made while a run is
`in_progress` is attributed to that run and to its current stage, including unrelated work
done in the same session. This is the reason for the **one orchestration per session** rule
in the Execution Model (`orch-execution-model.instructions.md`); interpret the numbers as an
upper bound when other work happened alongside the run.
