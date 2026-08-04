---
name: aspire-run
description: 'Start and confirm the health of a .NET Aspire-orchestrated application for QA/testing purposes. Use before any runtime validation, browser testing, or exploratory testing session.'
compatibility: Works with the Aspire CLI (`aspire run`) and, when available, the Aspire MCP server for resource state checks.
---

# Aspire Run — Start the App Under Test

Start a distributed .NET Aspire application and confirm it is healthy before any QA
validation begins. Running through Aspire (rather than a single project) ensures
dependent resources — databases, caches, queues, downstream services — are available
and wired exactly as they would be for a real user.

## When to Use

- Before any Playwright-driven feature validation.
- Before exploratory or regression testing against a local build.
- Whenever a QA report needs to reference a specific running app version/commit.

## Steps

### 1. Locate the AppHost

- Look for a project ending in `.AppHost` (convention) or ask the user for the path.
- Confirm the solution builds: `dotnet build` on the AppHost project if not already built.

### 2. Start the App

```bash
aspire run
```

Or, if the Aspire CLI is not installed/available:

```bash
dotnet run --project <path-to-AppHost>.csproj
```

Run this as a background/async process — QA validation happens against the live app
while it keeps running.

### 3. Confirm Health Before Testing

Prefer the Aspire MCP server when available:

```
Tool: get_resources
```

Wait until every required resource reports a running/healthy state. If a resource is
stuck starting or in a failed state, check `get_console_logs` for that resource before
proceeding — do not start Playwright validation against a partially-started app.

Fallback (no MCP server): watch the Aspire dashboard console output for `Running` state
on each resource, or poll each service's `/health` endpoint if `AddServiceDefaults()` is
in use.

### 4. Resolve Endpoint URLs

- Read the dashboard/console output for the resource endpoint(s) needed for browser
  testing (e.g. the frontend or API base URL).
- Record the exact URL(s) used — include them in the QA report for reproducibility.

### 5. Keep the App Running for the Whole Session

- Do not stop the app between validation scenarios; restarting changes state and
  invalidates the Aspire log/trace timeline the `aspire-log-monitor` skill depends on.
- Only stop the app after monitoring and Playwright validation are both complete and
  the report has been produced.

## Common Failure Modes

| Symptom | Likely Cause | Check |
|---|---|---|
| Resource stuck in "Starting" | Missing dependency (DB/cache container not pulled) | `get_console_logs` for that resource |
| Frontend loads but API calls fail | Service discovery misconfiguration | `ConnectionStrings__*` / `services__*__http__0` env vars |
| App exits immediately | Config/secret missing | Console output at startup, `get_console_logs` |

## Reference

- Aspire CLI docs: `https://aspire.dev`
- Aspire dashboard: `https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/dashboard/overview`
