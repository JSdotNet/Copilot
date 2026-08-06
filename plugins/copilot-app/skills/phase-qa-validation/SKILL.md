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

## Depth Selection (Automatic)

- **New functionality → QA validation with capture:**
  1. **Run the application locally** via the `qa:qa` agent using the `aspire` /
     `aspire-run` skill.
  2. **Execute the changed/affected scenarios with Playwright** — via the `playwright` MCP
    server, `qa:qa` drives each scenario, capturing screenshot/video evidence per
    checkpoint and failure.
  3. **Monitor runtime behavior continuously** — `qa:qa-monitor` watches Aspire logs,
    traces, and metrics. Inside the GitHub Copilot App, run `qa-monitor` in a parallel
    child session (`create_session` + cross-session messaging) so monitoring runs
    concurrently with Playwright validation; otherwise use the `qa` plugin's
    `delegate-to-qa-monitor` skill for a same-session handoff.
  4. **Record the QA result** with pass/fail per scenario and the captured evidence.

  Playwright execution itself stays in the orchestrating session (inline or via a
  sub-agent in the **same worktree**) so it exercises the actual change set.
- **Bug fix or change to existing functionality → targeted QA validation without required capture:**
  1. **Run the application locally** via the `aspire` / `aspire-run` skill and verify the
     affected scenarios.
  2. **Use Playwright when it helps validate the flow**, but capture screenshot/video
    evidence only when explicitly requested or when a failure needs supporting evidence.
  3. **Record pass/fail and monitoring findings** for the affected scenarios.
- **Dependency, package, framework, or SDK update with no functional change → startup-only
  validation:** start the application, confirm the dashboard/health endpoints report
  healthy, and confirm the logs show no new errors. Full functional Playwright scenarios and
  capture are not required unless the update introduces new user-facing behavior.
- **No functional change and nothing to run → skip:** mark this phase `skipped` and record
  why.

## Inputs

- The change kind (functional / bug fix / dependency update / none) from the calling
  orchestration.
- The affected scenarios or critical paths to exercise.

## Outputs

- QA result: per-scenario pass/fail with optional Playwright evidence paths, or the
  startup/health outcome (startup-only mode), or a skip reason.
- Monitoring findings (Aspire log/trace/metric anomalies) when monitoring ran.
- These outputs feed the shared Personal Validation phase (the recorded QA review the user
  reviews).

## Dashboard Reporting

- Report as the `QA Validation` stage via the shared **Dashboard Reporting Contract** in
  `instructions/orch-shared-phases.instructions.md`. Also pass `scenarios` (per-scenario
  `status`, `notes`, `evidence`) and `monitoring` (log/trace summary) so the dashboard
  renders QA results with evidence inline.

## Agents

- `qa:qa`, `qa:qa-monitor` (recommended); falls back to `csharp-coding:coding`
  running validation manually when the `qa` plugin is not installed. Agent transitions
  require explicit user approval.

## Skills Used

- `aspire`, `aspire-run`

## MCP Servers

- `playwright` for browser automation and smoke/E2E execution when QA runs browser-facing
  scenarios; evidence capture is required only for new functionality unless explicitly
  requested.

## Evidence Location

- Evidence paths reported to the dashboard are resolved **relative to the orchestrating
  session's workspace**, and paths outside it are rejected.
- A `qa-monitor` child session runs in its own worktree, so it must write evidence under
  the orchestrating session's workspace path, or its findings must be copied back before
  they are reported.
- The orchestrating session reports all QA results; the child session never calls dashboard
  actions itself.

## Reference

Source skill location: `plugins/copilot-app/skills/phase-qa-validation/SKILL.md`.
Phase definition: `plugins/copilot-app/instructions/orch-shared-phases.instructions.md`.
