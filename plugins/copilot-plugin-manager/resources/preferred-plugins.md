# Preferred Plugins

Curated list of GitHub Copilot CLI plugins for this environment. Used by `install-plugin`, `update-plugins`, `uninstall-plugin`, `list-plugins`, and `check-plugin-updates` skills.

## Source Types

Two source formats are supported:

- **Marketplace** — `<plugin-name>@<marketplace>` (e.g. `dotnet@awesome-copilot`)
  - Install: `copilot plugin install <plugin-name>@<marketplace>`
  - Update: `copilot plugin update <plugin-name>@<marketplace>`
- **GitHub URL / Local path** — full URL or relative path
  - Install and update: `copilot plugin install <url-or-path>` (reinstall = update)

---

## Marketplace Plugins — `awesome-copilot`

| Name | Install Key | Description |
|------|-------------|-------------|
| `awesome-copilot` | `awesome-copilot@awesome-copilot` | Meta discovery plugin for finding curated Copilot resources. |
| `dotnet` | `dotnet@awesome-copilot` | .NET and Aspire development guidance. |
| `csharp-dotnet-development` | `csharp-dotnet-development@awesome-copilot` | Broad C#/.NET coding guidance and workflows. |
| `testing-automation` | `testing-automation@awesome-copilot` | Test generation and automation guidance, including unit-test workflows. |
| `security-best-practices` | `security-best-practices@awesome-copilot` | Security, accessibility, performance, and code-quality guardrails. |
| `azure` | `azure@awesome-copilot` | Azure skills and MCP workflows. |
| `azure-cloud-development` | `azure-cloud-development@awesome-copilot` | Azure architecture and IaC development guidance. |
| `project-planning` | `project-planning@awesome-copilot` | Planning support for epics, feature breakdown, and delivery planning. |
| `software-engineering-team` | `software-engineering-team@awesome-copilot` | Multi-role engineering plugin covering architecture, implementation, QA, and DevOps. |
| `technical-spike` | `technical-spike@awesome-copilot` | Research and assumption-validation workflows before committing to implementation. |

---

## GitHub / Local Plugins

| Name | Source | Description |
|------|--------|-------------|
| `development` | `https://github.com/<owner>/<repo>/plugins/development` | Development planning and implementation orchestration plugin. |
| `architecture` | `https://github.com/<owner>/<repo>/plugins/architecture` | Architecture workflows for arc42, blueprints, ADRs, and technical debt records. |
| `copilot-spec-builder` | `https://github.com/<owner>/<repo>/plugins/copilot-spec-builder` | GitHub customization asset authoring — agents, instructions, plugins, and skills. |
| `copilot-plugin-manager` | `https://github.com/<owner>/<repo>/plugins/copilot-plugin-manager` | Copilot plugin lifecycle management — install, update, uninstall, list, and check for updates. |
| `domain-design` | `https://github.com/<owner>/<repo>/plugins/domain-design` | Domain-Driven Design — bounded context discovery, ubiquitous language, domain model design, and context mapping. |

> **Note:** Replace `<owner>/<repo>` with the actual GitHub repository path before using install or update skills.
