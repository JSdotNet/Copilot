---
name: orch-repo
description: 'Orchestrate GitHub repository creation and configuration for a new project. Use this skill to create the repository, expand the README, configure Copilot instructions, set up MCP servers, configure branch protection, add issue and PR templates, and establish repository governance. Run orch-project after this skill to scaffold the development project.'
---

# Orchestrate Repository

Automate the complete GitHub repository creation and configuration workflow using GitHub Copilot App canvas interface.

> **Note:** This skill covers only repository-level setup — creating the repo, configuring it, and establishing governance. Once the repository is ready, use `orch-project` to set up the development project structure inside it.

## Input Expectations

- Repository name and description.
- Repository visibility (public or private).
- Primary language and framework (for topic tags).
- Desired branch protection rules (default branch, required reviewers, status checks).
- MCP servers to enable for this repository.
- Whether to add collaborators or teams.

## Workflow Stages

> **Cross-plugin agents are recommended, not required.** When a referenced plugin is
> not installed, skip the stage or perform it manually and continue with remaining
> stages. All agent transitions require explicit user approval before switching.

### Stage 1: Repository Creation *(Manual)*

> Run the command below manually. The remaining stages are agent-assisted.

```bash
gh repo create <org>/<name> --description "<description>" --private --clone
```

- **Set default branch** (typically `main`) and initialize with a `README.md`.
- **Add repository topics** relevant to the language and domain.
- **Apply `.gitignore`** for the target language or framework.
- **Select a license** if applicable.

### Stage 2: README

- **Expand `README.md`** with project description, architecture overview, setup steps, and contribution guide.

**Agents:** `documentation:profile` *(preferred)*, *(default)*

### Stage 3: MCP Configuration

- **Query `JSdotNet.MCP.Guidelines`** to retrieve recommended MCP server selections and configuration patterns for the project type.
- **Configure MCP servers** in `.github/github-app.yml`:
  - Select and enable relevant MCP servers for the project (e.g., `JSdotNet.MCP.Guidelines`, `JSdotNet.MCP.Design`).
  - Set server-level permissions and scopes.

**Agents:** *(default)*  
**MCP Server:** `JSdotNet.MCP.Guidelines` for server selection guidance  
**Tools:** `.github/github-app.yml`

### Stage 4: Copilot Instructions

- **Query `JSdotNet.MCP.Guidelines`** to retrieve coding standards, conventions, and agent guidance relevant to the project type.
- **Create `.github/copilot-instructions.md`** with repository-wide Copilot context (tech stack, conventions, key patterns, agent guidance).
- **Add repo-level instruction files** under `.github/instructions/` using the `create-instruction` skill from `copilot-spec-builder` if installed; otherwise use the default agent.

**Skills:** `copilot-instructions-blueprint-generator`, `create-instruction` *(if `copilot-spec-builder` is installed)*  
**Agents:** *(default)*  
**MCP Server:** `JSdotNet.MCP.Guidelines` for conventions and agent guidance

### Stage 5: Branch Protection

- **Protect the default branch** with appropriate rules:
  - Require pull request reviews before merging.
  - Require status checks to pass before merging.
  - Require branches to be up to date before merging.
  - Restrict who can push to the protected branch.
- **Configure merge strategies** (squash, merge commit, rebase).
- **Enable auto-delete of head branches** after merge.

**Agents:** *(default)*  
**Tools:** `gh api`, GitHub REST API

### Stage 6: Issue and PR Templates

- **Query `JSdotNet.MCP.Guidelines`** to retrieve recommended issue template structures, PR checklist standards, and label conventions.
- **Create issue templates** (bug report, feature request, question).
- **Create pull request template** with a standard checklist.
- **Add `CODEOWNERS`** file to assign default reviewers per file path.
- **Configure repository labels** (bug, feature, documentation, breaking-change, etc.).

**Agents:** *(default)*  
**MCP Server:** `JSdotNet.MCP.Guidelines` for template and label conventions

### Stage 7: Repository Governance (Optional)

- **Configure Dependabot** for automated dependency updates and security alerts.
- **Enable GitHub security features** (secret scanning, code scanning with CodeQL).
- **Set up repository rulesets** for additional governance beyond branch protection.
- **Invite collaborators or assign teams** with appropriate permission levels.
- **Add a `SECURITY.md`** with responsible disclosure instructions.

**Agents:** *(default)*

## Usage Pattern

```
Orchestrate repository setup for:
- Name: "MyAwesomeAPI"
- Description: "ASP.NET Core REST API for order management"
- Visibility: private
- Language: C#
- Branch protection: require 1 review, require CI to pass
- Add collaborators: team "backend-devs" (write access)
```

## Output Expectations

- Repository created and visible on GitHub.
- `README.md` expanded with project description and setup steps.
- `.github/copilot-instructions.md` created with repository-wide Copilot context.
- MCP servers configured in `.github/github-app.yml`.
- Default branch created and protected.
- Issue templates, PR template, and `CODEOWNERS` in place.
- Dependabot and security scanning enabled.
- Collaborators or teams invited with correct permissions.
- Repository ready to receive the project scaffolding from `orch-project`.

## Separation from `orch-project`

| Concern | `orch-repo` | `orch-project` |
|---------|------------|---------------|
| Create GitHub repository | ✅ | ❌ |
| `README.md` (project description, setup steps) | ✅ | ❌ |
| `.github/copilot-instructions.md` (repo-wide context) | ✅ | ❌ |
| MCP server configuration (`github-app.yml`) | ✅ | ❌ |
| Branch protection and merge rules | ✅ | ❌ |
| Issue and PR templates | ✅ | ❌ |
| Repository governance (Dependabot, CodeQL) | ✅ | ❌ |
| `.github/instructions/` coding guidelines | ❌ | ✅ |
| GitHub Actions CI/CD workflows | ❌ | ✅ |
| Aspire AppHost and service scaffolding | ❌ | ✅ |
| Project directory structure (`src/`, `tests/`) | ❌ | ✅ |
| Build and test validation | ❌ | ✅ |
| Local run and monitoring validation | ❌ | ✅ |

> Use them sequentially: run `orch-repo` first, then `orch-project`.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). If the extension is not
installed, skip the canvas calls below and continue through standard chat
interaction.

- Open canvas `orch-dashboard`, then call `start_run` with
  `skillId: "orch-repo"` and these stages: Repository Creation, README, MCP
  Configuration, Copilot Instructions, Branch Protection, Issue and PR
  Templates, Repository Governance.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. repository URL,
  configured MCP servers, or branch protection rules applied.
- Call `finish_run` with the final status and a summary once the repository
  is fully configured.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.
- Repository readiness summary with links to created resources

## Reference

Source skill location: `plugins/copilot-app/skills/orch-repo/SKILL.md`
