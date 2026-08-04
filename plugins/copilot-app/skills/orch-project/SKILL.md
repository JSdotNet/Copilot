---
name: orch-project
description: 'Orchestrate project scaffolding and development environment setup for an existing repository. Use this skill after orch-repo to initialize the .github folder, coding guidelines, Aspire AppHost, project structure, and local validation. Assumes the repository already exists and is configured.'
---

# Orchestrate Project

Automate the complete project scaffolding workflow for an existing, configured repository using GitHub Copilot App canvas interface, including automated local validation and testing.

> **Note:** This skill assumes your repository already exists and is configured (README, Copilot instructions, MCP servers, branch protection, templates). Use `orch-repo` first to create and configure the repository, then use this skill to scaffold the development project inside it.

## Input Expectations

- Repository name (must already exist on GitHub and be configured via `orch-repo`).
- Project type (e.g., ASP.NET Core API with Aspire).
- Language and framework preferences.
- Aspire services to include (API, Database, Cache, Worker).

## Workflow Stages

> **Cross-plugin agents are recommended, not required.** When a referenced plugin is
> not installed, skip the stage or perform it manually and continue with remaining
> stages. All agent transitions require explicit user approval before switching.

### Stage 1: GitHub Folder Setup (Foundation)
- **Initialize `.github/` directory structure** with recommended layouts
- **Generate project guidelines** using `JSdotNet.MCP.Guidelines`:
  - Coding standards and patterns
  - Git workflow conventions
  - Review guidelines
  - Release procedures
- **Create `.github/instructions/` files** for developer guidance
- **Create `.github/copilot-settings.json`** for Copilot configuration

**Agents:** `csharp-coding:coding`, `development:developer`  
**MCP Server:** `JSdotNet.MCP.Guidelines` for guideline generation

### Stage 2: GitHub Actions Workflows

- **Add CI workflow** to build and test on pull requests and pushes.
- **Add release workflow** for versioning and publishing (if applicable).
- **Add dependency review workflow** for supply-chain security checks.
- **Configure workflow permissions** (least-privilege token scopes).
- **Set up environments** (development, staging, production) with required reviewers if needed.

**Agents:** `csharp-coding:coding`

### Stage 3: Architecture & Planning
- **Define target architecture** for initial setup
- **Capture API contracts** and data model boundaries
- **Plan integration points** across services
- **Capture risk and assumptions** for local development

**Agents:** `architecture:architect`, `development:development-plan`

### Stage 4: Tooling & Dependencies
- **Install base dependencies** (frameworks, SDKs)
- **Configure build & test pipelines**
- **Set up linting and code quality tools**
- **Configure logging and observability**

**Agents:** `csharp-coding:coding`, `development:developer`

### Stage 5: Aspire AppHost & Project Scaffolding

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

**Agents:** `csharp-coding:coding`, `development:developer`  
**Skills Used:** `aspire` skill from development plugin

### Stage 6: Build & Test Validation

- **Compile all projects** to verify no build errors
- **Run unit test suite** to verify test framework works
- **Execute integration tests** against AppHost

### Stage 7: Running Application Validation & Recording
- **Start Aspire AppHost** (`aspire run`) and confirm startup stability
- **Verify dashboard** is accessible and services are running
- **Check health endpoints** of all services
- **Validate database connectivity** (if applicable)
- **Run smoke tests** against the running application
- **Record validation evidence** (runtime logs, endpoint results, screenshots)
- **Generate runtime validation report** with pass/fail outcomes and recommendations

**Validation Checklist:**
- [ ] All projects compile without errors
- [ ] Unit tests pass (>0% coverage established)
- [ ] Integration tests execute successfully
- [ ] AppHost starts without errors
- [ ] Dashboard is accessible (default: localhost:18888)
- [ ] All services report healthy status
- [ ] Database connections working
- [ ] API endpoints respond correctly
- [ ] Logs show expected output
- [ ] Runtime validation evidence recorded and attached to report

**Agents:** `csharp-coding:coding`, `development:developer`  
**Output:** Build/test validation report plus runtime validation recording report

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
- Runtime validation evidence recorded and attached to report.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). If the extension is not
installed, skip the canvas calls below and continue through standard chat
interaction.

- Open canvas `orch-dashboard`, then call `start_run` with
  `skillId: "orch-project"` and these stages: GitHub Folder Setup
  (Foundation), GitHub Actions Workflows, Architecture & Planning, Tooling &
  Dependencies, Aspire AppHost & Project Scaffolding, Build & Test
  Validation, Running Application Validation & Recording.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. generated files,
  build results, or runtime health evidence.
- Call `finish_run` with the final status and a summary once the project is
  scaffolded and validated locally.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.
- Validation report with detailed results

## Validation Stage Details

The validation stages (5 and 6) ensure the project is ready for development:

### Build Validation
```
✓ Compile AppHost project
✓ Compile all service projects
✓ Compile test projects
✓ Resolve all NuGet dependencies
```

### Test Validation
```
✓ Run unit tests (establish baseline)
✓ Run integration tests against AppHost
✓ Verify test framework is working
```

### Application Validation
```
✓ Start Aspire AppHost: aspire run
✓ Wait for dashboard initialization
✓ Check all services started successfully
✓ Verify health endpoints responsive
✓ Test database connectivity (if configured)
✓ Run smoke tests against API endpoints
```

### Failure Handling
If validation fails, the canvas displays:
- Specific error messages
- Which stage failed
- Suggested fixes
- Option to re-run validation after fixes

## Reference

Source skill location: `plugins/copilot-app/skills/orch-project/SKILL.md`
