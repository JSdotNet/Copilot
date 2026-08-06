---
name: orch-project
description: 'Orchestrate project scaffolding and development environment setup for an existing repository. Use this skill after orch-repo to initialize the .github folder, coding guidelines, Aspire AppHost, project structure, and local validation. Assumes the repository already exists and is configured.'
---

# Orchestrate Project

Automate the complete project scaffolding workflow for an existing, configured repository using GitHub Copilot App canvas interface, including automated local validation and testing.

> **Note:** This skill assumes your repository already exists and is configured (README, Copilot instructions, MCP servers, branch protection, templates). Use `orch-repo` first to create and configure the repository, then use this skill to scaffold the development project inside it.
>
> **Precondition:** This skill also assumes the target project structure and architecture
> direction are already approved. Use it to scaffold and implement that agreed setup.

## Input Expectations

- Repository name (must already exist on GitHub and be configured via `orch-repo`).
- Approved project structure or architecture notes for the scaffold.
- Project type (e.g., ASP.NET Core API with Aspire).
- Language and framework preferences.
- Aspire services to include (API, Database, Cache, Worker).

## Workflow Stages

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and every transition needs explicit user approval.

### Stage 1: GitHub Folder Setup (Foundation)
- **Initialize `.github/` directory structure** with recommended layouts
- **Generate project guidelines** using `jsdotnet-guidelines-mcpserver`:
  - Coding standards and patterns
  - Git workflow conventions
  - Review guidelines
  - Release procedures
- **Create `.github/instructions/` files** for developer guidance
- **Create `.github/copilot-settings.json`** for Copilot configuration

**Agents:** `csharp-coding:coding`  
**MCP Server:** `jsdotnet-guidelines-mcpserver` for guideline generation

### Stage 2: GitHub Actions Workflows

- **Add CI workflow** to build and test on pull requests and pushes.
- **Add release workflow** for versioning and publishing (if applicable).
- **Add dependency review workflow** for supply-chain security checks.
- **Configure workflow permissions** (least-privilege token scopes).
- **Set up environments** (development, staging, production) with required reviewers if needed.

**Agents:** `csharp-coding:coding`

### Stage 3: Specification & Architecture Intake
- **Review the approved target architecture** for the initial setup
- **Load the approved implementation context** and repository constraints from
  `jsdotnet-guidelines-mcpserver`
- **Capture API contracts** and data model boundaries already agreed
- **Plan integration points** across services
- **Capture implementation risks and assumptions** for local development

**Agents:** `architecture:architect`
**MCP Servers:** `jsdotnet-guidelines-mcpserver`

### Stage 4: Tooling & Dependencies
- **Install base dependencies** (frameworks, SDKs)
- **Configure build & test pipelines**
- **Set up linting and code quality tools**
- **Configure logging and observability**

**Agents:** `csharp-coding:coding`

### Stage 5: Implementation

This stage combines AppHost creation and initial project scaffolding because they are
interdependent — the example service references AppHost configuration, service
discovery, and health checks.

#### Part A: Aspire AppHost Creation
- **Create AppHost project** for service orchestration
- **Add integrations** based on project type
- **Wire up service discovery** and health checks
- **Configure dashboard** for local development
- **Setup environment configuration** for local development

#### Part B: Initial Project Structure & Services
- **Create project directories** (src/, services/, tests/, docs/)
- **Create example service** demonstrating patterns
- **Wire service to AppHost** with health checks and references
- **Generate boilerplate code** (entry points, core types, AppHost references)
- **Set up testing framework** (xUnit, NUnit, etc.)
- **Create first unit tests** as examples
- **Setup test data fixtures**

**Agents:** `csharp-coding:coding`  
**Skills Used:** `aspire`

### Final Phases (Shared)

After Implementation, this skill runs the shared delivery phases
defined once in `instructions/orch-shared-phases.instructions.md` (code-modifying tier),
in order:

1. **Build & Test** — compile all projects and run the unit and integration/E2E test
   suites, run first; fail fast on build or test errors.
2. **QA Validation** — new runnable scaffold, so run QA validation with capture: start the Aspire
   AppHost, confirm the dashboard and service health endpoints are green (default
   dashboard `localhost:18888`) and database connectivity works, and run Playwright smoke
   checks on the example service, with `qa:qa-monitor` runtime monitoring and evidence
   recorded.
3. **Personal Validation** — hand back to the user (no agent); present the code review and
   the recorded QA review, and start the application for the user to review.
4. **Create Pull Request** — only after explicit user approval.
5. **Summary** — emit the run summary.

See `instructions/orch-shared-phases.instructions.md` for the full phase definitions;
update that file to change these phases for every orchestration.

## Usage Pattern

```
Orchestrate project setup for:
- Repository: "MyAwesomeAPI" (already exists on GitHub)
- Type: "ASP.NET Core API with Aspire"
- Language: C#
- Aspire services: API, Database, Cache, Worker
- Setup repository workflows and branch protection
- Validate compilation and running application
```

## Output Expectations

- `.github/` directory fully initialized with instructions, workflows, and Copilot configuration.
- Aspire AppHost and ServiceDefaults projects created.
- Example service wired to AppHost with health checks.
- All projects compile without errors.
- Unit and integration tests passing.
- AppHost starts without errors and dashboard is accessible.
- All services report healthy status.
- Runtime validation findings recorded, with capture attached for the new runnable flows.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension. Follow the
shared **Dashboard Reporting Contract** in
`instructions/orch-shared-phases.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence, the QA Validation
`scenarios`/`monitoring` passthrough, and the Personal Validation → Create Pull Request
gating. If the extension is not installed, skip the canvas calls and continue through
standard chat interaction.

- Call `start_run` with `skillId: "orch-project"` and these stages: GitHub Folder Setup
  (Foundation), GitHub Actions Workflows, Specification & Architecture Intake, Tooling &
  Dependencies, Implementation, Build & Test, QA Validation, Personal Validation,
  Create Pull Request, Summary.
- During **Specification & Architecture Intake**, also open/update `markdown-canvas`
  (`markdown-preview`) with the drafted architecture documentation and `diagram-canvas`
  (`mermaid-diagram`) with any accompanying Mermaid diagrams, per
  `instructions/canvas-usage.instructions.md`. Optional; skip gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract.

## Validation Notes

The build, test, and running-application checks for this scaffold are the shared
**Build & Test** and **QA Validation** phases (see
`instructions/orch-shared-phases.instructions.md`). Project-specific expectations for those
phases:

- Compile the AppHost, service, and test projects and resolve all NuGet dependencies.
- Run unit tests (establish a baseline) and integration tests against the AppHost.
- Start the Aspire AppHost (`aspire run`), confirm the dashboard initializes (default
  `localhost:18888`), all services report healthy, database connectivity works, and smoke
  tests against the API endpoints pass.
- On failure, record which phase failed with the specific errors and suggested fixes, and
  re-run after fixing.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-project/SKILL.md`
