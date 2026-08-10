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

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and every transition needs explicit user approval.
>
> Model choice per stage follows `instructions/orch-model-selection.instructions.md`
> (category defaults, overridable via `.github/copilot-model-selection.md` in the
> consuming repo).

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

- **Query `jsdotnet-guidelines-mcpserver`** to retrieve recommended MCP server
  selections and configuration patterns for the project type.
- **Configure MCP servers** in `.github/github-app.yml`:
  - Select and enable the repository's core MCP servers:
    `jsdotnet-guidelines-mcpserver`, `microsoft-learn`, and `playwright`.
  - Enable `jsdotnet-design-mcpserver` when the repository expects UX-specific design
    orchestrations or artifacts.
  - Set server-level permissions and scopes.

**Agents:** *(default)*  
**MCP Server:** `jsdotnet-guidelines-mcpserver` for server selection guidance  
**Tools:** `.github/github-app.yml`

### Stage 4: Copilot Instructions

- **Query `jsdotnet-guidelines-mcpserver`** to retrieve coding standards,
  conventions, and agent guidance relevant to the project type.
- **Create `.github/copilot-instructions.md`** with repository-wide Copilot context (tech stack, conventions, key patterns, agent guidance).
- **Add repo-level instruction files** under `.github/instructions/` using the `create-instruction` skill from `copilot-spec-builder` if installed; otherwise use the default agent.

**Skills:** `copilot-instructions-blueprint-generator`, `create-instruction` *(if `copilot-spec-builder` is installed)*  
**Agents:** *(default)*  
**MCP Server:** `jsdotnet-guidelines-mcpserver` for conventions and agent guidance

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

- **Query `jsdotnet-guidelines-mcpserver`** to retrieve recommended issue template
  structures, PR checklist standards, and label conventions.
- **Create issue templates** (bug report, feature request, question).
- **Create pull request template** with a standard checklist.
- **Add `CODEOWNERS`** file to assign default reviewers per file path.
- **Configure repository labels** (bug, feature, documentation, breaking-change, etc.).

**Agents:** *(default)*  
**MCP Server:** `jsdotnet-guidelines-mcpserver` for template and label conventions

### Stage 7: Repository Governance (Optional)

- **Configure Dependabot** for automated dependency updates and security alerts.
- **Enable GitHub security features** (secret scanning, code scanning with CodeQL).
- **Set up repository rulesets** for additional governance beyond branch protection.
- **Invite collaborators or assign teams** with appropriate permission levels.
- **Add a `SECURITY.md`** with responsible disclosure instructions.

**Agents:** *(default)*

### Final Phases (Shared)

After Repository Governance, this skill runs the shared closing phases defined once in
`instructions/orch-shared-phases.instructions.md` (documentation/config tier), in order:

1. **Personal Validation** — hand back to the user (no agent); present the drafted
   artifacts and any review for the user to approve.
2. **Create Pull Request** — only after explicit user approval (mark skipped when there is
   no change set).
3. **GitHub Issue Update** — when the session was started from a GitHub issue, add a
   comment to that issue with the captured result and QA report; otherwise skip.
4. **Summary** — emit the run summary.

See `instructions/orch-shared-phases.instructions.md` for the full phase definitions;
update that file to change these phases for every orchestration.

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

This skill reports progress through the `orch-dashboard` canvas extension. Follow the
shared **Dashboard Reporting Contract** in
`instructions/orch-shared-phases.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence and the Personal Validation → Create Pull
Request gating. If the extension is not installed, skip the canvas calls and continue
through standard chat interaction.

- Call `start_run` with `skillId: "orch-repo"` and these stages: Repository Creation,
  README, MCP Configuration, Copilot Instructions, Branch Protection, Issue and PR
  Templates, Repository Governance, Personal Validation, Create Pull Request, GitHub Issue Update, Summary.
- During **README**, also open/update `markdown-canvas` (`markdown-preview`) with the
  expanded README content, per `instructions/canvas-usage.instructions.md`. Optional; skip
  gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-repo/SKILL.md`
