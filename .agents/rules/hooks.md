---
name: hooks
description: Hook file shapes for both hosts, and the sessionStart translation the sync performs.
paths:
  - "plugins/*/hooks.json"
  - "plugins/*/hooks/hooks.json"
  - "plugins/*/hooks/*.mjs"
  - "plugins/*/hooks/*.md"
---

# Hooks

Author `hooks.json` at the plugin root, in Copilot's shape: camelCase events (`sessionStart`,
`preToolUse`) and `type: prompt` entries. Never edit `hooks/` — `pwsh
./scripts/Sync-ClaudePlugins.ps1` generates `hooks/hooks.json` and, for `sessionStart`, the
`emit-session-context.mjs` + `session-start-context.md` sidecar pair, because Claude Code
rejects a `prompt` hook on `SessionStart` at runtime and logs the refusal as a non-blocking
error, so the guidance would vanish silently. The generated command hook prints the sidecar as
`additionalContext`.

- A `sessionStart` prompt loads in every session of every repository the plugin is enabled in.
  Keep it to what must apply with no reference — routing, an invariant, an address the host
  namespaces — and point at a contract for the rest.
- Copilot cannot guard a prompt hook, so the opening sentence hedges what a command hook could
  decide; a plugin built for one host says so in the other host's hook and stops.
- `claude-desktop` is the exception: hand-authored throughout, its `hooks/hooks.json` carries
  command hooks that read event payloads (telemetry), which have no Copilot counterpart, and
  its root `hooks.json` reaches Copilot alone.
