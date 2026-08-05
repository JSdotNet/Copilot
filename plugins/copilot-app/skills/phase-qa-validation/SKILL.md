---
name: phase-qa-validation
description: 'Shared QA Validation phase for code-modifying orch-* orchestrations. Runs after Build & Test; depth is driven by change kind (functional/bug fix = full Playwright QA with monitoring, dependency update = startup-only, otherwise skipped). Invoked by the orchestrator agent.'
---

# Phase: QA Validation

Reusable **QA Validation** phase shared by every code-modifying `orch-*` orchestration. The
`orchestrator` agent invokes this skill after Build & Test. Its depth is decided
automatically from the kind of change so callers do not re-describe QA rules.

## When To Run

- Run for code-modifying orchestrations, after Build & Test passes.
- Documentation/config orchestrations skip this phase.

## Depth Selection (Automatic)

- **Functional change or bug fix → full QA validation:**
  1. **Run the application locally** via the `qa:qa` agent's `aspire-run` skill.
  2. **Execute the changed/affected scenarios with Playwright** — `qa:qa` drives each
     scenario (for a bug fix, the original reproduction steps plus the regression
     scenario), capturing screenshot/video evidence per checkpoint and failure.
  3. **Monitor runtime behavior continuously** — `qa:qa-monitor` watches Aspire logs,
     traces, and metrics. Inside the GitHub Copilot App, run `qa-monitor` in a parallel
     child session (`create_session` + cross-session messaging) so monitoring runs
     concurrently with Playwright validation; otherwise use the `qa` plugin's
     `delegate-to-qa-monitor` skill for a same-session handoff.
  4. **Record the QA result** with pass/fail per scenario and the captured evidence.
- **Dependency, package, framework, or SDK update with no functional change → startup-only
  validation:** start the application, confirm the dashboard/health endpoints report
  healthy, and confirm the logs show no new errors. Full functional Playwright scenarios are
  not required unless the update changes user-facing behavior.
- **No functional change and nothing to run → skip:** mark this phase `skipped` and record
  why.

## Inputs

- The change kind (functional / bug fix / dependency update / none) from the calling
  orchestration.
- The affected scenarios or critical paths to exercise.

## Outputs

- QA result: per-scenario pass/fail with Playwright evidence paths (full mode), or the
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

- `qa:qa`, `qa:qa-monitor` (recommended); falls back to `development:testing`,
  `csharp-coding:coding`, `review:reviewer` running validation manually when the `qa`
  plugin is not installed. Agent transitions require explicit user approval.

## Reference

Source skill location: `plugins/copilot-app/skills/phase-qa-validation/SKILL.md`.
Phase definition: `plugins/copilot-app/instructions/orch-shared-phases.instructions.md`.
