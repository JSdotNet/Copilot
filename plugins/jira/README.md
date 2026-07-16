# jira

Installable GitHub Copilot CLI plugin for Jira issue synchronization workflows.

## Includes

- Agents:
  - `agents/jira.agent.md`
- Skills:
  - `skills/create-jira-ticket/SKILL.md`
  - `skills/update-jira-ticket/SKILL.md`
- Instructions:
  - `instructions/jira-sync.instructions.md`
  - `instructions/agent-handoff.instructions.md`
  - `instructions/markdown.instructions.md`

## Scope

- Jira concerns: create and update Jira issues from approved backlog artifacts.
- Backlog artifacts use the `.wip/work/<module>/` convention with `epic-`, `story-`, and `bug-` file prefixes.

## Optional Integrations

- Backlog authoring handoff (`product-owner`) is optional and requires the `product-owner` plugin to be installed.

## Install

```bash
copilot plugin install JSdotNet/Copilot:plugins/jira
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/Copilot:plugins/jira
```

## Uninstall

```bash
copilot plugin uninstall jira
```
