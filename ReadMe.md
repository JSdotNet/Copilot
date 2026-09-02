# JSdotNet-Copilot

Repository for building and curating GitHub Copilot customization assets as installable local plugins. The project focuses on agent workflows, instruction packs, and reusable skills for architecture, development, documentation, review, and spec-driven asset authoring.

## Technology Stack

Primary technologies and formats observed in this repository:

- GitHub Copilot customization assets (`.agent.md`, `.instructions.md`, `SKILL.md`, `.prompt.md`)
- Markdown (`.md`) for agent/instruction/skill documentation
- JSON plugin manifests (`plugin.json`) with SemVer versions (for example `0.1.0`, `1.0.0`)
- GitHub Copilot CLI or `gh copilot` command surface for plugin operations

Version and runtime notes:

- This repository is documentation and customization focused; no runtime dependency manifest such as `package.json`, `.csproj`, `pom.xml`, or `requirements.txt` is defined at the root.
- Plugin versions are currently a mix of `0.1.0` and `1.0.0` depending on plugin maturity.

## Project Architecture

High-level architecture follows a plugin-based monorepo pattern:

- Each plugin is self-contained under `plugins/<plugin-name>/`.
- Typical plugin composition includes:
  - `agents/`
  - `instructions/`
  - `skills/`
  - optional `resources/`
  - `.github/plugin/plugin.json`
- Repository-level standards and global behavior are defined under `.github/instructions/` and `.github/copilot/`.

Conceptual layout:

```text
JSdotNet-Copilot
|- .github/
|  |- copilot/
|  |  \- copilot-instructions.md
|  |- instructions/
|  |- agents/
|  \- skills/
|- plugins/
|  |- aikido/
|  |- architecture/
|  |- claude-desktop/
|  |  \- mcp/
|  |     \- orch-dashboard/
|  |- copilot-app/
|  |  \- extensions/
|  |     |- diagram-canvas/
|  |     |- markdown-canvas/
|  |     \- orch-dashboard/
|  |- csharp-coding/
|  |- development/
|  |- documentation/
|  |- domain-design/
|  |- fincent/
|  |- github/
|  |- jira/
|  |- product-owner/
|  |- qa/
|  |- review/
|  |- spec-builder/
|  |- ux-design/
|  |- wip-convention/
|  |- knowledge-base/
|  |  \- extensions/
|  |     \- knowledge-canvas/
|  \- worktree-parallel/
```

## Getting Started

### Prerequisites

- Git
- GitHub CLI with Copilot extension (`gh copilot`) or standalone `copilot` CLI

### Installation and Setup

1. Clone the repository.
2. Open the repository in VS Code.
3. Install the local plugins you need directly from this repository:

```bash
copilot plugin install JSdotNet/Copilot:plugins/architecture
copilot plugin install JSdotNet/Copilot:plugins/copilot-app
copilot plugin install JSdotNet/Copilot:plugins/development
```

Update an already installed plugin by name:

```bash
copilot plugin update architecture
```

Verify plugins are available:

```bash
copilot plugin list
```

### Canvas Extensions

Unlike plugins (skills, agents, instructions), canvas extensions add interactive UI
surfaces the agent can open in a side panel. This repository ships canvas
extensions inside `plugins/copilot-app/extensions/`: `diagram-canvas` (Mermaid
diagram viewer), `markdown-canvas` (Markdown document preview), and
`orch-dashboard` (orchestration progress dashboard). Only `copilot-app`'s
`orch-*` orchestration skills open/update these canvases directly, on behalf of
the `architecture`, `domain-design`, `ux-design`, `documentation`, and
`product-owner` agents they coordinate — those content plugins have no direct
dependency on these extensions and work identically with or without them
installed.
`diagram-canvas` and `markdown-canvas` ship inside `copilot-app` but install and
run independently of it and of each other — install either one on its own. Each
is packaged like any other plugin (its own `.github/plugin/plugin.json`), so
install the same way:
`copilot plugin install JSdotNet/Copilot:plugins/copilot-app/extensions/diagram-canvas` and
`copilot plugin install JSdotNet/Copilot:plugins/copilot-app/extensions/markdown-canvas`.
See `plugins/copilot-app/extensions/diagram-canvas/README.md` and
`plugins/copilot-app/extensions/markdown-canvas/README.md` for details.
`orch-dashboard` is installed with the app extension installer from
`https://github.com/JSdotNet/Copilot/tree/main/plugins/copilot-app/extensions/orch-dashboard`.
Copilot App orchestration skills should address the plugin dashboard with the full
provider ID `plugin:copilot-app:orch-dashboard`; if duplicate `orch-dashboard` providers
are reported, remove stale user-scope copies from `%USERPROFILE%\.copilot\extensions`
after confirming they are not needed.

The `knowledge-base` plugin additionally bundles a `knowledge-canvas` extension that renders
the repository's knowledge-folder reference graph. It has no standalone manifest and installs
with its parent: `copilot plugin install JSdotNet/Copilot:plugins/knowledge-base`.

### Claude Desktop Extension

The `claude-desktop` plugin is the Claude-side sibling of `copilot-app`. Its `orch-dashboard`
MCP server replaces all three canvas extensions above, and in Claude Desktop it renders
**inline in the conversation** as an MCP App rather than in a separate window. Build the
installable bundle with:

```bash
pwsh ./scripts/Build-DesktopExtension.ps1
```

That writes `dist/orch-dashboard-<version>.mcpb`, which installs into Claude Desktop with one
click. See [`plugins/claude-desktop/README.md`](plugins/claude-desktop/README.md) for both
install paths and for which features work in which host.

## Project Structure

Repository organization centers on reusable Copilot plugin bundles:

- `.github/`
  - Global Copilot instructions and baseline standards.
- `plugins/`
  - Installable plugin bundles for specific domains:
    - `architecture`
    - `development`
    - `documentation`
    - `review`
    - `spec-builder`
    - `csharp-coding`
    - `aikido`
    - `copilot-app`
    - `claude-desktop`
    - `domain-design`
    - `fincent`
    - `github`
    - `jira`
    - `qa`
    - `ux-design`
    - `wip-convention`
    - `knowledge-base`
    - `worktree-parallel`
    - `product-owner`
- `docs/copilot/`
  - Plugin inventory/reference docs.

## Key Features

- Plugin-based Copilot customization model for modular adoption.
- Domain-focused agents for architecture, development, documentation, and review workflows.
- Skill catalogs that encapsulate repeatable guidance and authoring processes.
- Spec-driven asset authoring with `spec-builder`.
- GitHub, Jira, QA, UX, domain design, and security-focused workflow plugins.
- Work-in-progress artifact conventions via `wip-convention`.
- Parallel task decomposition patterns via `worktree-parallel`.

## Development Workflow

Current workflow pattern inferred from repository assets:

1. Create or update plugin assets under `plugins/<plugin>/...`.
2. Reinstall the affected plugin from GitHub using `copilot plugin install JSdotNet/Copilot:plugins/<plugin>`.
3. Validate behavior through agent and skill invocation.
4. Iterate and keep repository-level instructions aligned.

Branching strategy:

- A formal branching policy is not explicitly documented in the scanned source set.
- The `worktree-parallel` plugin promotes isolated feature branches/worktrees per task slice.

## Coding Standards

Key standards from repository instruction files:

- Use concise, direct English for `.github/**` customization assets.
- Follow Markdown baseline rules:
  - ATX headings only (`#`, `##`, `###`)
  - exactly one top-level heading per Markdown file
  - `-` for unordered lists
  - ordered lists as `1.`, `2.`, `3.`
  - fenced code blocks with language tags when possible
- Preserve plugin folder conventions and naming patterns.
- Prefer repository conventions over introducing new structures.

## Testing

Testing in this repository is primarily validation of customization asset behavior:

- Reinstall plugin after changes and verify agent/skill outcomes.
- Check path conventions, frontmatter keys, and manifest consistency.
- Ensure Markdown formatting rules are respected.

A dedicated runtime unit-test framework document (for example a separate `Unit_Tests` source file) was not found in `.github/copilot`.

## Contributing

Contribution guidelines for this repository:

1. Follow repository-level instructions first, especially:
   - `.github/copilot/copilot-instructions.md`
   - `.github/instructions/markdown.instructions.md`
2. Keep changes minimal and aligned with existing plugin patterns.
3. Reuse nearby examples when creating new assets:
   - existing plugin `agents/`, `instructions/`, and `skills/` folders are the primary exemplars.
4. Install or update the affected plugin directly and validate its behavior after edits.
5. Document notable changes in related plugin README files where relevant.

Helpful references:

- [Copilot Reference](docs/copilot/copilot-reference.md)
- [Copilot Plugins Inventory](copilot-plugins.md)
- [Copilot Skills Inventory](docs/copilot/copilot-skills.md)

## License

License metadata is plugin-specific in current manifests:

- Most local plugins declare `UNLICENSED`.
- `plugins/wip-convention/.github/plugin/plugin.json` and
  `plugins/knowledge-base/.github/plugin/plugin.json` declare `MIT`.

No single top-level repository license file was identified in the scanned sources.
