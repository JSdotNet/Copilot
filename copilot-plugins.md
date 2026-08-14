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
| `copilot-app` | `0.1.0` | `plugins/copilot-app` | `copilot plugin install JSdotNet/Copilot:plugins/copilot-app` | Copilot App orchestration workflows, pull request handoff, scheduled automation, and canvas progress reporting. |
| `copilot-plugin-manager` | `0.1.0` | `plugins/copilot-plugin-manager` | `copilot plugin install JSdotNet/Copilot:plugins/copilot-plugin-manager` | Preferred Copilot CLI plugin management via GitHub URLs. |
| `copilot-spec-builder` | `0.1.0` | `plugins/copilot-spec-builder` | `copilot plugin install JSdotNet/Copilot:plugins/copilot-spec-builder` | GitHub customization asset authoring for agents, instructions, plugins, and skills. |
| `csharp-coding` | `0.1.0` | `plugins/csharp-coding` | `copilot plugin install JSdotNet/Copilot:plugins/csharp-coding` | Focused C# .NET coding, review, optimization, and testing expertise. |
| `development` | `0.1.0` | `plugins/development` | `copilot plugin install JSdotNet/Copilot:plugins/development` | Development planning and implementation workflows. |
| `documentation` | `0.3.0` | `plugins/documentation` | `copilot plugin install JSdotNet/Copilot:plugins/documentation` | Documentation, infographic, and profile authoring workflows. |
| `domain-design` | `0.2.0` | `plugins/domain-design` | `copilot plugin install JSdotNet/Copilot:plugins/domain-design` | Domain-Driven Design workflows for contexts, language, models, and context mapping. |
| `fincent` | `0.1.0` | `plugins/fincent` | `copilot plugin install JSdotNet/Copilot:plugins/fincent` | Fincent project story review, development, domain alignment, estimation, PR review, sprint reporting, and demo workflows. |
| `github` | `0.1.0` | `plugins/github` | `copilot plugin install JSdotNet/Copilot:plugins/github` | GitHub issue sync, pull requests, GitHub Actions CI/CD, and Dependabot configuration. |
| `jira` | `0.1.0` | `plugins/jira` | `copilot plugin install JSdotNet/Copilot:plugins/jira` | Jira issue creation and update workflows from approved Markdown backlog artifacts. |
| `product-owner` | `0.2.0` | `plugins/product-owner` | `copilot plugin install JSdotNet/Copilot:plugins/product-owner` | Product backlog authoring for epics, stories, and bugs as Markdown artifacts. |
| `qa` | `0.1.0` | `plugins/qa` | `copilot plugin install JSdotNet/Copilot:plugins/qa` | Runtime QA validation with Aspire, Playwright evidence, and log/trace monitoring. |
| `review` | `0.3.0` | `plugins/review` | `copilot plugin install JSdotNet/Copilot:plugins/review` | Reusable TODO-driven, question-driven, and improvement-driven review skills. |
| `ux-design` | `0.2.0` | `plugins/ux-design` | `copilot plugin install JSdotNet/Copilot:plugins/ux-design` | UX wireframes, design guidelines, user flows, and design reviews. |
| `wip-convention` | `0.1.0` | `plugins/wip-convention` | `copilot plugin install JSdotNet/Copilot:plugins/wip-convention` | Shared `.wip` work-in-progress artifact conventions. |
| `worktree-parallel` | `0.1.0` | `plugins/worktree-parallel` | `copilot plugin install JSdotNet/Copilot:plugins/worktree-parallel` | Work decomposition across isolated git worktrees with per-worktree agent continuity. |

- `knowledge-base` (`0.2.0`)
  - Source path: `plugins/knowledge-base`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/knowledge-base`
  - Notes: Repository knowledge-folder convention for `.arc42`, `.domain`, `.tech`, `.design`, and `.backlog` — parseable chapter metadata, derived `_meta/` indexes, a reference-graph canvas, a session-start guardrail, and a `knowledge-meta` generator with a `--check` mode plus a CI workflow template. Adoption is partial by design; scaffold with `knowledge-base-init`, repair with `knowledge-base-validate`, and route per-folder edits through `orch-arc42-content`, `orch-domain`, `orch-tech`, `orch-design`, and `orch-backlog`. Requires Node 18+ for the generator.

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
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/copilot-app/extensions/diagram-canvas`
  - Canvas: `mermaid-diagram` (interactive C4/sequence/state/deployment/DDD/wireframe diagram viewer).
  - Used by: `copilot-app`'s `orch-*` orchestration skills, which open/update this canvas on behalf of the `architecture`, `domain-design`, and `ux-design` agents they coordinate. Those content plugins have no direct dependency on this extension. Ships inside `copilot-app` but installs and runs independently.
- `markdown-canvas` (`1.0.0`)
  - Source path: `plugins/copilot-app/extensions/markdown-canvas`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/copilot-app/extensions/markdown-canvas`
  - Canvas: `markdown-preview` (live ADR/TDR/arc42/backlog document preview).
  - Used by: `copilot-app`'s `orch-*` orchestration skills, which open/update this canvas on behalf of the `architecture`, `domain-design`, `ux-design`, `documentation`, and `product-owner` agents they coordinate. Those content plugins have no direct dependency on this extension. Ships inside `copilot-app` but installs and runs independently.
- `orch-dashboard` (`1`)
  - Source path: `plugins/copilot-app/extensions/orch-dashboard`
  - Install: `install_extension` tool with `https://github.com/JSdotNet/Copilot/tree/main/plugins/copilot-app/extensions/orch-dashboard` (not `copilot plugin install` — this extension has no standalone `.github/plugin/plugin.json`).
  - Canvas: live progress/output dashboard for `copilot-app`'s `orch-*` orchestration and automation skills.
  - Provider: orchestration agents should use the full plugin provider ID
    `plugin:copilot-app:orch-dashboard`; remove stale user-scope copies from
    `%USERPROFILE%\.copilot\extensions` if duplicate dashboard providers are reported.
  - Used by: `copilot-app` plugin only.
- `knowledge-canvas` (`1`)
  - Source path: `plugins/knowledge-base/extensions/knowledge-canvas`
  - Install: ships with the `knowledge-base` plugin — `copilot plugin install JSdotNet/Copilot:plugins/knowledge-base` (no standalone `.github/plugin/plugin.json`).
  - Canvas: interactive reference graph over the `.arc42`, `.domain`, `.tech`, `.design`, and `.backlog` chapters, rendered from the same graph code the `knowledge-meta` generator writes.
  - Used by: `knowledge-base` plugin only.

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
