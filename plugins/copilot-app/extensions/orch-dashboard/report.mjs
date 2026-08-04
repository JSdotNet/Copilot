// Markdown report generator for orch-dashboard runs. Used by the
// `/api/runs/:id/report` download endpoint and reusable for any future
// export format.

import { summarizeInsights } from "./insight.mjs";

function fmtDuration(ms) {
    if (ms === null || ms === undefined) return "n/a";
    const totalSec = Math.round(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function renderReportMarkdown(run) {
    const lines = [];
    lines.push(`# ${run.title}`);
    lines.push("");
    lines.push(`- **Skill:** \`${run.skillId}\``);
    lines.push(`- **Status:** ${run.status}`);
    lines.push(`- **Started:** ${run.startedAt}`);
    lines.push(`- **Updated:** ${run.updatedAt}`);
    lines.push("");

    lines.push("## Stages");
    lines.push("");
    lines.push("| # | Stage | Status | Agents |");
    lines.push("| - | ----- | ------ | ------ |");
    (run.stages || []).forEach((stage, i) => {
        lines.push(`| ${i + 1} | ${stage.name} | ${stage.status} | ${(stage.agents || []).join(", ") || "-"} |`);
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

    if (run.summary) {
        lines.push("## Summary");
        lines.push("");
        lines.push(run.summary);
        lines.push("");
    }

    const insight = summarizeInsights(run);
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

    return lines.join("\n");
}
