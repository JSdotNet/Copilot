---
name: hooks
description: Hook file shapes for both hosts, and the sessionStart twin Claude needs.
paths:
  - "plugins/*/hooks.json"
  - "plugins/*/hooks/hooks.json"
  - "plugins/*/hooks/*.mjs"
  - "plugins/*/hooks/*.md"
---

# Hooks

Two hand-authored files, one per host. Copilot reads `hooks.json` at the plugin root: camelCase
events (`sessionStart`, `preToolUse`) and `type: prompt` entries. Claude reads
`hooks/hooks.json`: PascalCase events, each a list of matcher groups.

- Claude Code rejects a `prompt` hook on `SessionStart` at runtime and logs the refusal as a
  non-blocking error, so the guidance would vanish silently. A Copilot `sessionStart` prompt
  therefore has a Claude twin: a `command` hook running `hooks/emit-session-context.mjs`,
  which prints `hooks/session-start-context.md` as `additionalContext`. The sidecar holds the
  Copilot prompt(s) verbatim, blank-line separated; `node tools/check-assets.mjs` fails when
  the two stop saying the same thing. Reword one, reword both. Drop the last prompt, drop the
  sidecar and emitter with it.
- A `sessionStart` prompt loads in every session of every repository the plugin is enabled in.
  Keep it to what must apply with no reference — routing, an invariant, an address the host
  namespaces — and point at a contract for the rest.
- Copilot cannot guard a prompt hook, so the opening sentence hedges what a command hook could
  decide; a plugin built for one host says so in the other host's hook and stops.
- Every plugin with a `hooks/` folder also has a root `hooks.json`: Copilot falls back to
  `hooks/hooks.json` only when the root file is absent, and would run the Claude commands.
- `claude-desktop` is the exception: Claude-native, its `hooks/hooks.json` carries command
  hooks that read event payloads (telemetry), which have no Copilot counterpart, and its root
  `hooks.json` reaches Copilot alone to say the plugin is Claude-only.
