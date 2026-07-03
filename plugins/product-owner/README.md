# product-owner

Installable GitHub Copilot CLI plugin for product backlog authoring and issue synchronization workflows.

## Includes

- Agents:
  - `agents/product-owner.agent.md`
- Skills:
  - `skills/write-story/SKILL.md`
  - `skills/write-epic/SKILL.md`
  - `skills/write-bug/SKILL.md`
  - `skills/create-jira-ticket/SKILL.md`
  - `skills/update-jira-ticket/SKILL.md`
  - `skills/create-github-issue/SKILL.md`
  - `skills/update-github-issue/SKILL.md`
- Instructions:
  - `instructions/stories.instructions.md`
  - `instructions/epics.instructions.md`
  - `instructions/bugs.instructions.md`
  - `instructions/jira-sync.instructions.md`
  - `instructions/github-issues-sync.instructions.md`
  - `instructions/agent-handoff.instructions.md`
  - `instructions/markdown.instructions.md`

## Scope

- Product Owner concerns: backlog writing and refinement for epics, stories, and bugs.
- Jira concerns: create/update Jira issues from approved backlog artifacts.
- GitHub concerns: create/update GitHub issues from approved backlog artifacts.
- Backlog artifacts use the `.wip/work/<module>/` convention with `epic-`, `story-`, and `bug-` file prefixes.
- Keep responsibilities separated by agent:
  - Use `product-owner` for writing and refining backlog content.
  - Use `jira` for Jira sync operations and field mapping.
  - Use `github-issues` for GitHub issue sync operations and field mapping.

## Optional Integrations

- Architecture handoff (`architect`) is optional and requires the `architecture` plugin to be installed.

## Agent Visibility

- Only `product-owner` is publicly exposed by this plugin.
- Specialist agents under `agents-internal/` are internal implementation assets and are not exposed directly.

## Resources

- `resources/checklists/`
- `resources/templates/`
- `resources/write-bug/`
- `resources/write-epic/`
- `resources/write-story/`

## Install

```bash
copilot plugin install JSdotNet/Copilot:plugins/product-owner
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/Copilot:plugins/product-owner
```

## Uninstall

```bash
copilot plugin uninstall product-owner
```
