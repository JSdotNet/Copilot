# Copilot Plugins

## Purpose

Track GitHub Copilot plugins used by this repository so team members can install, update, and audit them consistently.

## Marketplace

- Marketplace: `awesome-copilot`
- Repository config: `.github/copilot-settings.json`

## Installed Plugins

| Plugin | Source | Notes |
| --- | --- | --- |
| `dotnet` | `awesome-copilot` | Installed in local environment (`copilot plugin install dotnet@awesome-copilot`). |
| `awesome-copilot` | `awesome-copilot` | Meta discovery plugin for finding and generating curated Copilot resources. |
| `csharp-dotnet-development` | `awesome-copilot` | C#/.NET development guidance plugin. |
| `testing-automation` | `awesome-copilot` | Testing workflows and automation guidance plugin. |
| `impeccable` | `awesome-copilot` | Frontend design and UI-craft skill (impeccable.style). Used by the `ux-design` plugin when installed. Requires Node 18+ for automation scripts; falls back to design guidance without it. |
| `azure` | `awesome-copilot` | Azure skills and MCP workflows plugin. |
| `azure-cloud-development` | `awesome-copilot` | Azure architecture and IaC development plugin. |
| `project-planning` | `awesome-copilot` | Planning support for epics, feature breakdown, and implementation planning workflows. |
| `software-engineering-team` | `awesome-copilot` | Multi-role engineering plugin covering architecture, implementation, QA, and DevOps workflows. |
| `technical-spike` | `awesome-copilot` | Research and assumption-validation workflows before committing to implementation. |
| `security-best-practices` | `awesome-copilot` | Security, accessibility, performance, and code-quality guardrails. |

## Local Plugin Bundles

| Plugin | Version | Source path | Install | Notes |
| --- | --- | --- | --- | --- |
| `aikido` | `0.1.0` | `plugins/aikido` | `copilot plugin install JSdotNet/Copilot:plugins/aikido` | Aikido Security integration for SAST, secret scanning, finding fixes, posture review, and GitHub issue sync. Requires the Aikido MCP server (`@aikidosec/mcp`). |
| `architecture` | `0.4.0` | `plugins/architecture` | `copilot plugin install JSdotNet/Copilot:plugins/architecture` | Architecture documentation, blueprints, ADRs, technical debt records, and architecture diagrams. |
| `claude-desktop` | `0.4.0` | `plugins/claude-desktop` | `.mcpb` extension (Claude Desktop) or `/plugin install claude-desktop@jsdotnet-copilot` (Claude Code) | Claude sibling of `copilot-app`: the same orchestration and automation skills plus a Claude-only pull request lane (`create-pull-request`, `update-pr-branch`, `fix-pr-checks`, `pr-merge-ready`), with the canvas replaced by an `orch-dashboard` MCP server that renders inline as an MCP App in Claude Desktop (run dashboard, Mermaid viewer, Markdown viewer). Claude-only. |
| `copilot-app` | `0.1.0` | `plugins/copilot-app` | `copilot plugin install JSdotNet/Copilot:plugins/copilot-app` | Copilot App orchestration workflows, pull request handoff, scheduled automation, and canvas progress reporting. |
| `csharp-coding` | `0.1.0` | `plugins/csharp-coding` | `copilot plugin install JSdotNet/Copilot:plugins/csharp-coding` | Focused C# .NET coding, review, optimization, and testing expertise. |
| `development` | `0.2.0` | `plugins/development` | `copilot plugin install JSdotNet/Copilot:plugins/development` | Development planning and implementation workflows for a .NET backend and a React frontend, with repository-detected frontend tooling. |
| `documentation` | `0.3.0` | `plugins/documentation` | `copilot plugin install JSdotNet/Copilot:plugins/documentation` | Documentation, infographic, and profile authoring workflows. |
| `domain-design` | `0.2.0` | `plugins/domain-design` | `copilot plugin install JSdotNet/Copilot:plugins/domain-design` | Domain-Driven Design workflows for contexts, language, models, and context mapping. |
| `fincent` | `0.1.0` | `plugins/fincent` | `copilot plugin install JSdotNet/Copilot:plugins/fincent` | Fincent project story review, development, domain alignment, estimation, PR review, sprint reporting, and demo workflows. |
| `github` | `0.1.0` | `plugins/github` | `copilot plugin install JSdotNet/Copilot:plugins/github` | GitHub issue sync, pull requests, GitHub Actions CI/CD, and Dependabot configuration. |
| `jira` | `0.1.0` | `plugins/jira` | `copilot plugin install JSdotNet/Copilot:plugins/jira` | Jira issue creation and update workflows from approved Markdown backlog artifacts. |
| `product-owner` | `0.2.0` | `plugins/product-owner` | `copilot plugin install JSdotNet/Copilot:plugins/product-owner` | Product backlog authoring for epics, stories, and bugs as Markdown artifacts. |
| `qa` | `0.1.0` | `plugins/qa` | `copilot plugin install JSdotNet/Copilot:plugins/qa` | Runtime QA validation with Aspire, Playwright evidence, and log/trace monitoring. |
| `review` | `0.3.0` | `plugins/review` | `copilot plugin install JSdotNet/Copilot:plugins/review` | Reusable TODO-driven, question-driven, and improvement-driven review skills. |
| `spec-builder` | `0.1.0` | `plugins/spec-builder` | `copilot plugin install JSdotNet/Copilot:plugins/spec-builder` | GitHub customization asset authoring for agents, instructions, plugins, and skills. |
| `ux-design` | `0.2.0` | `plugins/ux-design` | `copilot plugin install JSdotNet/Copilot:plugins/ux-design` | UX wireframes, design guidelines, user flows, and design reviews. |
| `wip-convention` | `0.1.0` | `plugins/wip-convention` | `copilot plugin install JSdotNet/Copilot:plugins/wip-convention` | Shared `.wip` work-in-progress artifact conventions. |
| `worktree-parallel` | `0.1.0` | `plugins/worktree-parallel` | `copilot plugin install JSdotNet/Copilot:plugins/worktree-parallel` | Work decomposition across isolated git worktrees with per-worktree agent continuity. |

- `copilot-app` (`0.1.0`)
  - Source path: `plugins/copilot-app`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/copilot-app`
  - Notes: Orchestration (`orch-*`) and automation skills, the `orchestrator` agent, and a plugin-global `sessionStart` routing hook. See [Orchestration Configuration Layers](#orchestration-configuration-layers).

- `knowledge-base` (`0.6.0`)
  - Source path: `plugins/knowledge-base`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/knowledge-base`
  - Notes: Repository knowledge-folder convention for `.arc42`, `.domain`, `.tech`, `.design`, and `.backlog` — parseable chapter metadata, derived `_meta/` indexes, a reference-graph canvas, and enforcement tooling. Scaffold with `knowledge-base-init`, repair with `knowledge-base-validate`, and route per-folder edits through `orch-arc42-content`, `orch-domain`, `orch-tech`, `orch-design`, and `orch-backlog`. Requires Node 18+ for the generator. Heading text carries the name of a thing and the `type` field carries its kind; a repository written against the earlier convention migrates with the steps in the plugin README.

## Orchestration Configuration Layers

The `copilot-app` plugin drives orchestration behavior through four layers. Only the first
ships with the plugin; the repository-side files are all optional.

| Layer | Location | Owner | Effect |
|---|---|---|---|
| 1. Routing and soft enforcement | `plugins/copilot-app/hooks.json` (`sessionStart` prompt hook) | Plugin | Automatic in every session of every project once the plugin is installed. Names the `orch-*` skill for each governed task category and the specialist agent to fall back to. Choosing not to orchestrate must be stated explicitly with a reason. Nothing is blocked. |
| 2. Model override | `.github/copilot-model-selection.md` | Consuming repo | Overrides the model chosen per orchestration category. Convention: `plugins/copilot-app/instructions/orch-model-selection.instructions.md`. |
| 3. Startup and QA context | `.github/copilot-orch-context.md` | Consuming repo | Declares how the app starts, where to validate it, what healthy startup looks like, the default QA depth, and any repo-native `orch-*` skills. Convention: `plugins/copilot-app/instructions/orch-repo-context.instructions.md`; template: `plugins/copilot-app/resources/copilot-orch-context-template.md`. |
| 4. MCP servers | `.mcp.json` and repository instructions | Consuming repo | Remain repository-specific. The plugin routes to MCP servers but never owns or configures them. |

Notes:

- Because layer 1 is a plugin-global hook, a consuming repository no longer needs to
  hand-write its own orchestration routing instruction file.
- The plugin's `orch-*` list is a baseline, not an exhaustive catalog. A repository may ship
  its own `orch-*` skills under `.github/skills/`; those take precedence for the task
  categories they cover and can be declared under `## Repo-Native Orchestration Skills` in
  the context file.
- `.github/copilot-orch-context.md` must contain no secrets and must not pin a model; a
  repository with nothing to run declares `**Runnable application:** none` so QA validation
  is skipped cleanly.
- **Plugin changes require a reinstall.** Hook, skill, agent, and instruction changes take
  effect only after the plugin is reinstalled or updated from GitHub — use
  `scripts/install-or-update-plugins.ps1` or
  `copilot plugin install JSdotNet/Copilot:plugins/copilot-app`.

## Skills

- See [Copilot Skills](./copilot-skills.md) for skill inventory and provenance.

## Team Commands

```bash
# Install
copilot plugin install <plugin-name>@awesome-copilot

# Install requested focus plugins
copilot plugin install awesome-copilot@awesome-copilot
copilot plugin install csharp-dotnet-development@awesome-copilot
copilot plugin install testing-automation@awesome-copilot
copilot plugin install azure@awesome-copilot
copilot plugin install azure-cloud-development@awesome-copilot
copilot plugin install project-planning@awesome-copilot
copilot plugin install software-engineering-team@awesome-copilot
copilot plugin install technical-spike@awesome-copilot
copilot plugin install security-best-practices@awesome-copilot

# List installed plugins
copilot plugin list

# Update plugin
copilot plugin update <plugin-name>

# Uninstall plugin
copilot plugin uninstall <plugin-name>
```

## Update Process

1. Add or remove plugin entries in the table above.
2. Record a short note in the `Notes` column when changes are made.
3. Keep this file aligned with team onboarding docs.
