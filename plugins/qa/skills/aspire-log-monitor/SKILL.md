---
name: aspire-log-monitor
description: 'Continuously monitor logs, traces, and metrics of a running Aspire application via the Aspire MCP server while QA/Playwright validation is in progress. Use for the full duration of a test session, not just as a final check.'
compatibility: Requires the Aspire MCP server (`aspire mcp start`, CLI 13.1+).
---

# Aspire Log Monitor — Continuous QA Monitoring

Watch a running Aspire application's logs, traces, and metrics for the entire duration
of a QA test session, so runtime errors are caught even when the UI under test appears
to behave correctly.

This skill is a companion to `playwright-validation`: start monitoring before browser
interaction begins, and keep it running until every scenario is finished.

## Prerequisites

The Aspire CLI MCP server must be initialized and running before validation that depends on
resource state, logs, traces, metrics, or health evidence:

```bash
aspire mcp init
aspire mcp start
```

If the Aspire MCP tools are not visible in the Copilot session after startup, restart the
Copilot session/runtime or reload MCP tools before QA begins. If monitoring remains
unavailable, report the missing capability explicitly and do not claim Aspire log/trace or
resource-state evidence was captured.

## Available MCP Tools (CLI 13.1+)

| Tool | Description |
|---|---|
| `get_resources` | List all running resources and their state |
| `get_resource_logs` | Retrieve structured logs for a named resource |
| `get_traces` | Retrieve distributed traces for a named resource or trace ID |
| `get_metrics` | Query metric values for a named resource |
| `get_console_logs` | Get raw console/stdout output for a resource |

## Workflow

### 1. Establish a Baseline

Before any Playwright interaction:

1. `get_resources` — confirm every required resource is running/healthy.
2. `get_resource_logs` for each resource — note the current log tail and any
   pre-existing warnings so they aren't misattributed to the test run later.
3. Record the baseline timestamp.

### 2. Monitor Continuously During Validation

While `playwright-validation` executes scenarios:

1. After each scenario step (or at minimum after each scenario), re-run
   `get_resource_logs` for the resources involved and diff against the baseline.
2. Watch for new **Error** / **Critical** entries — flag them immediately with the
   scenario/step that triggered them, even if the browser showed a success state.
3. When a request/flow spans multiple services, use `get_traces` with the relevant
   trace ID (from response headers or logs) to confirm the full path succeeded.
4. Use `get_metrics` if a scenario is checking for performance regressions (e.g.
   `http.server.request.duration`).
5. If a resource becomes unhealthy mid-session, check `get_console_logs` immediately —
   config/dependency errors often appear there before structured logs.

### 3. Summarize at the End

Produce a monitoring summary to include in the QA report:

- New Error/Critical log entries observed, with resource, timestamp, and message.
- Any failed or abnormally slow traces, with the correlated scenario.
- Metric anomalies, if metrics were checked.
- Or explicitly: "No new errors observed in Aspire logs/traces during this session."

## Log Levels

| Level | When to flag |
|---|---|
| Error / Critical | Always — actionable failures |
| Warning | Note if new since baseline or recurring across scenarios |
| Information | Only relevant for confirming expected lifecycle events |
| Debug | Skip unless actively diagnosing a specific failure |

## Tips

- Keep monitoring active for the whole session — checking logs only once at the end
  can hide errors that were later overwritten by log rotation or buffer limits.
- Cross-reference log/trace timestamps directly against the Playwright evidence
  timestamps to correlate a UI action with its backend effect.
- A scenario that "passes" visually but produces a new Error-level log entry should be
  reported as Fail (or Flaky) with the log entry as evidence, not as Pass.

## Reference

- Aspire MCP docs: `https://learn.microsoft.com/en-us/dotnet/aspire/ai/mcp-server`
- Aspire dashboard: `https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/dashboard/overview`
