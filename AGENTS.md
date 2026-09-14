# Copilot

A plugin marketplace named `jsdotnet-copilot`: the specialist agents, skills, and contracts
that fill the roles a delivery flow consults — architecture, coding, QA, domain, UX, docs,
product, security — plus the two host plugins and the trackers. One folder per plugin under
`plugins/`, each installable on its own.

Assets are authored once and loaded by both GitHub Copilot and Claude Code — both hosts ignore
keys they do not know, which is what lets one file serve both. Only the Claude manifest, the
Claude hook file, and the marketplace are generated, by `pwsh ./scripts/Sync-ClaudePlugins.ps1`
from the Copilot manifest and `hooks.json`; everything else is hand-authored.

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

Before committing, run the sync and its check:

```bash
pwsh ./scripts/Sync-ClaudePlugins.ps1
pwsh ./scripts/Sync-ClaudePlugins.ps1 -Check
```

The first regenerates the Claude assets; the second fails on drift, on an agent shape a host
rejects — a missing description, an unloadable model pin, an unmapped tool id, a flow-control
tool on a specialist — and on a repository rule whose wrappers no longer match it.
`.github/workflows/claude-plugin-sync-check.yml` runs the check on every pull request that
touches `plugins/`.

## Committing

- Commit after every change, one logical change per commit.
- Leave nothing uncommitted when handing back.
- Never push and never open a pull request until asked.

## Plugin layout

```
plugins/<name>/
  .github/plugin/plugin.json      Copilot manifest — authored; name, version, description
  .claude-plugin/plugin.json      Claude manifest — generated (hand-authored for claude-desktop only)
  agents/<role>.agent.md          frontmatter name equals <role>; Copilot tool ids, Claude ones appended
  skills/<skill>/SKILL.md
  resources/<name>.md             a contract an asset reads by path — name and description, no glob —
                                  or a template or prompt fragment, which carries no frontmatter
  hooks.json                      Copilot hooks — authored
  hooks/                          Claude hooks and the sessionStart sidecar — generated
  mcp/<server>/                   an MCP server, declared under mcpServers (claude-desktop)
  extensions/<name>/              a Copilot canvas extension (copilot-app)
  scripts/                        executables a skill runs from the plugin itself
  README.md                       what the plugin is. Every plugin has one
```

There is no `instructions/` folder: no host auto-applies a glob from inside a plugin, so a
file that needs to reach a session is a contract referenced by path, or a `sessionStart` hook.
A new plugin also needs a row in `copilot-plugins.md`; the marketplace entry is generated.

## Versioning

A plugin change bumps the version in the Copilot manifest, and the sync carries it into the
Claude manifest and the marketplace; the `copilot-plugins.md` table is updated by hand. All
four must agree.

## Where the rest of the rules are

A rule that applies to one kind of file is authored once in `.agents/rules/` and wrapped per
host: Claude loads `.claude/rules/<topic>.md` when it opens a matching file, Copilot loads
`.github/instructions/<topic>.instructions.md`. Eight topics — `agents`, `skills`,
`skill-invocation`, `plugin-contracts`, `manifests`, `hooks`, `agent-language-and-tone`,
`markdown`. Change a rule and its two wrappers in the same commit; the sync check fails on
drift. The convention is [.agents/rules/README.md](.agents/rules/README.md).

Read the matching `plugins/spec-builder/resources/create-*.md` contract before authoring an
asset of that type; `plugins/spec-builder/resources/spec-conciseness.md` holds the body
budgets. `docs/copilot/claude-code-compatibility.md` explains what the sync generates and why.

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
