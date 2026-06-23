---
name: orchestrate-create-mvp
description: 'Orchestrate Minimum Viable Product (MVP) creation workflow. Use this skill to coordinate rapid development of core features across planning, implementation, testing, and deployment stages. Integrates development, product-owner, and architecture plugins with automated agent handoffs.'
---

# Orchestrate Create MVP

Execute a complete MVP development workflow from planning through deployment using coordinated agents.

## Workflow Stages

### Stage 1: MVP Definition & Planning
- **Define MVP scope** (core features, acceptance criteria)
- **Create user stories** for each feature
- **Estimate effort** and timeline
- **Identify dependencies** and risks

**Agents:** `product-owner:product-owner`, `development:development-plan`

### Stage 2: Architecture & Design
- **Design system architecture** for MVP scope
- **Document API contracts** and data models
- **Plan integration points** with external services
- **Create deployment strategy**

**Agents:** `architecture:architect`, `development:developer`

### Stage 3: Implementation Sprint
- **Create feature branches** for parallel development
- **Implement core features** using TDD approach
- **Build API endpoints** and services
- **Integrate UI/Frontend** (if applicable)

**Agents:** `csharp-coding:coding`, `development:developer`

### Stage 4: Testing & Quality Assurance
- **Write unit tests** for all components
- **Perform integration testing** across services
- **Conduct code review** for quality gates
- **Security scanning** and vulnerability assessment

**Agents:** `development:testing`, `review:reviewer`, `csharp-coding:coding`

### Stage 5: Documentation & Release
- **Generate API documentation** (OpenAPI/Swagger)
- **Create deployment guides** and runbooks
- **Document known limitations** and future enhancements
- **Prepare release notes**

**Agents:** `documentation:documentation`, `development:developer`

### Stage 6: Deployment & Validation
- **Deploy to staging** environment
- **Run smoke tests** and validation
- **Deploy to production** (if approved)
- **Monitor and verify** MVP metrics

**Agents:** `csharp-coding:coding`, `development:developer`

## Usage Pattern

```
Orchestrate MVP creation for:
- Project: "ReportingEngine"
- Core features:
  * User authentication
  * Report generation
  * Report export (PDF/Excel)
  * Basic scheduling
- Target: 4-week timeline
- Deploy to: Azure Container Apps
```

## Feature Breakdown Example

```
Epic: "Reporting Engine MVP"
├── User Authentication
│   ├── Story: Implement JWT auth
│   ├── Story: Add login/logout endpoints
│   └── Story: Create admin panel
├── Report Generation
│   ├── Story: Build report template engine
│   ├── Story: Implement data querying
│   └── Story: Add report preview
├── Export Capabilities
│   ├── Story: PDF export
│   └── Story: Excel export
└── Scheduling
    ├── Story: Background job scheduler
    └── Story: Report delivery email
```

## Integration Points

- **Development Plugin**: Coordinate MVP planning with `development-plan` agent
- **Product Owner Plugin**: Create stories and manage backlog
- **Architecture Plugin**: Design MVP architecture
- **GitHub Copilot App**: Orchestrate workflow and progress tracking
- **GitHub Issues**: Track MVP tasks and blockers

## Reference

Source skill location: `plugins/copilot-app/skills/orchestrate-create-mvp/SKILL.md`
