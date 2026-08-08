---
name: orch-create-module
description: 'Orchestrate creating a new module in an existing project using GitHub Copilot App canvas. Coordinates planning, implementation, testing, local run, and monitoring to integrate the module safely.'
---

# Orchestrate Create Module

Execute a complete workflow for adding a new module to an existing project using a local-first validation approach.

> **Precondition:** This skill assumes the module specification, boundaries, and
> architecture context already exist. Use it to translate that approved context into code.

## Input Expectations

- Target project name and location.
- Approved module specification or design notes.
- Module name and purpose.
- Public interfaces and expected consumers.
- Dependencies on existing modules or services.
- Runtime validation target (e.g., local run + monitoring).

## Workflow Stages

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and every transition needs explicit user approval.
>
> Model choice per stage follows `instructions/orch-model-selection.instructions.md`
> (category defaults, overridable via `.github/copilot-model-selection.md` in the
> consuming repo).

### Stage 1: Specification Intake
- **Review the approved module purpose** and boundaries
- **Confirm public interfaces** and expected consumers
- **Capture acceptance criteria** and non-functional requirements
- **Identify dependencies** and integration risks

**Agents:** `product-owner:product-owner`, `architecture:architect`

### Stage 2: Implementation Planning
- **Map the approved design** to the existing project structure
- **Define data contracts** and error handling behavior for implementation
- **Plan integration points** with existing modules/services
- **Create an implementation checklist** for incremental delivery

**Agents:** `architecture:architect`

### Stage 3: Implementation
- **Create module files/folders** in the existing project layout
- **Implement core functionality** using project patterns
- **Add dependency wiring** and configuration updates
- **Keep changes incremental** for easier review

**Agents:** `csharp-coding:coding`

### Final Phases (Shared)

After Module Implementation, this skill runs the shared delivery phases defined once in
`instructions/orch-shared-phases.instructions.md` (code-modifying tier), in order:

1. **Build & Test** — build, unit tests, and E2E tests, run first.
2. **QA Validation** — new module functionality, so run the full automatic QA validation
   (Playwright checks on the new module's endpoints/flows plus `qa:qa-monitor` runtime
   monitoring, with evidence recorded).
3. **Personal Validation** — hand back to the user (no agent); present the code review and
   the recorded QA review, and start the application for the user to review.
4. **Create Pull Request** — only after explicit user approval.
5. **Documentation Update** — after the pull request exists, check whether the repository's
   governed documentation is now stale and, if so, update it and commit onto the PR branch;
   a clean no-op when nothing needs changing.
6. **Summary** — emit the run summary.

See `instructions/orch-shared-phases.instructions.md` for the full phase definitions;
update that file to change these phases for every orchestration.

## Usage Pattern

```
Orchestrate module creation for:
- Project: "Billing.Core"
- Module: "InvoiceRules"
- Purpose: Validate and score invoice policy rules
- Dependencies: Existing pricing and tax modules
- Runtime target: Local run + monitoring
```

## Output Expectations

- Module created following project patterns and naming conventions.
- Unit and integration tests passing for module behavior.
- Module wired into project configuration and dependency graph.
- Project runs locally with module enabled.
- Validation evidence recorded (logs, health checks).
- Readiness status documented.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension. Follow the
shared **Dashboard Reporting Contract** in
`instructions/orch-shared-phases.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence, the QA Validation
`scenarios`/`monitoring` passthrough, and the Personal Validation → Create Pull Request
gating. If the extension is not installed, skip the canvas calls and continue through
standard chat interaction.

- Call `start_run` with `skillId: "orch-create-module"` and these stages: Specification
  Intake, Implementation Planning, Implementation, Build & Test, QA Validation,
  Personal Validation, Create Pull Request, Documentation Update, Summary.
- During **Specification Intake**, also open/update `markdown-canvas` (`markdown-preview`)
  with the approved acceptance criteria, and during **Implementation Planning**, open/update
  `markdown-canvas` with the module design documentation and `diagram-canvas`
  (`mermaid-diagram`) with any accompanying Mermaid diagrams, per
  `instructions/canvas-usage.instructions.md`. Optional; skip gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-create-module/SKILL.md`
