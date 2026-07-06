---
name: orch-feature
description: 'Orchestrate feature development from planning through local run and monitoring using GitHub Copilot App canvas. Manages the feature lifecycle across design, implementation, testing, review, and local validation with handoffs to csharp-coding for implementation.'
---

# Orchestrate Feature Development

Execute a complete feature development workflow from backlog to local validation using canvas interface.

## Input Expectations

- Feature name and description.
- Parent epic or project context.
- Acceptance criteria (at least one measurable criterion).
- Target milestone or sprint.
- Runtime validation target (e.g., local run + monitoring).

## Workflow Stages

> **Cross-plugin agents are recommended, not required.** When a referenced plugin is
> not installed, skip the stage or perform it manually and continue with remaining
> stages. All agent transitions require explicit user approval before switching.

### Stage 1: Feature Specification
- **Define feature requirements** and scope
- **Write user stories** with acceptance criteria
- **Identify stakeholders** and dependencies
- **Create design mockups** (if UI-focused)
- **Estimate effort** and assign points

**Agents:** `product-owner:product-owner`, `development:development-plan`

### Stage 2: Architecture & Design
- **Design data models** and API contracts
- **Document system changes** and impacts
- **Plan integration points**
- **Define local validation strategy**
- **Identify potential risks**

**Agents:** `architecture:architect`, `development:developer`

### Stage 3: Implementation
- **Create feature branch** with clear naming
- **Write code following standards** and patterns
- **Apply TDD** (test-driven development)
- **Maintain code coverage** targets
- **Document complex logic**

**Agents:** `csharp-coding:coding`, `development:developer`

### Stage 4: Testing & Validation
- **Run unit tests** for code coverage
- **Perform integration testing**
- **Execute user acceptance testing** (UAT)
- **Test edge cases** and error handling
- **Performance testing** if applicable

**Agents:** `development:testing`, `csharp-coding:coding`, `review:reviewer`

### Stage 5: Code Review & Quality
- **Submit pull request** for peer review
- **Address review feedback** and suggestions
- **Run security scanning** (SAST, dependency checks)
- **Verify all checks** pass (lint, build, tests)
- **Approve for merge**

**Agents:** `review:reviewer`, `csharp-coding:coding`

### Stage 6: E2E Validation & Result Recording
- **Prepare end-to-end test scenarios** from acceptance criteria
- **Execute E2E test suite** against integrated local flow
- **Run feature locally** and confirm startup stability
- **Monitor runtime behavior** (logs, health, key endpoints)
- **Capture evidence** (logs, screenshots, and run metadata)
- **Record validation result** with pass/fail status per scenario
- **Publish validation summary** for local acceptance decision input

**Agents:** `development:testing`, `csharp-coding:coding`, `review:reviewer`

## Usage Pattern

```
Orchestrate feature development for:
- Feature: "User Role-Based Access Control"
- Epic: "Security & Authorization"
- Acceptance criteria:
  * Admins can create/manage roles
  * Roles have fine-grained permissions
  * Audit log tracks role changes
- Target milestone: Next sprint
- Runtime target: Local run + monitoring
```

## Definition of Done Checklist

- [ ] Code complete and reviewed
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests passing
- [ ] Security scanning passed
- [ ] E2E test scenarios defined from acceptance criteria
- [ ] E2E validation executed successfully
- [ ] E2E run evidence captured (logs/screenshots)
- [ ] Validation result recorded and shared

## Output Expectations

- Feature code complete and reviewed.
- Unit tests written with coverage above 80%.
- Integration and E2E tests passing.
- Security scanning passed.
- Validation evidence captured (logs, screenshots).
- Validation result recorded with pass/fail per scenario.

## Canvas Interface (Planned)

> Canvas panels described below represent the target experience. No canvas extensions
> are implemented yet. The skill currently operates through standard chat interaction.

- Feature specification with acceptance criteria
- Development progress tracking each stage
- Definition of Done interactive checklist
- E2E validation panel with scenario-level pass/fail status
- Local run and monitoring panel for startup, logs, and health checks
- Integration buttons to switch to `csharp-coding:coding` agent (with approval)

## Reference

Source skill location: `plugins/copilot-app/skills/orch-feature/SKILL.md`
