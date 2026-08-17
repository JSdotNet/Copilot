# copilot-app

Installable GitHub Copilot App plugin for orchestration workflows and automation with
canvas-based interfaces.

## Purpose

This plugin provides specialized skills for GitHub Copilot App users who need to:

1. **Orchestrate repository and project setup** with guided, staged workflows
2. **Drive implementation workflows** for features, bugs, modules, services, and package
   updates
3. **Coordinate documentation workflows** for architecture, arc42, ADRs, TDRs, and
   blueprints
4. **Track progress visually** through shared dashboard and content-preview canvases

Each orchestration skill coordinates specialist agents from other plugins where useful.
Internal transitions do not require separate user approval; orchestrations continue through
build, test, and QA and stop at Personal Validation before pull requests. Cross-plugin
agents are recommended but not required — skills degrade gracefully when optional plugins are missing.

Code-modifying orchestrations assume the specification and architecture work is already
done. They are intended to be triggered from the results of documentation and
specification orchestrations, and they focus on intake, implementation, validation, and
review rather than restarting broad discovery.

## Includes

### Session Hook

- `hooks.json` - `sessionStart` prompt hook that routes governed task categories to the
  matching `orch-*` skill in every session of every project where the plugin is installed.
  See **Configuration Layers** below.

### Skills

- `skills/orch-repo/SKILL.md` - Create and configure a new GitHub repository (branch protection, CI/CD, templates)
- `skills/orch-project/SKILL.md` - Set up development project inside an existing repository (`.github/`, guidelines, Aspire scaffolding)
- `skills/orch-create-mvp/SKILL.md` - MVP development from planning to local run and monitoring (canvas)
- `skills/orch-update-packages/SKILL.md` - Safe, coordinated dependency updates with local validation (canvas)
- `skills/orch-aspire-update/SKILL.md` - Plan-first Aspire upgrade and new feature adoption (canvas)
- `skills/orch-architecture/SKILL.md` - General architecture orchestration with the architect agent (canvas)
- `skills/orch-arc42/SKILL.md` - arc42 documentation orchestration with guideline retrieval (canvas)
- `skills/orch-blueprint/SKILL.md` - Architecture blueprint orchestration with traceability review (canvas)
- `skills/orch-adr/SKILL.md` - ADR orchestration with guideline and ADR retrieval (canvas)
- `skills/orch-tdr/SKILL.md` - TDR orchestration with guideline and ADR retrieval (canvas)
- `skills/orch-feature/SKILL.md` - Feature development lifecycle management with scope discovery and local validation (canvas)
- `skills/orch-bug/SKILL.md` - Bug triage and TDD-based fix workflow with scope discovery and local monitoring (canvas)
- `skills/orch-structure/SKILL.md` - Existing repository structure/layout refactors, folder moves, project/solution organization fixes, and test/harness placement changes (canvas)
- `skills/orch-create-module/SKILL.md` - Create and validate a new module in an existing project (canvas)
- `skills/orch-create-service/SKILL.md` - Create and wire a new service in an existing project (canvas)
- `skills/orch-fallback/SKILL.md` - Generic entrypoint for task categories no other `orch-*` skill covers (canvas)

#### Automation Skills

Scheduled / batch automation workflows (formerly the standalone `automations`
plugin). Each reports progress through the `orch-dashboard` canvas extension.

- `skills/azure-sre-to-github-issue/SKILL.md` - Create GitHub issues from active Azure SRE alerts
- `skills/start-session-from-issue/SKILL.md` - Start a Copilot session per matching GitHub issue in plan mode
- `skills/update-open-sessions/SKILL.md` - Rebase or merge all open sessions onto the latest source branch
- `skills/automation-bug-fix/SKILL.md` - Start one `orch-bug` session per confirmed open `bug` issue
- `skills/automation-package-update/SKILL.md` - Update all outdated NuGet packages and open a PR
- `skills/automation-performance-review/SKILL.md` - Identify performance improvements, implement the best one, open a PR
- `skills/automation-review/SKILL.md` - Full review cycle (TODOs, suggestions, code review) with optional issue creation
- `skills/automation-week-starter/SKILL.md` - Produce a weekly "what's new" digest for configured topics
- `skills/automation-weekly-cost-analysis/SKILL.md` - Produce a weekly Chronicle cost report
- `skills/automation-whats-new/SKILL.md` - Report open and merged pull requests across repos since the last run

### Canvas Extensions

- `extensions/orch-dashboard/` - Live progress and output dashboard for all `orch-*` and automation skills. See `extensions/orch-dashboard/README.md` for the canvas action contract and install instructions.
- `extensions/diagram-canvas/` - Mermaid diagram viewer canvas (`mermaid-diagram`), opened by `orch-*` skills on behalf of the `architecture`, `domain-design`, and `ux-design` agents they coordinate — those plugins have no direct dependency on it. Installs and runs independently of `copilot-app` — see `extensions/diagram-canvas/README.md`.
- `extensions/markdown-canvas/` - Markdown document preview canvas (`markdown-preview`), opened by `orch-*` skills on behalf of the `architecture`, `domain-design`, `ux-design`, `documentation`, and `product-owner` agents they coordinate — those plugins have no direct dependency on it. Installs and runs independently of `copilot-app` — see `extensions/markdown-canvas/README.md`.

## Configuration Layers

Orchestration behavior comes from five layers. Only the first is shipped by this plugin; the
personal model override lives outside the repository, and all repo-side files are optional.

### 1. Plugin-Global Routing and Soft Enforcement (Automatic)

`hooks.json` registers a `sessionStart` prompt hook, so every session in every project that
has this plugin installed is told which `orch-*` skill owns which task category, which
specialist agent to fall back to when a skill is unavailable, and that choosing **not** to
use an orchestration for one of those categories must be stated explicitly with a reason.

Enforcement is deliberately **soft**: there is no blocking `preToolUse` hook. A consuming
repository therefore does not need to hand-write its own routing instruction file. The
plugin's `orch-*` list is a baseline, not an exhaustive catalog — a repository may ship its
own `orch-*` skills under `.github/skills/`, and those take precedence for the task
categories they cover.

### 2. Personal Global Model Override (Optional)

A user may override orchestration model choice outside every repository, so personal cost,
speed, or provider preferences are not committed as team instructions. The orchestrator first
checks `COPILOT_ORCH_MODEL_SELECTION_PATH`. When it is unset, it checks the default
user-global file path for the current OS:

| OS | Default path |
| --- | --- |
| Windows | `%APPDATA%\GitHub Copilot\orchestration\model-selection.md` |
| macOS/Linux | `~/.config/github-copilot/orchestration/model-selection.md` |

The file uses the same `Category` / `Model` Markdown table as the team repo override below.
Do not use repo-local personal files such as `.github/copilot-model-selection.local.md`;
personal configuration belongs outside the repo.

### 3. Team Repo Model Override — `.github/copilot-model-selection.md`

A repository may override the model chosen for any orchestration category. Categories,
defaults, and the resolution order (current run instruction → personal global override →
team repo override → category family/tier → `auto`) are defined in
`instructions/orch-model-selection.instructions.md`. The orchestrator reads the personal and
team files once per run.

### 4. Per-Repo Startup and QA Context — `.github/copilot-orch-context.md`

A repository may declare how its application starts and how it should be validated, so the
QA phase stops guessing the AppHost or interrupting the run to ask. The convention is defined
in `instructions/orch-repo-context.instructions.md`, with a copy-paste starting point at
[`resources/copilot-orch-context-template.md`](resources/copilot-orch-context-template.md).

Sections: `## Application`, `## How to Run`, `## Base URLs`, `## Test Credentials`,
`## MCP Servers`, `## Healthy Startup`, `## QA Depth`, and the optional
`## Repo-Native Orchestration Skills`. A repository with nothing to start declares
`**Runnable application:** none`, and QA Validation is then marked `skipped` cleanly. The
file must never contain secrets and never pins a model.

### 5. MCP Servers Stay Repository-Specific

This plugin routes work to MCP servers (see **MCP Server Routing** below) but does not own
or configure them. The repository's own `.mcp.json` and instruction files remain the source
of truth; the `## MCP Servers` section of the context file is informational only.

> **Plugin changes require a reinstall.** Hook, skill, agent, and instruction changes take
> effect only after the plugin is reinstalled or updated from GitHub — run
> `copilot plugin install <owner>/<repo>:plugins/copilot-app`, or use
> `scripts/install-or-update-plugins.ps1` in this repository.

## Install

```bash
copilot plugin install <owner>/<repo>:plugins/copilot-app
copilot plugin list
```

The plugin's skills are ready to use once installed. All three canvas extensions are
separate opt-in steps (canvas extensions are not installed by the plugin
mechanism itself, and each has its own install method):

- `orch-dashboard`: install with the `install_extension` tool using
  a repo folder URL such as
  `https://github.com/<owner>/<repo>/tree/<ref>/plugins/copilot-app/extensions/orch-dashboard`,
  choosing `project`, `user`, or `session` scope. See
  `extensions/orch-dashboard/README.md` for details. Copilot App orchestration
  agents should use the full provider ID `plugin:copilot-app:orch-dashboard`;
  if duplicate `orch-dashboard` providers are reported, remove stale user-scope
  copies from `%USERPROFILE%\.copilot\extensions` after confirming they are not needed.
- `diagram-canvas` and `markdown-canvas`: each has its own `.github/plugin/plugin.json`, so
  install them the same way as any plugin, independently of each other:
  `copilot plugin install <owner>/<repo>:plugins/copilot-app/extensions/diagram-canvas`
  and
  `copilot plugin install <owner>/<repo>:plugins/copilot-app/extensions/markdown-canvas`.
  See `extensions/diagram-canvas/README.md` and `extensions/markdown-canvas/README.md` for
  details.

## Verify Installation

After installation, the plugin skills should appear in GitHub Copilot App:

- In the command palette: `orch-repo`, `orch-project`, `orch-create-mvp`, `orch-update-packages`, `orch-aspire-update`, `orch-architecture`, `orch-arc42`, `orch-blueprint`, `orch-adr`, `orch-tdr`, `orch-feature`, `orch-bug`, `orch-structure`, `orch-create-module`, `orch-create-service`, `orch-fallback`
- In skill suggestions when relevant
- Canvas panels open for each orchestration skill
- Integration buttons to switch to `csharp-coding:coding` agent

## Key Features

- **Canvas Interfaces** - Interactive orchestration progress/output dashboard (`extensions/orch-dashboard/`) driven by every `orch-*` skill, plus live Mermaid diagram (`extensions/diagram-canvas/`) and Markdown document preview (`extensions/markdown-canvas/`) canvases that `orch-*` skills open on behalf of the architecture/domain-design/ux-design/documentation/product-owner agents they coordinate — those content plugins are unaware of and do not depend on either canvas extension
- **TDD Bug Fixes** - Solve bugs by creating tests first with csharp-coding agent
- **Aspire Integration** - Project setup includes .NET Aspire AppHost scaffolding
- **MCP-Aware Orchestration** - Routes standards and governed-asset checks through `jsdotnet-guidelines-mcpserver`, official Microsoft stack lookups through `microsoft-learn`, browser QA automation through `playwright`, and reserves `jsdotnet-design-mcpserver` for UX-specific flows
- **Local-First Validation** - Workflows focus on local run, health checks, and monitoring
- **Personal Validation Gate** - Runs continue through validation and pause for user approval before PR work

## Dependencies

This plugin works best with the following installed plugins:

- `architecture` - For architecture guidance
- `csharp-coding` - For code implementation with TDD
- `product-owner` - For user stories and backlog management
- `qa` - For runtime QA validation (Aspire + Playwright), used in the Local Run &
  Monitoring / E2E validation stage of `orch-feature`, `orch-bug`,
  `orch-update-packages`, `orch-structure`, `orch-create-module`, `orch-create-service`,
  `orch-create-mvp`, `orch-project`, and `orch-aspire-update`

Install recommended plugins:

```bash
copilot plugin install <owner>/<repo>:plugins/architecture
copilot plugin install <owner>/<repo>:plugins/csharp-coding
copilot plugin install <owner>/<repo>:plugins/product-owner
copilot plugin install <owner>/<repo>:plugins/review
copilot plugin install <owner>/<repo>:plugins/qa
```

## MCP Server Routing

The orchestration skills are optimized for these four MCP servers when they are enabled:

| MCP server | Primary use in orchestrations |
|------------|-------------------------------|
| `jsdotnet-guidelines-mcpserver` | Repository conventions, governed asset guidance, Copilot instructions, issue/PR templates, architecture/documentation constraints, and implementation context |
| `jsdotnet-design-mcpserver` | UX-specific design work such as wireframes, user flows, and design artifacts; reserve it for orchestrations that explicitly include UX design |
| `microsoft-learn` | Official Microsoft/.NET/Azure/Aspire documentation and code samples during implementation, upgrades, package analysis, and targeted build remediation |
| `playwright` | Browser-based QA validation and smoke/E2E execution; capture screenshot/video evidence only for new functionality or when explicitly requested |

Use the narrowest server needed for the current phase rather than querying all four by
default.

## Usage Examples

### Orchestrate Repository Setup

```
Invoke: orch-repo
- Name: "MyAwesomeAPI"
- Description: "ASP.NET Core REST API for order management"
- Visibility: private
- Branch protection: require 1 review, require CI to pass
- CI: build + test on PR, release on tag push
```

### Orchestrate Project Setup

```
Invoke: orch-project
- Repository: "MyAwesomeAPI" (already exists and is configured)
- Setup `.github` folder with repository guidance
- Create Aspire AppHost for distributed services
- Validate compilation and local run monitoring
```

### Orchestrate MVP Creation

```
Invoke: orch-create-mvp
- Project: "PaymentService"
- Core features: Payments, webhooks, reporting
- Timeline: 4 weeks
- Runtime target: Local run + monitoring
```

### Orchestrate Package Updates

```
Invoke: orch-update-packages
- Project: "CoreLibrary"
- Update types: Security, critical patches
- Testing: Full integration suite
- Runtime target: Local run + monitoring
```

### Orchestrate Aspire Update

```
Invoke: orch-aspire-update
- Project: "Orders.Platform"
- Current Aspire: 9.x
- Target Aspire: latest supported
- Refine update plan before implementation
- Enable selected new Aspire features after upgrade
- Record local validation evidence and summary
```

### Orchestrate General Architecture Work

```text
Invoke: orch-architecture
- Goal: evaluate and document the architecture impact of a plugin boundary change
- Scope: "architecture and copilot-app plugins"
- Output: proposal with risks, trade-offs, and recommended follow-up artifacts
```

### Orchestrate arc42 Documentation

```text
Invoke: orch-arc42
- System: "Copilot plugin monorepo"
- Sections: 1, 3, and 9
- Goal: refresh architecture documentation before plugin restructuring
- Use `jsdotnet-guidelines-mcpserver` before governed asset edits
```

### Orchestrate Architecture Blueprint

```text
Invoke: orch-blueprint
- System: "Copilot App plugin ecosystem"
- Goal: refresh component boundaries and traceability
- Use `jsdotnet-guidelines-mcpserver` before governed asset edits
```

### Orchestrate ADR

```text
Invoke: orch-adr
- Decision: "Should architecture orchestration own MCP guideline retrieval?"
- Scope: "Architecture and copilot-app plugins"
- Goal: capture decision, trade-offs, and follow-up
```

### Orchestrate TDR

```text
Invoke: orch-tdr
- Debt: "Architecture guidance retrieval is inconsistent across plugin workflows"
- Scope: "copilot-app orchestration skills"
- Goal: capture remediation path and related decisions
```

### Orchestrate Feature Development

```
Invoke: orch-feature
- Feature: "Role-Based Access Control"
- Epic: "Security & Authorization"
- Target: Next sprint
- Runtime target: Local run + monitoring
```

### Orchestrate Bug Fix (with TDD)

```
Invoke: orch-bug
- Bug: "Login fails with special characters"
- Severity: High
- Root cause: Input sanitization missing
- Approach: Create failing test first, then implement fix
- Runtime target: Local run + monitoring
```

### Orchestrate Structure Refactor

```text
Invoke: orch-structure
- Change: "Fix folder structure. harness should be below src"
- Validation: "Solution references and structure tests still pass"
```

### Orchestrate Module Creation

```
Invoke: orch-create-module
- Project: "Billing.Core"
- Module: "InvoiceRules"
- Scope: Domain logic + tests
- Runtime target: Local run + monitoring
```

### Orchestrate New Service

```
Invoke: orch-create-service
- Project: "Orders.Platform"
- Service: "NotificationService"
- Integration: AppHost + service discovery + health checks
- Runtime target: Local run + monitoring
```

## Integration Architecture

```
GitHub Copilot App
    ↓
copilot-app plugin
    └── orch-* skills (with canvas interfaces)
        ├── ↔ architecture plugin (architect agent)
        ├── ↔ jsdotnet-guidelines-mcpserver
        ├── ↔ jsdotnet-design-mcpserver (UX-specific flows only)
        ├── ↔ microsoft-learn
        ├── ↔ playwright
        ├── ↔ csharp-coding plugin (coding agent for implementation)
        ├── ↔ product-owner plugin (product-owner agent)
        └── ↔ qa plugin (qa, qa-monitor, and aspire/aspire-run used in Local Run & Monitoring / E2E validation stages)
```

## Workflow Coordination Model

Each orchestration skill follows a staged workflow tailored to the scenario (project setup, MVP, feature, package updates, bug fix, module creation, or service creation):

1. **Intake and alignment stages** - Establish or align to specification, architecture, constraints, and validation targets; missing inputs are derived here, not treated as a reason to stop
2. **Implementation stage** - Every code-modifying orchestration includes an explicit Implementation phase; it can appear after intake/planning stages instead of always being first
3. **Validation stages** - Unit, integration, and local runtime validation with recorded outcomes
4. **Quality stage** - Review readiness and blocker resolution
5. **Personal Validation stage** - The user reviews the result and explicitly approves before any pull request is created
6. **Create Pull Request stage** - A separate stage after personal validation; all PR-time changes belong here and the pull request is never opened before approval
7. **GitHub Issue Update stage** - When a session was started from a GitHub issue, comments on that issue with the captured result and QA report; otherwise skipped with a reason
8. **Summary stage** - Emitted once the pull request and any applicable issue update are complete (or the run concludes without one)

Agent selection per stage is recommended based on task context. Internal orchestration
transitions proceed without separate approval until the Personal Validation gate.

## Orchestration Flow Diagrams

To keep individual `SKILL.md` files focused on execution guidance, the workflow diagrams
live in one central document: [`resources/orchestration-flow-diagrams.md`](resources/orchestration-flow-diagrams.md).

| Skill | Workflow diagram |
|-------|------------------|
| `orch-repo` | [`resources/orchestration-flow-diagrams.md#orch-repo`](resources/orchestration-flow-diagrams.md#orch-repo) |
| `orch-project` | [`resources/orchestration-flow-diagrams.md#orch-project`](resources/orchestration-flow-diagrams.md#orch-project) |
| `orch-create-mvp` | [`resources/orchestration-flow-diagrams.md#orch-create-mvp`](resources/orchestration-flow-diagrams.md#orch-create-mvp) |
| `orch-update-packages` | [`resources/orchestration-flow-diagrams.md#orch-update-packages`](resources/orchestration-flow-diagrams.md#orch-update-packages) |
| `orch-aspire-update` | [`resources/orchestration-flow-diagrams.md#orch-aspire-update`](resources/orchestration-flow-diagrams.md#orch-aspire-update) |
| `orch-architecture` | [`resources/orchestration-flow-diagrams.md#orch-architecture`](resources/orchestration-flow-diagrams.md#orch-architecture) |
| `orch-arc42` | [`resources/orchestration-flow-diagrams.md#orch-arc42`](resources/orchestration-flow-diagrams.md#orch-arc42) |
| `orch-blueprint` | [`resources/orchestration-flow-diagrams.md#orch-blueprint`](resources/orchestration-flow-diagrams.md#orch-blueprint) |
| `orch-adr` | [`resources/orchestration-flow-diagrams.md#orch-adr`](resources/orchestration-flow-diagrams.md#orch-adr) |
| `orch-tdr` | [`resources/orchestration-flow-diagrams.md#orch-tdr`](resources/orchestration-flow-diagrams.md#orch-tdr) |
| `orch-feature` | [`resources/orchestration-flow-diagrams.md#orch-feature`](resources/orchestration-flow-diagrams.md#orch-feature) |
| `orch-bug` | [`resources/orchestration-flow-diagrams.md#orch-bug`](resources/orchestration-flow-diagrams.md#orch-bug) |
| `orch-structure` | [`resources/orchestration-flow-diagrams.md#orch-structure`](resources/orchestration-flow-diagrams.md#orch-structure) |
| `orch-create-module` | [`resources/orchestration-flow-diagrams.md#orch-create-module`](resources/orchestration-flow-diagrams.md#orch-create-module) |
| `orch-create-service` | [`resources/orchestration-flow-diagrams.md#orch-create-service`](resources/orchestration-flow-diagrams.md#orch-create-service) |
| `orch-fallback` | [`resources/orchestration-flow-diagrams.md#orch-fallback`](resources/orchestration-flow-diagrams.md#orch-fallback) |

## Skills Can Use Other Skills

The orchestration skills are designed to coordinate with other plugin skills:

- `orch-repo` creates and configures the repository; `orch-project` scaffolds the development project inside it — use them sequentially
- Documentation/specification orchestrations (`orch-architecture`, `orch-arc42`,
  `orch-blueprint`, `orch-adr`, `orch-tdr`, and future spec-update workflows) are the
  preferred upstream source of implementation context when they have run; the
  code-modifying orchestrations derive that context themselves when they have not
- `orch-project` uses the `aspire` skill for AppHost setup
- `orch-aspire-update` uses `aspire` and `nuget-manager` skills with plan refinement before updates
- `orch-architecture` uses the `architecture:architect` agent directly after MCP-based context gathering
- `orch-arc42` uses `architecture-arc42-generator` after MCP-based context gathering
- `orch-blueprint` uses `architecture-blueprint-generator` after MCP-based context gathering
- `orch-adr` uses `create-architectural-decision-record` after MCP-based context gathering
- `orch-tdr` uses `create-technical-debt-record` after MCP-based context gathering
- `orch-bug` uses TDD approach with `csharp-coding:coding` agent
- `orch-structure` handles existing repository structure/layout refactors and keeps
  `orch-project` focused on initial project scaffolding
- `orch-fallback` is the last resort: it covers task categories no other `orch-*` skill owns
  (tooling, CI, scripting, housekeeping) and recommends a dedicated skill when the category
  recurs. Unmet preconditions on a matching skill are never a reason to use it
- `orch-create-service` can use `aspire` for AppHost wiring
- `orch-feature`, `orch-bug`, `orch-update-packages`, `orch-structure`, `orch-create-module`,
  `orch-create-service`, `orch-create-mvp`, `orch-project`, and `orch-aspire-update`
  use the `qa` plugin's `qa` agent (Playwright validation with evidence) and
  `qa-monitor` agent (continuous Aspire log/trace/metric monitoring) in their
  Local Run & Monitoring / E2E validation stage. Inside the GitHub Copilot App,
  `qa-monitor` can run in a parallel child session (`create_session` + cross-session
  messaging) while `qa` validates in the current session; otherwise the `qa` plugin's
  `delegate-to-qa-monitor` skill provides a portable, same-session fallback.
- All orchestration skills can invoke specialized agents (with user approval) and their associated skills
- All orchestration skills report progress and output through the `orch-dashboard` canvas extension (`extensions/orch-dashboard/`)

## Reinstall After Changes

Changes to this plugin — including `hooks.json`, skills, agents, and instruction files —
take effect only after the plugin is reinstalled or updated from GitHub:

```bash
copilot plugin install <owner>/<repo>:plugins/copilot-app
```

Repository maintainers can update every local plugin at once with
`scripts/install-or-update-plugins.ps1`.

## Uninstall

```bash
copilot plugin uninstall copilot-app
```

## Contributing

Updates to skills should follow:

- [Agent Language and Tone](../.github/instructions/agent-language-and-tone.instructions.md)
- [Customization Structure](../.github/instructions/customization-structure.instructions.md)
- [Markdown Guidelines](../.github/instructions/markdown.instructions.md)

## Support

For issues or questions about this plugin:

1. Check [GitHub Issues](../../issues)
2. Review skill documentation for specific tasks
3. Verify dependent plugins are installed and current

## License

UNLICENSED

## Author

Job Schepers
