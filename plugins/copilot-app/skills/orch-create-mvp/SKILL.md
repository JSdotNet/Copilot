---
name: orch-create-mvp
description: 'Orchestrate Minimum Viable Product (MVP) creation using GitHub Copilot App canvas. Coordinates rapid development of core features across planning, implementation, testing, local run, and monitoring stages with agent handoffs.'
---

# Orchestrate Create MVP

Execute a complete MVP development workflow from planning through local run and monitoring using coordinated agents and canvas interface.

> **Precondition:** This skill assumes the MVP scope, priorities, and architecture are
> already approved. Use it to sequence and implement that approved MVP, not to establish the
> initial product definition.

## Input Expectations

- Project name and description.
- Approved MVP specification or roadmap scope.
- Core features list with priority order.
- Target timeline or sprint allocation.
- Runtime validation target (e.g., local or cloud run + monitoring).
- Optional constraints (team size, technology preferences).

## Workflow Stages

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and every transition needs explicit user approval.

### Stage 1: MVP Scope Intake
- **Review the approved MVP scope** and acceptance criteria
- **Confirm feature priorities** and delivery order
- **Identify dependencies** and risks
- **Confirm the validation target** for the implementation run

**Agents:** `product-owner:product-owner`, `architecture:architect`

### Stage 2: Implementation Planning
- **Break the approved MVP into implementation slices**
- **Map API contracts and data models** to the current codebase
- **Plan integration points** with external services
- **Define the local runtime validation strategy**

**Agents:** `architecture:architect`

### Stage 3: Implementation
- **Implement core features** using TDD approach
- **Build API endpoints** and services
- **Integrate UI/Frontend** (if applicable)

**Agents:** `csharp-coding:coding`

### Final Phases (Shared)

After Implementation, this skill runs the shared delivery phases defined once
in `instructions/orch-shared-phases.instructions.md` (code-modifying tier), in order:

1. **Build & Test** — build, unit tests, and E2E tests, run first.
2. **QA Validation** — new MVP functionality, so run the full automatic QA validation
   (Playwright smoke tests on core user flows plus `qa:qa-monitor` runtime monitoring,
   with evidence recorded).
3. **Personal Validation** — hand back to the user (no agent); present the code review and
   the recorded QA review, and start the application for the user to review.
4. **Create Pull Request** — only after explicit user approval.
5. **Summary** — emit the run summary.

See `instructions/orch-shared-phases.instructions.md` for the full phase definitions;
update that file to change these phases for every orchestration.

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

## Output Expectations

- MVP scope defined with prioritized feature breakdown.
- Architecture documented with API contracts and data models.
- Core features implemented with TDD approach.
- Unit and integration tests passing.
- All services start locally and report healthy status.
- Smoke tests pass on core user flows.
- Runtime readiness status recorded with evidence.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension. Follow the
shared **Dashboard Reporting Contract** in
`instructions/orch-shared-phases.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence, the QA Validation
`scenarios`/`monitoring` passthrough, and the Personal Validation → Create Pull Request
gating. If the extension is not installed, skip the canvas calls and continue through
standard chat interaction.

- Call `start_run` with `skillId: "orch-create-mvp"` and these stages: MVP Scope Intake,
  Implementation Planning, Implementation, Build & Test, QA Validation,
  Personal Validation, Create Pull Request, Summary.
- During **MVP Scope Intake**, also open/update `markdown-canvas`
  (`markdown-preview`) with the approved MVP scope, and during **Implementation Planning**,
  open/update `markdown-canvas` with the architecture documentation and `diagram-canvas`
  (`mermaid-diagram`) with any accompanying Mermaid diagrams, per
  `instructions/canvas-usage.instructions.md`. Optional; skip gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-create-mvp/SKILL.md`
