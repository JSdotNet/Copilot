---
name: orch-qa
description: 'Orchestrate a QA validation session with true parallel execution inside the GitHub Copilot App: run the qa agent in the current session to drive Aspire + Playwright validation, while a separate child session runs the qa-monitor agent concurrently for continuous Aspire log/trace/metric monitoring. Requires the qa plugin and the GitHub Copilot App session-orchestration tools (create_session, cross-session messaging).'
---

# Orchestrate QA Validation (Parallel Monitoring Session)

Run an evidence-backed QA validation with genuinely concurrent Aspire log/trace
monitoring, using GitHub Copilot App session orchestration.

## Why This Skill Exists

The `qa` plugin's own agents (`qa`, `qa-monitor`) can only hand off to each other
**within one session** via the standard `agent` tool (`delegate-to-qa-monitor` skill) —
that is portable across any host, but the two personas still take turns rather than
running at the same time. A plugin's own `.agent.md` files cannot spawn a separate
session on their own; session orchestration tools (`create_session`,
`write_agent`/`send_session_message`, `list_agents`) are exposed only to the top-level
session driving the GitHub Copilot App conversation — not to a portable agent's own
tool set. This skill is the runbook for that top-level session (i.e., whichever agent
you are talking to in the App) to follow directly, so monitoring genuinely runs in
parallel with browser interaction.

> **App-only.** This skill only works when the conversation is running inside the
> GitHub Copilot App (this product), because it depends on `create_session` and
> cross-session messaging tools. In plain Copilot CLI or VS Code, use the `qa` plugin's
> `delegate-to-qa-monitor` skill instead (same-session, sequential).

## Prerequisites

- The `qa` plugin is installed (provides the `qa` and `qa-monitor` agents and their
  skills).
- The feature/scenario(s) to validate are known, along with the AppHost project path.

## Input Expectations

- Feature or scenario name(s) to validate.
- AppHost project path (or enough context to locate it).
- Any specific edge cases the user wants covered ("more extensive testing").

## Workflow

### Stage 1: Start the App (current session)

1. Apply the `qa` plugin's `aspire-run` skill in the **current session** to start the
   AppHost and confirm every required resource is healthy.
2. Resolve the endpoint URL(s) needed for Playwright.

### Stage 2: Create the Monitoring Child Session

1. Use `create_session` to create a child session in the same project, with
   `coordinate_with_creator: true` so it can message back.
2. Kick it off with a prompt instructing it to act as the `qa:qa-monitor` agent against
   the already-running app:

   ```
   Act as the qa-monitor agent (plugins/qa/agents/qa-monitor.agent.md). The app under
   test is already running via Aspire — do not start or stop it. Apply the
   aspire-log-monitor skill: establish a baseline now for resources [<list>], then
   continuously poll for new Error/Critical log entries, failed traces, and metric
   anomalies. I will send you scenario checkpoint messages as I validate features in
   the parent session — correlate findings to the most recent checkpoint you received.
   Reply with a monitoring summary whenever I ask for one.
   ```

3. Do not archive or stop this child session until Stage 5 completes.

### Stage 3: Validate in the Current Session

1. Apply the `qa` agent's Playwright workflow (`playwright-validation`,
   `playwright-screenshot`, `playwright-recording` skills) in the **current session**,
   against the same running app.
2. Before starting each scenario, use `write_agent` to send the monitor session a
   checkpoint message: `Checkpoint: <scenario-name> starting`. Send another when it
   ends: `Checkpoint: <scenario-name> finished — <pass/fail>`.
3. Continue capturing screenshots/recordings as evidence per the `qa` agent's normal
   workflow — this does not change just because monitoring is in a separate session.

### Stage 4: Collect the Monitoring Summary

1. After the last scenario, send the monitor session a final message asking for its
   monitoring summary (`write_agent`).
2. Read its reply with `read_agent` (wait for completion if it is still processing).

### Stage 5: Merge and Report

1. Combine the current session's Playwright evidence/report with the monitor session's
   summary into one QA report, following the `qa` agent's report format (per-scenario
   Pass/Fail/Flaky, evidence paths, Aspire findings).
2. Archive the monitoring child session (`archive_session`) once its findings are
   merged, unless the user wants to keep it open for further investigation.

## Output Expectations

- A single merged QA report combining Playwright evidence (current session) with
  Aspire log/trace/metric findings (monitor child session), correlated by scenario
  checkpoint.
- The monitor child session archived after merging, unless the user asks to keep it.

## Constraints

- Do not skip sending scenario checkpoints — without them the monitor session's
  findings cannot be correlated to specific scenarios.
- Do not stop the monitor session before the last scenario finishes.
- If `create_session`/cross-session messaging is unavailable in the current host,
  fall back to the `qa` plugin's `delegate-to-qa-monitor` skill and tell the user why.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-qa/SKILL.md`

Related:
- `plugins/qa/agents/qa.agent.md`
- `plugins/qa/agents/qa-monitor.agent.md`
- `plugins/qa/skills/delegate-to-qa-monitor/SKILL.md` (portable, same-session fallback)
