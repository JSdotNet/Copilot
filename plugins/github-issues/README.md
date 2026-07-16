# github-issues

Installable GitHub Copilot CLI plugin for creating and updating GitHub issues from Markdown backlog artifacts.

## Includes

- Agents:
  - `agents/github-issues.agent.md`
- Skills:
  - `skills/create-github-issue/SKILL.md`
  - `skills/update-github-issue/SKILL.md`
- Instructions:
  - `instructions/github-issues-sync.instructions.md`
  - `instructions/agent-handoff.instructions.md`
  - `instructions/markdown.instructions.md`

## Scope

- GitHub Issues concerns: create/update GitHub issues from approved backlog artifacts.
- Backlog artifacts use the `.wip/work/<module>/` convention with `epic-`, `story-`, and `bug-` file prefixes.
- Keep responsibilities separated:
  - Use `product-owner` for writing and refining backlog content.
  - Use `github-issues` for GitHub issue sync operations and field mapping.

## Optional Integrations

- Backlog authoring handoff (`product-owner`) is optional and requires the `product-owner` plugin to be installed.

## Install

```bash
copilot plugin install JSdotNet/Copilot:plugins/github-issues
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/Copilot:plugins/github-issues
```

## Uninstall

```bash
copilot plugin uninstall github-issues
```
