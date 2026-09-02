# CLAUDE.md

Repository instructions for Claude Code. This repository builds and curates Copilot and
Claude Code customization assets as installable plugins under `plugins/*`.

## Reading These Rules

The authoritative rules live in `.github/instructions/**` and are shared with GitHub Copilot,
which applies them automatically through their `applyTo` frontmatter. Claude Code does not
apply `applyTo`, so read the matching file yourself before editing an asset of that type:

| Editing | Read first |
| --- | --- |
| Any Markdown in this repository | `.github/instructions/markdown.instructions.md` |
| Anything under `.github/**` | `.github/instructions/customization-structure.instructions.md` |
| `plugins/*/skills/**/SKILL.md` | `.github/instructions/skill-invocation.instructions.md` |
| `.github/agents/**` | `.github/instructions/meta-agent.instructions.md`, `.github/instructions/agent-handoff.instructions.md` |
| Agent-facing prose anywhere | `.github/instructions/agent-language-and-tone.instructions.md` |
| A specific asset type | The matching `plugins/spec-builder/instructions/authoring/create-*.instructions.md` |

`.github/copilot/copilot-instructions.md` is the Copilot entry point and carries the same
priority ordering. Where the two disagree, that file wins and this one is stale — fix it.

## Skill Invocation

Every skill in `plugins/*/skills/` is either model-invoked or user-invoked, and the choice is
a trade between always-loaded context and the human's own memory:

- **Model-invoked** — no `disable-model-invocation` key. The model may fire it, and another
  skill or agent may reach it. Keep the trigger phrasing in `description`.
- **User-invoked** — `disable-model-invocation: true`. Only the human can fire it; nothing
  else can reach it, including the Skill tool. `description` is one human-facing line.

`automation-*`, `workflow-morning-brief`, and `knowledge-base:from-spec-*` are user-invoked.
Everything else is model-invoked, including `create-*`, `product-owner:write-*`,
`workflow-issue-sweep`, and `workflow-resolve-issue` — agents dispatch to the first two, and a
scheduled routine or a dispatched worker session is the only invoker of the last two. Neither
an agent nor a routine can reach a user-invoked skill: only a human typing the name can.
Before marking anything user-invoked, grep the agents, hook prompts, and dispatch prompts for
its name, and check whether its own body documents a routine lane.

Skills that cross the specification/code boundary in both directions are named
`to-spec-<kind>` (code becomes a chapter) and `from-spec-<kind>` (a chapter becomes a change
brief). The literal `spec` carries the direction: `<kind>` alone would not, because an
aggregate is both a chapter and a class. The full rule is in
`.github/instructions/skill-invocation.instructions.md`.

## Dual-Host Constraint

One copy of every skill, agent, and instruction file serves both hosts. Only the manifest and
the hook shape are generated per host, by `scripts/Sync-ClaudePlugins.ps1`.

- Do not name host-specific tools in a skill body. Describe the action.
- Keep frontmatter to `name` and `description`, plus `disable-model-invocation` where the
  invocation rule calls for it. Copilot ignores that key, which degrades safely.
- Run `pwsh ./scripts/Sync-ClaudePlugins.ps1` after changing any plugin manifest, agent, or
  hook, and commit the regenerated Claude assets.

## Versioning

A plugin change bumps the version in **both** manifests — `plugins/<name>/.claude-plugin/plugin.json`
and `plugins/<name>/.github/plugin/plugin.json` — and the matching entries in
`.claude-plugin/marketplace.json` and the `copilot-plugins.md` table. All four must agree.
