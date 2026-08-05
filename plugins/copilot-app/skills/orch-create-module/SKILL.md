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

### Stage 6: Personal Validation
- **Present the completed work** and its evidence to the user for review
- **Confirm the outcome** against the skill's goals and acceptance criteria
- **Wait for explicit user approval** before any pull request is created

**Agents:** `review:reviewer`

### Stage 7: Create Pull Request
- **Create the pull request only after explicit user approval** in Personal Validation — never before
- **Write the PR description** from the change set and validation evidence
- **Apply any PR-time improvements** (final polish, labels, changelog) as part of this stage
- **Skip this stage** (mark it `skipped`) when the run produces no change set to submit
- **Prefer the `JSdotNet` account** for GitHub CLI/API operations per repository policy

**Agents:** `review:reviewer`
**Skills Used:** `pr-jsdotnet`

### Stage 8: Summary
- **Summarize the delivered outcome** and the created pull request (if any)
- **Emit the run summary** once the pull request is created, or the run concludes without one

**Agents:** `review:reviewer`

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
  Gates, Local Run & Monitoring, Personal Validation, Create Pull Request, Summary.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. module contract,
  design notes, or test/run results.
- For the **Local Run & Monitoring** stage, also pass `scenarios` (each
  module endpoint/flow check with `status: "pass"|"fail"|"flaky"` and
  Playwright evidence paths) and `monitoring` (the Aspire log/trace
  findings) so the dashboard renders QA results with evidence inline.
- Keep **Personal Validation** and **Create Pull Request** as separate stages:
  gate **Create Pull Request** on explicit user approval recorded in **Personal
  Validation** (mark it `skipped` when there is no change set to submit), and
  record all PR-time changes under the **Create Pull Request** stage output —
  never create the pull request before personal validation.
- Mark the **Summary** stage `in_progress` then `done`, and call `finish_run`
  with the final status and summary once the pull request is created (or the run
  concludes without one).
- During **Module Scope & Contract**, also open/update `markdown-canvas`
  (`markdown-preview`) with the drafted acceptance criteria, and during
  **Architecture & Design**, open/update `markdown-canvas` with the module
  design documentation and `diagram-canvas` (`mermaid-diagram`) with any
  accompanying Mermaid diagrams, per `instructions/canvas-usage.instructions.md`.
  Optional; skip gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-create-module/SKILL.md`
