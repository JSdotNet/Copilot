---
name: list-plugins
description: List installed Copilot plugins and compare against the preferred plugins list to identify gaps.
---

# List Plugins Skill

## Purpose

Use this skill to view installed plugins and check alignment with the preferred plugins list.

## Inputs

- No required input. Reads from `resources/preferred-plugins.md` for comparison.

## Workflow

1. Guide the user to run:
   ```bash
   copilot plugin list
   ```
2. Load `resources/preferred-plugins.md`.
3. Compare the listed plugins against the preferred list:
   - **Installed and preferred** — aligned, no action needed.
   - **Preferred but not installed** — flag as missing; offer to trigger the `install-plugin` skill.
   - **Installed but not preferred** — flag as untracked; ask if it should be added to the preferred list or uninstalled.
4. Present a clear status summary.

## Output

- Status table: installed plugins cross-referenced against the preferred list with gap analysis.
