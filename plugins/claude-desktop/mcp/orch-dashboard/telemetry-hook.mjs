#!/usr/bin/env node
// Telemetry bridge: Claude Code hook events -> orch-dashboard run insights.
//
// The GitHub Copilot version of this dashboard subscribes to host session events
// (`tool.execution_start`, `tool.execution_complete`, `subagent.completed`,
// `assistant.usage`, `session.usage_info`, `session.compaction_start`,
// `session.truncation`) from inside the extension process. Claude Code exposes the
// equivalent information differently: as hook invocations, one short-lived process per
// event, plus the session transcript on disk. This script is that adapter, so the
// Insight and Context panels keep working without the orchestrating agent having to
// self-report anything.
//
//   Copilot event              Claude Code source
//   tool.execution_start       PreToolUse hook       (records the start time)
//   tool.execution_complete    PostToolUse hook      (duration, category, MCP server)
//   subagent.completed         PostToolUse on Task   (agent name from subagent_type)
//   assistant.usage            transcript JSONL      (per-message `usage`, incl. sidechains)
//   session.usage_info         transcript JSONL      (last root message's prompt size)
//   session.compaction_start   PreCompact hook       (trigger: manual | auto)
//   (no Copilot equivalent)    SessionEnd hook       (stamps the run idle — see idle.mjs)
//
// Usage: `node telemetry-hook.mjs` with the hook payload on stdin.
//
// Everything here is best-effort and must never fail a tool call: the script exits 0 on
// any error, and unparseable transcript lines are skipped rather than fatal.

import { open, stat } from "node:fs/promises";
import { readActive, writeActive, readTelemetry, writeTelemetry, runsDir } from "./state.mjs";
import { readRun, writeRun } from "./store.mjs";
import { isIdle, markIdle } from "./idle.mjs";
import {
    categorizeTool,
    appendToolCall,
    appendAgentUse,
    recordTokenUsage,
    recordContextSample,
    recordCompaction,
} from "./insight.mjs";

// Claude Code's context window. Every current model exposes 200k; the 1M-context beta is
// advertised in the model id, so that is the only case worth special-casing.
function tokenLimitFor(model) {
    if (typeof model === "string" && /\[1m\]|-1m\b/i.test(model)) return 1_000_000;
    return 200_000;
}

function mcpServerFor(toolName) {
    const match = typeof toolName === "string" && toolName.match(/^mcp__([^_]+(?:_[^_]+)*?)__/);
    return match ? match[1] : undefined;
}

const AGENT_TOOLS = new Set(["Task", "Agent"]);

function readStdin() {
    return new Promise((resolve) => {
        let data = "";
        process.stdin.setEncoding("utf8");
        process.stdin.on("data", (chunk) => (data += chunk));
        process.stdin.on("end", () => resolve(data));
        // A hook that is invoked with no stdin should not hang the tool call.
        setTimeout(() => resolve(data), 2000).unref?.();
    });
}

// Reads the transcript from the stored byte offset and folds every assistant message's
// usage into the run. Returns the new offset plus the last root-agent model seen, which
// is also used to label tool calls.
async function syncTranscript(run, telemetry, transcriptPath) {
    if (!transcriptPath) return telemetry;
    let size;
    try {
        size = (await stat(transcriptPath)).size;
    } catch {
        return telemetry;
    }
    let offset = telemetry.transcriptPath === transcriptPath ? Number(telemetry.transcriptOffset) || 0 : 0;
    // A compaction rewrites the transcript, so an offset past the end means "start over".
    if (offset > size) offset = 0;
    if (offset === size) return { ...telemetry, transcriptPath, transcriptOffset: size };

    let text = "";
    const handle = await open(transcriptPath, "r");
    try {
        const length = size - offset;
        const buffer = Buffer.alloc(length);
        await handle.read(buffer, 0, length, offset);
        text = buffer.toString("utf8");
    } finally {
        await handle.close();
    }

    // Only whole lines are consumed; a partial trailing line is left for the next run.
    const lastNewline = text.lastIndexOf("\n");
    if (lastNewline < 0) return { ...telemetry, transcriptPath, transcriptOffset: offset };
    const consumed = text.slice(0, lastNewline + 1);
    const active = await readActive();
    const stage = active.stage || null;
    let lastRootModel = telemetry.lastModel || null;
    let lastRootSample = null;

    for (const line of consumed.split("\n")) {
        if (!line.trim()) continue;
        let entry;
        try {
            entry = JSON.parse(line);
        } catch {
            continue;
        }
        const message = entry && entry.message;
        const usage = message && message.usage;
        if (!usage || entry.type !== "assistant") continue;
        const isSubAgent = entry.isSidechain === true;
        const model = message.model || null;
        recordTokenUsage(run, {
            inputTokens: usage.input_tokens,
            outputTokens: usage.output_tokens,
            cacheReadTokens: usage.cache_read_input_tokens,
            cacheWriteTokens: usage.cache_creation_input_tokens,
            model,
            isSubAgent,
            stageIndex: stage ? stage.index : null,
            stageName: stage ? stage.name : null,
        });
        if (!isSubAgent) {
            if (model) lastRootModel = model;
            // The prompt the model just read is the closest thing Claude Code has to
            // Copilot's `session.usage_info.currentTokens`: everything the context window
            // held for that call, cached or not.
            lastRootSample = {
                currentTokens:
                    (Number(usage.input_tokens) || 0) +
                    (Number(usage.cache_read_input_tokens) || 0) +
                    (Number(usage.cache_creation_input_tokens) || 0),
                tokenLimit: tokenLimitFor(model),
            };
        }
    }
    // Sub-agents run their own context window, so only root samples drive the gauge.
    if (lastRootSample) recordContextSample(run, lastRootSample);

    return {
        ...telemetry,
        transcriptPath,
        transcriptOffset: offset + Buffer.byteLength(consumed, "utf8"),
        lastModel: lastRootModel,
    };
}

// Used when telemetry has nowhere to land: move the cursor to the end of the transcript
// so a run that becomes active later does not absorb the conversation that came before it.
async function skipToTranscriptEnd(sessionId, telemetry, transcriptPath) {
    if (!transcriptPath) return;
    try {
        const size = (await stat(transcriptPath)).size;
        await writeTelemetry(sessionId, { ...telemetry, transcriptPath, transcriptOffset: size });
    } catch {
        /* transcript not readable yet */
    }
}

async function main() {
    const raw = await readStdin();
    let payload;
    try {
        payload = JSON.parse(raw);
    } catch {
        return;
    }

    const event = payload.hook_event_name;
    const sessionId = payload.session_id || "default";
    const telemetry = await readTelemetry(sessionId);
    telemetry.pendingTools = telemetry.pendingTools && typeof telemetry.pendingTools === "object" ? telemetry.pendingTools : {};

    // PreToolUse only bookkeeps a start time; it never touches run state, so it stays
    // cheap even when no run is active.
    if (event === "PreToolUse") {
        const name = payload.tool_name || "unknown";
        const stack = Array.isArray(telemetry.pendingTools[name]) ? telemetry.pendingTools[name] : [];
        stack.push(Date.now());
        telemetry.pendingTools[name] = stack;
        await writeTelemetry(sessionId, telemetry);
        return;
    }

    const active = await readActive();
    if (!active.runId) {
        // Nothing to attribute telemetry to. Still advance the transcript cursor so a run
        // started later does not absorb the whole earlier conversation as its first stage.
        await skipToTranscriptEnd(sessionId, telemetry, payload.transcript_path);
        return;
    }

    const baseDir = runsDir();
    const run = await readRun(baseDir, active.runId);
    if (!run) return;

    // The session that owned this run has ended, so nothing more will happen in it on its
    // own. Stamping the run idle stops its elapsed clock and keeps `start_run` from
    // adopting it; releasing the active pointer keeps a later session's tool calls from
    // landing on work that already stopped.
    if (event === "SessionEnd") {
        markIdle(run);
        await writeRun(baseDir, run);
        await writeActive({ runId: null, stage: null, updatedAt: new Date().toISOString() });
        return;
    }

    // Backstop for a session left open at the Personal Validation gate: telemetry is
    // session-wide, so unrelated later work in that session would otherwise be attributed
    // to a run nothing has touched for hours. A resumed orchestration clears the stamp
    // through `update_stage` and attribution picks up again on its own.
    if (isIdle(run)) {
        await skipToTranscriptEnd(sessionId, telemetry, payload.transcript_path);
        return;
    }

    const stage = active.stage || null;
    let updated = telemetry;

    if (event === "PostToolUse") {
        const name = payload.tool_name || "unknown";
        const stack = Array.isArray(telemetry.pendingTools[name]) ? telemetry.pendingTools[name] : [];
        const startedAt = stack.shift();
        telemetry.pendingTools[name] = stack;
        const durationMs = startedAt ? Math.max(0, Date.now() - startedAt) : 0;
        appendToolCall(run, {
            toolName: name,
            category: categorizeTool(name),
            durationMs,
            success: true,
            endedAt: new Date().toISOString(),
            mcpServerName: mcpServerFor(name),
            model: telemetry.lastModel || undefined,
            stageIndex: stage ? stage.index : null,
            stageName: stage ? stage.name : null,
        });
        // A Task/Agent call is the one place a hook learns which sub-agent ran, so it
        // doubles as the `subagent.completed` equivalent.
        if (AGENT_TOOLS.has(name)) {
            const input = payload.tool_input || {};
            appendAgentUse(run, {
                agentName: input.subagent_type || "subagent",
                agentDisplayName: input.subagent_type || input.description || "subagent",
                model: input.model || telemetry.lastModel || undefined,
                status: "completed",
                durationMs,
                endedAt: new Date().toISOString(),
                stageIndex: stage ? stage.index : null,
                stageName: stage ? stage.name : null,
            });
        }
        updated = await syncTranscript(run, telemetry, payload.transcript_path);
    } else if (event === "PreCompact") {
        recordCompaction(run, {
            reason: payload.trigger === "manual" ? "manual" : "threshold",
            currentTokens: run.context && run.context.currentTokens,
            at: new Date().toISOString(),
        });
        // The cursor is deliberately left alone: compaction appends to the transcript
        // rather than rewriting it, and resetting would re-count every message already
        // folded into this run. syncTranscript restarts on its own if the file shrinks
        // or the session moves to a different transcript.
        updated = telemetry;
    } else if (event === "Stop" || event === "SubagentStop" || event === "SessionStart") {
        updated = await syncTranscript(run, telemetry, payload.transcript_path);
    } else {
        return;
    }

    await writeRun(baseDir, run);
    await writeTelemetry(sessionId, updated);
}

main().catch((err) => {
    process.stderr.write(`orch-dashboard telemetry: ${String((err && err.message) || err)}\n`);
    process.exit(0);
});
