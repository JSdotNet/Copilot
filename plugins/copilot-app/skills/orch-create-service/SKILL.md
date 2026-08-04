---
name: orch-create-service
description: 'Orchestrate creating a new service in an existing project using GitHub Copilot App canvas. Coordinates service design, implementation, project wiring, testing, local run, and monitoring.'
---

# Orchestrate Create Service in Existing Project

Execute a complete workflow for adding a new service to an existing project, with local run and monitoring as the final readiness gate.

## Input Expectations

- Target project name and repository.
- New service name and responsibilities.
- API or messaging contracts for the new service.
- Upstream and downstream dependencies.
- Runtime validation target (e.g., local run + monitoring).

## Workflow Stages

> **Cross-plugin agents are recommended, not required.** When a referenced plugin is
> not installed, skip the stage or perform it manually and continue with remaining
> stages. All agent transitions require explicit user approval before switching.

### Stage 1: Service Scope & Requirements
- **Define service responsibility** and ownership boundaries
- **Capture API or messaging contracts** for the new service
- **Identify upstream/downstream dependencies**
- **Set acceptance criteria** and operational expectations

**Agents:** `product-owner:product-owner`, `development:development-plan`

### Stage 2: Service Architecture & Integration Design
- **Design service project structure** aligned with existing architecture
- **Plan service discovery and references** for the host project
- **Define configuration model** (env vars, secrets, defaults)
- **Define health checks and observability signals**

**Agents:** `architecture:architect`, `development:developer`

### Stage 3: Service Implementation & Wiring
- **Create the new service project** in the existing solution/repository
- **Implement service endpoints/workers** and core logic
- **Wire service into host orchestration** (for example AppHost/service catalog)
- **Configure dependencies** (database, queue, cache) as needed

**Agents:** `csharp-coding:coding`, `development:developer`

### Stage 4: Testing & Validation Prep
- **Create unit tests** for service logic
- **Add integration tests** for service interactions
- **Verify startup configuration** and dependency connectivity
- **Fix defects** before runtime validation

**Agents:** `csharp-coding:coding`, `development:testing`, `review:reviewer`

### Stage 5: Local Run & Monitoring
- **Start host and new service locally** (`qa:qa` agent's `aspire-run` skill)
- **Validate health endpoints and critical service flows with Playwright** — `qa:qa` drives smoke checks across integration points, capturing screenshot/video evidence
- **Monitor logs and runtime behavior** for stability — `qa:qa-monitor` continuously watches Aspire logs/traces/metrics:
  - Inside the GitHub Copilot App, run `qa-monitor` in a parallel child session (`create_session` + cross-session messaging) so monitoring is concurrent with Playwright validation.
  - Otherwise, use the `qa` plugin's `delegate-to-qa-monitor` skill for a same-session handoff.
- **Record readiness status** and follow-up actions, merging Playwright evidence with monitoring findings

**Agents:** `qa:qa`, `qa:qa-monitor` (recommended); falls back to `csharp-coding:coding`, `development:developer`, `review:reviewer` running validation manually when the `qa` plugin isn't installed

## Usage Pattern

```
Orchestrate new service creation for:
- Project: "Orders.Platform" (existing)
- New service: "NotificationService"
- Responsibilities: Email and webhook notifications
- Integrations: AppHost, message broker, audit logging
- Runtime target: Local run + monitoring
```

## Output Expectations

- Service project created and wired into host orchestration.
- Service endpoints or workers implemented with core logic.
- Unit and integration tests passing.
- Health endpoints validated and critical flows tested.
- Logs and runtime behavior monitored for stability.
- Readiness status recorded with follow-up actions.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). If the extension is not
installed, skip the canvas calls below and continue through standard chat
interaction.

- Open canvas `orch-dashboard`, then call `start_run` with
  `skillId: "orch-create-service"` and these stages: Service Scope &
  Requirements, Service Architecture & Integration Design, Service
  Implementation & Wiring, Testing & Validation Prep, Local Run &
  Monitoring.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. service contract,
  wiring notes, or health-check results.
- For the **Local Run & Monitoring** stage, also pass `scenarios` (each
  health-check/integration flow with `status: "pass"|"fail"|"flaky"` and
  Playwright evidence paths) and `monitoring` (the Aspire log/trace
  findings) so the dashboard renders QA results with evidence inline.
- Call `finish_run` with the final status and a summary once the service
  runs locally and passes its checks.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.

## Skills Used

- `aspire` (optional) when wiring service resources into AppHost

## Reference

Source skill location: `plugins/copilot-app/skills/orch-create-service/SKILL.md`
