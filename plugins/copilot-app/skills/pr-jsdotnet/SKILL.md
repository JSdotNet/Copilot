---
name: pr-jsdotnet
description: 'Create a GitHub Pull Request in any JSdotNet repository through the `gh` CLI using JSdotNet account credentials for that command only. Use this skill when Copilot runs on a different account but the PR must be created as JSdotNet with a stable, repeatable workflow.'
---

# Create PR in JSdotNet Repositories

Create a GitHub Pull Request in any JSdotNet organization repository through the `gh` CLI using JSdotNet credentials for the PR command instead of the built-in Copilot App PR tool.

## Agent Requirement

This skill executes shell commands and requires access to `powershell` or `bash` tools.

**Switch to the default Copilot CLI agent first.** Specialized agents such as `architecture:architect`, `domain-design:domain-architect`, and `product-owner:product-owner` do not have shell tool access and cannot run `gh` commands. Before executing any step in this skill, ensure you are operating as the default Copilot CLI agent.

How to switch:
1. If you are currently under a specialized agent, close or exit that agent context.
2. Return to the standard Copilot CLI session where `powershell` and `bash` tools are available.
3. Then proceed with the steps below.

If switching is not possible in the current session, stop and ask the user to re-invoke the skill from the default Copilot CLI agent instead of attempting to run shell commands in a restricted context.

## Prerequisites

- `gh` CLI must be available in the shell (`gh --version`).
- `JSDOTNET_GH_TOKEN` must be set as an environment variable with a valid PAT for the JSdotNet account that has `repo` and `pull_request` scopes.
- The feature branch must already exist locally with at least one commit ahead of the base branch.
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

When this skill is invoked, follow these steps in order:

### Step 0 — Switch to default agent

Confirm you are operating as the default Copilot CLI agent with `powershell` or `bash` tool access before proceeding (see **Agent Requirement** above).

### Step 1 — Verify token availability

Check that `JSDOTNET_GH_TOKEN` is set and non-empty. Stop immediately with a clear message if the token is missing; do not attempt any `gh` commands without it.

```powershell
if ([string]::IsNullOrWhiteSpace($env:JSDOTNET_GH_TOKEN)) {
    Write-Error "JSDOTNET_GH_TOKEN is not set. Set the token and retry."
    exit 1
}
```

### Step 2 — Verify auth and permissions

Set `GH_TOKEN` and confirm the JSdotNet token works and has organization access before attempting PR creation.

```powershell
$env:GH_TOKEN = $env:JSDOTNET_GH_TOKEN
gh auth status
```

If `gh auth status` reports an error, or the account shown is not `JSdotNet`, stop and surface the exact error. Do not proceed to PR creation.

### Step 3 — Push branch if needed

Ensure the feature branch is pushed to the remote before calling `gh pr create`. A missing remote branch is the most common reason `gh pr create` fails silently.

```powershell
git push --set-upstream origin HEAD
```

If the push fails due to authentication, ensure the remote URL uses HTTPS and the token has write access to the repository.

### Step 4 — Create the PR

Create the PR with `gh pr create` using the JSdotNet token, then immediately unset `GH_TOKEN`.

```powershell
$env:GH_TOKEN = $env:JSDOTNET_GH_TOKEN

gh pr create `
  --repo JSdotNet/Copilot `
  --base main `
  --head <branch> `
  --title "<title>" `
  --body "<body>"

Remove-Item Env:GH_TOKEN
```

Only set `GH_TOKEN` for this command block. Remove it immediately after to avoid contaminating subsequent `gh` calls with JSdotNet credentials.

### Step 5 — Confirm and sync

After successful creation, output the PR URL. Do not call the built-in `create_pull_request` tool after a successful `gh pr create`; the session context is already updated.

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

- Do not execute any step of this workflow from a specialized agent that lacks shell tool access; switch to the default agent first.
- Do not rely on prompt-only account switching for PR creation.
- Do not fall back to the built-in `create_pull_request` tool when the PR must be authored as `JSdotNet`.
- If `JSDOTNET_GH_TOKEN` is missing, stop and ask the user to provide it; do not guess or skip the token check.
- If organization authorization or SSO is missing for the JSdotNet token, surface the exact `gh` error and stop.
- Always unset `GH_TOKEN` after the PR creation command to avoid credential leakage.

## Reference

Source skill location: `plugins/copilot-app/skills/pr-jsdotnet/SKILL.md`
