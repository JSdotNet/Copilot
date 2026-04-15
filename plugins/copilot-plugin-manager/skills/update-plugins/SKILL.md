---
name: update-plugins
description: Reinstall all preferred plugins from the preferred list to apply the latest updates.
---

# Update Plugins Skill

## Purpose

Use this skill to update all preferred Copilot plugins by reinstalling them from their GitHub URLs.

## Inputs

- No required input. Reads from `resources/preferred-plugins.md`.
- Optionally: a single plugin name to update only that one.

## Workflow

1. Load `resources/preferred-plugins.md` to get the full list of preferred plugins and their URLs.
2. For each plugin (or the specified one), guide the user to run:
   ```bash
   copilot plugin install <github-url>
   ```
   Reinstalling is the correct update mechanism for Copilot CLI plugins.
3. After all reinstalls, verify:
   ```bash
   copilot plugin list
   ```
4. Confirm all preferred plugins are present and report any missing ones.

## Output

- Summary of updated plugins with verification output from `copilot plugin list`.
