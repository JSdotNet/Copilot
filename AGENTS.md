# Copilot

A plugin marketplace named `jsdotnet-plugins`: the specialist agents, skills, and contracts
that fill the roles a delivery flow consults — architecture, coding, QA, domain, UX, docs,
product, security — plus the two host plugins and the trackers. One folder per plugin under
`plugins/`, each installable on its own.

Assets are authored once and loaded by both GitHub Copilot and Claude Code — both hosts ignore
keys they do not know, which is what lets one file serve both. There is no generator: every
file here is hand-authored, and `node tools/check-assets.mjs` fails when the two hosts'
files disagree.

## What this marketplace is not

The staged delivery flows, the shared phases, the pull-request lane, the scheduled entries,
and the cross-session fan-out that used to ship here continue as `delivery`, `delivery-schedule`,
and `fleet` in the `jsdotnet` marketplace ([JSdotNet/ai-agent-stack](https://github.com/JSdotNet/ai-agent-stack)),
and the knowledge-folder convention as `devbook` there. A specialist here fills a role or a
service for that engine and is usable on its own; it never names the engine, and it holds no
flow control — it does not sequence stages, hold gates, spawn sessions, or delegate. Two host
plugins remain: `claude-desktop` (an MCP dashboard, `start`, `session-handoff`,
`create-pull-request`) and `copilot-app` (`update-open-sessions` and three canvases).

## Validating a change

Before committing, run the checker:

```bash
node tools/check-assets.mjs
```

It fails on a manifest, marketplace entry, or table row whose version disagrees with the
others; on an agent shape a host rejects — a missing description, an unloadable model pin, a
tools list that does not match `tools/tool-map.json`, a flow-control tool on a specialist; on
a Claude `SessionStart` hook that is not a command hook or a sidecar that no longer says what
the Copilot prompt says; on a repository rule whose wrappers drifted; and on a plugin that
grew an `instructions/` folder. It reports body budgets and writes nothing.
`.github/workflows/check-assets.yml` runs it on every pull request.

## Committing

- Commit after every change, one logical change per commit.
- Leave nothing uncommitted when handing back.
- Never push and never open a pull request until asked.

## Plugin layout

```
plugins/<name>/
  .github/plugin/plugin.json      Copilot manifest — same name, version, description as the Claude one
  .claude-plugin/plugin.json      Claude manifest — agents listed explicitly, mcpServers, dependencies
  agents/<role>.agent.md          frontmatter name equals <role>; tools as one union list, Copilot ids first
  skills/<skill>/SKILL.md
  resources/<name>.md             a contract an asset reads by path — name and description, no glob —
                                  or a template or prompt fragment, which carries no frontmatter
  hooks.json                      Copilot hooks (type: prompt)
  hooks/                          Claude hooks; a sessionStart prompt's twin is a command hook plus its sidecar
  mcp/<server>/                   an MCP server, declared under mcpServers (claude-desktop)
  extensions/<name>/              a Copilot canvas extension (copilot-app)
  scripts/                        executables a skill runs from the plugin itself
  README.md                       what the plugin is. Every plugin has one
```

There is no `instructions/` folder: no host auto-applies a glob from inside a plugin, so a
file that needs to reach a session is a contract referenced by path, or a `sessionStart` hook.
A new plugin also needs a marketplace entry in `.claude-plugin/marketplace.json` and a row in
`copilot-plugins.md`.

## Versioning

A plugin change bumps the version in both manifests, the marketplace entry, and the
`copilot-plugins.md` row — `node tools/bump-version.mjs <plugin> [patch|minor|major]` writes
all four. All four must agree.

## Where the rest of the rules are

A rule that applies to one kind of file is authored once in `.agents/rules/` and wrapped per
host: Claude loads `.claude/rules/<topic>.md` when it opens a matching file, Copilot loads
`.github/instructions/<topic>.instructions.md`. Eight topics — `agents`, `skills`,
`skill-invocation`, `plugin-contracts`, `manifests`, `hooks`, `agent-language-and-tone`,
`markdown`. Change a rule and its two wrappers in the same commit; the checker fails on
drift. The convention is [.agents/rules/README.md](.agents/rules/README.md).

Read the matching `plugins/spec-builder/resources/create-*.md` contract before authoring an
asset of that type; `plugins/spec-builder/resources/spec-conciseness.md` holds the body
budgets. `docs/copilot/claude-code-compatibility.md` explains how one file serves both hosts.

## Writing

An asset is read by a model on every load, so prose costs context and vagueness costs
behaviour.

- Imperative, present tense, no hedging. A softened rule is a rule that does not fire.
- Cut what the model already does by default, and state each rule in exactly one file — point
  at it by relative path from everywhere else.
- Body budgets: `SKILL.md` 40 lines, a rule or a `resources/` contract 60, `*.agent.md` 80.
  Past the budget, move reference behind a pointer, split, or state the reason in the file.
- Keep host-specific tool names out of skill and contract prose; describe the action.
- Exempt safety-critical text from any terseness rule: confirmations before irreversible
  actions stay in full prose.

## Pull requests

When creating a pull request in this repository, invoke the `pr-jsdotnet` skill
(`.github/skills/pr-jsdotnet/SKILL.md`) instead of the built-in PR creation tool, so the PR is
authored with JSdotNet organization credentials via `gh pr create`.
