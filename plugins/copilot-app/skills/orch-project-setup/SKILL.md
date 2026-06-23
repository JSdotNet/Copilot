---
name: orch-project-setup
description: 'Orchestrate .github setup and project scaffolding with Aspire integration. Use this skill to initialize development environment, setup GitHub workflows, create project structure with Aspire AppHost, and establish coding standards for existing repositories.'
---

# Orchestrate Project Setup

Automate the complete project setup workflow for existing repositories using GitHub Copilot App canvas interface.

> **Note:** This skill assumes your repository already exists. It focuses on setting up the development infrastructure, guidelines, and initial scaffolding.

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

**Agents:** `csharp-coding:coding`, `documentation:documentation`  
**MCP Server:** `project-guideline-MCP` for guideline generation

### Stage 2: Architecture & Documentation
- **Generate README.md** with project overview
- **Create architecture documentation** (arc42 blueprint if applicable)
- **Document development guidelines** and coding standards
- **Set up copilot-instructions.md** for consistency
- **Generate CONTRIBUTING.md** for team collaboration

**Agents:** `documentation:documentation`, `architecture:architect`

### Stage 3: Tooling & Dependencies
- **Install base dependencies** (frameworks, SDKs)
- **Configure build & test pipelines**
- **Set up linting and code quality tools**
- **Configure logging and observability**

**Agents:** `csharp-coding:coding`, `development:developer`

### Stage 4: Aspire Scaffolding
- **Create AppHost project** for service orchestration
- **Add integrations** based on project type
- **Wire up service discovery** and health checks
- **Configure dashboard** for local development
- **Create example service** demonstrating patterns
- **Setup environment configuration** for development/staging/production

**Agents:** `csharp-coding:coding`, `development:developer`  
**Skills Used:** `aspire` skill from development plugin

### Stage 5: Initial Project Structure
- **Create project directories** (src/, tests/, docs/)
- **Generate boilerplate code** (entry points, core types, AppHost references)
- **Set up testing framework** (xUnit, NUnit, etc.)
- **Create first unit tests** as examples
- **Setup test data fixtures**

**Agents:** `csharp-coding:coding`, `development:developer`

### Stage 6: Team Onboarding
- **Create local development setup guide**
- **Generate Aspire quick-start** (how to run AppHost)
- **Document environment setup** (required tools, SDKs)
- **Create troubleshooting guide**
- **Generate plugin setup instructions** for Copilot

**Agents:** `documentation:documentation`, `product-owner:product-owner`

## Usage Pattern

```
Orchestrate project setup for:
- Repository: "MyAwesomeAPI" (already exists on GitHub)
- Type: "ASP.NET Core API"
- Language: C#
- Aspire services: API, Database, Cache, Queue
- Include development guides and troubleshooting
- Setup GitHub workflows and branch protection
```

## Canvas Interface

This skill opens a **project setup canvas** in GitHub Copilot App showing:

- **Progress tracker** for each workflow stage
- **Checklist** of setup tasks
- **Generated files preview** (.github structure, guidelines, scaffolding)
- **Configuration options** (Aspire services, integrations, tooling)
- **Action buttons** to generate, preview, or apply changes

## Integration Points

- **Development Plugin**: Coordinate with `development-plan` agent
- **Architecture Plugin**: Generate arc42 blueprints
- **Documentation Plugin**: Create project documentation
- **Product Owner Plugin**: Setup issue templates and backlog
- **project-guideline-MCP**: Generate project-specific guidelines
- **GitHub Copilot App**: Canvas-based workflow orchestration

## Key Benefits

- **No manual setup** - Automated .github folder creation
- **Guideline-driven** - Uses project-guideline-MCP for consistent standards
- **Aspire-ready** - Immediate support for distributed applications
- **Team-aligned** - Enforces organization standards from day one
- **Visible progress** - Canvas shows what's being created and why

## Reference

Source skill location: `plugins/copilot-app/skills/orch-project-setup/SKILL.md`
