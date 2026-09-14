# Repository rules

A rule that applies to one kind of file is authored **once** here and wrapped per host. A new
host adds a third wrapper; it never adds a second copy.

```
.agents/rules/<topic>.md                      the rule. One copy. name / description / paths.
  ├── .claude/rules/<topic>.md                wrapper: paths:   → pointer
  └── .github/instructions/<topic>.instructions.md
                                              wrapper: applyTo: → pointer
```

A wrapper carries frontmatter and one sentence of body. It never restates a rule. The shared
file declares `name`, `description`, and a `paths` list; the Claude wrapper copies `paths`
verbatim, and the Copilot wrapper's `applyTo` is that list joined with commas. Because
`applyTo` is exactly `paths.join(",")`, drift is machine-detectable —
`pwsh ./scripts/Sync-ClaudePlugins.ps1 -Check` fails on a wrapper whose glob differs from the
shared file, on a rule missing a wrapper, and on a wrapper with no rule. It checks the wrappers;
it does not write them.

The root file follows the same shape: `AGENTS.md` holds the standing rules, `CLAUDE.md` is an
`@AGENTS.md` import, and `.github/copilot-instructions.md` is one sentence telling Copilot to
read it.

`.agents/rules/` is not a ratified standard. `AGENTS.md` is the standard for the *root* file
and defines no globs; [agents.md#179](https://github.com/agentsmd/agents.md/issues/179) is the
open proposal for glob-scoped rules, and its `name` / `description` / `paths` shape is what
this convention uses. It is the same convention `JSdotNet/ai-agent-stack` holds its plugins to.

## One exception, deliberate

**A plugin cannot ship rules.** There is no rules component and no `rules` key in
`plugin.json`, and a plugin-root `CLAUDE.md` is not loaded. Everything here is
repository-scoped: it serves people working **in** this repository, never someone who
installed a plugin from it. Shared text a plugin's skill or agent needs is a contract in that
plugin's `resources/`, reached by an explicit path reference — see
[plugin-contracts.md](plugin-contracts.md).

## Topics

| Topic | Governs |
| --- | --- |
| `agents` | `plugins/*/agents/**/*.agent.md` |
| `skills` | `plugins/*/skills/**/SKILL.md` |
| `skill-invocation` | the same files — model-invoked or user-invoked, and converter naming |
| `plugin-contracts` | `plugins/*/resources/*.md` |
| `manifests` | both plugin manifests and the marketplace |
| `hooks` | both hook files and the generated sidecar |
| `agent-language-and-tone` | agents and skills — output language and tone |
| `markdown` | every Markdown file |

A rule fires when a host **reads** a matching file, so authoring one from scratch may not
trigger it. Open a sibling first, or read the rule directly.

All three directories are committed, so every worktree under `.claude/worktrees/` picks them
up. A rule is therefore never the place for anything personal or machine-local.
