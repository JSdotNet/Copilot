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
| `aikido` | `0.2.0` | `plugins/aikido` | `copilot plugin install JSdotNet/ai-plugins:plugins/aikido` | Aikido Security integration for SAST, secret scanning, finding fixes, posture review, and GitHub issue sync. Requires the Aikido MCP server (`@aikidosec/mcp`). `0.2.0` makes it a pure specialist: no session tools, no handoff gate. Ships no `instructions/` folder: shared text is a `resources/` contract (`name` + `description`, no glob) that its skills and agents reference by path, per `.agents/rules/plugin-contracts.md`. |
| `architecture` | `0.5.0` | `plugins/architecture` | `copilot plugin install JSdotNet/ai-plugins:plugins/architecture` | Architecture documentation, ADRs, technical debt records, and architecture diagrams. `0.5.0` makes it a pure specialist: no session tools, no handoff gate, writes to `.arc42/` when the repository has it; `architecture-blueprint-generator` removed. Ships no `instructions/` folder: shared text is a `resources/` contract (`name` + `description`, no glob) that its skills and agents reference by path, per `.agents/rules/plugin-contracts.md`. |
| `claude-desktop` | `0.12.0` | `plugins/claude-desktop` | `.mcpb` extension (Claude Desktop) or `/plugin install claude-desktop@jsdotnet-plugins` (Claude Code) | Claude host plugin: the `orch-dashboard` MCP server (run dashboard, Mermaid viewer, Markdown viewer, rendered inline as an MCP App in Claude Desktop) plus `start`, `session-handoff`, and `create-pull-request`. `0.12.0` removes everything that now ships from the `jsdotnet` marketplace ([JSdotNet/ai-agent-stack](https://github.com/JSdotNet/ai-agent-stack)): the `orch-*` skills and `orchestrator` agent (`delivery`'s `flow-*` and `flow-runner`), the `phase-*` skills, the rest of the pull-request lane, `start-session-from-issue`, `azure-sre-to-github-issue`, the `automation-*` entries (`delivery-schedule`), and the `workflow-*` fan-out (`fleet`). Claude-only. Ships no `instructions/` folder: shared text is a `resources/` contract (`name` + `description`, no glob) that its skills and agents reference by path, per `.agents/rules/plugin-contracts.md`. |
| `copilot-app` | `0.4.0` | `plugins/copilot-app` | `copilot plugin install JSdotNet/ai-plugins:plugins/copilot-app` | Copilot App host plugin: `update-open-sessions` plus the three canvas extensions. `0.4.0` removes the `orch-*`, `phase-*`, `automation-*`, `azure-sre-to-github-issue`, and `start-session-from-issue` skills and the `orchestrator` agent, which continue as `delivery`, `delivery-schedule`, and `fleet` in the `jsdotnet` marketplace. Ships no `instructions/` folder: shared text is a `resources/` contract (`name` + `description`, no glob) that its skills and agents reference by path, per `.agents/rules/plugin-contracts.md`. |
| `csharp-coding` | `0.2.0` | `plugins/csharp-coding` | `copilot plugin install JSdotNet/ai-plugins:plugins/csharp-coding` | Focused C# .NET coding, review, optimization, and testing expertise. `0.2.0` makes it a pure specialist: no session tools, no approval gate, `sync` removed (the update-base phase belongs to a flow). Ships no `instructions/` folder: shared text is a `resources/` contract (`name` + `description`, no glob) that its skills and agents reference by path, per `.agents/rules/plugin-contracts.md`. |
| `documentation` | `0.5.0` | `plugins/documentation` | `copilot plugin install JSdotNet/ai-plugins:plugins/documentation` | Documentation, infographic, and profile authoring workflows. `0.5.0` makes it a pure specialist: no session tools, no handoff gate. Ships no `instructions/` folder: shared text is a `resources/` contract (`name` + `description`, no glob) that its skills and agents reference by path, per `.agents/rules/plugin-contracts.md`. |
| `domain-design` | `0.3.0` | `plugins/domain-design` | `copilot plugin install JSdotNet/ai-plugins:plugins/domain-design` | Domain-Driven Design workflows for contexts, language, models, and context mapping. `0.3.0` makes it a pure specialist: no session tools, no handoff gate, writes to `.domain/` when the repository has it. Ships no `instructions/` folder: shared text is a `resources/` contract (`name` + `description`, no glob) that its skills and agents reference by path, per `.agents/rules/plugin-contracts.md`. |
| `fincent` | `0.4.0` | `plugins/fincent` | `copilot plugin install JSdotNet/ai-plugins:plugins/fincent` | Fincent project story review, development, domain alignment, estimation, PR review, sprint reporting, and demo workflows. `0.4.0` points `pr-remarks-resolve` at the `delivery` pull-request lane. |
| `github` | `0.2.0` | `plugins/github` | `copilot plugin install JSdotNet/ai-plugins:plugins/github` | GitHub issue sync, pull requests, GitHub Actions CI/CD, and Dependabot configuration. Ships no `instructions/` folder: shared text is a `resources/` contract (`name` + `description`, no glob) that its skills and agents reference by path, per `.agents/rules/plugin-contracts.md`. |
| `jira` | `0.2.0` | `plugins/jira` | `copilot plugin install JSdotNet/ai-plugins:plugins/jira` | Jira issue creation and update workflows from approved Markdown backlog artifacts. Ships no `instructions/` folder: shared text is a `resources/` contract (`name` + `description`, no glob) that its skills and agents reference by path, per `.agents/rules/plugin-contracts.md`. |
| `product-owner` | `0.3.0` | `plugins/product-owner` | `copilot plugin install JSdotNet/ai-plugins:plugins/product-owner` | Product backlog authoring for epics, stories, and bugs as Markdown artifacts. `0.3.0` makes it a pure specialist: no session tools, no handoff gate. Ships no `instructions/` folder: shared text is a `resources/` contract (`name` + `description`, no glob) that its skills and agents reference by path, per `.agents/rules/plugin-contracts.md`. |
| `qa` | `0.4.0` | `plugins/qa` | `copilot plugin install JSdotNet/ai-plugins:plugins/qa` | Runtime QA validation with Aspire, Playwright evidence, and log/trace monitoring. `0.4.0` makes it a pure specialist: no delegation tools, no handoff gate, and no reference to any host plugin's flows. Ships no `instructions/` folder: shared text is a `resources/` contract (`name` + `description`, no glob) that its skills and agents reference by path, per `.agents/rules/plugin-contracts.md`. |
| `react-coding` | `0.1.0` | `plugins/react-coding` | `copilot plugin install JSdotNet/ai-plugins:plugins/react-coding` | React and TypeScript implementation through the `frontend` agent: components, hooks, typed API clients bound to a .NET contract, and component tests, with commands detected from the repository. The React lane of the retired `development` plugin; its planning and phase-gated execution agents are gone, because a flow owns sequencing. Ships no `instructions/` folder: shared text is a `resources/` contract (`name` + `description`, no glob) that its skills and agents reference by path, per `.agents/rules/plugin-contracts.md`. |
| `review` | `0.4.0` | `plugins/review` | `copilot plugin install JSdotNet/ai-plugins:plugins/review` | Reusable TODO-driven, question-driven, and improvement-driven review skills. |
| `spec-builder` | `0.5.0` | `plugins/spec-builder` | `copilot plugin install JSdotNet/ai-plugins:plugins/spec-builder` | GitHub customization asset authoring for agents, instructions, plugins, and skills. `0.5.0` drops the approval-gated handoff wording. Ships no `instructions/` folder: shared text is a `resources/` contract (`name` + `description`, no glob) that its skills and agents reference by path, per `.agents/rules/plugin-contracts.md`. |
| `ux-design` | `0.4.0` | `plugins/ux-design` | `copilot plugin install JSdotNet/ai-plugins:plugins/ux-design` | UX wireframes, design guidelines, user flows, and design reviews. `0.4.0` makes it a pure specialist: no session tools, no handoff gate, guideline content goes to `.design/` when the repository has it. Ships no `instructions/` folder: shared text is a `resources/` contract (`name` + `description`, no glob) that its skills and agents reference by path, per `.agents/rules/plugin-contracts.md`. |
| `wip-convention` | `0.3.0` | `plugins/wip-convention` | `copilot plugin install JSdotNet/ai-plugins:plugins/wip-convention` | Shared `.wip` work-in-progress artifact conventions. Ships no `instructions/` folder: shared text is a `resources/` contract (`name` + `description`, no glob) that its skills and agents reference by path, per `.agents/rules/plugin-contracts.md`. |

## Skills

- See [Copilot Skills](./copilot-skills.md) for skill inventory and provenance.

## Canvas Extensions

Canvas extensions add interactive UI panels the agent can open (`open_canvas`), rather
than skills/agents/instructions, but they are packaged and installed the same way as any
other local plugin — each one has its own `.github/plugin/plugin.json` with an
`"extensions"` field (instead of `"agents"`/`"skills"`) pointing at the folder containing
its `extension.mjs`. Install with `copilot plugin install`, same as any plugin in this
repo.

- `diagram-canvas` (`1.0.0`)
  - Source path: `plugins/copilot-app/extensions/diagram-canvas`
  - Install: `copilot plugin install JSdotNet/ai-plugins:plugins/copilot-app/extensions/diagram-canvas`
  - Canvas: `mermaid-diagram` (interactive C4/sequence/state/deployment/DDD/wireframe diagram viewer).
  - Used by: a flow skill (`delivery@jsdotnet`), which opens/updates this canvas on behalf of the `architecture`, `domain-design`, and `ux-design` agents it coordinates. Those content plugins have no direct dependency on this extension. Ships inside `copilot-app` but installs and runs independently.
- `markdown-canvas` (`1.0.0`)
  - Source path: `plugins/copilot-app/extensions/markdown-canvas`
  - Install: `copilot plugin install JSdotNet/ai-plugins:plugins/copilot-app/extensions/markdown-canvas`
  - Canvas: `markdown-preview` (live ADR/TDR/arc42/backlog document preview).
  - Used by: a flow skill (`delivery@jsdotnet`), which opens/updates this canvas on behalf of the `architecture`, `domain-design`, `ux-design`, `documentation`, and `product-owner` agents it coordinates. Those content plugins have no direct dependency on this extension. Ships inside `copilot-app` but installs and runs independently.
- `orch-dashboard` (`1`)
  - Source path: `plugins/copilot-app/extensions/orch-dashboard`
  - Install: `install_extension` tool with `https://github.com/JSdotNet/ai-plugins/tree/main/plugins/copilot-app/extensions/orch-dashboard` (not `copilot plugin install` — this extension has no standalone `.github/plugin/plugin.json`).
  - Canvas: live progress/output dashboard for a run reported through it — `copilot-app`'s `update-open-sessions`, or a flow from `delivery@jsdotnet` that resolved it as its surface.
  - Provider: orchestration agents should use the full plugin provider ID
    `plugin:copilot-app:orch-dashboard`; remove stale user-scope copies from
    `%USERPROFILE%\.copilot\extensions` if duplicate dashboard providers are reported.
  - Used by: `copilot-app` plugin only.

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

## Claude Code

The local plugin bundles also load in Claude Code, from a single copy of every file. Skills,
contracts and agents are shared as-is; only the manifest and the hook shape differ per host
(`.claude-plugin/`, `hooks/`), and both are hand-authored and checked:

```bash
node tools/check-assets.mjs
```

All bundles except `copilot-app` are Claude-targeted; that one depends on the Copilot CLI
canvas extension API, and its Claude sibling is the hand-authored `claude-desktop` bundle, which
replaces the canvases with an MCP server. See [Claude Code Compatibility](./docs/copilot/claude-code-compatibility.md)
for the translation rules, known differences, and install instructions.

## Update Process

1. Add or remove plugin entries in the table above.
2. Record a short note in the `Notes` column when changes are made.
3. Keep this file aligned with team onboarding docs.
4. Bump with `node tools/bump-version.mjs <plugin>` so both manifests, the marketplace entry,
   and the row here agree, and run `node tools/check-assets.mjs` before committing.
