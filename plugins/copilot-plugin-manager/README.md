# copilot-plugin-manager

Installable GitHub Copilot CLI plugin for managing preferred Copilot plugins via GitHub URLs.

## Includes

- Agent:
  - `agents/plugin-manager.agent.md`
- Skills:
  - `skills/install-plugin/SKILL.md`
  - `skills/update-plugins/SKILL.md`
  - `skills/uninstall-plugin/SKILL.md`
  - `skills/list-plugins/SKILL.md`
  - `skills/check-plugin-updates/SKILL.md`
- Resources:
  - `resources/preferred-plugins.md`
  - `resources/domain-recommendations.md`

## Scope

- This plugin manages the lifecycle of GitHub Copilot CLI plugins: install, update, uninstall, list, and check for updates.
- It maintains a curated list of preferred plugins with their GitHub URLs.
- It does not author or compose plugin content — use `copilot-spec-builder` for that.

## Preferred Plugins List

Edit `resources/preferred-plugins.md` to add or remove preferred plugins. Each skill reads from this list.

## Local Install

```bash
copilot plugin install ./plugins/copilot-plugin-manager
copilot plugin list
```

## Install From GitHub

```bash
copilot plugin install https://github.com/<owner>/<repo>/plugins/copilot-plugin-manager
```

## Reinstall After Changes

```bash
copilot plugin install ./plugins/copilot-plugin-manager
```

## Uninstall

```bash
copilot plugin uninstall copilot-plugin-manager
```

## Resources

- [GitHub Copilot CLI Plugin Docs](https://docs.github.com/en/copilot/customizing-copilot) — official reference for plugin install and management.
- [Copilot CLI Reference](https://cli.github.com/manual/) — `gh copilot` command reference.

## Future Upgrades

- **Pinned versions** — support version pinning per plugin entry in `preferred-plugins.md`.
- **Diff report** — a skill that compares installed plugins against the preferred list and reports gaps.
- **Bulk install skill** — install all preferred plugins in one guided workflow.
- **Plugin health check** — verify that all installed plugin paths resolve correctly after a reinstall.
