---
name: orch-create-module
description: 'Orchestrate creating a new module in an existing project using GitHub Copilot App canvas. Coordinates planning, implementation, testing, local run, and monitoring to integrate the module safely.'
---

# Orchestrate Create Module

Execute a complete workflow for adding a new module to an existing project using a local-first validation approach.

## Workflow Stages

### Stage 1: Module Scope & Contract
- **Define module purpose** and boundaries
- **List public interfaces** and expected consumers
- **Capture acceptance criteria** and non-functional requirements
- **Identify dependencies** and integration risks

**Agents:** `product-owner:product-owner`, `development:development-plan`

### Stage 2: Architecture & Design
- **Design module structure** and naming conventions
- **Define data contracts** and error handling behavior
- **Plan integration points** with existing modules/services
- **Create implementation checklist** for incremental delivery

**Agents:** `architecture:architect`, `development:developer`

### Stage 3: Module Implementation
- **Create module files/folders** in the existing project layout
- **Implement core functionality** using project patterns
- **Add dependency wiring** and configuration updates
- **Keep changes incremental** for easier review

**Agents:** `csharp-coding:coding`, `development:developer`

### Stage 4: Testing & Quality Gates
- **Create unit tests** for module behavior
- **Add integration tests** for key module interactions
- **Run static checks** and project quality gates
- **Resolve defects** before runtime validation

**Agents:** `csharp-coding:coding`, `review:reviewer`, `development:testing`

### Stage 5: Local Run & Monitoring
- **Run the project locally** with module enabled
- **Validate module endpoints/flows** using smoke tests
- **Monitor logs and health checks** for regressions
- **Record validation evidence** and readiness status

**Agents:** `csharp-coding:coding`, `development:developer`, `review:reviewer`

## Usage Pattern

```
Orchestrate module creation for:
- Project: "Billing.Core"
- Module: "InvoiceRules"
- Purpose: Validate and score invoice policy rules
- Dependencies: Existing pricing and tax modules
- Runtime target: Local run + monitoring
```

## Canvas Interface

This skill opens a **module creation canvas** in GitHub Copilot App showing:

- **Module scope panel** with contracts and boundaries
- **Architecture checklist** for structure and dependencies
- **Implementation tracker** across files and tasks
- **Test and quality dashboard** for module-specific coverage
- **Local run and monitoring panel** for logs, health, and smoke checks
- **Integration buttons** to switch to `csharp-coding:coding` agent

## Integration Points

- **Product Owner Plugin**: Scope definition and acceptance criteria
- **Development Plugin**: Planning and implementation coordination
- **Architecture Plugin**: Module boundaries and integration design
- **csharp-coding Plugin**: Coding and test implementation
- **Review Plugin**: Quality and risk-focused review
- **GitHub Copilot App**: Canvas-based orchestration and tracking

## Reference

Source skill location: `plugins/copilot-app/skills/orch-create-module/SKILL.md`
