# github

Installable GitHub Copilot CLI plugin for GitHub platform workflows — issue synchronization, GitHub Actions CI/CD, Dependabot configuration, and pull request management.

## Includes

- Skills:
  - `skills/create-github-issue/SKILL.md`
  - `skills/update-github-issue/SKILL.md`
  - `skills/github-actions/SKILL.md`
  - `skills/dependabot/SKILL.md`
- Instructions:
  - `instructions/github-issues-sync.instructions.md`
  - `instructions/github-actions.instructions.md`
  - `instructions/markdown.instructions.md`

## Scope

- Issue sync: create and update GitHub issues from approved Markdown backlog artifacts.
- GitHub Actions: author, review, and harden CI/CD workflow files under `.github/workflows/`.
- Dependabot: configure `.github/dependabot.yml` for automated dependency updates.
- Keep backlog authoring in the `product-owner` plugin; this plugin owns GitHub platform execution.

## Awesome Copilot References

Additional GitHub-related resources available from the Awesome Copilot marketplace:

| Resource | Install |
| --- | --- |
| `github-actions-expert` agent | `copilot plugin install github-actions-expert@awesome-copilot` |
| `github-actions-ci-cd-best-practices` instructions | via `github-actions-expert@awesome-copilot` |
| `dependabot` skill (full reference) | `copilot plugin install dependabot@awesome-copilot` |

## Optional Integrations

- Backlog authoring handoff (`product-owner`) is optional and requires the `product-owner` plugin to be installed.

## Install

```bash
copilot plugin install JSdotNet/Copilot:plugins/github
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/Copilot:plugins/github
```

## Uninstall

```bash
copilot plugin uninstall github
```
