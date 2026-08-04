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
| `impeccable` | `awesome-copilot` | Frontend design and UI-craft skill (impeccable.style). Used by the `ux-design` plugin when installed. Requires Node 18+ for automation scripts; falls back to design guidance without it. |
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

- `csharp-coding` (`0.1.0`)
  - Source path: `plugins/csharp-coding`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/csharp-coding`
  - Notes: Single-agent C# .NET coding expert — write, review, optimize, test, refactor, and propose features. Alternative to the `development` plugin for focused coding workflows.

- `copilot-plugin-manager` (`0.1.0`)
  - Source path: `plugins/copilot-plugin-manager`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/copilot-plugin-manager`
  - Notes: Plugin lifecycle management — install, update, uninstall, list, and check for updates.

- `automations` (`0.1.0`)
  - Source path: `plugins/automations`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/automations`
  - Notes: Automation prompts for Azure SRE → GitHub issues, session creation from issues, and session branch updates.

- `aikido` (`0.1.0`)
  - Source path: `plugins/aikido`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/aikido`
  - Notes: Aikido Security integration — scan code for SAST vulnerabilities and secrets, fix findings, review security posture, and sync issues to GitHub. Requires the Aikido MCP server (`@aikidosec/mcp`).

- `copilot-app` (`0.1.0`)
  - Source path: `plugins/copilot-app`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/copilot-app`
  - Notes: GitHub Copilot App plugin for PR creation with JSdotNet account and orchestrating development tasks (project-setup, MVP, package updates, features, bugs).

- `domain-design` (`0.1.0`)
  - Source path: `plugins/domain-design`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/domain-design`
  - Notes: Domain-Driven Design workflows — bounded context discovery, ubiquitous language, domain model design, and context mapping.

- `ux-design` (`0.1.0`)
  - Source path: `plugins/ux-design`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/ux-design`
  - Notes: UX design workflows — wireframes (SVG/Mermaid), design guidelines, user flows, and design reviews.

- `product-owner` (`0.1.0`)
  - Source path: `plugins/product-owner`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/product-owner`
  - Notes: Product Owner backlog authoring — epics, stories, and bugs as Markdown artifacts. Jira sync requires the `jira` plugin. GitHub issue sync requires the `github` plugin.

- `jira` (`0.1.0`)
  - Source path: `plugins/jira`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/jira`
  - Notes: Jira issue synchronization — create and update Jira issues from approved Markdown backlog artifacts. Works standalone or alongside the `product-owner` plugin.

- `github` (`0.1.0`)
  - Source path: `plugins/github`
  - Install: `copilot plugin install JSdotNet/Copilot:plugins/github`
  - Notes: GitHub platform workflows — issue sync from Markdown backlog artifacts, GitHub Actions CI/CD, Dependabot configuration. Works standalone or alongside the `product-owner` plugin.

## Skills

- See [Copilot Skills](./copilot-skills.md) for skill inventory and provenance.

## Canvas Extensions

Canvas extensions are a separate mechanism from plugins: they add interactive UI panels
the agent can open (`open_canvas`), rather than skills/agents/instructions. Install them
with the `install_extension` tool (source = a GitHub repo folder or gist), not
`copilot plugin install`.

- `copilot-canvas-studio` (`1.0.0`)
  - Source path: `extensions/copilot-canvas-studio`
  - Install: use `install_extension` with `https://github.com/JSdotNet/Copilot/tree/main/extensions/copilot-canvas-studio`
  - Canvases: `mermaid-diagram` (interactive C4/sequence/state/deployment/DDD/wireframe diagram viewer), `markdown-preview` (live ADR/TDR/arc42/backlog document preview).
  - Used by: `architecture`, `domain-design`, `ux-design`, `documentation`, `product-owner` plugins when installed alongside them.

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
