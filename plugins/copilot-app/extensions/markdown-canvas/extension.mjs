import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { createCanvas, joinSession } from "@github/copilot-sdk/extension";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Per-instance state store for the markdown-preview canvas.
// ---------------------------------------------------------------------------
const instances = new Map();

function getInstance(instanceId) {
  if (!instances.has(instanceId)) {
    instances.set(instanceId, {
      currentView: null,
      history: [],
      token: crypto.randomBytes(16).toString("hex"),
    });
  }
  return instances.get(instanceId);
}

function pushView(inst, view) {
  if (inst.currentView) inst.history.push(inst.currentView);
  inst.currentView = view;
}

function replaceView(inst, view) {
  inst.currentView = view;
}

function popView(inst) {
  if (inst.history.length === 0) return null;
  inst.currentView = inst.history.pop();
  return inst.currentView;
}

function viewPayload(inst) {
  const view = inst.currentView;
  return {
    ...view,
    historyDepth: inst.history.length,
    breadcrumbs: inst.history.map((v) => v.title).concat(view ? [view.title] : []),
  };
}

// ---------------------------------------------------------------------------
// Server-Sent Events, one client set per instanceId.
// ---------------------------------------------------------------------------
const sseClients = new Map();

function broadcast(instanceId, event, data) {
  const clients = sseClients.get(instanceId);
  if (!clients) return;
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) res.write(msg);
}

function broadcastView(instanceId, inst) {
  broadcast(instanceId, "view", viewPayload(inst));
}

function validateToken(instanceId, token) {
  const inst = instances.get(instanceId);
  return Boolean(inst && inst.token === token);
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------
function json(res, code, data) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function serveFile(res) {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(fs.readFileSync(path.join(__dirname, "public", "markdown.html"), "utf8"));
}

// ---------------------------------------------------------------------------
// HTTP server for this canvas instance's page, SSE stream, and small API.
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const segments = url.pathname.split("/").filter(Boolean);
  const instanceId = url.searchParams.get("instance");
  const token = url.searchParams.get("token");

  const authorized = instanceId && validateToken(instanceId, token);
  if (!authorized) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  // Page
  if (req.method === "GET" && segments.length === 0) {
    serveFile(res);
    return;
  }

  // SSE stream
  if (req.method === "GET" && segments[0] === "events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    if (!sseClients.has(instanceId)) sseClients.set(instanceId, new Set());
    sseClients.get(instanceId).add(res);
    req.on("close", () => sseClients.get(instanceId)?.delete(res));

    const inst = getInstance(instanceId);
    if (inst.currentView) {
      res.write(`event: view\ndata: ${JSON.stringify(viewPayload(inst))}\n\n`);
    }
    return;
  }

  // Current state (used by the page on load/reconnect)
  if (req.method === "GET" && segments[0] === "api" && segments[1] === "state") {
    const inst = getInstance(instanceId);
    json(res, 200, viewPayload(inst));
    return;
  }

  // Navigate back through document history
  if (req.method === "POST" && segments[0] === "api" && segments[1] === "back") {
    const inst = getInstance(instanceId);
    const prev = popView(inst);
    if (prev) broadcastView(instanceId, inst);
    json(res, 200, { ok: true, view: prev });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

const port = await new Promise((resolve) => {
  server.listen(0, "127.0.0.1", () => resolve(server.address().port));
});

function openUrl(instanceId, inst) {
  return `http://127.0.0.1:${port}/?instance=${instanceId}&token=${inst.token}`;
}

// ---------------------------------------------------------------------------
// Markdown document preview. Renders ADRs, TDRs, arc42 sections, blueprints,
// and backlog artifacts (epics/stories/bugs) as live-rendered documents so
// the user can review formatted output while the agent drafts.
// ---------------------------------------------------------------------------
const markdownCanvas = createCanvas({
  id: "markdown-preview",
  displayName: "Markdown Document Preview",
  description:
    "Live-renders a Markdown document (ADR, TDR, arc42 section, blueprint, epic/story/bug) as formatted HTML while the agent drafts or revises it.",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Optional title for the initial document" },
      content: { type: "string", description: "Optional raw Markdown content to render immediately on open" },
    },
  },
  actions: [
    {
      name: "render_markdown",
      description:
        "Render or update the Markdown document shown on the canvas. Use mode 'push' when switching to review a different document (adds to history), or 'replace' (default) to update the current document in place.",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string", description: "Document title" },
          content: { type: "string", description: "Raw Markdown content to render" },
          mode: {
            type: "string",
            enum: ["push", "replace"],
            description: "Navigation mode. 'push' saves the current document to history. 'replace' updates in place (default).",
          },
        },
        required: ["content"],
      },
      handler({ instanceId, input }) {
        const inst = getInstance(instanceId);
        const view = { title: input.title || "Document", content: input.content };
        if (input.mode === "push") pushView(inst, view);
        else replaceView(inst, view);
        broadcastView(instanceId, inst);
        return { ok: true, historyDepth: inst.history.length };
      },
    },
    {
      name: "get_state",
      description: "Get the current document content, title, and history depth.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      handler({ instanceId }) {
        const inst = getInstance(instanceId);
        return viewPayload(inst);
      },
    },
    {
      name: "clear",
      description: "Clear the document preview and its history.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      handler({ instanceId }) {
        const inst = getInstance(instanceId);
        inst.currentView = null;
        inst.history = [];
        broadcast(instanceId, "clear", {});
        return { ok: true };
      },
    },
  ],
  open({ instanceId, input }) {
    const inst = getInstance(instanceId);
    if (input?.content) {
      replaceView(inst, { title: input.title || "Document", content: input.content });
    }
    return {
      url: openUrl(instanceId, inst),
      title: input?.title || "Markdown Document Preview",
      status: inst.currentView ? inst.currentView.title : "Ready",
    };
  },
  onClose({ instanceId }) {
    instances.delete(instanceId);
    sseClients.delete(instanceId);
  },
});

await joinSession({ canvases: [markdownCanvas] });
