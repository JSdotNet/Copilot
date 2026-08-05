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

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and every transition needs explicit user approval.

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

### Final Phases (Shared)

After Service Implementation & Wiring, this skill runs the shared delivery phases defined
once in `instructions/orch-shared-phases.instructions.md` (code-modifying tier), in order:

1. **Build & Test** — build, unit tests, and E2E tests, run first.
2. **QA Validation** — functional service change, so run the full automatic QA validation
   (Playwright checks on health endpoints and critical service flows plus `qa:qa-monitor`
   runtime monitoring, with evidence recorded).
3. **Personal Validation** — hand back to the user (no agent); present the code review and
   the recorded QA review, and start the application for the user to review.
4. **Create Pull Request** — only after explicit user approval.
5. **Summary** — emit the run summary.

See `instructions/orch-shared-phases.instructions.md` for the full phase definitions;
update that file to change these phases for every orchestration.

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

This skill reports progress through the `orch-dashboard` canvas extension. Follow the
shared **Dashboard Reporting Contract** in
`instructions/orch-shared-phases.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence, the QA Validation
`scenarios`/`monitoring` passthrough, and the Personal Validation → Create Pull Request
gating. If the extension is not installed, skip the canvas calls and continue through
standard chat interaction.

- Call `start_run` with `skillId: "orch-create-service"` and these stages: Service Scope &
  Requirements, Service Architecture & Integration Design, Service Implementation &
  Wiring, Build & Test, QA Validation, Personal Validation, Create Pull Request, Summary.
- During **Service Scope & Requirements**, also open/update `markdown-canvas`
  (`markdown-preview`) with the drafted service contract, and during **Service
  Architecture & Integration Design**, open/update `markdown-canvas` with the design
  documentation and `diagram-canvas` (`mermaid-diagram`) with any accompanying Mermaid
  diagrams, per `instructions/canvas-usage.instructions.md`. Optional; skip gracefully if
  not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract.

## Skills Used

- `aspire` (optional) when wiring service resources into AppHost

## Reference

Source skill location: `plugins/copilot-app/skills/orch-create-service/SKILL.md`
