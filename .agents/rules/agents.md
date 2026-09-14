---
name: agents
description: Frontmatter, tools, and handoff rules for a plugin agent file.
paths:
  - "plugins/*/agents/**/*.agent.md"
---

# Agents

- `name` equals the filename's `<role>`; `description` is required — Claude refuses to load an
  agent without one.
- No `model` pin unless the value is `opus`/`sonnet`/`haiku`/`fable`/`inherit` or a real
  `claude-*` id; anything else fails to load on one host. Put the preference in a `## Model`
  body section.
- `tools` is one union list: the Copilot tool ids first, then the Claude names
  `tools/tool-map.json` translates them to, so one list serves both hosts. The checker
  derives the Claude half and fails on an entry the map does not produce, on one it produces
  that is missing, and on a Copilot id the map does not know — add it there, never guess.
- No specialist carries flow control. `create_session`, `send_session_message`,
  `respond_to_session_plan`, `list_sessions_and_chats`, `get_session`, `list_projects`,
  `SendMessage`, and an unscoped `agent` are refused by the checker on every plugin here: a role
  names where out-of-scope work belongs and leaves sequencing, approval, and delegation to
  whatever consulted it. `agent` scoped by an `agents:` list to a read-only helper is allowed.
- For MCP, name the server's tools by their Copilot ids and grant the whole server in both
  spellings — `mcp__plugin_<plugin>_<server>` and `mcp__<server>` — because the prefix
  depends on how the server was registered; the server must be declared in the Claude manifest.
- Claude ignores the `handoffs` key: name every handoff target in the body prose, as
  `<plugin>:<agent>`, and never write an approval step around it.
- A contract in `resources/` reaches Claude only when something references its path — neither
  host auto-applies a file from inside a plugin. Reference every one the agent depends on, per
  [plugin-contracts.md](plugin-contracts.md).
- An agent that writes into a devbook folder names both layouts — `.arc42/` and
  `.devbook/arc42/`, and their siblings — and defers to that folder's own rules for structure
  and metadata.

Body budget 80 lines: `plugins/spec-builder/resources/spec-conciseness.md`.
`node tools/check-assets.mjs` enforces the frontmatter and tool rules above.
