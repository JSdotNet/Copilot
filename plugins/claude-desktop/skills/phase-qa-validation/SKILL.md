---
name: phase-qa-validation
description: 'Shared QA Validation phase for code-modifying orch-* orchestrations. Runs after Build & Test; depth is driven by change kind (new functionality = Playwright QA with capture, bug/existing-flow change = targeted verification, dependency update = startup-only, otherwise skipped). Invoked by the orchestrator agent.'
---

# Phase: QA Validation

Reusable **QA Validation** phase shared by every code-modifying `orch-*` orchestration. The
`orchestrator` agent invokes this skill after Build & Test. Its depth is decided
automatically from the kind of change so callers do not re-describe QA rules.

## When To Run

- Run for code-modifying orchestrations, after Build & Test passes.
- Documentation/config orchestrations skip this phase.
- Skip when the repository declares it has no runnable application (see **Repo Context**).

## Repo Context

The consuming repository may supply `.claude/orch-context.md`, read once per run by
the orchestrator. The convention is defined in
`instructions/orch-repo-context.instructions.md` — do not restate it here. Use it as
follows:

- **How to run** — use the declared startup command and AppHost path instead of discovering
  or guessing them, and instead of asking the user.
- **Base URLs** — validate against the declared dashboard, front end, and API entry points.
- **Healthy startup** — judge startup against the declared resources, health endpoints, and
  log signals, and do not report the declared benign warnings as failures.
- **Test credentials** — follow the declared pointer to obtain credentials; the file never
  contains secrets.
- **QA depth** — the declared depth overrides the automatic change-kind selection below, and
  any repo-specific caveats it lists still apply.
- **No runnable application** — when the repository declares
  `**Runnable application:** none`, mark this phase `skipped`, record that the repository
  declares no runnable application, and attempt no startup, Playwright run, or `qa:qa`
  delegation.

When the file is absent, a section is missing, or a value is unrecognized, fall back to the
behavior described below, note the fallback once, and continue.

## Depth Selection (Automatic)

Before running a QA mode that depends on an MCP server, verify that the required MCP
tooling is available. Required tooling includes `playwright` for browser automation,
screenshots, videos, or any user-requested evidence capture, and any monitoring MCP/tooling
declared by repo context or needed for the selected runtime validation.

For Playwright-backed validation, the preflight is:

1. Confirm the consuming repo/session has the Playwright MCP server configured before QA
   starts, for example:

   ```json
   {
     "servers": {
       "playwright": {
         "command": "npx",
         "args": ["-y", "@playwright/mcp@latest"]
       }
     }
   }
   ```

2. Confirm Claude Code was restarted or its MCP servers were reloaded after
   configuration, so the `browser_*` Playwright tools are visible to the QA/orchestration
   agent that will run validation.
3. Run a live capture smoke check before scenarios: use Playwright MCP to navigate to the
   target page and take a screenshot. If navigation or screenshot capture fails, screenshot
   and video capture are unavailable for this run.

For Aspire-backed monitoring, confirm Aspire MCP is initialized and running before
validation when logs, traces, metrics, resources, or health evidence are required:

```bash
aspire mcp init
aspire mcp start
```

When QA is delegated to `qa:qa` or `qa:qa-monitor`, verify availability in the target
agent/session tool surface, not only in the parent orchestration session. The QA plugin
declares the required `aspire` and `playwright` MCP servers and allowlists them at server
granularity, so the child agent gets every tool of each server (Aspire's `list_resources`,
`list_structured_logs`, `list_console_logs`, `list_traces`, `list_trace_structured_logs`, and
Playwright's `browser_*`).

Two failure modes are worth naming separately, because they look identical from the outside
and only one is a real outage:

- **Stale tool name.** A tool called by a remembered name the server no longer exposes fails
  per call — Aspire renamed its query tools from `get_*` to `list_*` and dropped metrics
  entirely. Resolve the current name from the tool list; this is not a missing server.
- **Wrong prefix in an allowlist.** A plugin-provided MCP server is namespaced with its
  plugin, so the QA servers surface as `mcp__plugin_qa_aspire__*` and
  `mcp__plugin_qa_playwright__*`, and only as `mcp__aspire__*` / `mcp__playwright__*` when
  registered directly in a repository's MCP configuration. An allowlist naming the wrong form
  matches nothing, and the child agent loses every tool of that server while the parent
  session still has them.

If the tools are present in normal sessions but absent only in the delegated child agent,
report it as a child-agent MCP/tool allowlist exposure failure, name the missing server, and
say which of the two forms the agent's allowlist used.

If required MCP tooling is unavailable:

- Mark **QA Validation** `blocked`, not `done` or `skipped`.
- Prompt the user with the missing MCP server or tool name, why it is required, and the
  setup or enablement action needed before QA can continue.
- Stop before Personal Validation, pull request creation, issue updates, or Summary.
- Do not complete the phase through a degraded/manual fallback that omits required
  browser automation, evidence capture, or monitoring.
- Do not describe browser snapshots or smoke output as Playwright MCP screenshots,
  videos, or traces. They can be noted as fallback render evidence only when the selected
  validation policy allows a degraded result; they do not satisfy required Playwright
  evidence capture.

Applies when the repository does not declare a QA depth in `.claude/orch-context.md`.

- **New functionality → QA validation with capture:**
  1. **Run the application locally** via the `qa:qa` agent using the `aspire` /
     `aspire-run` skill.
  2. **Execute the changed/affected scenarios with Playwright** — via the `playwright` MCP
     server, `qa:qa` drives each scenario, capturing screenshot/video evidence per
     checkpoint and failure.
  3. **Monitor runtime behavior continuously** — `qa:qa-monitor` watches Aspire logs,
     traces, and metrics. Run `qa-monitor` as a background sub-agent
     (the `Agent` tool with `run_in_background`) so monitoring runs
     concurrently with Playwright validation; otherwise use the `qa` plugin's
     `delegate-to-qa-monitor` skill for a same-session handoff.
  4. **Stop the monitor when the scenarios are done** — request its summary with
     `SendMessage`, then end the background agent with `TaskStop`. `qa-monitor` polls until
     told otherwise, so this phase must not be marked `done` while one is still running.
  5. **Record the QA result** with pass/fail per scenario and the captured evidence.

  Playwright execution itself stays in the orchestrating session (inline or via a
  sub-agent in the **same worktree**) so it exercises the actual change set.
- **Bug fix or change to existing functionality → targeted QA validation without required capture:**
  1. **Run the application locally** via the `aspire` / `aspire-run` skill and verify the
     affected scenarios.
  2. **Use Playwright when it helps validate the flow**, but capture screenshot/video
     evidence only when explicitly requested or when a failure needs supporting evidence.
     When the selected verification requires Playwright or requested evidence, missing MCP
     availability blocks QA instead of falling back to an incomplete manual check.
  3. **Record pass/fail and monitoring findings** for the affected scenarios.
- **Dependency, package, framework, or SDK update with no functional change → startup-only
  validation:** start the application, confirm the dashboard/health endpoints report
  healthy, and confirm the logs show no new errors. Full functional Playwright scenarios and
  capture are not required unless the update introduces new user-facing behavior.
- **No functional change and nothing to run → skip:** mark this phase `skipped` and record
  why.

## Revalidation After Requested Changes

When the user requests changes during Personal Validation, or QA finds issues that lead to
implementation changes, refresh the running app before repeating QA or handing back to the
user. Prefer updating the same running instance when the repo's startup mode supports hot
reload/watch and Aspire reports the affected resources remain healthy. Otherwise stop and
restart the application automatically, wait for healthy/running state again, and refresh
endpoint URLs when they change. Record whether revalidation used the same updated instance
or a restart, and do not ask the user to restart the app manually as the normal path.

## Inputs

- The change kind (functional / bug fix / dependency update / none) from the calling
  orchestration.
- The affected scenarios or critical paths to exercise.
- The repo context resolved by the orchestrator from `.claude/orch-context.md`
  (startup command, AppHost path, base URLs, healthy-startup signals, credential pointer,
  QA depth), when the repository supplies it.

## Outputs

- QA result: per-scenario pass/fail with optional Playwright evidence paths; a `blocked`
  result naming missing required MCP tooling and the user action needed to continue; or the
  startup/health outcome (startup-only mode), or a skip reason.
- Monitoring findings (Aspire log/trace/metric anomalies) when monitoring ran.
- These outputs feed the shared Personal Validation phase (the recorded QA review the user
  reviews).

## Dashboard Reporting

- Report as the `QA Validation` stage via the shared **Dashboard Reporting Contract** in
  `instructions/orch-shared-phases.instructions.md`. Also pass `scenarios` (per-scenario
  `status`, `notes`, `evidence`) and `monitoring` (log/trace summary) so the dashboard
  renders QA results with evidence inline.
- When required MCP tooling is unavailable, report the stage as `blocked` with the missing
  tooling and user-actionable setup guidance in `output`. Do not report pass scenarios or
  success wording for checks that could not be completed correctly.

## Agents

- `qa:qa`, `qa:qa-monitor` (recommended); falls back to `csharp-coding:coding`
  running validation manually when the `qa` plugin is not installed, but only when manual
  validation can complete the selected QA depth correctly. Manual validation is not a
  substitute for required MCP-backed browser automation, evidence capture, or monitoring.
  Continue without a separate approval prompt before this phase unless required tooling is
  missing; missing required tooling blocks the phase and prompts the user.

## Skills Used

- `aspire`, `aspire-run`

## MCP Servers

- `playwright` is required for browser automation, smoke/E2E execution of browser-facing
  scenarios, and screenshot/video evidence capture. Evidence capture is required for new
  functionality and whenever the user explicitly requests it.
- A quick Playwright MCP preflight must navigate to a target page and save a screenshot
  before scenario validation begins. If that fails, screenshot/video evidence capture is
  unavailable and the phase must report the limitation or block according to the selected
  QA depth.
- Aspire MCP is required when validation depends on Aspire resource state, logs, traces,
  metrics, or health evidence. Initialize/start it with `aspire mcp init` and
  `aspire mcp start` before validation, or block with a clear missing-monitoring report.
- Missing required MCP tooling is a blocking prerequisite failure; stop and prompt the user
  for setup instead of completing QA through degraded fallback.

## Evidence Location

- Evidence paths reported to the dashboard are resolved **relative to the git worktree
  root** the orchestration runs in, and paths outside it are rejected.
- A `qa-monitor` sub-agent launched with `isolation: "worktree"` runs in its own checkout,
  so it must write evidence under the orchestrating worktree root, or its findings must be
  copied back before they are reported.
- The orchestrating session reports all QA results; a sub-agent never calls dashboard tools
  itself.

## Reference

Source skill location: `plugins/claude-desktop/skills/phase-qa-validation/SKILL.md`.
Phase definition: `plugins/claude-desktop/instructions/orch-shared-phases.instructions.md`.
Repo context convention: `plugins/claude-desktop/instructions/orch-repo-context.instructions.md`.
