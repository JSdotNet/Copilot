# copilot-app

Installable GitHub Copilot App host plugin: one session-maintenance skill and the three
canvas extensions that give a run a visual surface inside the Copilot App.

The orchestration lane this plugin used to carry — the `orch-*` skills, the shared phases,
the `automation-*` schedule entries, `azure-sre-to-github-issue`, and
`start-session-from-issue` — continues as `delivery@jsdotnet`, `delivery-schedule@jsdotnet`,
and `fleet@jsdotnet` in [JSdotNet/ai-agent-stack](https://github.com/JSdotNet/ai-agent-stack)
(`orch-*` became `flow-*`, `automation-*` became `schedule-*`, `workflow-*` became
`fleet-*`). The canvases have a host-neutral successor there too
(`delivery-surface-canvas`); the copies here stay for a Copilot App that runs without that
marketplace.

## Includes

### Skills

- `skills/update-open-sessions/SKILL.md` - Rebase or merge all open Copilot sessions onto
  the latest source branch.

### Canvas Extensions

- `extensions/orch-dashboard/` - Live progress and output dashboard. See
  `extensions/orch-dashboard/README.md` for the canvas action contract and install
  instructions; `resources/dashboard-contract.md` resolves the provider and
  sets the reporting cadence a skill follows.
- `extensions/diagram-canvas/` - Mermaid diagram viewer canvas (`mermaid-diagram`). Installs
  and runs independently of `copilot-app` — see `extensions/diagram-canvas/README.md`.
- `extensions/markdown-canvas/` - Markdown document preview canvas (`markdown-preview`).
  Installs and runs independently of `copilot-app` — see
  `extensions/markdown-canvas/README.md`.

`resources/canvas-usage.md` says when a skill opens the content-preview
canvases alongside the dashboard.

## Install

```bash
copilot plugin install <owner>/<repo>:plugins/copilot-app
copilot plugin list
```

The canvas extensions are separate opt-in steps (canvas extensions are not installed by the
plugin mechanism itself, and each has its own install method):

- `orch-dashboard`: install with the `install_extension` tool using a repo folder URL such as
  `https://github.com/<owner>/<repo>/tree/<ref>/plugins/copilot-app/extensions/orch-dashboard`,
  choosing `project`, `user`, or `session` scope. See `extensions/orch-dashboard/README.md`.
  Use the full provider ID `plugin:copilot-app:orch-dashboard`; if duplicate
  `orch-dashboard` providers are reported, remove stale user-scope copies from
  `%USERPROFILE%\.copilot\extensions` after confirming they are not needed.
- `diagram-canvas` and `markdown-canvas`: each has its own `.github/plugin/plugin.json`, so
  install them the same way as any plugin, independently of each other:
  `copilot plugin install <owner>/<repo>:plugins/copilot-app/extensions/diagram-canvas`
  and
  `copilot plugin install <owner>/<repo>:plugins/copilot-app/extensions/markdown-canvas`.

> **Plugin changes require a reinstall.** Skill and instruction changes take effect only
> after the plugin is reinstalled or updated from GitHub — run
> `copilot plugin install <owner>/<repo>:plugins/copilot-app`, or use
> `scripts/install-or-update-plugins.ps1` in this repository.

## Uninstall

```bash
copilot plugin uninstall copilot-app
```

## Contributing

Updates to skills should follow:

- [Skills](../../.agents/rules/skills.md)
- [Agent Language and Tone](../../.agents/rules/agent-language-and-tone.md)
- [Markdown Guidelines](../../.agents/rules/markdown.md)

## License

UNLICENSED

## Author

Job Schepers
