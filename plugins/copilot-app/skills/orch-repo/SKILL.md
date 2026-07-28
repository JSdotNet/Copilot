---
name: orch-repo
description: 'Orchestrate GitHub repository creation and configuration for a new project. Use this skill to create the repository, configure branch protection, set up CI/CD workflows, add issue and PR templates, and establish repository governance. Run orch-project after this skill to scaffold the development project.'
---

# Orchestrate Repository

Automate the complete GitHub repository creation and configuration workflow using GitHub Copilot App canvas interface.

> **Note:** This skill covers only repository-level setup — creating the repo, configuring it, and establishing governance. Once the repository is ready, use `orch-project` to set up the development project structure inside it.

## Input Expectations

- Repository name and description.
- Repository visibility (public or private).
- Primary language and framework (for topic tags and workflow selection).
- Desired branch protection rules (default branch, required reviewers, status checks).
- CI/CD requirements (build, test, release workflows).
- Whether to add collaborators or teams.

## Workflow Stages

> **Cross-plugin agents are recommended, not required.** When a referenced plugin is
> not installed, skip the stage or perform it manually and continue with remaining
> stages. All agent transitions require explicit user approval before switching.

### Stage 1: Repository Creation

- **Create the GitHub repository** with name, description, and visibility.
- **Set default branch** (typically `main`) and initialize with a `README.md`.
- **Add repository topics** relevant to the language and domain.
- **Apply `.gitignore`** for the target language or framework.
- **Select a license** if applicable.

**Agents:** `development:developer`  
**Tools:** `gh repo create`

### Stage 2: Branch Protection

- **Protect the default branch** with appropriate rules:
  - Require pull request reviews before merging.
  - Require status checks to pass before merging.
  - Require branches to be up to date before merging.
  - Restrict who can push to the protected branch.
- **Configure merge strategies** (squash, merge commit, rebase).
- **Enable auto-delete of head branches** after merge.

**Agents:** `development:developer`  
**Tools:** `gh api`, GitHub REST API

### Stage 3: GitHub Actions Workflows

- **Add CI workflow** to build and test on pull requests and pushes.
- **Add release workflow** for versioning and publishing (if applicable).
- **Add dependency review workflow** for supply-chain security checks.
- **Configure workflow permissions** (least-privilege token scopes).
- **Set up environments** (development, staging, production) with required reviewers if needed.

**Agents:** `development:developer`, `csharp-coding:coding`

### Stage 4: Issue and PR Templates

- **Create issue templates** (bug report, feature request, question).
- **Create pull request template** with a standard checklist.
- **Add `CODEOWNERS`** file to assign default reviewers per file path.
- **Configure repository labels** (bug, feature, documentation, breaking-change, etc.).

**Agents:** `development:developer`

### Stage 5: Repository Governance (Optional)

- **Configure Dependabot** for automated dependency updates and security alerts.
- **Enable GitHub security features** (secret scanning, code scanning with CodeQL).
- **Set up repository rulesets** for additional governance beyond branch protection.
- **Invite collaborators or assign teams** with appropriate permission levels.
- **Add a `SECURITY.md`** with responsible disclosure instructions.

**Agents:** `development:developer`

## Usage Pattern

```
Orchestrate repository setup for:
- Name: "MyAwesomeAPI"
- Description: "ASP.NET Core REST API for order management"
- Visibility: private
- Language: C#
- Branch protection: require 1 review, require CI to pass
- CI: build + test on PR, release on tag push
- Add collaborators: team "backend-devs" (write access)
```

## Output Expectations

- Repository created and visible on GitHub.
- Default branch created and protected.
- CI/CD workflows committed and running on first push.
- Issue templates, PR template, and `CODEOWNERS` in place.
- Dependabot and security scanning enabled.
- Collaborators or teams invited with correct permissions.
- Repository ready to receive the project scaffolding from `orch-project`.

## Separation from `orch-project`

| Concern | `orch-repo` | `orch-project` |
|---------|------------|---------------|
| Create GitHub repository | ✅ | ❌ |
| Branch protection and merge rules | ✅ | ❌ |
| CI/CD GitHub Actions workflows | ✅ | ❌ |
| Issue and PR templates | ✅ | ❌ |
| Repository governance (Dependabot, CodeQL) | ✅ | ❌ |
| `.github/copilot-instructions.md` | ❌ | ✅ |
| `.github/instructions/` coding guidelines | ❌ | ✅ |
| Aspire AppHost and service scaffolding | ❌ | ✅ |
| Project directory structure (`src/`, `tests/`) | ❌ | ✅ |
| Build and test validation | ❌ | ✅ |
| Local run and monitoring validation | ❌ | ✅ |

> Use them sequentially: run `orch-repo` first, then `orch-project`.

## Canvas Interface (Planned)

> Canvas panels described below represent the target experience. No canvas extensions
> are implemented yet. The skill currently operates through standard chat interaction.

- Repository configuration form (name, visibility, topics, license)
- Branch protection rule builder
- Workflow selector (CI, release, Dependabot, CodeQL)
- Template and label configurator
- Progress tracker for each workflow stage
- Repository readiness summary with links to created resources

## Reference

Source skill location: `plugins/copilot-app/skills/orch-repo/SKILL.md`
