# Claude Code Compatibility

## Purpose

The plugins in `plugins/` are authored for GitHub Copilot and also load in Claude Code.
There is **one copy of every file** — no parallel Claude tree. This works because both hosts
ignore frontmatter they do not understand, and both silently drop tool names they cannot
resolve, so a single agent file can carry the vocabulary of both.

Only the manifest location and the hook shape genuinely differ, and those are generated.

## Layout

| Path | Authored by | Read by |
| --- | --- | --- |
| `skills/<name>/SKILL.md` | hand | both |
| `instructions/`, `prompts/`, `resources/` | hand | both |
| `agents/<role>.agent.md` | hand, except `name` + `tools` | both |
| `.github/plugin/plugin.json` | hand | Copilot |
| `hooks.json` | hand | Copilot |
| `.claude-plugin/plugin.json` | **generated** | Claude |
| `hooks/hooks.json` | **generated** | Claude |
| `.claude-plugin/marketplace.json` (repo root) | **generated** | Claude |

Never edit anything under `.claude-plugin/` or `hooks/`. Change the Copilot source and
regenerate.

## Regenerating

```bash
pwsh ./scripts/Sync-ClaudePlugins.ps1
```

Check mode reports drift and exits non-zero without writing. This is what CI runs:

```bash
pwsh ./scripts/Sync-ClaudePlugins.ps1 -Check
```

`Claude Plugin Sync Check` runs on every pull request touching `plugins/`, and the nightly
version-bump workflow regenerates after bumping so the mirrored `version` stays true.

## How one agent file serves both hosts

| Field | Copilot | Claude Code | Resolution |
| --- | --- | --- | --- |
| `name` | optional, falls back to filename | **required** | present; Copilot honours it |
| `description` | optional | **required** | present |
| `tools` | optional; **ignores unavailable tools** | optional; ignores unresolved entries provided at least one resolves | one union list |
| `agents` | delegation whitelist | unknown key, ignored | kept, plus `Agent(...)` in `tools` |
| `handoffs` | delegation buttons | unknown key, ignored | kept; targets documented in the body |
| `model` | Copilot model ids | Claude aliases only | **omitted** — see below |

The `tools` list carries Copilot ids first, then their Claude equivalents:

```yaml
tools:
  - 'read/readFile'      # Copilot keeps these
  - 'terminal/runInTerminal'
  - 'Read'               # Claude keeps these
  - 'Bash'
  - 'Skill'
```

Each host filters the list to what it recognises. Claude only refuses to launch an agent
when *nothing* in the list resolves, which cannot happen here.

`scripts/Sync-ClaudePlugins.ps1` maintains the `name` and `tools` lines in place. Author the
Copilot tool ids; the script appends the Claude equivalents and rebuilds the list from the
Copilot ids alone, so the output is a pure function of the authored intent and hand-edits to
the Claude half are reverted. Everything else in the file is yours.

### Tool translation

`scripts/claude-sync/tool-map.json` holds the table. The generator **fails** on an unmapped
tool id rather than guessing, so a new Copilot tool surfaces as a build error.

| Copilot | Claude Code |
| --- | --- |
| `read/readFile`, `vscode/openFile` | `Read` |
| `search`, `search/codebase` | `Grep`, `Glob` |
| `search/textSearch`, `search/usages`, `search/searchResults` | `Grep` |
| `search/fileSearch`, `search/findTestFiles`, `search/listDirectory` | `Glob` |
| `search/changes` | `Bash` |
| `edit/createFile` | `Write` |
| `edit/editFiles` | `Edit` |
| `terminal/runInTerminal`, `execute/createAndRunTask` | `Bash` |
| `web/fetch` | `WebFetch`, `WebSearch` |
| `agent` | `Agent` (or `Agent(...)` when `agents:` is set) |
| `vscode/askQuestions` | `AskUserQuestion` |
| `list_projects`, `create_session`, `list_sessions_and_chats` | `Agent` |
| `send_session_message`, `get_session`, `respond_to_session_plan` | `SendMessage` |
| `aspire_*`, `get_resources`, `get_traces`, … | `mcp__aspire` |
| `browser_*`, `playwright-browser_*` | `mcp__playwright` |
| `vscode/memory`, `extensions_*`, `*_canvas*` | *no equivalent; Copilot-only* |

Every agent additionally gets `Skill`: Copilot exposes a plugin's skills to its agents
implicitly, Claude requires the tool to be listed.

### Manifest

`skills` is omitted from the Claude manifest deliberately — Claude already scans `skills/`
by default, and the field *adds to* that default rather than replacing it.

`agents` lists the shared `.agent.md` files explicitly rather than naming a directory, which
avoids depending on how Claude globs a folder of `*.agent.md`.

`mcpServers` is copied through unchanged; the two hosts use compatible syntax.

`hooks` is omitted for the same reason as `skills` — Claude Code loads `hooks/hooks.json`
automatically. Naming it in the manifest too makes the plugin fail to load with
`Duplicate hooks file detected`; the field is only for hook files beyond that standard one.

### Hooks

Semantics survive intact, because Claude Code also supports `type: "prompt"` hooks. Only the
nesting and the event casing change:

```jsonc
// Copilot                              // Claude Code
{"version":1,"hooks":{                  {"hooks":{
  "sessionStart":[                        "SessionStart":[
    {"type":"prompt","prompt":"..."}        {"hooks":[{"type":"prompt","prompt":"..."}]}
  ]}}                                     ]}}
```

## Installing in Claude Code

```bash
/plugin marketplace add JSdotNet/Copilot
```

Then `/plugin install <name>@jsdotnet-copilot`.

## Known differences

**No `model` pins.** Claude Code refuses to load an agent whose `model` it does not
recognise — it does not fall back. Since both hosts read the same key and neither accepts
the other's model ids, pins were removed from the six `development/agents-internal/` agents
and the intent recorded in a `## Model` section in each body. Each host now applies its own
default. The generator rejects any pin that is not a Claude-valid value, so this cannot
regress silently.

**`copilot-app` is Copilot-only and excluded.** It is built around the Copilot CLI canvas
extension API (`diagram-canvas`, `markdown-canvas`, `orch-dashboard`), which has no Claude
counterpart. Porting it means rewriting the extensions — as Artifacts for rendered output
and an MCP server for the dashboard — not translating them.

**`applyTo` instructions are not auto-applied.** Claude has no glob-scoped instruction
injection. This matters less than it looks: 75 skill and agent files already reference these
instructions explicitly by path, and explicit references work identically under Claude. Only
instructions relying purely on ambient glob matching lose behaviour; those need a
`PostToolUse` hook with a `matcher`, or promotion into the plugin's `SessionStart` hook.

**`handoffs` are invisible to Claude.** Claude ignores the key and delegates from what it
reads in the prose, so every handoff target must be described in the agent body. The
generator warns when a declared target is never mentioned there.

**Internal agents are visible in Claude.** There is no equivalent of Copilot's
"`agents-internal/` is not exposed directly" convention. Those agents are listed in the
Claude manifest anyway, because they are live handoff targets and dangling references would
be worse than extra visibility.

**`AskUserQuestion` is foreground-only.** Claude strips it from background subagents, so
agents translated from `vscode/askQuestions` cannot prompt when run in the background.

## Linting

Beyond generating, the script fails the build on problems a script must not fix by itself:

- an agent with no `description`
- a `model` value Claude would reject
- a tools list that resolves to nothing for either host
- an unmapped Copilot tool id

and warns on:

- a handoff target the agent body never mentions
- Copilot tool ids left in agent **prose**, which it never rewrites. Currently two:
  `plugins/csharp-coding/agents/coding.agent.md` (`web/fetch`) and
  `plugins/development/agents-internal/development-plan.agent.md` (`vscode/askQuestions`,
  `edit/createFile`).
