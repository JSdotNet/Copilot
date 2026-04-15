---
name: check-plugin-updates
description: Check which installed Copilot plugins have updates available and guide the user through applying them.
---

# Check Plugin Updates Skill

## Purpose

Use this skill to identify installed plugins that are outdated or missing compared to the preferred list, and guide the user through updating them.

## Inputs

- No required input. Reads from `resources/preferred-plugins.md` for the preferred list.
- Optionally: a single plugin name to check only that one.

## Workflow

1. Load `resources/preferred-plugins.md` to get the preferred list and their sources.
2. Guide the user to run:
   ```bash
   copilot plugin list
   ```
3. Cross-reference installed plugins against the preferred list and classify each:
   - **Up-to-date** — installed and source matches preferred list; no action needed.
   - **Needs update** — installed but source has changed or reinstall is recommended.
   - **Missing** — in preferred list but not installed; offer to trigger `install-plugin`.
   - **Untracked** — installed but not in preferred list; flag for review.
4. For each plugin that needs updating, provide the correct update command based on source type:
   - **Marketplace plugin** (e.g. `@awesome-copilot`):
     ```bash
     copilot plugin update <plugin-name>@<marketplace>
     ```
   - **GitHub URL or local path plugin** — reinstall is the update mechanism:
     ```bash
     copilot plugin install <github-url-or-local-path>
     ```
5. After updates, verify:
   ```bash
   copilot plugin list
   ```
6. Present a final status summary.

## Output

- Update report: classification table (up-to-date / needs update / missing / untracked) with commands for each action item.
