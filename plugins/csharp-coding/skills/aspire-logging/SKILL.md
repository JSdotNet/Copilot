---
name: aspire-logging
description: 'Retrieve and analyze structured logs from running Aspire applications via the Aspire MCP server. Use when diagnosing errors, investigating slow requests, or reviewing service output during local development.'
compatibility: Requires Aspire MCP server (`aspire mcp start` with CLI 13.1+).
---

# Aspire Logging — Retrieve Logs via Aspire MCP

Query structured logs, traces, and resource state from a running Aspire application using the Aspire MCP server.

## Prerequisites

The Aspire CLI MCP server must be running:

```bash
aspire mcp start
```

Or configure it for your AI assistant:

```bash
aspire mcp init
```

## Available MCP Tools (CLI 13.1+)

| Tool | Description |
|---|---|
| `get_resources` | List all running resources (services, containers, databases) and their state |
| `get_resource_logs` | Retrieve structured logs for a named resource |
| `get_traces` | Retrieve distributed traces for a named resource or trace ID |
| `get_metrics` | Query metric values for a named resource |
| `get_console_logs` | Get raw console/stdout output for a resource |

## Workflow

### 1. List Running Resources

```
Tool: get_resources
```

Returns resource names, types (project/container/executable), and health state. Use the resource name in subsequent calls.

### 2. Get Structured Logs

```
Tool: get_resource_logs
resource: "my-api"
```

Returns structured log entries with timestamp, level, message, and properties. Filter by level or time range if supported.

### 3. Get Console Output

```
Tool: get_console_logs
resource: "my-worker"
```

Returns raw stdout/stderr — useful for startup errors or unstructured output.

### 4. Get Traces

```
Tool: get_traces
resource: "my-api"
```

Returns distributed trace spans. Use a `traceId` to drill into a specific request path across services.

### 5. Get Metrics

```
Tool: get_metrics
resource: "my-api"
metric: "http.server.request.duration"
```

## Diagnostic Workflow

When investigating an issue:

1. `get_resources` — confirm which services are running and healthy.
2. `get_resource_logs` for the failing service — find error messages and stack traces.
3. `get_traces` — correlate a failing request across multiple services by trace ID.
4. `get_console_logs` — check startup failures or missing config.
5. `get_metrics` — look for latency spikes, high error rates, or saturation.

## Log Levels

| Level | When to check |
|---|---|
| Error / Critical | Always — these are actionable failures |
| Warning | Intermittent issues, degraded state, retries |
| Information | Normal lifecycle events, request handling |
| Debug | Detailed internal state (verbose — filter carefully) |

## Tips

- Cross-reference log timestamps with trace spans to pinpoint where latency is introduced.
- Use trace IDs from logs to pull the full distributed trace across services.
- When an Aspire resource is in a degraded or stopped state, check console logs first — config errors often surface there before structured logs are emitted.

## Reference

- Aspire MCP docs: `https://learn.microsoft.com/en-us/dotnet/aspire/ai/mcp-server`
- Aspire dashboard: `https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/dashboard/overview`
