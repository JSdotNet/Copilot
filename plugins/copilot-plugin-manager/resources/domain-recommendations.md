# Domain-Based Plugin Recommendations

Curated guidance on which plugins to install based on technology focus area. Used by the `plugin-manager` agent when a user asks what to install for a given domain.

## C#/.NET Development

| Plugin | Install Key | Why install |
|---|---|---|
| `csharp-dotnet-development` | `csharp-dotnet-development@awesome-copilot` | Broad C#/.NET coding guidance, async patterns, and framework workflows. |
| `dotnet` | `dotnet@awesome-copilot` | .NET and Aspire development guidance; use for .NET Aspire-specific workflows. |
| `testing-automation` | `testing-automation@awesome-copilot` | Test generation and automation including xUnit, NUnit, MSTest workflows. |
| `security-best-practices` | `security-best-practices@awesome-copilot` | Security, accessibility, performance, and code-quality guardrails. |

> **Note:** No standalone `aspire` plugin exists in the current Awesome Copilot catalog. Use `dotnet` with local repo skills for .NET Aspire conventions.

## Azure and Cloud

| Plugin | Install Key | Why install |
|---|---|---|
| `azure` | `azure@awesome-copilot` | Azure skills and MCP server workflows for day-to-day cloud operations. |
| `azure-cloud-development` | `azure-cloud-development@awesome-copilot` | Azure architecture, IaC (Bicep), cost optimization, and deployment guidance. |

## Project Management and Planning

| Plugin | Install Key | Why install |
|---|---|---|
| `project-planning` | `project-planning@awesome-copilot` | Epics, feature breakdown, implementation planning, and GitHub issue creation. |
| `technical-spike` | `technical-spike@awesome-copilot` | Time-boxed research and assumption-validation before committing to implementation. |

## General Engineering

| Plugin | Install Key | Why install |
|---|---|---|
| `software-engineering-team` | `software-engineering-team@awesome-copilot` | Multi-role coverage: architecture, implementation, QA, and DevOps in one plugin. |
| `awesome-copilot` | `awesome-copilot@awesome-copilot` | Meta-discovery plugin for finding additional curated Copilot resources and skills. |

## Skill Focus Quick Map

| Skill focus | Recommended plugin(s) |
|---|---|
| Aspire | `dotnet` |
| C# / ASP.NET | `csharp-dotnet-development` |
| xUnit / NUnit / MSTest | `testing-automation` + `csharp-dotnet-development` |
| Azure infrastructure | `azure-cloud-development` |
| Azure operations / MCP | `azure` |
| Project planning | `project-planning` |
| Security guardrails | `security-best-practices` |
| Research spikes | `technical-spike` |
