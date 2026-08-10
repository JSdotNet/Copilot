# Copilot Plugins

## Purpose

Track GitHub Copilot plugins used by this repository so team members can install, update, and audit them consistently.

## Marketplace

- Marketplace: `awesome-copilot`
- Repository config: `.github/copilot-settings.json`

## Installed Plugins

| Plugin | Source | Notes |
|---|---|---|
| `dotnet` | `awesome-copilot` | Installed in local environment (`copilot plugin install dotnet@awesome-copilot`). |
| `awesome-copilot` | `awesome-copilot` | Meta discovery plugin for finding and generating curated Copilot resources. |
| `csharp-dotnet-development` | `awesome-copilot` | C#/.NET development guidance plugin. |
| `testing-automation` | `awesome-copilot` | Testing workflows and automation guidance plugin. |
| `azure` | `awesome-copilot` | Azure skills and MCP workflows plugin. |
| `azure-cloud-development` | `awesome-copilot` | Azure architecture and IaC development plugin. |
| `project-planning` | `awesome-copilot` | Planning support for epics, feature breakdown, and implementation planning workflows. |
| `software-engineering-team` | `awesome-copilot` | Multi-role engineering plugin covering architecture, implementation, QA, and DevOps workflows. |
| `technical-spike` | `awesome-copilot` | Research and assumption-validation workflows before committing to implementation. |
| `security-best-practices` | `awesome-copilot` | Security, accessibility, performance, and code-quality guardrails. |

## Local Plugin Bundles

- `development` (`0.1.0`)
  - Source path: `plugins/development`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/development`
  - Notes: Development planning and execution workflows.

- `architecture` (`0.1.0`)
  - Source path: `plugins/architecture`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/architecture`
  - Notes: Architecture-focused workflows for arc42, blueprints, ADRs, and technical debt records.

- `copilot-spec-builder` (`0.1.0`)
  - Source path: `plugins/copilot-spec-builder`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/copilot-spec-builder`
  - Notes: GitHub customization asset authoring — agents, instructions, plugins, and skills.

- `copilot-plugin-manager` (`0.1.0`)
  - Source path: `plugins/copilot-plugin-manager`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/copilot-plugin-manager`
  - Notes: Plugin lifecycle management — install, update, uninstall, list, and check for updates.

- `copilot-app` (`0.1.0`)
  - Source path: `plugins/copilot-app`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/copilot-app`
  - Notes: Orchestration (`orch-*`) and automation skills, the `orchestrator` agent, and a plugin-global `sessionStart` routing hook. See [Orchestration Configuration Layers](#orchestration-configuration-layers).

- `knowledge-base` (`0.1.0`)
  - Source path: `plugins/knowledge-base`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/knowledge-base`
  - Notes: Repository knowledge-folder convention for `.arc42`, `.domain`, `.tech`, `.design`, and `.backlog` — parseable chapter metadata, derived `_meta/` indexes, a reference-graph canvas, and enforcement tooling. Requires Node 18+ for the generator.

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
