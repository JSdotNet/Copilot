---
name: manifests
description: Which plugin manifest is authored, which is generated, and what must agree across the four places a version lives.
paths:
  - "plugins/*/.github/plugin/plugin.json"
  - "plugins/*/.claude-plugin/plugin.json"
  - ".claude-plugin/marketplace.json"
---

# Manifests

Author `.github/plugin/plugin.json` — `name`, `description`, `version`, `author`, `license`,
`keywords`, and the component pointers (`agents`, `skills`, `hooks`, `mcpServers`,
`dependencies`). Never edit `.claude-plugin/plugin.json` or the root
`.claude-plugin/marketplace.json`: `pwsh ./scripts/Sync-ClaudePlugins.ps1` generates both from
the Copilot manifest, and `-Check` fails in CI when they drift. The one hand-authored Claude
manifest is `claude-desktop`'s, which has no Copilot source; `copilot-app` has no Claude
manifest at all.

A version change touches four places that must agree: both manifests, the marketplace entry,
and the `copilot-plugins.md` table. Bump when anything under the plugin changes, and write
what a consumer would notice into the table's Notes column.

`description` is the first thing a host shows: say what the plugin is, which role or service
it fills, and that it holds no flow control. A plugin that continues in another marketplace
declares a `dependencies` entry on its successor there — `{ name, marketplace }` — which
Claude resolves and Copilot ignores.
