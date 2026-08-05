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

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and every transition needs explicit user approval.

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

### Final Phases (Shared)

After Implementation, this skill runs the shared delivery phases defined once in
`instructions/orch-shared-phases.instructions.md` (code-modifying tier), in order:

1. **Build & Test** — build, unit tests, and E2E tests, run first.
2. **QA Validation** — functional feature change, so run the full automatic QA validation
   (Playwright scenarios from the acceptance criteria plus `qa:qa-monitor` runtime
   monitoring, with evidence recorded).
3. **Personal Validation** — hand back to the user (no agent); present the code review and
   the recorded QA review, and start the application for the user to review.
4. **Create Pull Request** — only after explicit user approval.
5. **Summary** — emit the run summary.

See `instructions/orch-shared-phases.instructions.md` for the full phase definitions;
update that file to change these phases for every orchestration.

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
- [ ] Personal validation approved by the user
- [ ] Pull request created after approval, with all checks passing

## Output Expectations

- Feature code complete and reviewed.
- Unit tests written with coverage above 80%.
- Integration and E2E tests passing.
- Security scanning passed.
- Validation evidence captured (logs, screenshots).
- Validation result recorded with pass/fail per scenario.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension. Follow the
shared **Dashboard Reporting Contract** in
`instructions/orch-shared-phases.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence, the QA Validation
`scenarios`/`monitoring` passthrough, and the Personal Validation → Create Pull Request
gating. If the extension is not installed, skip the canvas calls and continue through
standard chat interaction.

- Call `start_run` with `skillId: "orch-feature"` and these stages: Feature
  Specification, Architecture & Design, Implementation, Build & Test, QA Validation,
  Personal Validation, Create Pull Request, Summary.
- During **Feature Specification**, also open/update `markdown-canvas` (`markdown-preview`)
  with the drafted user stories, and during **Architecture & Design**, open/update
  `markdown-canvas` with the data model/API contract documentation and `diagram-canvas`
  (`mermaid-diagram`) with any accompanying Mermaid diagrams, per
  `instructions/canvas-usage.instructions.md`. Optional; skip gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-feature/SKILL.md`
