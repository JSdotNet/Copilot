# product-owner

Installable GitHub Copilot CLI plugin for product backlog authoring with optional Jira synchronization.

## Includes

- Agents:
  - `agents/product-owner.agent.md`
- Skills:
  - `skills/write-story/SKILL.md`
  - `skills/write-epic/SKILL.md`
  - `skills/write-bug/SKILL.md`
  - `skills/create-jira-ticket/SKILL.md`
  - `skills/update-jira-ticket/SKILL.md`
- Instructions:
  - `instructions/stories.instructions.md`
  - `instructions/epics.instructions.md`
  - `instructions/bugs.instructions.md`
  - `instructions/jira-sync.instructions.md`
  - `instructions/agent-handoff.instructions.md`
  - `instructions/markdown.instructions.md`

## Scope

- Product Owner concerns: backlog writing and refinement for epics, stories, and bugs.
- Jira concerns: create/update Jira issues from approved backlog artifacts (optional use).
- Backlog artifacts use the `.wip/work/<module>/` convention with `epic-`, `story-`, and `bug-` file prefixes.
- Keep responsibilities separated by agent:
  - Use `product-owner` for writing and refining backlog content.
  - Use `jira` for Jira sync operations and field mapping.
  - Use `github-issues` (separate plugin) for GitHub issue sync operations.

## Optional Integrations

- Architecture handoff (`architect`) is optional and requires the `architecture` plugin to be installed.
- GitHub issue sync (`github-issues` agent) is optional and requires the `github-issues` plugin to be installed.

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
