---
name: orch-feature
description: 'Orchestrate feature implementation through local run and monitoring using GitHub Copilot App canvas. Focuses on coding, validation, review, and personal approval once the feature scope is already known.'
---

# Orchestrate Feature Development

Execute a feature implementation workflow from approved requirements and architecture
through local validation using canvas interface.

> **Precondition:** This skill assumes the feature specification, acceptance criteria, and
> architecture are already approved — typically from an earlier documentation or
> specification orchestration. Use this skill to implement that approved scope, not to
> discover it from scratch.

## Input Expectations

- Feature name and description.
- Approved feature specification or story context.
- Approved architecture constraints or design notes for the affected area.
- Parent epic or project context.
- Acceptance criteria (at least one measurable criterion).
- Target milestone or sprint.
- Runtime validation target (e.g., local run + monitoring).

## Workflow Stages

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and every transition needs explicit user approval.

### Stage 1: Specification & Architecture Intake
- **Review the approved feature scope** and acceptance criteria
- **Map the existing architecture guidance** to the impacted code paths
- **Confirm implementation constraints** and affected integration points
- **Define the local validation target** for the approved change

**Agents:** `product-owner:product-owner`, `architecture:architect`

### Stage 2: Implementation
- **Write code following standards** and patterns
- **Apply TDD** (test-driven development)
- **Maintain code coverage** targets
- **Document complex logic**

**Agents:** `csharp-coding:coding`

### Final Phases (Shared)

After Implementation, this skill runs the shared delivery phases defined once in
`instructions/orch-shared-phases.instructions.md` (code-modifying tier), in order:

1. **Build & Test** — build, unit tests, and E2E tests, run first.
2. **QA Validation** — new functionality, so run the full automatic QA validation
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

- Call `start_run` with `skillId: "orch-feature"` and these stages: Specification &
  Architecture Intake, Implementation, Build & Test, QA Validation, Personal Validation,
  Create Pull Request, Summary.
- During **Specification & Architecture Intake**, optionally open/update
  `markdown-canvas` (`markdown-preview`) or `diagram-canvas` (`mermaid-diagram`) with the
  provided specification or architecture artifacts, per
  `instructions/canvas-usage.instructions.md`.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-feature/SKILL.md`
