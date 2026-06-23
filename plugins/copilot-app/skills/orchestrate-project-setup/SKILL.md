---
name: orchestrate-project-setup
description: 'Orchestrate project setup tasks with automated workflow. Use this skill when starting a new project or setting up an existing project for development. Coordinates with development, architecture, and product-owner plugins to initialize repository structure, tooling, and documentation.'
---

# Orchestrate Project Setup

Automate the complete project setup workflow using GitHub Copilot App and coordinated agents.

## Workflow Stages

### Stage 1: Foundation Setup
- **Initialize repository** structure with .github conventions
- **Create project configuration** (package.json, appsettings.json, etc.)
- **Set up version control** workflows (branch protection, CI/CD templates)
- **Configure development environment** (Dev Containers, local setup scripts)

**Agents:** `csharp-coding:coding` (for .NET projects), `development:developer`

### Stage 2: Documentation & Architecture
- **Generate README.md** with project overview
- **Create architecture documentation** (arc42 blueprint)
- **Document development guidelines** and coding standards
- **Set up copilot-instructions.md** for consistency

**Agents:** `documentation:documentation`, `architecture:architect`

### Stage 3: Tooling & Dependencies
- **Install base dependencies** (frameworks, SDKs)
- **Configure build & test pipelines**
- **Set up linting and code quality tools**
- **Configure logging and observability**

**Agents:** `csharp-coding:coding`, `development:developer`

### Stage 4: Initial Scaffolding
- **Create project structure** (src/, tests/, docs/)
- **Generate boilerplate code** (entry points, core types)
- **Set up testing framework** (xUnit, NUnit, etc.)
- **Create first unit tests** as examples

**Agents:** `csharp-coding:coding`, `development:developer`, `review:reviewer`

### Stage 5: Team Onboarding
- **Create CONTRIBUTING.md** guide
- **Document local development setup**
- **Generate plugin setup instructions**
- **Create quick-start examples**

**Agents:** `documentation:documentation`, `product-owner:product-owner`

## Usage Pattern

```
Orchestrate a new .NET project setup:
- Project name: "MyAwesomeAPI"
- Type: "ASP.NET Core Web API"
- Language: C#
- Include architecture documentation
- Include setup scripts and Dev Container
```

## Integration Points

- **Development Plugin**: Coordinate with `development-plan` agent
- **Architecture Plugin**: Generate arc42 blueprints
- **Documentation Plugin**: Create project documentation
- **Product Owner Plugin**: Set up GitHub Issues templates
- **GitHub Copilot App**: Native task orchestration interface

## Reference

Source skill location: `plugins/copilot-app/skills/orchestrate-project-setup/SKILL.md`
