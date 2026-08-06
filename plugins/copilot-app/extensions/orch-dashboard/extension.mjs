// Extension: orch-dashboard
// Live progress and output dashboard for copilot-app orch-* orchestration
// skills (orch-feature, orch-bug, orch-adr, orch-arc42, orch-blueprint,
// orch-tdr, orch-architecture, orch-project, orch-repo, orch-create-mvp,
// orch-update-packages, orch-aspire-update, orch-create-module,
// orch-create-service) and the copilot-app automation skills
// (automation-bug-fix, automation-package-update,
// automation-performance-review, automation-review, automation-week-starter,
// automation-weekly-cost-analysis, automation-whats-new,
// azure-sre-to-github-issue, start-session-from-issue,
// update-open-sessions).
//
// Model: an orchestration run is a JSON file (see store.mjs) with a list of
// named stages, each carrying a status (pending/in_progress/done/blocked/
// skipped/cancelled) and free-form output text. QA/validation stages (driven
// by the qa plugin's playwright-validation and aspire-log-monitor skills)
// may additionally carry `scenarios` (pass/fail/flaky results with evidence
// file references) and `monitoring` (a runtime log/trace/metric findings
// summary) — see update_stage below. The orchestrating agent drives the run
// through canvas actions (start_run, update_stage, finish_run) as it works
// through a skill's workflow stages; list_runs/get_run let the agent re-read
// state after a resume. The canvas itself is a read-only live dashboard: a
// run list on the left, stage-by-stage progress, QA results/evidence, and
// captured output on the right, refreshed over SSE whenever an action
// mutates state.
//
// State is persisted under `<session workspace>/orchestration-runs/*.json`
// so it lives alongside other session artifacts and is cleaned up with the
// session. If no workspace path is available (should not normally happen
// for project sessions) state falls back to a per-user directory under
// $COPILOT_HOME.

import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat as fsStat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { EventEmitter } from "node:events";
import { joinSession, createCanvas, CanvasError } from "@github/copilot-sdk/extension";
import { ensureDir, writeRun, readRun, listRuns, newRunId } from "./store.mjs";
import { renderShell } from "./render.mjs";
import {
    categorizeTool,
    appendToolCall,
    appendAgentUse,
    summarizeInsights,
    summarizeContext,
    recordTokenUsage,
    recordContextSample,
    recordCompaction,
    recordTruncation,
} from "./insight.mjs";
import { renderReportMarkdown } from "./report.mjs";

const VALID_STATUSES = ["pending", "in_progress", "done", "blocked", "skipped", "cancelled"];
const VALID_SCENARIO_STATUSES = ["pass", "fail", "flaky"];
const VALID_FINDING_LEVELS = ["error", "critical", "warning", "info"];
const VALID_CHANGE_KINDS = ["new-functionality", "bug-fix", "dependency-update", "none"];
const VALID_APPROVAL_STATES = ["pending", "approved", "rejected"];

const EVIDENCE_CONTENT_TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".webm": "video/webm",
    ".mp4": "video/mp4",
    ".log": "text/plain; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".json": "application/json; charset=utf-8",
};

// One local HTTP server per open canvas instance; every instance reads/writes
// the same on-disk run store, so all panels stay in sync.
const servers = new Map();
// Broadcasts a "run store changed" signal to every open instance's SSE
// clients, regardless of which instance/action triggered the change.
const bus = new EventEmitter();
bus.setMaxListeners(0);

// The run currently receiving tool-activity telemetry (see "Insight
// tracking" below). Only one run is tracked live at a time — the most
// recently started run that hasn't finished yet.
let activeRunId = null;
// The stage currently `in_progress` for each tracked run (runId -> { index,
// name }), used to attribute tool calls and sub-agent invocations to the
// right stage in the insight breakdown. Cleared when that stage moves to a
// terminal status, so activity between stages (or after the last stage)
// isn't misattributed.
const activeStageByRun = new Map();

// Serializes read-modify-write access per runId so concurrent action calls
// (e.g. two update_stage calls issued back-to-back) can't race each other
// and silently drop an update.
const runLocks = new Map();
function withRunLock(runId, fn) {
    const prev = runLocks.get(runId) || Promise.resolve();
    const run = prev.then(fn, fn);
    runLocks.set(runId, run.then(() => {}, () => {}));
    return run;
}

function resolveBaseDir(session) {
    if (session.workspacePath) {
        return path.join(session.workspacePath, "orchestration-runs");
    }
    const home = process.env.COPILOT_HOME || path.join(os.homedir(), ".copilot");
    return path.join(home, "extensions", "orch-dashboard", "artifacts", session.sessionId || "default");
}

function summarize(run) {
    return {
        id: run.id,
        skillId: run.skillId,
        title: run.title,
        status: run.status,
        startedAt: run.startedAt,
        updatedAt: run.updatedAt,
        changeKind: run.changeKind || null,
        approval: run.approval || null,
    };
}

function findStageIndex(run, { stageIndex, stageName }) {
    if (typeof stageIndex === "number") return stageIndex;
    if (stageName) {
        const idx = run.stages.findIndex((s) => s.name === stageName);
        if (idx >= 0) return idx;
    }
    return -1;
}

// Normalizes the optional QA payload accepted by update_stage: a list of
// tested scenarios (pass/fail/flaky, each with evidence file references) and
// an optional runtime-monitoring summary (from the qa plugin's
// aspire-log-monitor skill). Both are stored verbatim on the stage so the
// dashboard/report can render them without re-deriving structure.
function normalizeScenarios(scenarios) {
    if (!Array.isArray(scenarios)) return undefined;
    return scenarios.map((s) => ({
        name: String((s && s.name) || "Scenario"),
        status: VALID_SCENARIO_STATUSES.includes(s && s.status) ? s.status : "fail",
        notes: typeof (s && s.notes) === "string" ? s.notes : "",
        evidence: Array.isArray(s && s.evidence)
            ? s.evidence
                  .filter((e) => e && typeof e.path === "string" && e.path)
                  .map((e) => ({
                      type: typeof e.type === "string" && e.type ? e.type : "file",
                      path: e.path,
                      description: typeof e.description === "string" ? e.description : "",
                  }))
            : [],
    }));
}

function normalizeMonitoring(monitoring) {
    if (!monitoring || typeof monitoring !== "object") return undefined;
    return {
        summary: typeof monitoring.summary === "string" ? monitoring.summary : "",
        findings: Array.isArray(monitoring.findings)
            ? monitoring.findings.map((f) => ({
                  level: VALID_FINDING_LEVELS.includes(f && f.level) ? f.level : "info",
                  resource: typeof (f && f.resource) === "string" ? f.resource : "",
                  message: typeof (f && f.message) === "string" ? f.message : "",
                  timestamp: typeof (f && f.timestamp) === "string" ? f.timestamp : "",
              }))
            : [],
    };
}

function evidenceContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return EVIDENCE_CONTENT_TYPES[ext] || "application/octet-stream";
}

async function startServer(instanceId, baseDir) {
    const server = createServer(async (req, res) => {
        try {
            const url = new URL(req.url, "http://localhost");
            if (req.method === "GET" && url.pathname === "/") {
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                res.end(renderShell());
                return;
            }
            if (req.method === "GET" && url.pathname === "/api/runs") {
                const runs = await listRuns(baseDir);
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                res.end(JSON.stringify(runs.map(summarize)));
                return;
            }
            const reportMatch = url.pathname.match(/^\/api\/runs\/([^/]+)\/report$/);
            if (req.method === "GET" && reportMatch) {
                const run = await readRun(baseDir, decodeURIComponent(reportMatch[1]));
                if (!run) {
                    res.statusCode = 404;
                    res.end("not found");
                    return;
                }
                const filename = `${run.skillId}-${run.id}.md`.replace(/[^a-zA-Z0-9._-]/g, "-");
                res.setHeader("Content-Type", "text/markdown; charset=utf-8");
                res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
                res.end(renderReportMarkdown(run));
                return;
            }
            const evidenceMatch = url.pathname.match(/^\/api\/runs\/([^/]+)\/evidence$/);
            if (req.method === "GET" && evidenceMatch) {
                const relPath = url.searchParams.get("path");
                const root = session.workspacePath;
                if (!relPath || !root) {
                    res.statusCode = 404;
                    res.end("evidence not available");
                    return;
                }
                // Evidence paths are relative to the session workspace (e.g. the
                // `.wip/qa/<feature>/screenshots/...` convention from the qa
                // plugin's playwright-screenshot skill). Resolve and confirm the
                // result stays inside the workspace before serving it.
                const resolved = path.resolve(root, relPath);
                if (resolved !== root && !resolved.startsWith(root + path.sep)) {
                    res.statusCode = 403;
                    res.end("forbidden");
                    return;
                }
                let stats;
                try {
                    stats = await fsStat(resolved);
                } catch {
                    res.statusCode = 404;
                    res.end("evidence file not found");
                    return;
                }
                if (!stats.isFile()) {
                    res.statusCode = 404;
                    res.end("evidence file not found");
                    return;
                }
                res.setHeader("Content-Type", evidenceContentType(resolved));
                res.setHeader("Content-Length", String(stats.size));
                createReadStream(resolved).pipe(res);
                return;
            }
            const detailMatch = url.pathname.match(/^\/api\/runs\/([^/]+)$/);
            if (req.method === "GET" && detailMatch) {
                const run = await readRun(baseDir, decodeURIComponent(detailMatch[1]));
                if (!run) {
                    res.statusCode = 404;
                    res.end("not found");
                    return;
                }
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                res.end(JSON.stringify({ ...run, insightSummary: summarizeInsights(run), contextSummary: summarizeContext(run) }));
                return;
            }
            if (req.method === "GET" && url.pathname === "/events") {
                res.writeHead(200, {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                });
                res.write("retry: 2000\n\n");
                const onUpdate = () => res.write("event: update\ndata: {}\n\n");
                bus.on("update", onUpdate);
                req.on("close", () => bus.off("update", onUpdate));
                return;
            }
            res.statusCode = 404;
            res.end("not found");
        } catch (err) {
            res.statusCode = 500;
            res.end(String((err && err.message) || err));
        }
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    return { server, url: `http://127.0.0.1:${port}/` };
}

const session = await joinSession({
    canvases: [
        createCanvas({
            id: "orch-dashboard",
            displayName: "Orchestration dashboard",
            description:
                "Live progress and output dashboard for copilot-app orch-* orchestration skills (orch-feature, orch-bug, orch-adr, orch-arc42, orch-blueprint, orch-tdr, orch-architecture, orch-project, orch-repo, orch-create-mvp, orch-update-packages, orch-aspire-update, orch-create-module, orch-create-service) and the copilot-app automation skills (automation-bug-fix, automation-package-update, automation-performance-review, automation-review, automation-week-starter, automation-weekly-cost-analysis, automation-whats-new, azure-sre-to-github-issue, start-session-from-issue, update-open-sessions). Open once per session; drive it with start_run/update_stage/finish_run as a workflow progresses.",
            inputSchema: {
                type: "object",
                properties: {
                    runId: { type: "string", description: "Optional run to focus when the panel opens." },
                },
            },
            actions: [
                {
                    name: "start_run",
                    description:
                        "Start tracking a new orchestration run. Call once at the beginning of an orch-* skill, listing every workflow stage up front so the dashboard can show overall progress immediately.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            skillId: { type: "string", description: "Skill identifier, e.g. orch-feature, orch-bug, orch-adr." },
                            title: { type: "string", description: "Short human-readable title for this run, e.g. the feature or bug name." },
                            stages: {
                                type: "array",
                                description: "Ordered list of workflow stages for this skill.",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        agents: { type: "array", items: { type: "string" } },
                                    },
                                    required: ["name"],
                                },
                            },
                            changeKind: {
                                type: "string",
                                enum: VALID_CHANGE_KINDS,
                                description: "Kind of change this run produces; drives QA Validation depth and is persisted so a resumed run keeps the same depth.",
                            },
                            resume: {
                                type: "boolean",
                                description: "If true (default), reattach to an existing in_progress run for the same skillId instead of starting a duplicate. Set false to force a new run.",
                            },
                        },
                        required: ["skillId", "title", "stages"],
                    },
                    handler: async (ctx) => {
                        const { skillId, title, stages, changeKind, resume } = ctx.input || {};
                        if (!skillId || !title || !Array.isArray(stages) || stages.length === 0) {
                            throw new CanvasError("canvas_input_invalid", "skillId, title, and a non-empty stages[] are required.");
                        }
                        if (changeKind && !VALID_CHANGE_KINDS.includes(changeKind)) {
                            throw new CanvasError("canvas_input_invalid", `changeKind must be one of ${VALID_CHANGE_KINDS.join(", ")}`);
                        }
                        const baseDir = resolveBaseDir(session);
                        if (resume !== false) {
                            const existing = (await listRuns(baseDir)).find(
                                (r) => r.skillId === skillId && r.status === "in_progress"
                            );
                            if (existing) {
                                activeRunId = existing.id;
                                bus.emit("update");
                                return { runId: existing.id, resumed: true, run: existing };
                            }
                        }
                        const run = {
                            id: newRunId(),
                            skillId,
                            title,
                            status: "in_progress",
                            changeKind: changeKind || null,
                            approval: { personalValidation: "pending", decidedAt: null, note: "" },
                            startedAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            stages: stages.map((s) => ({
                                name: s.name,
                                agents: Array.isArray(s.agents) ? s.agents : [],
                                status: "pending",
                                output: "",
                                updatedAt: null,
                            })),
                            summary: "",
                            insights: [],
                        };
                        await writeRun(baseDir, run);
                        activeRunId = run.id;
                        bus.emit("update");
                        return { runId: run.id, resumed: false };
                    },
                },
                {
                    name: "set_run_context",
                    description:
                        "Persist run-level context that must survive a session resume: the change kind driving QA depth, and the Personal Validation approval decision that gates the pull request. Call with approval 'approved' only after the user explicitly approves.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            runId: { type: "string" },
                            changeKind: { type: "string", enum: VALID_CHANGE_KINDS },
                            approval: {
                                type: "string",
                                enum: VALID_APPROVAL_STATES,
                                description: "Personal Validation decision. 'approved' is the only value that unlocks the Create Pull Request stage.",
                            },
                            approvalNote: { type: "string", description: "What the user said when approving or rejecting." },
                        },
                        required: ["runId"],
                    },
                    handler: async (ctx) => {
                        const { runId, changeKind, approval, approvalNote } = ctx.input || {};
                        if (changeKind && !VALID_CHANGE_KINDS.includes(changeKind)) {
                            throw new CanvasError("canvas_input_invalid", `changeKind must be one of ${VALID_CHANGE_KINDS.join(", ")}`);
                        }
                        if (approval && !VALID_APPROVAL_STATES.includes(approval)) {
                            throw new CanvasError("canvas_input_invalid", `approval must be one of ${VALID_APPROVAL_STATES.join(", ")}`);
                        }
                        const baseDir = resolveBaseDir(session);
                        let result = null;
                        await withRunLock(runId, async () => {
                            const run = await readRun(baseDir, runId);
                            if (!run) throw new CanvasError("run_not_found", `No run with id ${runId}`);
                            if (changeKind) run.changeKind = changeKind;
                            if (approval) {
                                run.approval = {
                                    personalValidation: approval,
                                    decidedAt: new Date().toISOString(),
                                    note: typeof approvalNote === "string" ? approvalNote : (run.approval && run.approval.note) || "",
                                };
                            }
                            run.updatedAt = new Date().toISOString();
                            await writeRun(baseDir, run);
                            result = { changeKind: run.changeKind || null, approval: run.approval || null };
                        });
                        bus.emit("update");
                        return result || { ok: true };
                    },
                },
                {
                    name: "update_stage",
                    description:
                        "Update one stage of a tracked run: its status and/or captured output. Call this at the start of a stage (status: in_progress) and again when it finishes (status: done/blocked/skipped) with a summary of what was produced. For QA/validation stages (e.g. driven by the qa plugin), also pass scenarios and/or monitoring so the dashboard can show pass/fail results and evidence.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            runId: { type: "string" },
                            stageIndex: { type: "number" },
                            stageName: { type: "string" },
                            status: { type: "string", enum: VALID_STATUSES },
                            output: { type: "string", description: "Free-form output/result text to show for this stage; appended to any existing output." },
                            appendOutput: { type: "boolean", description: "If true (default false), append to existing output instead of replacing it." },
                            scenarios: {
                                type: "array",
                                description:
                                    "QA scenario results for this stage (e.g. from the qa plugin's playwright-validation skill). Replaces any scenarios previously recorded for this stage.",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string", description: "Scenario name/description." },
                                        status: { type: "string", enum: VALID_SCENARIO_STATUSES },
                                        notes: { type: "string", description: "Findings, console/network errors, or other detail for this scenario." },
                                        evidence: {
                                            type: "array",
                                            description: "Evidence files proving the result, e.g. Playwright screenshots/recordings.",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    type: { type: "string", description: "screenshot, video, log, trace, or other." },
                                                    path: { type: "string", description: "Path to the evidence file, relative to the session workspace." },
                                                    description: { type: "string" },
                                                },
                                                required: ["path"],
                                            },
                                        },
                                    },
                                    required: ["name", "status"],
                                },
                            },
                            monitoring: {
                                type: "object",
                                description: "Runtime monitoring summary for this stage (e.g. from the qa plugin's aspire-log-monitor skill).",
                                properties: {
                                    summary: { type: "string", description: "Overall monitoring summary, e.g. \"No new errors observed.\"" },
                                    findings: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                level: { type: "string", enum: VALID_FINDING_LEVELS },
                                                resource: { type: "string" },
                                                message: { type: "string" },
                                                timestamp: { type: "string" },
                                            },
                                            required: ["message"],
                                        },
                                    },
                                },
                            },
                        },
                        required: ["runId", "status"],
                    },
                    handler: async (ctx) => {
                        const { runId, stageIndex, stageName, status, output, appendOutput, scenarios, monitoring } = ctx.input || {};
                        if (!VALID_STATUSES.includes(status)) {
                            throw new CanvasError("canvas_input_invalid", `status must be one of ${VALID_STATUSES.join(", ")}`);
                        }
                        const baseDir = resolveBaseDir(session);
                        await withRunLock(runId, async () => {
                            const run = await readRun(baseDir, runId);
                            if (!run) throw new CanvasError("run_not_found", `No run with id ${runId}`);
                            const idx = findStageIndex(run, { stageIndex, stageName });
                            if (idx < 0 || idx >= run.stages.length) {
                                throw new CanvasError("stage_not_found", "Provide a valid stageIndex or stageName.");
                            }
                            const stage = run.stages[idx];
                            stage.status = status;
                            if (status === "in_progress") {
                                activeStageByRun.set(runId, { index: idx, name: stage.name });
                            } else {
                                const active = activeStageByRun.get(runId);
                                if (active && active.index === idx) activeStageByRun.delete(runId);
                            }
                            if (typeof output === "string" && output.length > 0) {
                                stage.output = appendOutput && stage.output ? `${stage.output}\n${output}` : output;
                            }
                            const normalizedScenarios = normalizeScenarios(scenarios);
                            if (normalizedScenarios) stage.scenarios = normalizedScenarios;
                            const normalizedMonitoring = normalizeMonitoring(monitoring);
                            if (normalizedMonitoring) stage.monitoring = normalizedMonitoring;
                            stage.updatedAt = new Date().toISOString();
                            run.updatedAt = stage.updatedAt;
                            await writeRun(baseDir, run);
                        });
                        bus.emit("update");
                        return { ok: true };
                    },
                },
                {
                    name: "finish_run",
                    description: "Mark a run as finished (done/blocked/cancelled) and attach an overall summary shown at the top of the run detail.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            runId: { type: "string" },
                            status: { type: "string", enum: ["done", "blocked", "cancelled"] },
                            summary: { type: "string" },
                        },
                        required: ["runId", "status"],
                    },
                    handler: async (ctx) => {
                        const { runId, status, summary } = ctx.input || {};
                        const baseDir = resolveBaseDir(session);
                        await withRunLock(runId, async () => {
                            const run = await readRun(baseDir, runId);
                            if (!run) throw new CanvasError("run_not_found", `No run with id ${runId}`);
                            run.status = status;
                            if (typeof summary === "string") run.summary = summary;
                            run.updatedAt = new Date().toISOString();
                            await writeRun(baseDir, run);
                        });
                        if (activeRunId === runId) activeRunId = null;
                        activeStageByRun.delete(runId);
                        bus.emit("update");
                        return { ok: true };
                    },
                },
                {
                    name: "list_runs",
                    description: "List all tracked runs (summaries only). Useful to recover the current runId after a resume.",
                    handler: async () => {
                        const baseDir = resolveBaseDir(session);
                        const runs = await listRuns(baseDir);
                        return runs.map(summarize);
                    },
                },
                {
                    name: "get_run",
                    description: "Fetch full detail (all stages and output) for one run.",
                    inputSchema: {
                        type: "object",
                        properties: { runId: { type: "string" } },
                        required: ["runId"],
                    },
                    handler: async (ctx) => {
                        const baseDir = resolveBaseDir(session);
                        const run = await readRun(baseDir, ctx.input && ctx.input.runId);
                        if (!run) throw new CanvasError("run_not_found", `No run with id ${ctx.input && ctx.input.runId}`);
                        return { ...run, insightSummary: summarizeInsights(run), contextSummary: summarizeContext(run) };
                    },
                },
            ],
            open: async (ctx) => {
                const baseDir = resolveBaseDir(session);
                await ensureDir(baseDir);
                let entry = servers.get(ctx.instanceId);
                if (!entry) {
                    entry = await startServer(ctx.instanceId, baseDir);
                    servers.set(ctx.instanceId, entry);
                }
                return { title: "Orchestration dashboard", url: entry.url };
            },
            onClose: async (ctx) => {
                const entry = servers.get(ctx.instanceId);
                if (entry) {
                    servers.delete(ctx.instanceId);
                    await new Promise((resolve) => entry.server.close(() => resolve()));
                }
            },
        }),
    ],
});

// Insight tracking: listen to the session's own tool-call and sub-agent
// telemetry and attribute each call to whichever run is currently
// "in_progress" (see resolveBaseDir/activeRunId above) and, when known,
// whichever stage of that run is currently `in_progress`
// (activeStageByRun) — so the dashboard can show which agent(s), MCP
// server(s), and model(s) actually did the work for each phase, not just
// the ones declared up front in start_run. Kept outside the canvas action
// handlers because it's driven by session events, not agent-invoked actions.
const pendingToolCalls = new Map();
session.on("tool.execution_start", (event) => {
    const data = event && event.data;
    if (!data || !data.toolCallId) return;
    pendingToolCalls.set(data.toolCallId, {
        toolName: data.toolName,
        mcpServerName: data.mcpServerName,
        model: data.model,
        startedAt: Date.now(),
    });
});
session.on("tool.execution_complete", (event) => {
    const data = event && event.data;
    if (!data || !data.toolCallId) return;
    const pending = pendingToolCalls.get(data.toolCallId);
    pendingToolCalls.delete(data.toolCallId);
    if (!pending || !activeRunId) return;
    const runId = activeRunId;
    const toolName = data.toolName || pending.toolName || "unknown";
    const durationMs = Math.max(0, Date.now() - pending.startedAt);
    const stageInfo = activeStageByRun.get(runId);
    withRunLock(runId, async () => {
        const baseDir = resolveBaseDir(session);
        const run = await readRun(baseDir, runId);
        if (!run) return;
        appendToolCall(run, {
            toolName,
            category: categorizeTool(toolName),
            durationMs,
            success: data.success !== false,
            endedAt: new Date().toISOString(),
            mcpServerName: data.mcpServerName || pending.mcpServerName || undefined,
            model: data.model || pending.model || undefined,
            stageIndex: stageInfo ? stageInfo.index : null,
            stageName: stageInfo ? stageInfo.name : null,
        });
        await writeRun(baseDir, run);
    })
        .then(() => bus.emit("update"))
        .catch(() => {});
});

// Custom-agent / Task-tool sub-agent invocations. `subagent.completed` and
// `subagent.failed` both carry the agent name, model, and duration, so
// either terminal event is enough to record what ran; `subagent.started`
// carries no duration yet and is not persisted.
function recordAgentUse(status) {
    return (event) => {
        const data = event && event.data;
        if (!data || !activeRunId) return;
        const runId = activeRunId;
        const stageInfo = activeStageByRun.get(runId);
        withRunLock(runId, async () => {
            const baseDir = resolveBaseDir(session);
            const run = await readRun(baseDir, runId);
            if (!run) return;
            appendAgentUse(run, {
                agentName: data.agentName,
                agentDisplayName: data.agentDisplayName || data.agentName,
                model: data.model,
                status,
                durationMs: data.durationMs,
                totalTokens: data.totalTokens,
                totalToolCalls: data.totalToolCalls,
                error: status === "failed" ? data.error : undefined,
                endedAt: new Date().toISOString(),
                stageIndex: stageInfo ? stageInfo.index : null,
                stageName: stageInfo ? stageInfo.name : null,
            });
            await writeRun(baseDir, run);
        })
            .then(() => bus.emit("update"))
            .catch(() => {});
    };
}
session.on("subagent.completed", recordAgentUse("completed"));
session.on("subagent.failed", recordAgentUse("failed"));

// Context-window tracking: `assistant.usage` gives the tokens consumed by each
// model call (attributed to the active run/stage exactly like tool calls
// above), while `session.usage_info` / `session.compaction_*` /
// `session.truncation` give the live context gauge for the run. Same
// session-wide caveat as the tool insights: anything happening while a run is
// `in_progress` is attributed to that run.
session.on("assistant.usage", (event) => {
    const data = event && event.data;
    if (!data || !activeRunId) return;
    const runId = activeRunId;
    const stageInfo = activeStageByRun.get(runId);
    // `agentId` is absent for the root agent and present for sub-agent work.
    const isSubAgent = Boolean(event.agentId);
    withRunLock(runId, async () => {
        const baseDir = resolveBaseDir(session);
        const run = await readRun(baseDir, runId);
        if (!run) return;
        recordTokenUsage(run, {
            inputTokens: data.inputTokens,
            outputTokens: data.outputTokens,
            reasoningTokens: data.reasoningTokens,
            cacheReadTokens: data.cacheReadTokens,
            cacheWriteTokens: data.cacheWriteTokens,
            model: data.model,
            isSubAgent,
            stageIndex: stageInfo ? stageInfo.index : null,
            stageName: stageInfo ? stageInfo.name : null,
        });
        await writeRun(baseDir, run);
    })
        .then(() => bus.emit("update"))
        .catch(() => {});
});

// `session.usage_info` is ephemeral and fires very frequently, so persistence
// is throttled: write only when the value moved by more than 1% of the token
// limit, or when at least CONTEXT_SAMPLE_MIN_INTERVAL_MS has passed.
const CONTEXT_SAMPLE_MIN_INTERVAL_MS = 5000;
const CONTEXT_SAMPLE_MIN_DELTA_RATIO = 0.01;
let lastContextSample = { runId: null, at: 0, tokens: 0 };
session.on("session.usage_info", (event) => {
    const data = event && event.data;
    if (!data || !activeRunId) return;
    // Sub-agents have their own context window; only the root agent's samples
    // describe the orchestration's own "am I about to be compacted?" state.
    if (event.agentId) return;
    const currentTokens = Number(data.currentTokens);
    if (!Number.isFinite(currentTokens)) return;
    const tokenLimit = Number(data.tokenLimit);
    const runId = activeRunId;
    const now = Date.now();
    const sameRun = lastContextSample.runId === runId;
    if (sameRun && currentTokens === lastContextSample.tokens) return;
    const minDelta = Number.isFinite(tokenLimit) && tokenLimit > 0 ? tokenLimit * CONTEXT_SAMPLE_MIN_DELTA_RATIO : 0;
    const movedEnough = !sameRun || Math.abs(currentTokens - lastContextSample.tokens) > minDelta;
    const waitedEnough = !sameRun || now - lastContextSample.at >= CONTEXT_SAMPLE_MIN_INTERVAL_MS;
    if (!movedEnough && !waitedEnough) return;
    lastContextSample = { runId, at: now, tokens: currentTokens };
    withRunLock(runId, async () => {
        const baseDir = resolveBaseDir(session);
        const run = await readRun(baseDir, runId);
        if (!run) return;
        recordContextSample(run, {
            currentTokens,
            tokenLimit,
            messagesLength: data.messagesLength,
            conversationTokens: data.conversationTokens,
            systemTokens: data.systemTokens,
            toolDefinitionsTokens: data.toolDefinitionsTokens,
        });
        await writeRun(baseDir, run);
    })
        .then(() => bus.emit("update"))
        .catch(() => {});
});

session.on("session.compaction_start", (event) => {
    const data = (event && event.data) || {};
    if (!activeRunId) return;
    const runId = activeRunId;
    withRunLock(runId, async () => {
        const baseDir = resolveBaseDir(session);
        const run = await readRun(baseDir, runId);
        if (!run) return;
        recordCompaction(run, {
            reason: data.trigger,
            currentTokens: data.currentTokens,
            at: (event && event.timestamp) || new Date().toISOString(),
        });
        await writeRun(baseDir, run);
    })
        .then(() => bus.emit("update"))
        .catch(() => {});
});

session.on("session.truncation", (event) => {
    const data = event && event.data;
    if (!data || !activeRunId) return;
    const runId = activeRunId;
    withRunLock(runId, async () => {
        const baseDir = resolveBaseDir(session);
        const run = await readRun(baseDir, runId);
        if (!run) return;
        recordTruncation(run, {
            preTokens: data.preTruncationTokensInMessages,
            postTokens: data.postTruncationTokensInMessages,
            removedTokens: data.tokensRemovedDuringTruncation,
            at: (event && event.timestamp) || new Date().toISOString(),
        });
        await writeRun(baseDir, run);
    })
        .then(() => bus.emit("update"))
        .catch(() => {});
});
