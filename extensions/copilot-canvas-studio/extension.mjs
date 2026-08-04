import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { createCanvas, joinSession } from "@github/copilot-sdk/extension";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Shared per-instance state store, keyed by `${kind}:${instanceId}` so the
// two canvases (mermaid, markdown) never collide even if the agent reuses
// the same instanceId string for both.
// ---------------------------------------------------------------------------
const instances = new Map();

function instanceKey(kind, instanceId) {
  return `${kind}:${instanceId}`;
}

function getInstance(kind, instanceId) {
  const key = instanceKey(kind, instanceId);
  if (!instances.has(key)) {
    instances.set(key, {
      kind,
      currentView: null,
      history: [],
      token: crypto.randomBytes(16).toString("hex"),
    });
  }
  return instances.get(key);
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
// Server-Sent Events, one client set per `kind:instanceId`.
// ---------------------------------------------------------------------------
const sseClients = new Map();

function broadcast(kind, instanceId, event, data) {
  const clients = sseClients.get(instanceKey(kind, instanceId));
  if (!clients) return;
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) res.write(msg);
}

function broadcastView(kind, instanceId, inst) {
  broadcast(kind, instanceId, "view", viewPayload(inst));
}

function validateToken(kind, instanceId, token) {
  const inst = instances.get(instanceKey(kind, instanceId));
  return Boolean(inst && inst.token === token);
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------
function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => resolve(body ? JSON.parse(body) : {}));
    req.on("error", reject);
  });
}

function json(res, code, data) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function serveFile(res, file) {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(fs.readFileSync(path.join(__dirname, "public", file), "utf8"));
}

// ---------------------------------------------------------------------------
// Single shared HTTP server for both canvases. Requests are routed by
// pathname prefix (`/mermaid`, `/markdown`) and authorized per-instance via
// a random token issued when the instance is first created.
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const segments = url.pathname.split("/").filter(Boolean);
  const kind = segments[0]; // "mermaid" or "markdown"
  const instanceId = url.searchParams.get("instance");
  const token = url.searchParams.get("token");

  if (kind !== "mermaid" && kind !== "markdown") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const authorized = instanceId && validateToken(kind, instanceId, token);
  if (!authorized) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  // Page
  if (req.method === "GET" && segments.length === 1) {
    serveFile(res, `${kind}.html`);
    return;
  }

  // SSE stream
  if (req.method === "GET" && segments[1] === "events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    const key = instanceKey(kind, instanceId);
    if (!sseClients.has(key)) sseClients.set(key, new Set());
    sseClients.get(key).add(res);
    req.on("close", () => sseClients.get(key)?.delete(res));

    const inst = getInstance(kind, instanceId);
    if (inst.currentView) {
      res.write(`event: view\ndata: ${JSON.stringify(viewPayload(inst))}\n\n`);
    }
    return;
  }

  // Current state (used by the page on load/reconnect)
  if (req.method === "GET" && segments[1] === "api" && segments[2] === "state") {
    const inst = getInstance(kind, instanceId);
    json(res, 200, viewPayload(inst));
    return;
  }

  // Navigate back through diagram/document history
  if (req.method === "POST" && segments[1] === "api" && segments[2] === "back") {
    const inst = getInstance(kind, instanceId);
    const prev = popView(inst);
    if (prev) broadcastView(kind, instanceId, inst);
    json(res, 200, { ok: true, view: prev });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

const port = await new Promise((resolve) => {
  server.listen(0, "127.0.0.1", () => resolve(server.address().port));
});

function openUrl(kind, instanceId, inst) {
  return `http://127.0.0.1:${port}/${kind}?instance=${instanceId}&token=${inst.token}`;
}

// ---------------------------------------------------------------------------
// Canvas 1: Mermaid diagram viewer. Renders C4, sequence, state, deployment,
// DDD (aggregate, context map, event flow, subdomain landscape), and
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
        const inst = getInstance("mermaid", instanceId);
        const view = {
          title: input.title || "Diagram",
          source: input.source,
          explanation: input.explanation || null,
        };
        if (input.mode === "push") pushView(inst, view);
        else replaceView(inst, view);
        broadcastView("mermaid", instanceId, inst);
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
        const inst = getInstance("mermaid", instanceId);
        if (inst.currentView) {
          inst.currentView.explanation = { title: input.title, text: input.text };
          broadcast("mermaid", instanceId, "explanation", inst.currentView.explanation);
        }
        return { ok: true };
      },
    },
    {
      name: "get_state",
      description: "Get the current diagram source, title, and history depth.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      handler({ instanceId }) {
        const inst = getInstance("mermaid", instanceId);
        return viewPayload(inst);
      },
    },
    {
      name: "clear",
      description: "Clear the diagram canvas and its history.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      handler({ instanceId }) {
        const inst = getInstance("mermaid", instanceId);
        inst.currentView = null;
        inst.history = [];
        broadcast("mermaid", instanceId, "clear", {});
        return { ok: true };
      },
    },
  ],
  open({ instanceId, input }) {
    const inst = getInstance("mermaid", instanceId);
    return {
      url: openUrl("mermaid", instanceId, inst),
      title: input?.title || "Mermaid Diagram Viewer",
      status: inst.currentView ? inst.currentView.title : "Ready",
    };
  },
  onClose({ instanceId }) {
    instances.delete(instanceKey("mermaid", instanceId));
    sseClients.delete(instanceKey("mermaid", instanceId));
  },
});

// ---------------------------------------------------------------------------
// Canvas 2: Markdown document preview. Renders ADRs, TDRs, arc42 sections,
// blueprints, and backlog artifacts (epics/stories/bugs) as live-rendered
// documents so the user can review formatted output while the agent drafts.
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
        const inst = getInstance("markdown", instanceId);
        const view = { title: input.title || "Document", content: input.content };
        if (input.mode === "push") pushView(inst, view);
        else replaceView(inst, view);
        broadcastView("markdown", instanceId, inst);
        return { ok: true, historyDepth: inst.history.length };
      },
    },
    {
      name: "get_state",
      description: "Get the current document content, title, and history depth.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      handler({ instanceId }) {
        const inst = getInstance("markdown", instanceId);
        return viewPayload(inst);
      },
    },
    {
      name: "clear",
      description: "Clear the document preview and its history.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      handler({ instanceId }) {
        const inst = getInstance("markdown", instanceId);
        inst.currentView = null;
        inst.history = [];
        broadcast("markdown", instanceId, "clear", {});
        return { ok: true };
      },
    },
  ],
  open({ instanceId, input }) {
    const inst = getInstance("markdown", instanceId);
    return {
      url: openUrl("markdown", instanceId, inst),
      title: input?.title || "Markdown Document Preview",
      status: inst.currentView ? inst.currentView.title : "Ready",
    };
  },
  onClose({ instanceId }) {
    instances.delete(instanceKey("markdown", instanceId));
    sseClients.delete(instanceKey("markdown", instanceId));
  },
});

await joinSession({ canvases: [mermaidCanvas, markdownCanvas] });
