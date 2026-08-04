# JSdotNet-Copilot

Repository for building and curating GitHub Copilot customization assets as installable local plugins. The project focuses on agent workflows, instruction packs, and reusable skills for architecture, development, documentation, review, and plugin lifecycle management.

## Technology Stack

Primary technologies and formats observed in this repository:

- GitHub Copilot customization assets (`.agent.md`, `.instructions.md`, `SKILL.md`, `.prompt.md`)
- Markdown (`.md`) for agent/instruction/skill documentation
- JSON plugin manifests (`plugin.json`) with SemVer versions (for example `0.1.0`, `1.0.0`)
- PowerShell (`.ps1`) scripts for plugin installation and update automation
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
|  |- architecture/
|  |- development/
|  |- documentation/
|  |- review/
|  |- copilot-plugin-manager/
|  |- copilot-spec-builder/
|  |- copilot-app/
|  |  \- extensions/
|  |     |- diagram-canvas/
|  |     |- markdown-canvas/
|  |     \- orch-dashboard/
|  |- wip-convention/
|  \- worktree-parallel/
\- scripts/
```

## Getting Started

### Prerequisites

- Git
- GitHub CLI with Copilot extension (`gh copilot`) or standalone `copilot` CLI
- PowerShell 5.1+ (Windows) for local automation scripts

### Installation and Setup

1. Clone the repository.
2. Open the repository in VS Code.
3. Install all local plugins:

```powershell
./scripts/install-local-plugins.ps1
```

Alternative install/update flow:

```powershell
./scripts/install-or-update-plugins.ps1 -Mode install-or-update
```

Update already installed local plugins:

```powershell
./scripts/update-local-plugins.ps1
```

Verify plugins are available:

```bash
copilot plugin list
```

### Canvas Extensions

Unlike plugins (skills, agents, instructions), canvas extensions add interactive UI
surfaces the agent can open in a side panel. This repository ships two independent canvas
extensions inside `plugins/copilot-app/extensions/`: `diagram-canvas` (Mermaid diagram
viewer) and `markdown-canvas` (Markdown document preview), used by the `architecture`,
`domain-design`, `ux-design`, `documentation`, `product-owner`, and `copilot-app` plugins.
Both ship inside `copilot-app` but install and run independently of it and of each other —
install either one on its own for any of the other plugins. Each is packaged like any other
plugin (its own `.github/plugin/plugin.json`), so install the same way:
`copilot plugin install JSdotNet/Copilot:plugins/copilot-app/extensions/diagram-canvas` and
`copilot plugin install JSdotNet/Copilot:plugins/copilot-app/extensions/markdown-canvas`.
See `plugins/copilot-app/extensions/diagram-canvas/README.md` and
`plugins/copilot-app/extensions/markdown-canvas/README.md` for details.

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
    - `copilot-spec-builder`
    - `copilot-plugin-manager`
    - `wip-convention`
    - `worktree-parallel`
    - `product-owner`
- `docs/copilot/`
  - Plugin inventory/reference docs.
- `scripts/`
  - Install/update automation for local plugin workflows.

## Key Features

- Plugin-based Copilot customization model for modular adoption.
- Domain-focused agents for architecture, development, documentation, and review workflows.
- Skill catalogs that encapsulate repeatable guidance and authoring processes.
- Spec-driven asset authoring with `copilot-spec-builder`.
- Plugin lifecycle management via `copilot-plugin-manager`.
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
4. Reinstall and validate plugins after edits.
5. Document notable changes in related plugin README files where relevant.

Helpful references:

- [Copilot Reference](docs/copilot/copilot-reference.md)
- [Copilot Plugins Inventory](docs/copilot/copilot-plugins.md)
- [Copilot Skills Inventory](docs/copilot/copilot-skills.md)

## License

License metadata is plugin-specific in current manifests:

- Most local plugins declare `UNLICENSED`.
- `plugins/wip-convention/.github/plugin/plugin.json` declares `MIT`.

No single top-level repository license file was identified in the scanned sources.
