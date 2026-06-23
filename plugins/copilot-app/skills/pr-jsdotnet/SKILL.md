---
name: pr-jsdotnet
description: 'Create a GitHub Pull Request in any JSdotNet repository. Use this skill when you need to create a PR with JSdotNet account credentials, proper title, description, labels, and branch naming conventions. Integrates with GitHub Copilot App to streamline PR workflows across all JSdotNet organization repositories.'
---

# Create PR in JSdotNet Repositories

Create a GitHub Pull Request in any JSdotNet organization repository using native GitHub Copilot App interface.

## Prerequisites

- GitHub Copilot App authenticated with JSdotNet account access
- Feature branch already created and committed with changes
- Target repository: Any repo in JSdotNet organization (e.g., JSdotNet/Copilot, JSdotNet/Awesome, etc.)

## Key Features

- **Automated PR creation** via GitHub Copilot App
- **Branch naming** follows kebab-case conventions (e.g., `add-github-copilot-integration`)
- **Title generation** follows clear, descriptive patterns
- **Labels support** for categorization (bug, feature, enhancement, documentation)
- **Draft PR option** for early feedback
- **Maintainer modification** flag for collaboration

## Usage Patterns

### Create a feature PR

```
Create a PR for my feature branch with:
- Title: "Add GitHub Copilot App integration"
- Description: Comprehensive summary of changes
- Labels: feature, copilot-app
```

### Create a draft PR for review

```
Create a draft PR to get early feedback:
- Title: "WIP: Refactor plugin architecture"
- Labels: enhancement, work-in-progress
```

### Create a bug fix PR

```
Create a PR to fix the issue:
- Title: "Fix plugin loading timeout error"
- Description: Root cause analysis and fix summary
- Labels: bug, high-priority
```

## Integration Points

- **GitHub Copilot App**: Native PR creation interface
- **Copilot CLI**: Sync PR information to session context
- **Development plugin**: Coordinate with `create-pull-request` function
- **Product Owner plugin**: Use with GitHub Issues workflow
- **Any JSdotNet repository**: Works across all JSdotNet organization repos

## Reference

Source skill location: `plugins/copilot-app/skills/pr-jsdotnet/SKILL.md`
