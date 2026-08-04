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
