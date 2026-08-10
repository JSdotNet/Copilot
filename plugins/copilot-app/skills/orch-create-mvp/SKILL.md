---
name: orch-create-mvp
description: 'Orchestrate Minimum Viable Product (MVP) creation using GitHub Copilot App canvas — from an ad-hoc product idea or an approved MVP specification through planning, implementation, testing, local run, and monitoring with agent handoffs. Use for a first runnable product increment of any size; missing scope, feature priorities, or architecture context is derived in Stage 0 rather than being a reason to skip orchestration.'
---

# Orchestrate Create MVP

Execute a complete MVP development workflow from planning through local run and monitoring using coordinated agents and canvas interface.

> **Scope:** This skill covers MVP work whether or not a prior product or architecture
> orchestration ran. When an approved MVP scope, priority order, and architecture exist,
> Stage 0 is a short intake and Stage 1 proceeds as usual. When they do not — a product
> idea described in a sentence or two — Stage 0 derives them with the user. Missing
> inputs are a reason to run Stage 0, never a reason to skip this skill and implement
> inline.

## Input Expectations

**Required:**

- Project name, or a one-line description of the product idea.

**Derived in Stage 0 when absent:**

- Approved MVP specification or roadmap scope.
- Core features list with priority order.
- Acceptance criteria per core feature (at least one measurable criterion each).
- Target timeline or sprint allocation.
- Runtime validation target (e.g., local or cloud run + monitoring).
- Optional constraints (team size, technology preferences).

## Workflow Stages

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and every transition needs explicit user approval.
>
> Model choice per stage follows `instructions/orch-model-selection.instructions.md`
> (category defaults, overridable via `.github/copilot-model-selection.md` in the
> consuming repo).

### Stage 0: Scope Discovery

Run this stage first, always. It is a quick confirmation when an approved MVP scope
already exists, and a full derivation when it does not.

- **Restate the product outcome** the MVP must deliver, in one or two sentences, in the
  user's terms
- **Derive the core feature list** and cut it to the smallest set that makes the product
  usable; name what is deliberately out of scope
- **Derive a priority and delivery order** across those features
- **Derive at least one measurable acceptance criterion** per core feature
- **Identify the target codebase or greenfield starting point**, dependencies, and risks
- **Identify governing instructions** — `.github/copilot-instructions.md`, any matching
  `**/*.instructions.md`, and relevant guidelines or ADRs via
  `jsdotnet-guidelines-mcpserver`
- **Confirm the derived scope with the user** before any code is written; do not proceed
  to Stage 1 without that confirmation

Escalate instead of continuing when the product direction itself is the open question, or
when the MVP needs a new architectural decision or a documented target architecture before
implementation — recommend `orch-blueprint`, `orch-architecture`, or `orch-adr` and ask
the user. Product-definition work at that level belongs there, not here.

**Agents:** none required (orchestrator). Optionally `product-owner:product-owner` for
feature framing and acceptance criteria; `architecture:architect` when the target
architecture needs shaping.

### Stage 1: MVP Scope Intake
- **Review the MVP scope confirmed in Stage 0** and its acceptance criteria
- **Confirm feature priorities** and delivery order
- **Identify dependencies** and risks
- **Confirm the validation target** for the implementation run

**Agents:** `product-owner:product-owner`, `architecture:architect`

### Stage 2: Implementation Planning
- **Break the confirmed MVP into implementation slices**
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

With an approved MVP scope:

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

Ad-hoc product idea — Stage 0 derives the rest:

```
Orchestrate MVP creation for:
- Project: "Something that lets our users build and export their own reports"
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

- Call `start_run` with `skillId: "orch-create-mvp"` and these stages: Scope Discovery,
  MVP Scope Intake, Implementation Planning, Implementation, Build & Test, QA Validation,
  Personal Validation, Create Pull Request, Summary.
- During **Scope Discovery**, present the restated product outcome, derived core feature
  list with priority order, and derived acceptance criteria as the stage output so the
  user can confirm or correct them.
- During **MVP Scope Intake**, also open/update `markdown-canvas`
  (`markdown-preview`) with the confirmed MVP scope, and during **Implementation Planning**,
  open/update `markdown-canvas` with the architecture documentation and `diagram-canvas`
  (`mermaid-diagram`) with any accompanying Mermaid diagrams, per
  `instructions/canvas-usage.instructions.md`. Optional; skip gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-create-mvp/SKILL.md`
