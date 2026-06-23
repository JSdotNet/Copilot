---
name: orch-feature
description: 'Orchestrate feature development from conception through production deployment using GitHub Copilot App canvas. Manages the complete feature lifecycle including planning, design, implementation, testing, documentation, and release. Coordinates multiple agents with automation handoffs to csharp-coding for development.'
---

# Orchestrate Feature Development

Execute a complete feature development workflow from backlog to production using canvas interface.

## Workflow Stages

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
- **Create deployment strategy**
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

### Stage 6: Documentation
- **Update API documentation** (OpenAPI/Swagger)
- **Write user-facing documentation**
- **Create changelog entry**
- **Update runbooks** if operational changes
- **Record architectural decisions** (ADR if needed)

**Agents:** `documentation:documentation`, `development:developer`

### Stage 7: Deployment & Release
- **Merge to main/develop** branch
- **Deploy to staging** environment
- **Run smoke tests** on staging
- **Deploy to production** (with approval)
- **Monitor metrics** and error rates

**Agents:** `csharp-coding:coding`, `development:developer`

## Usage Pattern

```
Orchestrate feature development for:
- Feature: "User Role-Based Access Control"
- Epic: "Security & Authorization"
- Acceptance criteria:
  * Admins can create/manage roles
  * Roles have fine-grained permissions
  * Audit log tracks role changes
- Target release: Next sprint
- Deployment: Blue-green on production
```

## Definition of Done Checklist

- [ ] Code complete and reviewed
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests passing
- [ ] Security scanning passed
- [ ] Documentation updated
- [ ] Changelog entry created
- [ ] PR merged to main branch
- [ ] Deployed to staging
- [ ] Approved for production
- [ ] Deployed to production
- [ ] Monitored for 24 hours

## Canvas Interface

This skill opens a **feature development canvas** in GitHub Copilot App showing:

- **Feature specification** with acceptance criteria
- **Development progress** tracking each stage
- **Definition of Done** interactive checklist
- **Code review status** with comment threads
- **Test coverage** visualization
- **Integration buttons** to switch to `csharp-coding:coding` agent for implementation
- **Deployment gates** and approval workflow
- **Release notes** generator

## Integration Points

- **Product Owner Plugin**: Create and manage user stories
- **Development Plugin**: Plan and execute implementation
- **Architecture Plugin**: Design and ADR documentation
- **csharp-coding Plugin**: Switch to coding agent for implementation and testing
- **Documentation Plugin**: API and user documentation
- **GitHub Copilot App**: Canvas-based feature status tracking

## Reference

Source skill location: `plugins/copilot-app/skills/orch-feature/SKILL.md`
