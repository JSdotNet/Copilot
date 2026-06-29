---
name: orch-setup
description: 'Orchestrate .github setup and project scaffolding with Aspire integration and local validation. Use this skill to initialize development environment, setup repository workflows, create project structure with Aspire AppHost, validate compilation/testing, and confirm local run and monitoring for existing repositories.'
---

# Orchestrate Project Setup

Automate the complete project setup workflow for existing repositories using GitHub Copilot App canvas interface, including automated local validation and testing.

> **Note:** This skill assumes your repository already exists. It focuses on setting up the development infrastructure, guidelines, and initial scaffolding with built-in validation.

## Workflow Stages

### Stage 1: GitHub Folder Setup (Foundation)
- **Initialize `.github/` directory structure** with recommended layouts
- **Generate project guidelines** using `project-guideline-MCP` server:
  - Coding standards and patterns
  - Git workflow conventions
  - Review guidelines
  - Release procedures
- **Create `.github/instructions/` files** for developer guidance
- **Setup GitHub workflows** (CI/CD templates, branch protection, issue templates)
- **Create `.github/copilot-settings.json`** for Copilot configuration

**Agents:** `csharp-coding:coding`, `development:developer`  
**MCP Server:** `project-guideline-MCP` for guideline generation

### Stage 2: Architecture & Planning
- **Define target architecture** for initial setup
- **Capture API contracts** and data model boundaries
- **Plan integration points** across services
- **Capture risk and assumptions** for local development

**Agents:** `architecture:architect`, `development:development-plan`

### Stage 3: Tooling & Dependencies
- **Install base dependencies** (frameworks, SDKs)
- **Configure build & test pipelines**
- **Set up linting and code quality tools**
- **Configure logging and observability**

**Agents:** `csharp-coding:coding`, `development:developer`

### Stage 4: Aspire AppHost & Project Scaffolding
**Combined Stage** — Stages 4 & 5 merged (they are interdependent)

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

**Rationale:** AppHost and initial services are tightly coupled. The example service references the AppHost configuration, service discovery setup, and health checks created in the AppHost project. Separating them would create circular dependencies.

**Agents:** `csharp-coding:coding`, `development:developer`  
**Skills Used:** `aspire` skill from development plugin

### Stage 5: Build & Test Validation
**NEW STAGE** — Ensure project is ready for development

- **Compile all projects** to verify no build errors
- **Run unit test suite** to verify test framework works
- **Execute integration tests** against AppHost

### Stage 6: Running Application Validation & Recording
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

## Canvas Interface

This skill opens a **project setup canvas** in GitHub Copilot App showing:

- **Progress tracker** for each workflow stage
- **Checklist** of setup tasks
- **Generated files preview** (.github structure, guidelines, scaffolding)
- **Configuration options** (Aspire services, integrations, tooling)
- **Validation status** during Stage 5 and Stage 6 (real-time console output)
- **Health indicators** for each component:
  - Build status (compiling...)
  - Test status (running tests...)
  - Application status (running AppHost...)
  - Recording status (collecting validation evidence...)
  - Service health (checking endpoints...)
- **Action buttons** to generate, preview, apply, or re-validate
- **Validation report** with detailed results

## Integration Points

- **Development Plugin**: Coordinate with `development-plan` agent
- **Architecture Plugin**: Generate arc42 blueprints
- **project-guideline-MCP**: Generate project-specific guidelines
- **csharp-coding Plugin**: Implementation and validation
- **GitHub Copilot App**: Canvas-based workflow orchestration

## Key Benefits

- **No manual setup** - Automated .github folder creation
- **Guideline-driven** - Uses project-guideline-MCP for consistent standards
- **Aspire-ready** - Immediate support for distributed applications
- **Integrated services** - AppHost and initial services created together
- **Validated setup** - Automatic verification that everything compiles and runs
- **Visible progress** - Canvas shows real-time status during validation
- **Ready to develop** - After completion, developers can immediately start coding

## Validation Stage Details

The **Stage 5: Validation** is critical for ensuring the project is ready:

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

Source skill location: `plugins/copilot-app/skills/orch-setup/SKILL.md`
