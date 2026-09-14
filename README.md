# ai-plugins

The `jsdotnet-copilot` plugin marketplace for Claude Code and GitHub Copilot: the specialist
agents, skills, and contracts that fill the roles a delivery flow consults — architecture,
coding, QA, domain, UX, documentation, product, security — plus two host plugins and the issue
trackers. Every asset is authored once and loaded by both hosts.

The flows themselves live elsewhere. Staged delivery, the pull-request lane, scheduled runs,
cross-session fan-out, and the knowledge-folder convention ship as `delivery`,
`delivery-schedule`, `fleet`, and `devbook` in the `jsdotnet` marketplace
([JSdotNet/ai-agent-stack](https://github.com/JSdotNet/ai-agent-stack)). A specialist here is
usable on its own and holds no flow control: it does not sequence stages, hold gates, spawn
sessions, or delegate.

## Plugins

| Plugin | Kind | What it does |
| --- | --- | --- |
| `architecture` | specialist | arc42 chapters, ADRs, technical debt records, C4/sequence/state/deployment diagrams |
| `csharp-coding` | specialist | C# .NET implementation, review, optimization, TDD, NuGet |
| `react-coding` | specialist | React and TypeScript implementation bound to a .NET contract |
| `qa` | specialist | Runtime validation with Aspire, Playwright evidence, log/trace monitoring |
| `domain-design` | specialist | Bounded contexts, ubiquitous language, domain models, context maps |
| `ux-design` | specialist | Wireframes, user flows, design guidelines, UI reviews |
| `documentation` | specialist | How-tos, explanations, articles, proposals, infographics, profiles |
| `product-owner` | specialist | Epics, stories, and bugs as Markdown artifacts |
| `review` | specialist | TODO-, question-, and suggestion-driven review passes |
| `spec-builder` | specialist | Authoring agents, instructions, skills, plugins, and workflows |
| `aikido` | specialist | Aikido Security scanning, triage, and fixes |
| `github` | tracker | Issue sync, pull requests, Actions CI/CD, Dependabot |
| `jira` | tracker | Jira issues from approved Markdown backlog artifacts |
| `claude-desktop` | host | `orch-dashboard` MCP server plus `start`, `session-handoff`, `create-pull-request` |
| `copilot-app` | host | `update-open-sessions` plus three canvas extensions |
| `wip-convention` | convention | Shared `.wip` work-in-progress artifact layout |
| `fincent` | project | Fincent story review, estimation, PR review, sprint and demo reporting |

Versions, install strings, and change notes per plugin are in
[copilot-plugins.md](copilot-plugins.md); the skill inventory is in
[docs/copilot/copilot-skills.md](docs/copilot/copilot-skills.md).

## Install

### Claude Code

```bash
/plugin marketplace add JSdotNet/ai-plugins
```

Then `/plugin install <name>@jsdotnet-copilot`. The marketplace keeps the name
`jsdotnet-copilot`: it is a per-machine key that every installed plugin references, so the
repository rename did not touch it.

### GitHub Copilot CLI

```bash
copilot plugin install JSdotNet/ai-plugins:plugins/architecture
```

`copilot plugin update architecture` refreshes an installed plugin and `copilot plugin list`
shows what is available.

### Host plugins

`claude-desktop` is the Claude side. In Claude Code it installs like any other plugin. In Claude
Desktop its dashboard renders inline in the conversation as an MCP App; build the bundle with
`pwsh ./scripts/Build-DesktopExtension.ps1`, which writes `dist/orch-dashboard-<version>.mcpb`.
Both paths are in [plugins/claude-desktop/README.md](plugins/claude-desktop/README.md).

`copilot-app` is the Copilot side. Its canvas extensions under `plugins/copilot-app/extensions/`
add side-panel surfaces a flow opens on behalf of the content plugins — `diagram-canvas`
(Mermaid), `markdown-canvas` (Markdown preview), and `orch-dashboard` (run progress). No content
plugin depends on them. `diagram-canvas` and `markdown-canvas` install on their own:

```bash
copilot plugin install JSdotNet/ai-plugins:plugins/copilot-app/extensions/diagram-canvas
```

`orch-dashboard` has no plugin manifest and installs through the app extension installer from
`https://github.com/JSdotNet/ai-plugins/tree/main/plugins/copilot-app/extensions/orch-dashboard`;
address it by the full provider id `plugin:copilot-app:orch-dashboard`, and if duplicate
providers are reported, remove stale user-scope copies from `%USERPROFILE%\.copilot\extensions`.

## Repository layout

```text
ai-plugins
|- AGENTS.md                    the standing rules; CLAUDE.md imports it,
|                               .github/copilot-instructions.md points at it
|- .agents/rules/               path-scoped rules, one copy each
|- .claude/rules/               Claude wrappers, one per rule
|- .github/
|  |- instructions/             Copilot wrappers, one per rule
|  |- skills/                   repository-local skills
|  \- workflows/                check-assets.yml, nightly-plugin-version-bump.yml
|- .claude-plugin/marketplace.json   the marketplace, one entry per plugin
|- plugins/<name>/              one folder per plugin, each installable on its own
|- docs/copilot/                dual-host reference and inventories
|- tools/                       check-assets.mjs, bump-version.mjs, tool-map.json
|- scripts/                     Build-DesktopExtension.ps1, generate-diagram-svgs.ps1
\- copilot-plugins.md           the plugin table
```

Inside a plugin, `agents/`, `skills/`, and `resources/` are shared by both hosts; the
manifests (`.github/plugin/plugin.json`, `.claude-plugin/plugin.json`) and the hooks
(`hooks.json`, `hooks/`) are one file per host, all hand-authored. No plugin ships an
`instructions/` folder — a file that must reach a session is a
`resources/` contract referenced by path, or a `sessionStart` hook. The full layout is in
[AGENTS.md](AGENTS.md).

## Dual-host model

One copy of every agent, skill, and contract serves both hosts, because each host ignores
the keys it does not know. There is no generator: every file is hand-authored, and
`node tools/check-assets.mjs` fails when the two hosts' files disagree. The rules that make
one copy possible — no `model` pins, one tools list with Copilot ids first and the Claude
names `tools/tool-map.json` derives from them, no host-specific tool names in prose, a
`sessionStart` prompt hook twinned by a Claude command hook plus sidecar — are in
[docs/copilot/claude-code-compatibility.md](docs/copilot/claude-code-compatibility.md).

## Working on the repository

1. Edit under `plugins/<name>/`; a change that touches one host's manifest or hooks touches
   the other's in the same commit.
2. Bump the version — both manifests, the marketplace entry, and the `copilot-plugins.md`
   row must agree:

   ```bash
   node tools/bump-version.mjs <plugin> [patch|minor|major]
   ```

3. Run the checker:

   ```bash
   node tools/check-assets.mjs
   ```

   It fails on a version that disagrees across the four places, on an agent shape a host
   rejects, on a Claude hook that drifted from its Copilot twin, on a rule whose wrappers
   drifted, and on a plugin with an `instructions/` folder; it writes nothing.
   `.github/workflows/check-assets.yml` runs it on every pull request.
4. Reinstall the plugin and exercise the agent or skill.
5. Commit one logical change per commit; leave nothing uncommitted.

Rules for the assets themselves — frontmatter, body budgets, tone, Markdown baseline — are the
eight topics under `.agents/rules/`, each wrapped once per host; the convention is
[.agents/rules/README.md](.agents/rules/README.md). Read the matching
`plugins/spec-builder/resources/create-*.md` contract before authoring an asset of that type.

## References

- [copilot-plugins.md](copilot-plugins.md) — plugin table with versions and install strings
- [docs/copilot/copilot-skills.md](docs/copilot/copilot-skills.md) — skill inventory
- [docs/copilot/copilot-reference.md](docs/copilot/copilot-reference.md) — Copilot CLI reference
- [docs/copilot/claude-code-compatibility.md](docs/copilot/claude-code-compatibility.md) — how one file serves both hosts
- [AGENTS.md](AGENTS.md) — standing rules

## License

There is no repository-level license file; every plugin manifest declares `MIT`.
