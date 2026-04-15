---
name: install-plugin
description: Install a GitHub Copilot plugin from a GitHub URL or local path using the Copilot CLI.
---

# Install Plugin Skill

## Purpose

Use this skill to install a single Copilot plugin from a GitHub URL or a local path.

## Inputs

- Plugin name or GitHub URL. If not provided, select from `resources/preferred-plugins.md`.
- Target environment (local repo or system-wide).

## Workflow

1. Load `resources/preferred-plugins.md` and check if the requested plugin is listed.
2. If found, use the URL from the preferred list.
3. If not found, ask the user to provide the GitHub URL or local path.
4. Guide the user to run:
   ```bash
   copilot plugin install <url-or-path>
   ```
5. Verify the install:
   ```bash
   copilot plugin list
   ```
6. Confirm success or report any errors.

## Output

- Confirmed plugin install with verification output from `copilot plugin list`.
