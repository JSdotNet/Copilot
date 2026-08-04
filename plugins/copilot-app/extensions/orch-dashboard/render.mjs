// Renderer for orch-dashboard. Single static HTML shell; all data comes from
// same-origin JSON endpoints (`/api/runs`, `/api/runs/:id`) served by
// extension.mjs, with live refresh over an SSE stream (`/events`).

const STATUS_LABEL = {
    pending: "Pending",
    in_progress: "In progress",
    done: "Done",
    blocked: "Blocked",
    skipped: "Skipped",
    cancelled: "Cancelled",
};

export function renderShell() {
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Orchestration dashboard</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--background-color-default, #ffffff);
    color: var(--text-color-default, #1f2328);
    font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
    font-size: var(--text-body-medium, 14px);
    line-height: var(--leading-body-medium, 20px);
    display: flex;
    height: 100vh;
    overflow: hidden;
  }
  #runs {
    width: 280px;
    flex: none;
    border-right: 1px solid var(--border-color-default, #d0d7de);
    overflow-y: auto;
    padding: 8px;
  }
  #detail {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
  }
  h1 {
    font-size: var(--text-title-medium, 18px);
    font-weight: var(--font-weight-semibold, 600);
    margin: 4px 8px 12px;
  }
  .run-item {
    display: block;
    width: 100%;
    text-align: left;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    padding: 8px 10px;
    margin-bottom: 4px;
    cursor: pointer;
    color: inherit;
    font: inherit;
  }
  .run-item:hover { background: var(--background-color-muted, rgba(127,127,127,0.08)); }
  .run-item.selected {
    border-color: var(--color-focus-outline, #0969da);
    background: var(--background-color-muted, rgba(127,127,127,0.08));
  }
  .run-item .title { font-weight: var(--font-weight-semibold, 600); display: block; margin-bottom: 2px; }
  .run-item .meta { font-size: 12px; color: var(--text-color-muted, #59636e); }
  .badge {
    display: inline-block;
    padding: 1px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: var(--font-weight-semibold, 600);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  .badge.pending { background: rgba(127,127,127,0.18); color: var(--text-color-muted, #59636e); }
  .badge.in_progress { background: rgba(9,105,218,0.15); color: var(--true-color-blue, #0969da); }
  .badge.done { background: rgba(31,136,61,0.15); color: #1f883d; }
  .badge.blocked, .badge.cancelled { background: rgba(207,34,46,0.15); color: var(--true-color-red, #cf222e); }
  .badge.skipped { background: rgba(127,127,127,0.1); color: var(--text-color-muted, #59636e); }
  .stage {
    border-left: 3px solid var(--border-color-default, #d0d7de);
    padding: 6px 0 6px 14px;
    margin-bottom: 4px;
    position: relative;
  }
  .stage.in_progress { border-left-color: var(--true-color-blue, #0969da); }
  .stage.done { border-left-color: #1f883d; }
  .stage.blocked { border-left-color: var(--true-color-red, #cf222e); }
  .stage-head { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .stage-name { font-weight: var(--font-weight-semibold, 600); }
  .stage-agents { font-size: 12px; color: var(--text-color-muted, #59636e); margin-bottom: 4px; }
  .stage-output {
    white-space: pre-wrap;
    font-family: var(--font-mono, "SFMono-Regular", Consolas, monospace);
    font-size: var(--text-code-inline, 12px);
    background: var(--background-color-muted, rgba(127,127,127,0.06));
    border-radius: 6px;
    padding: 8px 10px;
    margin-top: 4px;
  }
  .empty { color: var(--text-color-muted, #59636e); padding: 24px; text-align: center; }
  .summary { margin-top: 16px; padding: 10px 12px; border-radius: 6px; background: var(--background-color-muted, rgba(127,127,127,0.06)); }
  .header-row { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
  .header-actions { display: flex; align-items: center; gap: 8px; }
  .subtitle { color: var(--text-color-muted, #59636e); font-size: 12px; margin: 0 0 16px; }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid var(--border-color-default, #d0d7de);
    background: var(--background-color-default, #ffffff);
    color: var(--text-color-default, #1f2328);
    font-size: 12px;
    font-weight: var(--font-weight-semibold, 600);
    text-decoration: none;
    cursor: pointer;
  }
  .btn:hover { background: var(--background-color-muted, rgba(127,127,127,0.08)); }
  .insight { margin-top: 20px; }
  .insight h2 { font-size: var(--text-body-large, 15px); margin: 0 0 8px; }
  .insight-stats { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 10px; }
  .insight-stat { font-size: 12px; color: var(--text-color-muted, #59636e); }
  .insight-stat strong { display: block; font-size: 16px; color: var(--text-color-default, #1f2328); font-weight: var(--font-weight-semibold, 600); }
  .bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 12px; }
  .bar-label { width: 110px; flex: none; color: var(--text-color-muted, #59636e); }
  .bar-track { flex: 1; background: var(--background-color-muted, rgba(127,127,127,0.08)); border-radius: 4px; overflow: hidden; height: 10px; }
  .bar-fill { height: 100%; background: var(--true-color-blue, #0969da); border-radius: 4px; }
  .bar-value { width: 70px; flex: none; text-align: right; color: var(--text-color-muted, #59636e); }
</style>
</head>
<body>
  <div id="runs"><h1>Orchestrations</h1><div id="run-list"></div></div>
  <div id="detail"><div class="empty">Select a run to see progress and output.</div></div>
  <script>
    const STATUS_LABEL = ${JSON.stringify(STATUS_LABEL)};
    let runs = [];
    let selectedId = null;

    function esc(s) {
      return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    function badge(status) {
      const s = status || "pending";
      return '<span class="badge ' + esc(s) + '">' + esc(STATUS_LABEL[s] || s) + '</span>';
    }

    function renderRunList() {
      const el = document.getElementById("run-list");
      if (!runs.length) {
        el.innerHTML = '<div class="empty">No orchestrations recorded yet.</div>';
        return;
      }
      el.innerHTML = runs.map((r) => (
        '<button class="run-item ' + (r.id === selectedId ? "selected" : "") + '" data-id="' + esc(r.id) + '">' +
          '<span class="title">' + esc(r.title) + '</span>' +
          '<span class="meta">' + esc(r.skillId) + ' &middot; ' + badge(r.status) + '</span>' +
        '</button>'
      )).join("");
      el.querySelectorAll(".run-item").forEach((btn) => {
        btn.addEventListener("click", () => selectRun(btn.dataset.id));
      });
    }

    function fmtDuration(ms) {
      if (ms === null || ms === undefined) return "n/a";
      const totalSec = Math.round(ms / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return m > 0 ? (m + "m " + s + "s") : (s + "s");
    }

    function renderInsight(run) {
      const insight = run.insightSummary;
      if (!insight || !insight.totalCalls) return "";
      const categories = Object.entries(insight.byCategory || {}).sort((a, b) => b[1] - a[1]);
      const maxMs = Math.max(insight.thinkingMs || 0, ...categories.map((c) => c[1]), 1);
      const bars = categories.map(([category, ms]) => (
        '<div class="bar-row"><span class="bar-label">' + esc(category) + '</span>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + Math.round((ms / maxMs) * 100) + '%"></div></div>' +
          '<span class="bar-value">' + fmtDuration(ms) + '</span></div>'
      )).join("");
      const thinkingBar = insight.thinkingMs !== null ? (
        '<div class="bar-row"><span class="bar-label">Thinking (est.)</span>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + Math.round((insight.thinkingMs / maxMs) * 100) + '%;background:var(--text-color-muted,#59636e);"></div></div>' +
          '<span class="bar-value">' + fmtDuration(insight.thinkingMs) + '</span></div>'
      ) : "";
      return (
        '<div class="insight"><h2>Insight</h2>' +
        '<div class="insight-stats">' +
          '<div class="insight-stat"><strong>' + insight.totalCalls + '</strong>tool calls</div>' +
          '<div class="insight-stat"><strong>' + fmtDuration(insight.elapsedMs) + '</strong>elapsed</div>' +
          '<div class="insight-stat"><strong>' + fmtDuration(insight.totalToolMs) + '</strong>tool time</div>' +
        '</div>' +
        thinkingBar + bars +
        '</div>'
      );
    }

    function renderDetail(run) {
      const el = document.getElementById("detail");
      if (!run) {
        el.innerHTML = '<div class="empty">Select a run to see progress and output.</div>';
        return;
      }
      const stages = (run.stages || []).map((s) => (
        '<div class="stage ' + esc(s.status) + '">' +
          '<div class="stage-head"><span class="stage-name">' + esc(s.name) + '</span>' + badge(s.status) + '</div>' +
          (s.agents && s.agents.length ? '<div class="stage-agents">Agents: ' + esc(s.agents.join(", ")) + '</div>' : "") +
          (s.output ? '<div class="stage-output">' + esc(s.output) + '</div>' : "") +
        '</div>'
      )).join("");
      el.innerHTML =
        '<div class="header-row"><h1 style="margin:0;">' + esc(run.title) + '</h1>' +
          '<div class="header-actions">' + badge(run.status) +
            '<a class="btn" href="/api/runs/' + esc(run.id) + '/report" download>Download report</a>' +
          '</div>' +
        '</div>' +
        '<p class="subtitle">' + esc(run.skillId) + ' &middot; started ' + esc(new Date(run.startedAt).toLocaleString()) +
          (run.updatedAt ? ' &middot; updated ' + esc(new Date(run.updatedAt).toLocaleString()) : "") + '</p>' +
        stages +
        (run.summary ? '<div class="summary"><strong>Summary:</strong><br/>' + esc(run.summary) + '</div>' : "") +
        renderInsight(run);
    }

    async function selectRun(id) {
      selectedId = id;
      renderRunList();
      const res = await fetch("/api/runs/" + encodeURIComponent(id));
      if (res.ok) renderDetail(await res.json());
    }

    async function refresh() {
      const res = await fetch("/api/runs");
      runs = await res.json();
      if (!selectedId && runs.length) selectedId = runs[0].id;
      renderRunList();
      if (selectedId) {
        const found = runs.find((r) => r.id === selectedId);
        if (found) {
          const res2 = await fetch("/api/runs/" + encodeURIComponent(selectedId));
          if (res2.ok) renderDetail(await res2.json());
        } else {
          renderDetail(null);
        }
      }
    }

    refresh();
    const events = new EventSource("/events");
    events.addEventListener("update", refresh);
  </script>
</body>
</html>`;
}
