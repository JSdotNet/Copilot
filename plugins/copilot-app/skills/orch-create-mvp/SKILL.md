---
name: orch-create-mvp
description: 'Orchestrate Minimum Viable Product (MVP) creation using GitHub Copilot App canvas. Coordinates rapid development of core features across planning, implementation, testing, local run, and monitoring stages with agent handoffs.'
---

# Orchestrate Create MVP

Execute a complete MVP development workflow from planning through local run and monitoring using coordinated agents and canvas interface.

## Input Expectations

- Project name and description.
- Core features list with priority order.
- Target timeline or sprint allocation.
- Runtime validation target (e.g., local or cloud run + monitoring).
- Optional constraints (team size, technology preferences).

## Workflow Stages

> **Cross-plugin agents are recommended, not required.** When a referenced plugin is
> not installed, skip the stage or perform it manually and continue with remaining
> stages. All agent transitions require explicit user approval before switching.

### Stage 1: MVP Definition & Planning
- **Define MVP scope** (core features, acceptance criteria)
- **Create user stories** for each feature
- **Estimate effort** and timeline
- **Identify dependencies** and risks

**Agents:** `product-owner:product-owner`, `development:development-plan`

### Stage 2: Architecture & Design
- **Design system architecture** for MVP scope
- **Document API contracts** and data models
- **Plan integration points** with external services
- **Define local runtime validation strategy**

**Agents:** `architecture:architect`, `development:developer`

### Stage 3: Implementation Sprint
- **Create feature branches** for parallel development
- **Implement core features** using TDD approach
- **Build API endpoints** and services
- **Integrate UI/Frontend** (if applicable)

**Agents:** `csharp-coding:coding`, `development:developer`

### Stage 4: Testing & Quality Assurance
- **Write unit tests** for all components
- **Perform integration testing** across services
- **Conduct code review** for quality gates
- **Security scanning** and vulnerability assessment

**Agents:** `development:testing`, `review:reviewer`, `csharp-coding:coding`

### Stage 5: Run & Monitoring
- **Start MVP locally or in cloud** and validate startup for all components (`qa:qa` agent's `aspire-run` skill)
- **Validate core user flows with Playwright** — `qa:qa` runs smoke tests on core user flows, capturing screenshot/video evidence
- **Monitor runtime logs and health checks** — `qa:qa-monitor` continuously watches Aspire logs/traces/metrics:
  - Inside the GitHub Copilot App, run `qa-monitor` in a parallel child session (`create_session` + cross-session messaging) so monitoring is concurrent with Playwright validation.
  - Otherwise, use the `qa` plugin's `delegate-to-qa-monitor` skill for a same-session handoff.
- **Record local or cloud readiness status** and unresolved blockers, merging Playwright evidence with monitoring findings

**Agents:** `qa:qa`, `qa:qa-monitor` (recommended); falls back to `csharp-coding:coding`, `development:developer`, `review:reviewer` running validation manually when the `qa` plugin isn't installed

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

This skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). If the extension is not
installed, skip the canvas calls below and continue through standard chat
interaction.

- Open canvas `orch-dashboard`, then call `start_run` with
  `skillId: "orch-create-mvp"` and these stages: MVP Definition & Planning,
  Architecture & Design, Implementation Sprint, Testing & Quality
  Assurance, Run & Monitoring.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. feature
  breakdown, design decisions, or test/run results.
- For the **Run & Monitoring** stage, also pass `scenarios` (each core
  user-flow check with `status: "pass"|"fail"|"flaky"` and Playwright
  evidence paths) and `monitoring` (the Aspire log/trace findings) so the
  dashboard renders QA results with evidence inline.
- Call `finish_run` with the final status and a summary once the MVP runs
  locally and passes its checks.
- During **MVP Definition & Planning**, also open/update `markdown-canvas`
  (`markdown-preview`) with the drafted user stories, and during
  **Architecture & Design**, open/update `markdown-canvas` with the architecture
  documentation and `diagram-canvas` (`mermaid-diagram`) with any accompanying
  Mermaid diagrams, per `instructions/canvas-usage.instructions.md`. Optional;
  skip gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-create-mvp/SKILL.md`
