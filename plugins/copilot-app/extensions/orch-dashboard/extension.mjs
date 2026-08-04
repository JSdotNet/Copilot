// Extension: orch-dashboard
// Live progress and output dashboard for copilot-app orch-* orchestration
// skills (orch-feature, orch-bug, orch-adr, orch-arc42, orch-blueprint,
// orch-tdr, orch-architecture, orch-project, orch-repo, orch-create-mvp,
// orch-update-packages, orch-aspire-update, orch-create-module,
// orch-create-service).
//
// Model: an orchestration run is a JSON file (see store.mjs) with a list of
// named stages, each carrying a status (pending/in_progress/done/blocked/
// skipped/cancelled) and free-form output text. The orchestrating agent
// drives the run through canvas actions (start_run, update_stage,
// finish_run) as it works through a skill's workflow stages; list_runs/
// get_run let the agent re-read state after a resume. The canvas itself is a
// read-only live dashboard: a run list on the left, stage-by-stage progress
// and captured output on the right, refreshed over SSE whenever an action
// mutates state.
//
// State is persisted under `<session workspace>/orchestration-runs/*.json`
// so it lives alongside other session artifacts and is cleaned up with the
// session. If no workspace path is available (should not normally happen
// for project sessions) state falls back to a per-user directory under
// $COPILOT_HOME.

import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import { EventEmitter } from "node:events";
import { joinSession, createCanvas, CanvasError } from "@github/copilot-sdk/extension";
import { ensureDir, writeRun, readRun, listRuns, newRunId } from "./store.mjs";
import { renderShell } from "./render.mjs";
import { categorizeTool, appendToolCall, summarizeInsights } from "./insight.mjs";
import { renderReportMarkdown } from "./report.mjs";

const VALID_STATUSES = ["pending", "in_progress", "done", "blocked", "skipped", "cancelled"];

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
            const detailMatch = url.pathname.match(/^\/api\/runs\/([^/]+)$/);
            if (req.method === "GET" && detailMatch) {
                const run = await readRun(baseDir, decodeURIComponent(detailMatch[1]));
                if (!run) {
                    res.statusCode = 404;
                    res.end("not found");
                    return;
                }
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                res.end(JSON.stringify({ ...run, insightSummary: summarizeInsights(run) }));
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
                "Live progress and output dashboard for copilot-app orch-* orchestration skills (orch-feature, orch-bug, orch-adr, orch-arc42, orch-blueprint, orch-tdr, orch-architecture, orch-project, orch-repo, orch-create-mvp, orch-update-packages, orch-aspire-update, orch-create-module, orch-create-service). Open once per session; drive it with start_run/update_stage/finish_run as a workflow progresses.",
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
                        },
                        required: ["skillId", "title", "stages"],
                    },
                    handler: async (ctx) => {
                        const { skillId, title, stages } = ctx.input || {};
                        if (!skillId || !title || !Array.isArray(stages) || stages.length === 0) {
                            throw new CanvasError("canvas_input_invalid", "skillId, title, and a non-empty stages[] are required.");
                        }
                        const baseDir = resolveBaseDir(session);
                        const run = {
                            id: newRunId(),
                            skillId,
                            title,
                            status: "in_progress",
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
                        return { runId: run.id };
                    },
                },
                {
                    name: "update_stage",
                    description:
                        "Update one stage of a tracked run: its status and/or captured output. Call this at the start of a stage (status: in_progress) and again when it finishes (status: done/blocked/skipped) with a summary of what was produced.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            runId: { type: "string" },
                            stageIndex: { type: "number" },
                            stageName: { type: "string" },
                            status: { type: "string", enum: VALID_STATUSES },
                            output: { type: "string", description: "Free-form output/result text to show for this stage; appended to any existing output." },
                            appendOutput: { type: "boolean", description: "If true (default false), append to existing output instead of replacing it." },
                        },
                        required: ["runId", "status"],
                    },
                    handler: async (ctx) => {
                        const { runId, stageIndex, stageName, status, output, appendOutput } = ctx.input || {};
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
                            if (typeof output === "string" && output.length > 0) {
                                stage.output = appendOutput && stage.output ? `${stage.output}\n${output}` : output;
                            }
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
                        return { ...run, insightSummary: summarizeInsights(run) };
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

// Insight tracking: listen to the session's own tool-call telemetry and
// attribute each call's duration to whichever run is currently
// "in_progress" (see resolveBaseDir/activeRunId above). Kept outside the
// canvas action handlers because it's driven by session events, not
// agent-invoked actions.
const pendingToolCalls = new Map();
session.on("tool.execution_start", (event) => {
    const data = event && event.data;
    if (!data || !data.toolCallId) return;
    pendingToolCalls.set(data.toolCallId, { toolName: data.toolName, startedAt: Date.now() });
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
        });
        await writeRun(baseDir, run);
    })
        .then(() => bus.emit("update"))
        .catch(() => {});
});
