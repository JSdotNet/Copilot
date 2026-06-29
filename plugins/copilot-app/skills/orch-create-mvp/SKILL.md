---
name: orch-create-mvp
description: 'Orchestrate Minimum Viable Product (MVP) creation using GitHub Copilot App canvas. Coordinates rapid development of core features across planning, implementation, testing, local run, and monitoring stages with automated handoffs.'
---

# Orchestrate Create MVP

Execute a complete MVP development workflow from planning through local run and monitoring using coordinated agents and canvas interface.

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
- **Define local runtime validation strategy**

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

### Stage 5: Run & Monitoring
- **Start MVP locally or in cloud** and validate startup for all components
- **Run smoke tests** on core user flows
- **Monitor runtime logs and health checks**
- **Record local or cloud readiness status** and unresolved blockers

**Agents:** `csharp-coding:coding`, `development:developer`, `review:reviewer`

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
- Runtime target: Local or cloud run + monitoring
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

## Canvas Interface

This skill opens an **MVP development canvas** in GitHub Copilot App showing:

- **MVP roadmap** with feature breakdown and timeline
- **Sprint planner** showing task allocation and dependencies
- **Progress dashboard** tracking completion across stages
- **Team collaboration** panel for assignments and comments
- **Integration buttons** to switch to `csharp-coding:coding` agent for implementation
- **Status indicators** for each component (planning, in-progress, testing, running)

## Integration Points

- **Development Plugin**: Coordinate MVP planning with `development-plan` agent
- **Product Owner Plugin**: Create stories and manage backlog
- **Architecture Plugin**: Design MVP architecture
- **csharp-coding Plugin**: Switch to coding agent for implementation sprints
- **GitHub Copilot App**: Canvas-based workflow orchestration
- **GitHub Issues**: Track MVP tasks and blockers

## Reference

Source skill location: `plugins/copilot-app/skills/orch-create-mvp/SKILL.md`
