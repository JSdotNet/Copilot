# claude-desktop

A Claude Code host plugin: a live run dashboard, Mermaid diagram viewer and Markdown
document viewer served by its own MCP server, plus the three skills that belong to a host
rather than to a delivery engine — `start`, `session-handoff`, and `create-pull-request`.

This is the Claude counterpart of [`copilot-app`](../copilot-app/README.md). Every other
plugin in this repository is authored once and read by both hosts (see
[Claude Code compatibility](../../docs/copilot/claude-code-compatibility.md)); the two host
plugins are the exception, because each is built on its host's own rendering surface.

The orchestration lane this plugin used to carry — the `orch-*` skills, the `phase-*`
skills, the `orchestrator` agent, the rest of the pull-request lane (`push-branch`,
`update-pr-branch`, `fix-pr-checks`, `pr-merge-ready`, `start-session-from-issue`), the
`automation-*` entries, `azure-sre-to-github-issue`, and the `workflow-*` fan-out —
continues as `delivery@jsdotnet`, `delivery-schedule@jsdotnet`, and `fleet@jsdotnet` in
[JSdotNet/ai-agent-stack](https://github.com/JSdotNet/ai-agent-stack): `orch-*` became
`flow-*`, `automation-*` became `schedule-*`, `workflow-*` became `fleet-*`, and the
`orchestrator` agent became `flow-runner`. That engine resolves its run surface from the
live tool list, so the dashboard here serves a `flow-*` run as readily as it served an
`orch-*` one; `delivery-surface-dashboard@jsdotnet` is its host-neutral successor.

It ships in two forms, from one implementation:

- **A Claude Desktop extension** (`.mcpb`) — one-click install, and the dashboard renders
  **inline in the conversation** as an MCP App.
- **A Claude Code plugin** — the same MCP server plus the skills and the telemetry hooks,
  with the dashboard in a browser tab.

Build the extension with `pwsh ./scripts/Build-DesktopExtension.ps1`; see
[the server README](mcp/orch-dashboard/README.md) for both install paths and for what works
in which host.

## Includes

### MCP Server

- `mcp/orch-dashboard/` — the run dashboard, diagram viewer, and document viewer, plus the
  telemetry hook. See [its README](mcp/orch-dashboard/README.md) for the full tool contract,
  state layout, and security posture. Registered automatically by this plugin; requires
  Node 18+ on `PATH` and has no npm dependencies.

  It also names the session: every run's output destination is observed through the telemetry
  hook, and `start_run`/`update_stage` hand back a prefixed `sessionTitle`
  (`domain:<context>`, `arc42`, `tech`, `design`, `backlog`, `code`, or `artifact`) so a list
  of parallel sessions can be scanned by the kind of work each one did. See **Session Naming**
  in the server README for the precedence rules.

### Hooks

- `hooks/hooks.json` — a `SessionStart` command hook that tells every session what this
  plugin provides and how its dashboard tools are addressed, plus the command hooks that feed
  dashboard telemetry.
- `hooks/session-start-context.md` and `hooks/emit-session-context.mjs` — that text and the
  emitter that hands it to Claude as `additionalContext`. A `prompt` hook cannot do this
  job: Claude Code rejects prompt hooks on `SessionStart` and records the refusal as a
  non-blocking error, so the guidance would vanish silently. See
  [Claude Code Compatibility](../../docs/copilot/claude-code-compatibility.md).
- `hooks.json` (plugin root) — a Copilot-only guard. Claude Code ignores a plugin's root
  `hooks.json` and reads `hooks/hooks.json`; Copilot reads the root file and falls back to
  `hooks/` only when it is absent. So this file reaches Copilot alone, where it says the plugin
  is Claude-only and points at `copilot-app` instead. Nothing in it is generated.

### Instructions

- `resources/orch-dashboard-contract.md` — how a run reports to the
  dashboard: stage cadence, `set_run_context`, and how to read the captured context and
  token insight.
- `resources/dashboard-usage.md` — when a run also renders a diagram or a
  document through the server's viewers.

### Skills

- `skills/start/` — start the app from the repository's own startup instruction, then open
  it. Reads `.claude/start.md` (template:
  [`resources/claude-start-template.md`](resources/claude-start-template.md)), falling back
  to `.claude/orch-context.md` (template:
  [`resources/claude-orch-context-template.md`](resources/claude-orch-context-template.md)),
  the repository's getting-started docs, and then inference.
- `skills/session-handoff/` — package this session's state into a brief another session can
  continue from: the same worktree, a new worktree, or a different repository. Writes the
  brief to `~/.claude/handoffs/` (template:
  [`resources/session-handoff-template.md`](resources/session-handoff-template.md)), marks
  the dashboard run handed off when there is one, and hands back the paste-ready first
  message. Run it when the 85% context warning fires, or before a stage known to be
  expensive.
- `skills/create-pull-request/` — open a PR for the current branch, body grounded in the
  diff and the linked issue. The rest of the pull-request lane lives in `delivery@jsdotnet`.

Neither `.claude/start.md` nor `.claude/orch-context.md` may contain a secret or pin a model.

## Install

### Claude Desktop (extension)

Build the bundle, then install it with one click — Claude Desktop ships the Node runtime, so
there is nothing else to set up:

```bash
pwsh ./scripts/Build-DesktopExtension.ps1
```

Double-click `dist/orch-dashboard-<version>.mcpb`, or use Settings → Extensions → Advanced
settings → Install Extension. During installation, set **Project directory** to the git
worktree you want the dashboard to report on; Claude Desktop has no working directory of its
own, and QA evidence paths resolve against that setting.

### Claude Code (plugin)

```bash
/plugin marketplace add JSdotNet/ai-plugins
```

Then install the plugin:

```bash
/plugin install claude-desktop@jsdotnet-ai-plugins
```

The skills, the hooks, and the MCP server are all registered by the install. Ask for the
dashboard, or run a flow whose surface resolves to this server, and it opens and hands you
its URL.

## Verify Installation

- In Claude Desktop: asking for the dashboard renders a panel inline in the conversation
- In Claude Code: `start`, `session-handoff`, and `create-pull-request` appear in the skill
  list, and `mcp__plugin_claude-desktop_orch-dashboard__open_dashboard` returns a
  `http://127.0.0.1:<port>/` URL whose page shows the run list and updates without a refresh

## Relationship to `copilot-app`

The two plugins are deliberate siblings: same dashboard contract, different host and
different rendering surface. The Copilot App version keeps the canvases; this one keeps the
MCP server. A change to a dashboard tool argument usually belongs in both.

## Uninstall

```bash
/plugin uninstall claude-desktop@jsdotnet-ai-plugins
```

## License

UNLICENSED

## Author

Job Schepers
