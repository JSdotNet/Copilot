# claude-desktop

Orchestration workflows and scheduled automation, with a live run dashboard, Mermaid diagram
viewer and Markdown document viewer served by its own MCP server.

This is the Claude counterpart of [`copilot-app`](../copilot-app/README.md). Every other
plugin in this repository is authored once and read by both hosts (see
[Claude Code compatibility](../../docs/copilot/claude-code-compatibility.md)); `copilot-app`
is the exception, because it is built on the Copilot CLI canvas extension API. This plugin is
that rewrite.

It ships in two forms, from one implementation:

- **A Claude Desktop extension** (`.mcpb`) — one-click install, and the dashboard renders
  **inline in the conversation** as an MCP App. This is the primary target, and the closest
  thing to the Copilot canvas.
- **A Claude Code plugin** — the same MCP server plus the `orch-*` skills, the orchestrator
  agent and the telemetry hooks, with the dashboard in a browser tab.

Build the extension with `pwsh ./scripts/Build-DesktopExtension.ps1`; see
[the server README](mcp/orch-dashboard/README.md) for both install paths and for what works
in which host.

## Purpose

1. **Orchestrate repository and project setup** with guided, staged workflows
2. **Drive implementation workflows** for features, bugs, modules, services, and package
   updates
3. **Coordinate documentation workflows** for architecture, arc42, ADRs, TDRs, and
   blueprints
4. **Track progress visually** through a live dashboard, diagram viewer, and document viewer

Each orchestration skill coordinates specialist agents from other plugins where useful.
Internal transitions do not require separate user approval; orchestrations continue through
build, test, and QA and stop at Personal Validation before pull requests. Cross-plugin
agents are recommended but not required — skills degrade gracefully when optional plugins
are missing.

## What Replaced the Canvas

The Copilot version shipped three canvas extensions. All three are replaced by **one MCP
server** with two rendering surfaces: `ui://` resources for hosts that implement MCP Apps
(Claude Desktop, Claude web), and a local HTTP page for everything else.

| Copilot CLI | claude-desktop |
| --- | --- |
| `orch-dashboard` canvas panel | `open_dashboard` → an MCP App panel, or a page on `127.0.0.1` |
| `diagram-canvas` (`mermaid-diagram`) | `render_diagram` → `ui://orch-dashboard/diagram.html` |
| `markdown-canvas` (`markdown-preview`) | `render_markdown` → `ui://orch-dashboard/document.html` |
| canvas actions | MCP tools with the same names and arguments |
| host session telemetry events | Claude Code hooks + the session transcript |

The run model, the rendering, the reports and the insight aggregation are the **same code**
as the Copilot extension: `render.mjs` and `report.mjs` are byte-identical, and `store.mjs`
and `insight.mjs` differ only in comments and in the tool names the category table matches.
Only the transport and the telemetry source are genuinely host-specific.

The three pages are byte-identical to the canvas versions even on the App surface: an
injected bridge (`mcp/orch-dashboard/app-bridge.js`) adapts `fetch` and `EventSource` to
`tools/call` rather than the pages being rewritten.

Practical consequences:

- In Claude Desktop the dashboard is a panel in the conversation again. In Claude Code it is
  a browser tab: call `open_dashboard` once per session and it updates itself from there.
- Run state lives outside the repository (see **State** in the server README), so it survives
  a restart and never appears in `git status`.
- Insight and Context telemetry is captured by hooks rather than host events. Tool counts,
  categories, durations, sub-agent usage, per-stage token deltas, the context gauge, and
  compaction counts all still work; the two accuracy caveats are documented in the server
  README.

## Includes

### MCP Server

- `mcp/orch-dashboard/` — the run dashboard, diagram viewer, and document viewer, plus the
  telemetry hook. See [its README](mcp/orch-dashboard/README.md) for the full tool contract,
  state layout, and security posture. Registered automatically by this plugin; requires
  Node 18+ on `PATH` and has no npm dependencies.

### Hooks

- `hooks/hooks.json` — a `SessionStart` prompt hook that routes governed task categories to
  the matching `orch-*` skill in every session where the plugin is installed, plus the
  command hooks that feed dashboard telemetry.

### Agent

- `agents/orchestrator.agent.md` — the sequencer, tracker, and gatekeeper. It runs the shared
  phases in order, drives the dashboard, resolves model selection, and enforces the Personal
  Validation gate.

### Skills

- `skills/orch-repo/` — create and configure a new GitHub repository
- `skills/orch-project/` — set up a development project inside an existing repository
- `skills/orch-create-mvp/` — MVP development from planning to local run and monitoring
- `skills/orch-update-packages/` — safe, coordinated dependency updates with local validation
- `skills/orch-aspire-update/` — plan-first Aspire upgrade and new feature adoption
- `skills/orch-architecture/` — general architecture orchestration
- `skills/orch-arc42/` — arc42 documentation orchestration with guideline retrieval
- `skills/orch-blueprint/` — architecture blueprint orchestration with traceability review
- `skills/orch-adr/` — ADR orchestration with guideline and ADR retrieval
- `skills/orch-tdr/` — TDR orchestration with guideline and ADR retrieval
- `skills/orch-feature/` — feature lifecycle with scope discovery and local validation
- `skills/orch-bug/` — bug triage and TDD-based fix workflow
- `skills/orch-structure/` — repository structure/layout refactors
- `skills/orch-create-module/` — create and validate a new module
- `skills/orch-create-service/` — create and wire a new service
- `skills/orch-fallback/` — generic entrypoint for task categories no other `orch-*` skill covers
- `skills/phase-build-test/`, `skills/phase-qa-validation/` — the two heavy shared phases,
  packaged so their procedure is maintained once

#### Pull Request Skills

Everything after the Personal Validation gate the `orch-*` orchestrations stop at.

- `skills/create-pull-request/` — open a PR for the current branch, body grounded in the diff
- `skills/update-pr-branch/` — integrate the base branch and resolve conflicts
- `skills/fix-pr-checks/` — read failing job logs, reproduce, fix, push until green
- `skills/pr-merge-ready/` — sweep your open sessions' PRs and clear their blockers; built
  for `/loop`

| Question | Skill |
| --- | --- |
| The branch is done — open a PR | `create-pull-request` |
| GitHub says the branch has conflicts or is out of date | `update-pr-branch` |
| Checks are red | `fix-pr-checks` |
| Which of my open sessions need what, on a timer | `pr-merge-ready` |
| Reviewers left comments | `pr-remarks-review` (plugin: `review`) |

`pr-merge-ready` is scoped to the open worktree sessions on this machine — it matches each
session branch to its pull request and works inside that session's existing worktree. It never
runs `gh pr checkout`, so it cannot fight the worktree that already holds the branch. Sessions
with no PR yet are reported, not remediated; raising the PR stays a deliberate call via
`create-pull-request`.

#### Developer Skills

- `skills/start/` — start the app from the repository's own startup instruction, then open
  it. Reads `.claude/start.md` (template:
  [`resources/claude-start-template.md`](resources/claude-start-template.md)), falling back
  to `.claude/orch-context.md`, the repository's getting-started docs, and then inference.

#### Automation Skills

- `skills/azure-sre-to-github-issue/` — create GitHub issues from active Azure SRE alerts
- `skills/start-session-from-issue/` — prepare one ready-to-run, plan-first session handoff
  per matching issue
- `skills/automation-bug-fix/` — claim each confirmed open `bug` issue and prepare one
  ready-to-run `orch-bug` handoff for it
- `skills/automation-package-update/` — update outdated NuGet packages and open a PR
- `skills/automation-performance-review/` — find, implement, and PR a performance improvement
- `skills/automation-review/` — full review cycle with optional issue creation
- `skills/automation-week-starter/` — weekly "what's new" digest for configured topics
- `skills/automation-weekly-cost-analysis/` — weekly token/cost report from recorded runs
- `skills/automation-whats-new/` — open and merged pull requests since the last run

## Configuration Layers

Orchestration behavior comes from four layers. Only the first ships with this plugin; the
personal model override lives outside the repository, and the repo-side files are optional.

### 1. Plugin-Global Routing and Soft Enforcement (Automatic)

The `SessionStart` prompt hook tells every session which `orch-*` skill owns which task
category, which specialist agent to fall back to when a skill is unavailable, and that
choosing **not** to use an orchestration for one of those categories must be stated
explicitly with a reason. Enforcement is deliberately **soft**: there is no blocking
`PreToolUse` hook. A repository may ship its own `orch-*` skills under `.claude/skills/`, and
those take precedence for the categories they cover.

### 2. Personal Global Model Override (Optional)

A user may override orchestration model choice outside every repository. The orchestrator
first checks `CLAUDE_ORCH_MODEL_SELECTION_PATH`; when unset, it checks the default
user-global file:

| OS | Default path |
| --- | --- |
| Windows | `%USERPROFILE%\.claude\orchestration\model-selection.md` |
| macOS/Linux | `~/.claude/orchestration/model-selection.md` |

Categories, defaults, and the resolution order are defined in
`instructions/orch-model-selection.instructions.md`.

### 3. Team Repo Model Override — `.claude/model-selection.md`

A repository may override the model chosen for any orchestration category, using the same
`Category` / `Model` table.

### 4. Per-Repo Startup and QA Context — `.claude/orch-context.md`

A repository may declare how its application starts and how it should be validated, so the
QA phase stops guessing the AppHost or interrupting the run to ask. The convention is defined
in `instructions/orch-repo-context.instructions.md`, with a starting point at
[`resources/claude-orch-context-template.md`](resources/claude-orch-context-template.md).
A repository with nothing to start declares `**Runnable application:** none`, and QA
Validation is then marked `skipped` cleanly. The file must never contain secrets and never
pins a model.

### 5. Per-Repo Interactive Startup — `.claude/start.md`

A repository may declare the developer-facing start: the command and the URL to open, plus
optional sign-in, area map, and troubleshooting notes. Read only by the `start` skill, which
falls back to `.claude/orch-context.md` for anything it omits. Never contains a secret.

MCP servers stay repository-specific: this plugin routes work to them but does not own or
configure them.

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
/plugin marketplace add JSdotNet/Copilot
```

Then install the plugin:

```bash
/plugin install claude-desktop@jsdotnet-copilot
```

The skills, the agent, the hooks, and the MCP server are all registered by the install. Ask
for an orchestration (`Run orch-feature for …`) and the orchestrator opens the dashboard and
hands you its URL.

## Verify Installation

- In Claude Desktop: asking for the dashboard renders a panel inline in the conversation
- In Claude Code: `orch-*` skills appear in the skill list and are suggested for the governed
  categories, and `mcp__plugin_claude-desktop_orch-dashboard__open_dashboard` returns a
  `http://127.0.0.1:<port>/`
  URL whose page shows the run list and updates without a refresh

## Dependencies

Works best with these plugins from the same marketplace installed:

- `architecture` — architecture guidance
- `csharp-coding` — code implementation with TDD
- `product-owner` — user stories and backlog management
- `review` — reusable review skills
- `qa` — runtime QA validation (Aspire + Playwright)

## MCP Server Routing

The orchestration skills are optimized for these servers when enabled:

| MCP server | Primary use in orchestrations |
|------------|-------------------------------|
| `jsdotnet-guidelines-mcpserver` | Repository conventions, governed asset guidance, instructions, templates, architecture/documentation constraints |
| `jsdotnet-design-mcpserver` | UX-specific design work; reserve it for orchestrations that explicitly include UX design |
| `microsoft-learn` | Official Microsoft/.NET/Azure/Aspire documentation during implementation and upgrades |
| `playwright` | Browser-based QA validation and smoke/E2E execution |

Use the narrowest server needed for the current phase rather than querying all four.

## Workflow Coordination Model

Each orchestration follows a staged workflow tailored to its scenario:

1. **Intake and alignment stages** — establish or align to specification, architecture,
   constraints, and validation targets; missing inputs are derived here, not treated as a
   reason to stop
2. **Implementation stage** — every code-modifying orchestration has an explicit one
3. **Validation stages** — unit, integration, and local runtime validation with recorded
   outcomes
4. **Quality stage** — review readiness and blocker resolution
5. **Personal Validation stage** — the user reviews and explicitly approves before any PR
6. **Create Pull Request stage** — separate, and never opened before approval
7. **GitHub Issue Update stage** — comments the result and QA report on the originating issue
8. **Summary stage** — emitted once the PR and any issue update are complete

The shared phases are defined once in
[`instructions/orch-shared-phases.instructions.md`](instructions/orch-shared-phases.instructions.md);
the workflow diagrams live in
[`resources/orchestration-flow-diagrams.md`](resources/orchestration-flow-diagrams.md).

## Relationship to `copilot-app`

The two plugins are deliberate siblings: same skills, same stage names, same dashboard
contract, different host. Keep them in step when changing shared behavior — a change to a
stage list, a phase definition, or a dashboard tool argument usually belongs in both. The
files that must differ are the manifest, the hooks, the dashboard transport, and any wording
that names a host capability.

## Uninstall

```bash
/plugin uninstall claude-desktop@jsdotnet-copilot
```

## License

UNLICENSED

## Author

Job Schepers
