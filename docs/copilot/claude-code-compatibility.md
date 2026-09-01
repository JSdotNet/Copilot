# Claude Code Compatibility

## Purpose

The plugins in `plugins/` are authored for GitHub Copilot and also load in Claude Code.
There is **one copy of every file** — no parallel Claude tree. This works because both hosts
ignore frontmatter they do not understand, and both silently drop tool names they cannot
resolve, so a single agent file can carry the vocabulary of both.

Only the manifest location and the hook shape genuinely differ, and those are generated.

The single exception is the `copilot-app` / `claude-desktop` pair, where the host difference is
not frontmatter but a UI surface Claude Code does not have. See **Claude-native plugins**.

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
regenerate. The one exception is a Claude-native plugin (`claude-desktop`), which has no Copilot
source to generate from and is hand-authored throughout — see **Claude-native plugins**.

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
| `aspire_*`, `list_resources`, `list_traces`, `doctor`, … | `mcp__plugin_qa_aspire`, `mcp__aspire` |
| `browser_*`, `playwright-browser_*` | `mcp__plugin_qa_playwright`, `mcp__playwright` |
| `vscode/memory`, `extensions_*`, `*_canvas*` | *no equivalent; Copilot-only* |

Every agent additionally gets `Skill`: Copilot exposes a plugin's skills to its agents
implicitly, Claude requires the tool to be listed.

MCP tool ids translate to **server-level** patterns rather than a list of tool names, and to
both spellings of the server:

- `mcp__plugin_<plugin>_<server>` — how Claude names a server a plugin provides, because it
  namespaces it with the providing plugin (`plugin:qa:aspire` normalizes to
  `plugin_qa_aspire`).
- `mcp__<server>` — the same server registered directly in a repository's `.mcp.json`.

`tools` is an allowlist matched against exact runtime names, so naming only one form costs
every tool of that server, silently: the agent launches with its built-ins and reports itself
blocked. Granting the server also survives the server renaming its tools, which is not
hypothetical — Aspire's `get_*` query tools became `list_*` and its metrics tool disappeared.

The cost is granularity: Claude cannot allow a subset of one server's tools this way, so an
agent meant to use a server read-only (`qa-monitor`) carries that intent in its prose
constraints instead of in the allowlist. The generator fails if an agent declares an MCP tool
id whose server the plugin's own manifest does not declare, since the emitted pattern would
name a server that never surfaces.

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

For most events only the nesting and the event casing change, because Claude Code also
supports `type: "prompt"` hooks:

```jsonc
// Copilot                              // Claude Code
{"version":1,"hooks":{                  {"hooks":{
  "preToolUse":[                          "PreToolUse":[
    {"type":"prompt","prompt":"..."}        {"hooks":[{"type":"prompt","prompt":"..."}]}
  ]}}                                     ]}}
```

**`sessionStart` is the exception, and it is the important one.** A prompt hook runs by
issuing a sub-prompt into the conversation, and at session start there is no conversation
yet, so Claude Code refuses it:

```text
Failed to run: prompt-type hooks are not supported for SessionStart events
(no conversation context is available). Use a command-type hook instead.
```

It is recorded as a *non-blocking* hook error. Nothing surfaces in the UI, the session starts
normally, and the guidance is simply absent — which is how every plugin in this repository
shipped a dead session-start hook for its whole history.

So `sessionStart` translates to a **command** hook plus two generated siblings:

| Generated file | Contents |
| --- | --- |
| `hooks/session-start-context.md` | the authored prompt text, verbatim |
| `hooks/emit-session-context.mjs` | reads that file, prints the hook JSON envelope |
| `hooks/hooks.json` | `{"type":"command","command":"node \"${CLAUDE_PLUGIN_ROOT}/hooks/emit-session-context.mjs\""}` |

The emitter returns the text as `hookSpecificOutput.additionalContext`, which Claude injects
into the new session. Plain stdout is injected too, but the envelope states the intent, so the
generator uses it. Keeping the prose in a sidecar rather than inside the command string keeps
it out of shell quoting and keeps the diff readable. Requires Node on the host; Claude Code
already runs on it.

Two consequences for authoring:

- Several `sessionStart` prompts in one Copilot `hooks.json` collapse into one sidecar,
  separated by a blank line. They are context, not separate turns, so nothing is lost.
- Dropping the last `sessionStart` prompt deletes the sidecar and emitter as well; otherwise
  the plugin would keep injecting guidance nobody authored any more.

`sessionEnd` prompt hooks are a lesser trap: Claude runs them only in the interactive REPL and
reports `Prompt stop hooks are not yet supported outside REPL` in a headless run. The
generator translates them but warns. `userPromptSubmit`, `preToolUse`, `postToolUse`, and
`stop` all accept prompt hooks and pass through unchanged.

#### Which host reads which file

Hook discovery differs between the hosts, and the difference is load-bearing:

| File | Claude Code | Copilot CLI |
| --- | --- | --- |
| `plugins/<name>/hooks.json` (root) | **ignored** | loaded |
| `plugins/<name>/hooks/hooks.json` | loaded | loaded **only if the root file is absent** |

Two consequences:

- The generated `hooks/` tree is invisible to Copilot for every plugin here, because each one
  has a root `hooks.json` — which is guaranteed by construction, since the generator only
  writes `hooks/` when the root file exists. Do not rely on Copilot being unable to *parse*
  the Claude shape: it reads nested groups and PascalCase event names fine, and will run them
  if it ever reaches the file. Precedence is the whole protection.
- The split doubles as a way to target one host. A root `hooks.json` reaches Copilot only; a
  `hooks/hooks.json` reaches Claude only. `claude-desktop` uses exactly that to warn a Copilot
  user that the plugin is Claude-only (see its README), and the warning also suppresses
  Copilot's fallback so it never tries to run the plugin's `${CLAUDE_PLUGIN_ROOT}` commands.

Copilot also supports `command` hooks on `sessionStart`, so one shape *could* serve both
hosts. It is not worth it: the prompt hook needs no Node and no sidecar, so the Copilot side
keeps it. Note that Copilot fires `prompt` hooks only in new interactive sessions — never on
resume, and never under `-p` — so a `-p` run is not a valid way to test one.

## Claude-native plugins

One plugin is authored for Claude only: **`claude-desktop`**, the sibling of `copilot-app`.
Its manifest and hooks are hand-written, nothing under it is generated, and the sync script
lists it in `$ClaudeNativePlugins` so it still appears in `marketplace.json`. That listing is
the only thing the generator does for it.

"Claude only" is a statement of intent, not something the hosts enforce: Copilot will load the
plugin from `.claude-plugin/plugin.json` and surface its skills if a user points `--plugin-dir`
at it. Its root `hooks.json` exists to say so in that case — see the file table above.

It ships twice from one implementation: as a Claude Code plugin, and as a **Claude Desktop
extension** (`.mcpb`) built by `scripts/Build-DesktopExtension.ps1`. On the Desktop side the
dashboard renders inline in the conversation as an
[MCP App](https://modelcontextprotocol.io/extensions/apps/overview) — `ui://` resources under
the `io.modelcontextprotocol/ui` extension — which is the real replacement for the Copilot
canvas panel. Claude Code is not on the MCP Apps
[client matrix](https://modelcontextprotocol.io/extensions/client-matrix), so there the same
three pages are served over local HTTP instead. Extension support is negotiated, so neither
host needs to know about the other's surface.

It exists because a canvas cannot be translated — it has to be rebuilt on a different
transport:

| `copilot-app` | `claude-desktop` |
| --- | --- |
| `orch-dashboard` canvas panel | MCP App panel inline in Claude Desktop; a page on `127.0.0.1` elsewhere |
| canvas actions (`invoke_canvas_action`) | MCP tools (`mcp__plugin_claude-desktop_orch-dashboard__*`), same names and arguments |
| `diagram-canvas`, `markdown-canvas` extensions | `/mermaid` and `/markdown` routes on the same server, driven by `render_diagram` / `render_markdown` |
| host session telemetry events | `PreToolUse`/`PostToolUse`/`SubagentStop`/`PreCompact`/`Stop` hooks plus the session transcript |
| (no equivalent) | `SessionEnd` hook, which stamps an unfinished run idle so an abandoned gate stops accruing elapsed time |
| `.github/copilot-orch-context.md`, `.github/copilot-model-selection.md` | `.claude/orch-context.md`, `.claude/model-selection.md` |
| Copilot model families in the selection table | `opus` / `sonnet` / `haiku` aliases |
| child sessions for concurrent work | background sub-agents, `isolation: "worktree"` when a separate checkout is needed |

What is genuinely shared is the interesting part: `render.mjs` and `report.mjs` are
byte-identical in both plugins, and `store.mjs`/`insight.mjs` differ only in comments and in
the tool names the category table matches — none of them ever touched the Copilot SDK. Keep
the two plugins' skills, stage names, and dashboard contract in step; a change to shared
behavior usually belongs in both.

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

**`copilot-app` is Copilot-only; `claude-desktop` is its Claude sibling.** `copilot-app` is built
around the Copilot CLI canvas extension API (`diagram-canvas`, `markdown-canvas`,
`orch-dashboard`), which has no Claude counterpart, so it stays excluded from generation.
The port could not be a translation — it needed a different transport — so it lives as a
separate, hand-authored plugin. See **Claude-native plugins** below.

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
