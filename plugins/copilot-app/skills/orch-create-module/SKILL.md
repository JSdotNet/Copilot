---
name: orch-create-module
description: 'Orchestrate creating a new module in an existing project using GitHub Copilot App canvas — from an ad-hoc "we need a module for X" request or an approved module specification through planning, implementation, testing, local run, and monitoring. Use for new modules and for carving an existing area into a module; missing specification, boundaries, or architecture context is derived in Stage 0 rather than being a reason to skip orchestration.'
---

# Orchestrate Create Module

Execute a complete workflow for adding a new module to an existing project using a local-first validation approach.

> **Scope:** This skill covers module work whether or not a prior specification or
> architecture orchestration ran. When an approved module specification, boundaries, and
> architecture context exist, Stage 0 is a short intake and Stage 1 proceeds as usual.
> When they do not — an ad-hoc request or a small module carved out of existing code —
> Stage 0 derives them with the user. Missing inputs are a reason to run Stage 0, never a
> reason to skip this skill and implement inline.

## Input Expectations

**Required:**

- Target project name and location.
- Module name, or a one-line description of what the module should do.

**Derived in Stage 0 when absent:**

- Approved module specification or design notes.
- Module purpose and boundaries.
- Public interfaces and expected consumers.
- Dependencies on existing modules or services.
- Acceptance criteria (at least one measurable criterion).
- Runtime validation target (e.g., local run + monitoring).

## Workflow Stages

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and every transition needs explicit user approval.
>
> Model choice per stage follows `instructions/orch-model-selection.instructions.md`
> (category defaults, overridable via `.github/copilot-model-selection.md` in the
> consuming repo).

### Stage 0: Scope Discovery

Run this stage first, always. It is a quick confirmation when an approved module
specification already exists, and a full derivation when it does not.

- **Restate the module's purpose** in one or two sentences, in the user's terms
- **Derive the module boundaries** — what belongs inside it and what stays outside
- **Derive its public interfaces** and expected consumers
- **Derive at least one measurable acceptance criterion** that makes the module
  verifiable
- **Identify dependencies** on existing modules or services and the integration points
  they touch
- **Identify governing instructions** — `.github/copilot-instructions.md`, any matching
  `**/*.instructions.md`, and relevant guidelines or ADRs via
  `jsdotnet-guidelines-mcpserver`
- **Confirm the derived scope with the user** before any code is written; do not proceed
  to Stage 1 without that confirmation

Escalate instead of continuing when the module is really a separate deployable service,
or when it needs a new architectural decision, a new bounded context, or a cross-cutting
redesign — recommend `orch-create-service`, `orch-adr`, `orch-architecture`, or
`orch-blueprint` and ask the user.

**Agents:** none required (orchestrator). Optionally `product-owner:product-owner` for
acceptance criteria wording; `architecture:architect` only when architectural impact is
suspected.

### Stage 1: Specification Intake
- **Review the module purpose and boundaries confirmed in Stage 0**
- **Confirm public interfaces** and expected consumers
- **Capture acceptance criteria** and non-functional requirements
- **Identify dependencies** and integration risks

**Agents:** `product-owner:product-owner`, `architecture:architect`

### Stage 2: Implementation Planning
- **Map the confirmed design** to the existing project structure
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
5. **Summary** — emit the run summary.

See `instructions/orch-shared-phases.instructions.md` for the full phase definitions;
update that file to change these phases for every orchestration.

## Usage Pattern

With an approved module specification:

```
Orchestrate module creation for:
- Project: "Billing.Core"
- Module: "InvoiceRules"
- Purpose: Validate and score invoice policy rules
- Dependencies: Existing pricing and tax modules
- Runtime target: Local run + monitoring
```

Ad-hoc request — Stage 0 derives the rest:

```
Orchestrate module creation for:
- Project: "Billing.Core"
- Module: "Something to keep the invoice policy rules out of the pricing code"
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

- Call `start_run` with `skillId: "orch-create-module"` and these stages: Scope Discovery,
  Specification Intake, Implementation Planning, Implementation, Build & Test, QA
  Validation, Personal Validation, Create Pull Request, Summary.
- During **Scope Discovery**, present the restated module purpose, derived boundaries and
  public interfaces, and derived acceptance criteria as the stage output so the user can
  confirm or correct them.
- During **Specification Intake**, also open/update `markdown-canvas` (`markdown-preview`)
  with the confirmed acceptance criteria, and during **Implementation Planning**, open/update
  `markdown-canvas` with the module design documentation and `diagram-canvas`
  (`mermaid-diagram`) with any accompanying Mermaid diagrams, per
  `instructions/canvas-usage.instructions.md`. Optional; skip gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-create-module/SKILL.md`
