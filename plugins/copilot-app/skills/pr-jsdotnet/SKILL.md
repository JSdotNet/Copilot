---
name: pr-jsdotnet
description: 'Create a GitHub Pull Request in any JSdotNet repository through the `gh` CLI using JSdotNet account credentials for that command only. Use this skill when Copilot runs on a different account but the PR must be created as JSdotNet with a stable, repeatable workflow.'
---

# Create PR in JSdotNet Repositories

Create a GitHub Pull Request in any JSdotNet organization repository through the `gh` CLI using JSdotNet credentials for the PR command instead of the built-in Copilot App PR tool.

## Prerequisites

- GitHub Copilot App may stay authenticated with a different account for normal Copilot usage.
- `gh` CLI must be available for PR creation.
- The `JSdotNet` account must be authenticated for `gh` PR creation.
- `JSDOTNET_GH_TOKEN` must be available when the session needs to create the PR through `gh`.
- Feature branch must already be created and committed with changes.
- Target repository can be any repo in the `JSdotNet` organization, such as `JSdotNet/Copilot`.

## Key Features

- **Deterministic PR creation** through `gh pr create` with JSdotNet credentials.
- **No App account switching required** for normal Copilot usage.
- **Branch naming** follows kebab-case conventions such as `add-github-copilot-integration`.
- **Title generation** follows clear, descriptive patterns.
- **Labels support** for categorization such as bug, feature, enhancement, and documentation.
- **Draft PR option** for early feedback.
- **Maintainer modification** flag for collaboration.
- **Clear fallback behavior** when the JSdotNet token or required CLI tools are unavailable.

## Required Workflow

When this skill is invoked, use this PR creation path:

1. Prefer the `gh` CLI instead of the built-in `create_pull_request` tool.
2. Use the `JSdotNet` account only for the PR creation command.
3. Set `GH_TOKEN` from `JSDOTNET_GH_TOKEN` only for that command or shell session.
4. Push the branch if needed, then create the PR with `gh pr create`.
5. If the JSdotNet token, `gh`, or shell tooling is unavailable, stop and explain the exact blocker instead of falling back to the built-in PR tool.

Example PowerShell flow:

```powershell
$env:GH_TOKEN = $env:JSDOTNET_GH_TOKEN
gh auth status
gh pr create --repo JSdotNet/Copilot --base main --head <branch> --title "<title>" --body "<body>"
Remove-Item Env:GH_TOKEN
```

## Usage Patterns

### Create a feature PR

```text
Create a PR for my feature branch with:
- Title: "Add GitHub Copilot App integration"
- Description: Comprehensive summary of changes
- Labels: feature, copilot-app
- Use the JSdotNet account for `gh pr create`
```

### Create a draft PR for review

```text
Create a draft PR to get early feedback:
- Title: "WIP: Refactor plugin architecture"
- Labels: enhancement, work-in-progress
- Use `JSDOTNET_GH_TOKEN` for the PR command
```

### Create a bug fix PR

```text
Create a PR to fix the issue:
- Title: "Fix plugin loading timeout error"
- Description: Root cause analysis and fix summary
- Labels: bug, high-priority
- Create the PR via `gh`, not the built-in PR tool
```

## Integration Points

- **GitHub Copilot App** keeps the normal Copilot account active for chat and coding.
- **`gh` CLI** creates the PR with JSdotNet credentials for that command only.
- **Copilot CLI** syncs PR information to session context after successful creation.
- **Product Owner plugin** can be used with GitHub Issues workflows.
- **Any JSdotNet repository** can use the same PR creation pattern.

## Guardrails

- Do not rely on prompt-only account switching for PR creation.
- Do not fall back to the built-in `create_pull_request` tool when the PR must be authored as `JSdotNet`.
- If organization authorization or SSO is missing for the JSdotNet token, surface that explicitly.

## Reference

Source skill location: `plugins/copilot-app/skills/pr-jsdotnet/SKILL.md`
