import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { createCanvas, joinSession } from "@github/copilot-sdk/extension";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Per-instance state store for the mermaid-diagram canvas.
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
  res.end(fs.readFileSync(path.join(__dirname, "public", "mermaid.html"), "utf8"));
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

  // Navigate back through diagram history
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
// Mermaid diagram viewer. Renders C4, sequence, state, deployment, DDD
// (aggregate, context map, event flow, subdomain landscape), and
// wireframe/user-flow Mermaid diagrams produced by this repo's plugins.
// ---------------------------------------------------------------------------
const mermaidCanvas = createCanvas({
  id: "mermaid-diagram",
  displayName: "Mermaid Diagram Viewer",
  description:
    "Renders Mermaid diagram source (C4, sequence, state, deployment, DDD aggregate/context-map/event-flow, wireframe, user-flow) as an interactive, pannable/zoomable live preview.",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Optional title for the initial diagram" },
      source: { type: "string", description: "Optional raw Mermaid diagram source to render immediately on open, e.g. the contents of a ```mermaid fenced code block" },
      explanation: {
        type: "object",
        properties: {
          title: { type: "string" },
          text: { type: "string" },
        },
        description: "Optional explanation panel shown alongside the initial diagram",
      },
    },
  },
  actions: [
    {
      name: "render_diagram",
      description:
        "Render or update a Mermaid diagram on the canvas. Use mode 'push' to drill into a related diagram (adds to history so the user can navigate back with the Back button), or 'replace' (default) to update the current view in place.",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string", description: "Diagram title" },
          source: { type: "string", description: "Raw Mermaid diagram source, e.g. the contents of a ```mermaid fenced code block" },
          mode: {
            type: "string",
            enum: ["push", "replace"],
            description: "Navigation mode. 'push' saves the current view to history. 'replace' updates in place (default).",
          },
          explanation: {
            type: "object",
            properties: {
              title: { type: "string" },
              text: { type: "string" },
            },
            description: "Optional explanation panel shown alongside the diagram",
          },
        },
        required: ["source"],
      },
      handler({ instanceId, input }) {
        const inst = getInstance(instanceId);
        const view = {
          title: input.title || "Diagram",
          source: input.source,
          explanation: input.explanation || null,
        };
        if (input.mode === "push") pushView(inst, view);
        else replaceView(inst, view);
        broadcastView(instanceId, inst);
        return { ok: true, historyDepth: inst.history.length };
      },
    },
    {
      name: "show_explanation",
      description: "Display or update an explanation panel alongside the current diagram, without changing the diagram itself.",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string" },
          text: { type: "string" },
        },
        required: ["title", "text"],
      },
      handler({ instanceId, input }) {
        const inst = getInstance(instanceId);
        if (inst.currentView) {
          inst.currentView.explanation = { title: input.title, text: input.text };
          broadcast(instanceId, "explanation", inst.currentView.explanation);
        }
        return { ok: true };
      },
    },
    {
      name: "get_state",
      description: "Get the current diagram source, title, and history depth.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      handler({ instanceId }) {
        const inst = getInstance(instanceId);
        return viewPayload(inst);
      },
    },
    {
      name: "clear",
      description: "Clear the diagram canvas and its history.",
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
    if (input?.source) {
      replaceView(inst, {
        title: input.title || "Diagram",
        source: input.source,
        explanation: input.explanation || null,
      });
    }
    return {
      url: openUrl(instanceId, inst),
      title: input?.title || "Mermaid Diagram Viewer",
      status: inst.currentView ? inst.currentView.title : "Ready",
    };
  },
  onClose({ instanceId }) {
    instances.delete(instanceId);
    sseClients.delete(instanceId);
  },
});

await joinSession({ canvases: [mermaidCanvas] });
