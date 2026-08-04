# product-owner

Installable GitHub Copilot CLI plugin for product backlog authoring. Write epics, stories, and bugs as Markdown artifacts.

## Includes

- Agents:
  - `agents/product-owner.agent.md`
- Skills:
  - `skills/write-story/SKILL.md`
  - `skills/write-epic/SKILL.md`
  - `skills/write-bug/SKILL.md`
- Instructions:
  - `instructions/stories.instructions.md`
  - `instructions/epics.instructions.md`
  - `instructions/bugs.instructions.md`
  - `instructions/agent-handoff.instructions.md`
  - `instructions/markdown.instructions.md`
  - `instructions/canvas-usage.instructions.md`

## Scope

- Product Owner concerns: backlog writing and refinement for epics, stories, and bugs.
- Backlog artifacts use the `.wip/work/<module>/` convention with `epic-`, `story-`, and `bug-` file prefixes.
- Keep responsibilities separated:
  - Use `product-owner` for writing and refining backlog content.
  - Use `jira` plugin for Jira sync operations and field mapping (optional).
  - Use `github` plugin for GitHub issue sync operations (optional).

## Optional Integrations

- Architecture handoff (`architect`) is optional and requires the `architecture` plugin to be installed.
- Jira sync requires the `jira` plugin to be installed (`copilot plugin install JSdotNet/Copilot:plugins/jira`).
- GitHub issue sync requires the `github` plugin to be installed (`copilot plugin install JSdotNet/Copilot:plugins/github`).

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

## Optional Enhancement — Canvas Previews

Install the `copilot-canvas-studio` canvas extension to get a live, interactive preview of
drafted epics, stories, and bugs instead of Markdown-only output:

```bash
copilot plugin install JSdotNet/Copilot:plugins/copilot-app/extensions/copilot-canvas-studio
```

When installed, backlog skills render drafted content on the `markdown-preview` canvas
(see `instructions/canvas-usage.instructions.md`). Without it, skills fall back to their
existing Markdown file output.
