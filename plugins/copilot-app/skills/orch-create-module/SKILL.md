---
name: orch-create-module
description: 'Orchestrate creating a new module in an existing project using GitHub Copilot App canvas. Coordinates planning, implementation, testing, local run, and monitoring to integrate the module safely.'
---

# Orchestrate Create Module

Execute a complete workflow for adding a new module to an existing project using a local-first validation approach.

## Input Expectations

- Target project name and location.
- Module name and purpose.
- Public interfaces and expected consumers.
- Dependencies on existing modules or services.
- Runtime validation target (e.g., local run + monitoring).

## Workflow Stages

> **Cross-plugin agents are recommended, not required.** When a referenced plugin is
> not installed, skip the stage or perform it manually and continue with remaining
> stages. All agent transitions require explicit user approval before switching.

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
- **Run the project locally** with module enabled (`qa:qa` agent's `aspire-run` skill)
- **Validate module endpoints/flows with Playwright** — `qa:qa` drives smoke-test scenarios, capturing screenshot/video evidence
- **Monitor logs and health checks** for regressions — `qa:qa-monitor` continuously watches Aspire logs/traces/metrics:
  - Inside the GitHub Copilot App, run `qa-monitor` in a parallel child session (`create_session` + cross-session messaging) so monitoring is concurrent with Playwright validation.
  - Otherwise, use the `qa` plugin's `delegate-to-qa-monitor` skill for a same-session handoff.
- **Record validation evidence** and readiness status, merging Playwright evidence with monitoring findings

**Agents:** `qa:qa`, `qa:qa-monitor` (recommended); falls back to `csharp-coding:coding`, `development:developer`, `review:reviewer` running validation manually when the `qa` plugin isn't installed

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

This skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). If the extension is not
installed, skip the canvas calls below and continue through standard chat
interaction.

- Open canvas `orch-dashboard`, then call `start_run` with
  `skillId: "orch-create-module"` and these stages: Module Scope &
  Contract, Architecture & Design, Module Implementation, Testing & Quality
  Gates, Local Run & Monitoring.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. module contract,
  design notes, or test/run results.
- Call `finish_run` with the final status and a summary once the module
  runs locally and passes its checks.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-create-module/SKILL.md`
