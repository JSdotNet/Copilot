---
name: uninstall-plugin
description: Uninstall a GitHub Copilot plugin by name using the Copilot CLI.
---

# Uninstall Plugin Skill

## Purpose

Use this skill to uninstall a Copilot plugin by its registered name.

## Inputs

- Plugin name to uninstall (the `name` field from `plugin.json`, e.g. `copilot-spec-builder`).

## Workflow

1. Confirm the plugin name with the user before proceeding.
2. Check `resources/preferred-plugins.md` — if the plugin is in the preferred list, warn the user and ask whether to also remove it from the list.
3. Guide the user to run:
   ```bash
   copilot plugin uninstall <plugin-name>
   ```
4. Verify the plugin is gone:
   ```bash
   copilot plugin list
   ```
5. If the user approved removal from the preferred list, guide the edit of `resources/preferred-plugins.md`.

## Output

- Confirmed uninstall with verification output from `copilot plugin list`.
