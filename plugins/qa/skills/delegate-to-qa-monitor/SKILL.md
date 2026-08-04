---
name: delegate-to-qa-monitor
description: 'Delegate continuous Aspire log/trace/metric monitoring to the qa-monitor agent from within the qa agent. Use this when a QA session benefits from a dedicated monitoring persona instead of interleaving monitoring calls with browser interaction.'
---

# Delegate to QA Monitor Agent

Use this skill to hand off continuous observability duties to the `qa-monitor` agent
from within the `qa` agent, so log/trace monitoring gets undivided attention instead of
being squeezed between Playwright steps.

## When to Delegate

Delegate to the `qa-monitor` agent when:

- The test session is long or has many scenarios, making interleaved monitoring calls
  easy to skip under time pressure.
- The user asks for "more extensive testing" with many scenarios in one session.
- Monitoring quality matters as much as UI validation (e.g. investigating an
  intermittent backend error, not just a UI regression).

For short, single-scenario checks, the `qa` agent may instead apply the
`aspire-log-monitor` skill directly without delegating — delegation is an optional
persona split, not a hard requirement.

## Important Limitation — Same-Session Handoff Only

Delegating via this skill and the standard `agent` tool switches the **active agent
persona within the current session**. It does **not** run monitoring in a separate
process or in true parallel with Playwright interaction — the session still executes
one agent's turn at a time.

- If the QA session is running inside the GitHub Copilot App and genuine parallel
  execution is required (monitoring truly running concurrently with browser
  interaction, in a separate session), use the `orch-qa` skill from the `copilot-app`
  plugin instead — that skill uses App-level session orchestration
  (`create_session`/cross-session messaging) which is not available to a plugin agent's
  own tool set.
- This skill is the portable option: it works in any host that supports the `agent`
  tool (Copilot CLI, VS Code, GitHub Copilot App), at the cost of being sequential
  rather than truly concurrent.

## How to Delegate

1. Confirm the app under test is already running and healthy (`aspire-run` skill
   already applied by the `qa` agent).
2. Compose a delegation prompt using the template below.
3. Present the prompt to the user and ask for approval before switching to the
   `qa-monitor` agent.
4. Only switch after explicit user approval.
5. Before switching back to drive the browser, ask `qa-monitor` to record its current
   baseline/status, then resume browser interaction — send it periodic checkpoint
   messages (see the `qa-monitor` agent's "Coordination" section) as scenarios progress
   if the host allows sending messages without a full context switch; otherwise, switch
   back to `qa-monitor` between scenarios to record checkpoints and check for new
   findings.

## Delegation Prompt Template

```
Agent: qa-monitor

Context:
- App under test: <resource names / AppHost path>
- Endpoint(s) already confirmed healthy: <url(s)>
- Scenarios planned: <list of scenario names>

Task:
Establish a monitoring baseline now, then continuously watch Aspire logs/traces/metrics
for the resources above. Report any new Error/Critical entries immediately. Produce a
monitoring summary when asked, correlated to the scenario checkpoints I will send you.
```

## Notes

- The `qa-monitor` agent is self-contained for monitoring: no further handoffs are
  expected from it beyond reporting back to `qa` or flagging a bug for
  `csharp-coding:coding`.
- If the `qa-monitor` agent is not installed or the user declines the handoff, continue
  applying the `aspire-log-monitor` skill directly from the `qa` agent.
