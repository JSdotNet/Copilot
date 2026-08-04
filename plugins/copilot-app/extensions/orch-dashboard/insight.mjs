// Tool-activity insight tracking for orch-dashboard runs.
//
// The extension observes the session's own tool-call telemetry
// (`tool.execution_start` / `tool.execution_complete`, see agent-author.md)
// while a run is active and buckets each call into the same broad
// categories the CLI's own agent-activity view uses (Shell, Edit, Read, MCP
// tool, Agent tasks, Other). This gives every run a "time by tool" and
// elapsed/thinking-time breakdown without requiring the orchestrating agent
// to self-report every tool call.
//
// Caveat: tool telemetry is session-wide, not run-scoped, so any tool call
// that happens while a run's status is "in_progress" is attributed to it —
// including calls unrelated to the orchestration if the user does other
// work in the same session concurrently.

const MAX_TOOL_CALLS_PER_RUN = 1000;

const CATEGORY_RULES = [
    { category: "Shell", test: /powershell|bash|shell/i },
    { category: "Edit", test: /^edit$|^create$/i },
    { category: "Read", test: /^view$|^glob$|^grep$/i },
    { category: "MCP tool", test: /mcpserver|mcp[_-]/i },
    { category: "Agent tasks", test: /^task$/i },
];

export function categorizeTool(toolName) {
    const name = toolName || "unknown";
    for (const rule of CATEGORY_RULES) {
        if (rule.test.test(name)) return rule.category;
    }
    return "Other";
}

export function appendToolCall(run, entry) {
    run.insights = Array.isArray(run.insights) ? run.insights : [];
    run.insights.push(entry);
    if (run.insights.length > MAX_TOOL_CALLS_PER_RUN) {
        run.insights.splice(0, run.insights.length - MAX_TOOL_CALLS_PER_RUN);
    }
}

// Aggregates the raw per-call log into totals the dashboard/report can
// render directly: total calls, total measured tool time, wall-clock
// elapsed time, an estimated "thinking" remainder, and time by category.
export function summarizeInsights(run) {
    const calls = Array.isArray(run.insights) ? run.insights : [];
    const byCategory = {};
    let totalToolMs = 0;
    for (const call of calls) {
        const ms = Number(call.durationMs) || 0;
        byCategory[call.category] = (byCategory[call.category] || 0) + ms;
        totalToolMs += ms;
    }
    const startedAt = run.startedAt ? new Date(run.startedAt).getTime() : null;
    const endedAt = run.status === "in_progress" ? Date.now() : run.updatedAt ? new Date(run.updatedAt).getTime() : null;
    const elapsedMs = startedAt !== null && endedAt !== null ? Math.max(0, endedAt - startedAt) : null;
    const thinkingMs = elapsedMs !== null ? Math.max(0, elapsedMs - totalToolMs) : null;
    return {
        totalCalls: calls.length,
        totalToolMs,
        elapsedMs,
        thinkingMs,
        byCategory,
    };
}
