# CLAUDE.md

Repository instructions for Claude Code. This repository builds and curates Copilot and
Claude Code customization assets as installable plugins under `plugins/*`.

## Reading These Rules

The authoritative rules live in `.agents/rules/**`, in files that carry no frontmatter and
name neither host. Each one has two thin loaders that differ only in dialect: Copilot's
`.github/instructions/<name>.instructions.md` carries `applyTo`, Claude's
`.claude/rules/<name>.md` carries `paths`, and both point back at the same body. Neither
loader holds a rule — so change a glob and change both loaders in the same commit, and change
a rule in `.agents/rules/` only.

Plugin-local instructions under `plugins/*/instructions/**` are the exception: a plugin
cannot ship rules or `.github/instructions/` loaders, so those reach Claude only when a skill
or agent references them by relative path, or when they are promoted to the plugin's `sessionStart` hook. Read the
matching `plugins/spec-builder/instructions/authoring/create-*.instructions.md` before
authoring an asset of that type.

`.github/copilot/copilot-instructions.md` is the Copilot entry point and carries the same
priority ordering. Where the two disagree, that file wins and this one is stale — fix it.

## Skill Invocation

Every skill in `plugins/*/skills/` is either model-invoked or user-invoked, and the choice is
a trade between always-loaded context and the human's own memory:

- **Model-invoked** — no `disable-model-invocation` key. The model may fire it, and another
  skill or agent may reach it. Keep the trigger phrasing in `description`.
- **User-invoked** — `disable-model-invocation: true`. Only the human can fire it; nothing
  else can reach it, including the Skill tool. `description` is one human-facing line.

`fincent`'s `automation-*` are user-invoked. Everything else is model-invoked, including
`create-*` and `product-owner:write-*` — agents dispatch to them. Neither an agent nor a
routine can reach a user-invoked skill: only a human typing the name can. Before marking
anything user-invoked, grep the agents, hook prompts, and dispatch prompts for its name, and
check whether its own body documents a routine lane. A body that documents one must either
give up the flag or give up the lane. The staged flows and fan-out this repository used to
ship (`orch-*`, `phase-*`, `workflow-*`) moved to `delivery@jsdotnet` and `fleet@jsdotnet`.

Skills that cross the specification/code boundary in both directions are named
`to-spec-<kind>` (code becomes a chapter) and `from-spec-<kind>` (a chapter becomes a change
brief). The literal `spec` carries the direction: `<kind>` alone would not, because an
aggregate is both a chapter and a class. No plugin here ships such a pair any more — they
moved with `knowledge-base` to `devbook@jsdotnet` — but the rule still governs any new one.
The full rule is in `.agents/rules/skill-invocation.md`.

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
