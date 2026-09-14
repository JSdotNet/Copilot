---
name: manifests
description: What each plugin manifest declares, and the four places a version must agree.
paths:
  - "plugins/*/.github/plugin/plugin.json"
  - "plugins/*/.claude-plugin/plugin.json"
  - ".claude-plugin/marketplace.json"
---

# Manifests

Both manifests are hand-authored and agree on `name`, `version`, and `description`. Nothing
generates one from the other; `node tools/check-assets.mjs` fails on any disagreement.

- `.github/plugin/plugin.json` (Copilot): `name`, `description`, `version`, `author`,
  `license`, `keywords`, and the component pointers — `agents`, `skills`, `hooks`.
- `.claude-plugin/plugin.json` (Claude): the same identity fields; list agent files explicitly
  under `agents` (`./agents/<role>.agent.md`) or handoffs to them dangle; omit `skills` and
  `hooks` — Claude scans `skills/` and loads `hooks/hooks.json` already, and naming the hooks
  file fails with "Duplicate hooks file detected"; declare MCP servers under `mcpServers`,
  and a successor in another marketplace under `dependencies` as `{ name, marketplace }`.
- The root `.claude-plugin/marketplace.json` lists every plugin that has a Claude manifest —
  `name`, `source` (`./plugins/<name>`), `description`, `version` — or Claude Code will not
  offer it. `copilot-app` ships no Claude manifest and `claude-desktop` no Copilot one; every
  other plugin ships both.

A version lives in four places — both manifests, the marketplace entry, and the
`copilot-plugins.md` row — and all four agree. `node tools/bump-version.mjs <plugin>
[patch|minor|major|x.y.z]` writes the same value into all four; the nightly workflow runs it
for every plugin whose tree changed. Write what a consumer would notice into the table's
Notes column.

`description` is the first thing a host shows: say what the plugin is, which role or service
it fills, and that it holds no flow control.
