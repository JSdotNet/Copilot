// Markdown report generator for orch-dashboard runs. Used by the
// `/api/runs/:id/report` download endpoint and reusable for any future
// export format.

import { summarizeInsights, summarizeContext } from "./insight.mjs";

function fmtTokens(n) {
    if (n === null || n === undefined || !Number.isFinite(Number(n))) return "n/a";
    const value = Number(n);
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return String(Math.round(value));
}

function fmtDuration(ms) {
    if (ms === null || ms === undefined) return "n/a";
    const totalSec = Math.round(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function renderReportMarkdown(run) {
    const insight = summarizeInsights(run);
    const context = summarizeContext(run);
    const lines = [];
    lines.push(`# ${run.title}`);
    lines.push("");
    lines.push(`- **Skill:** \`${run.skillId}\``);
    lines.push(`- **Status:** ${run.status}`);
    lines.push(`- **Started:** ${run.startedAt}`);
    lines.push(`- **Updated:** ${run.updatedAt}`);
    if (run.changeKind) lines.push(`- **Change kind:** ${run.changeKind}`);
    if (run.approval && run.approval.personalValidation) {
        const decidedAt = run.approval.decidedAt ? ` (${run.approval.decidedAt})` : "";
        const note = run.approval.note ? ` — ${run.approval.note}` : "";
        lines.push(`- **Personal validation:** ${run.approval.personalValidation}${decidedAt}${note}`);
    }
    lines.push("");

    lines.push("## Stages");
    lines.push("");
    lines.push("| # | Stage | Status | Agents (planned) | Agents (used) | MCP Servers | Models |");
    lines.push("| - | ----- | ------ | ----------------- | -------------- | ----------- | ------ |");
    (run.stages || []).forEach((stage, i) => {
        const observed = insight.perStage[i] || { agents: [], mcpServers: [], models: [] };
        lines.push(
            `| ${i + 1} | ${stage.name} | ${stage.status} | ${(stage.agents || []).join(", ") || "-"} | ${observed.agents.join(", ") || "-"} | ${observed.mcpServers.join(", ") || "-"} | ${observed.models.join(", ") || "-"} |`
        );
    });
    lines.push("");

    const stagesWithOutput = (run.stages || []).filter((stage) => stage.output);
    if (stagesWithOutput.length) {
        lines.push("## Stage Output");
        lines.push("");
        (run.stages || []).forEach((stage, i) => {
            if (!stage.output) return;
            lines.push(`### ${i + 1}. ${stage.name}`);
            lines.push("");
            lines.push("```text");
            lines.push(stage.output);
            lines.push("```");
            lines.push("");
        });
    }

    const stagesWithQa = (run.stages || []).filter(
        (stage) => (Array.isArray(stage.scenarios) && stage.scenarios.length) || (stage.monitoring && (stage.monitoring.summary || (stage.monitoring.findings || []).length))
    );
    if (stagesWithQa.length) {
        lines.push("## QA Results");
        lines.push("");
        stagesWithQa.forEach((stage) => {
            lines.push(`### ${stage.name}`);
            lines.push("");
            if (Array.isArray(stage.scenarios) && stage.scenarios.length) {
                lines.push("| Scenario | Status | Evidence | Notes |");
                lines.push("| -------- | ------ | -------- | ----- |");
                stage.scenarios.forEach((s) => {
                    const evidence = (s.evidence || []).map((e) => `${e.type || "file"}: \`${e.path}\``).join("<br>") || "-";
                    lines.push(`| ${s.name} | ${s.status} | ${evidence} | ${s.notes || "-"} |`);
                });
                lines.push("");
            }
            if (stage.monitoring && (stage.monitoring.summary || (stage.monitoring.findings || []).length)) {
                lines.push("**Runtime monitoring:**");
                lines.push("");
                if (stage.monitoring.summary) {
                    lines.push(stage.monitoring.summary);
                    lines.push("");
                }
                if ((stage.monitoring.findings || []).length) {
                    lines.push("| Level | Resource | Message | Timestamp |");
                    lines.push("| ----- | -------- | ------- | --------- |");
                    stage.monitoring.findings.forEach((f) => {
                        lines.push(`| ${f.level} | ${f.resource || "-"} | ${f.message} | ${f.timestamp || "-"} |`);
                    });
                    lines.push("");
                }
            }
        });
    }

    if (run.summary) {
        lines.push("## Summary");
        lines.push("");
        lines.push(run.summary);
        lines.push("");
    }

    lines.push("## Insight");
    lines.push("");
    lines.push(`- **Total tool calls:** ${insight.totalCalls}`);
    lines.push(`- **Elapsed time:** ${fmtDuration(insight.elapsedMs)}`);
    lines.push(`- **Measured tool time:** ${fmtDuration(insight.totalToolMs)}`);
    if (insight.thinkingMs !== null) {
        lines.push(`- **Estimated thinking/reasoning time:** ${fmtDuration(insight.thinkingMs)}`);
    }
    lines.push("");
    const categories = Object.entries(insight.byCategory).sort((a, b) => b[1] - a[1]);
    if (categories.length) {
        lines.push("| Category | Time |");
        lines.push("| -------- | ---- |");
        categories.forEach(([category, ms]) => lines.push(`| ${category} | ${fmtDuration(ms)} |`));
        lines.push("");
    }
    if (insight.agentsUsed.length) lines.push(`- **Agents used:** ${insight.agentsUsed.join(", ")}`);
    if (insight.mcpServersUsed.length) lines.push(`- **MCP servers used:** ${insight.mcpServersUsed.join(", ")}`);
    if (insight.modelsUsed.length) lines.push(`- **Models used:** ${insight.modelsUsed.join(", ")}`);
    lines.push("");

    // Context tracking is omitted entirely for runs recorded before it
    // existed (summarizeContext returns null in that case).
    if (context) {
        lines.push("## Context");
        lines.push("");
        if (context.gauge) {
            const g = context.gauge;
            const pct = g.percent === null || g.percent === undefined ? "" : ` (${g.percent}%)`;
            const limit = g.tokenLimit ? ` / ${fmtTokens(g.tokenLimit)}` : "";
            lines.push(`- **Context window:** ${fmtTokens(g.currentTokens)}${limit}${pct}`);
            if (g.peakTokens) {
                const peakPct = g.peakPercent === null || g.peakPercent === undefined ? "" : ` (${g.peakPercent}%)`;
                lines.push(`- **Peak context:** ${fmtTokens(g.peakTokens)}${peakPct}`);
            }
            const breakdown = [];
            if (g.systemTokens !== null) breakdown.push(`system ${fmtTokens(g.systemTokens)}`);
            if (g.conversationTokens !== null) breakdown.push(`conversation ${fmtTokens(g.conversationTokens)}`);
            if (g.toolDefinitionsTokens !== null) breakdown.push(`tool definitions ${fmtTokens(g.toolDefinitionsTokens)}`);
            if (breakdown.length) lines.push(`- **Breakdown:** ${breakdown.join(", ")}`);
        }
        if (context.totals) {
            lines.push(`- **Tokens consumed:** ${fmtTokens(context.totals.tokens)} over ${context.totals.modelCalls} model call${context.totals.modelCalls === 1 ? "" : "s"} (${fmtTokens(context.totals.uncachedTokens)} not served from the prompt cache)`);
            if (context.totals.reasoningTokens) lines.push(`- **Reasoning tokens:** ${fmtTokens(context.totals.reasoningTokens)}`);
            if (context.totals.cacheReadTokens || context.totals.cacheWriteTokens) {
                lines.push(`- **Prompt cache:** ${fmtTokens(context.totals.cacheReadTokens)} read, ${fmtTokens(context.totals.cacheWriteTokens)} written`);
            }
            if (context.subAgentTotals) {
                lines.push(`- **Delegated to sub-agents:** ${fmtTokens(context.subAgentTotals.tokens)} over ${context.subAgentTotals.modelCalls} model call${context.subAgentTotals.modelCalls === 1 ? "" : "s"}`);
            }
        }
        if (context.compactionCount) {
            const reasons = Object.entries(context.compactionReasons || {})
                .map(([reason, count]) => `${reason} x${count}`)
                .join(", ");
            lines.push(`- **Compactions:** ${context.compactionCount}${reasons ? ` (${reasons})` : ""}`);
        }
        if (context.truncationCount) {
            lines.push(`- **Truncations:** ${context.truncationCount} (${fmtTokens(context.truncatedTokens)} tokens removed)`);
        }
        lines.push("");

        const stageRows = (run.stages || [])
            .map((stage, i) => ({ stage, i, usage: context.perStage[String(i)] }))
            .filter((row) => row.usage && row.usage.tokens);
        if (stageRows.length) {
            lines.push("| # | Stage | Tokens | Uncached | Input | Output | Reasoning | Model calls | Sub-agent tokens |");
            lines.push("| - | ----- | ------ | -------- | ----- | ------ | --------- | ----------- | ---------------- |");
            stageRows.forEach(({ stage, i, usage }) => {
                lines.push(
                    `| ${i + 1} | ${stage.name} | ${fmtTokens(usage.tokens)} | ${fmtTokens(usage.uncachedTokens)} | ${fmtTokens(usage.inputTokens)} | ${fmtTokens(usage.outputTokens)} | ${fmtTokens(usage.reasoningTokens)} | ${usage.modelCalls} | ${usage.subAgent && usage.subAgent.tokens ? fmtTokens(usage.subAgent.tokens) : "-"} |`
                );
            });
            lines.push("");
        }
    }

    return lines.join("\n");
}
