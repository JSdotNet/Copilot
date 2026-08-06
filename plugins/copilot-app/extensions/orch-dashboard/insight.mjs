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
// It also observes `subagent.started`/`subagent.completed`/`subagent.failed`
// (custom-agent and Task-tool sub-agent invocations) so each run additionally
// records which custom agent(s), MCP server(s), and model(s) actually did the
// work, both overall and broken down per stage (attributed to whichever
// stage was `in_progress` when the call/sub-agent ran — see
// `activeStageByRun` in extension.mjs). This complements the `agents[]`
// declared up front in `start_run`, which only records intent, not what
// actually ran.
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
    // Playwright MCP (browser_*) and Aspire CLI MCP (get_resources/get_resource_logs/
    // get_traces/get_metrics/get_console_logs) tool calls, used by the qa plugin's
    // playwright-validation and aspire-log-monitor skills. Checked before the generic
    // "MCP tool" rule so QA activity gets its own bucket in the insight breakdown.
    { category: "QA (Playwright/Aspire)", test: /^browser_|^get_resources$|^get_resource_logs$|^get_traces$|^get_metrics$|^get_console_logs$/i },
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

// entry: { kind: "tool", toolName, category, durationMs, success, endedAt,
//   stageIndex, stageName, mcpServerName?, model? }
export function appendToolCall(run, entry) {
    run.insights = Array.isArray(run.insights) ? run.insights : [];
    run.insights.push({ kind: "tool", ...entry });
    if (run.insights.length > MAX_TOOL_CALLS_PER_RUN) {
        run.insights.splice(0, run.insights.length - MAX_TOOL_CALLS_PER_RUN);
    }
}

// entry: { kind: "agent", agentName, agentDisplayName, model, status:
//   "completed"|"failed", durationMs, totalTokens, totalToolCalls, endedAt,
//   stageIndex, stageName }. Recorded from subagent.completed/subagent.failed
// so the dashboard can show which custom agent(s) and model(s) actually ran
// a stage, alongside the MCP servers observed via appendToolCall.
export function appendAgentUse(run, entry) {
    run.insights = Array.isArray(run.insights) ? run.insights : [];
    run.insights.push({ kind: "agent", ...entry });
    if (run.insights.length > MAX_TOOL_CALLS_PER_RUN) {
        run.insights.splice(0, run.insights.length - MAX_TOOL_CALLS_PER_RUN);
    }
}

function addToSet(map, key, value) {
    if (!value) return;
    if (!map.has(key)) map.set(key, new Set());
    map.get(key).add(value);
}

// Aggregates the raw per-call log into totals the dashboard/report can
// render directly: total calls, total measured tool time, wall-clock
// elapsed time, an estimated "thinking" remainder, time by category, and
// which agents/MCP servers/models were observed — overall and per stage.
export function summarizeInsights(run) {
    const entries = Array.isArray(run.insights) ? run.insights : [];
    // Entries persisted before this field existed have no `kind`; treat them
    // as tool calls for backward compatibility with older run files.
    const toolCalls = entries.filter((e) => e.kind !== "agent");
    const agentCalls = entries.filter((e) => e.kind === "agent");

    const byCategory = {};
    let totalToolMs = 0;
    for (const call of toolCalls) {
        const ms = Number(call.durationMs) || 0;
        byCategory[call.category] = (byCategory[call.category] || 0) + ms;
        totalToolMs += ms;
    }
    const startedAt = run.startedAt ? new Date(run.startedAt).getTime() : null;
    const endedAt = run.status === "in_progress" ? Date.now() : run.updatedAt ? new Date(run.updatedAt).getTime() : null;
    const elapsedMs = startedAt !== null && endedAt !== null ? Math.max(0, endedAt - startedAt) : null;
    const thinkingMs = elapsedMs !== null ? Math.max(0, elapsedMs - totalToolMs) : null;

    const agentsUsed = new Set();
    const mcpServersUsed = new Set();
    const modelsUsed = new Set();
    const perStageAgents = new Map();
    const perStageMcp = new Map();
    const perStageModels = new Map();
    const stageNames = new Map();

    for (const call of toolCalls) {
        if (call.mcpServerName) mcpServersUsed.add(call.mcpServerName);
        if (call.model) modelsUsed.add(call.model);
        if (call.stageIndex === null || call.stageIndex === undefined) continue;
        stageNames.set(call.stageIndex, call.stageName || stageNames.get(call.stageIndex));
        addToSet(perStageMcp, call.stageIndex, call.mcpServerName);
        addToSet(perStageModels, call.stageIndex, call.model);
    }
    for (const call of agentCalls) {
        const agentLabel = call.agentDisplayName || call.agentName;
        if (agentLabel) agentsUsed.add(agentLabel);
        if (call.model) modelsUsed.add(call.model);
        if (call.stageIndex === null || call.stageIndex === undefined) continue;
        stageNames.set(call.stageIndex, call.stageName || stageNames.get(call.stageIndex));
        addToSet(perStageAgents, call.stageIndex, agentLabel);
        addToSet(perStageModels, call.stageIndex, call.model);
    }

    const perStage = {};
    for (const stageIndex of stageNames.keys()) {
        perStage[stageIndex] = {
            stageName: stageNames.get(stageIndex) || "",
            agents: Array.from(perStageAgents.get(stageIndex) || []).sort(),
            mcpServers: Array.from(perStageMcp.get(stageIndex) || []).sort(),
            models: Array.from(perStageModels.get(stageIndex) || []).sort(),
        };
    }

    return {
        totalCalls: toolCalls.length,
        totalToolMs,
        elapsedMs,
        thinkingMs,
        byCategory,
        agentsUsed: Array.from(agentsUsed).sort(),
        mcpServersUsed: Array.from(mcpServersUsed).sort(),
        modelsUsed: Array.from(modelsUsed).sort(),
        perStage,
    };
}
