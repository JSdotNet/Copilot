---
name: orch-create-service
description: 'Orchestrate creating a new service in an existing project using GitHub Copilot App canvas — from an ad-hoc "we need a service for X" request or an approved service specification through service design, implementation, project wiring, testing, local run, and monitoring. Use for new services and for extracting an existing area into its own service; missing specification, responsibilities, or architecture context is derived in Stage 0 rather than being a reason to skip orchestration.'
---

# Orchestrate Create Service in Existing Project

Execute a complete workflow for adding a new service to an existing project, with local run and monitoring as the final readiness gate.

> **Scope:** This skill covers service work whether or not a prior specification or
> architecture orchestration ran. When an approved service specification, responsibilities,
> and architecture context exist, Stage 0 is a short intake and Stage 1 proceeds as usual.
> When they do not — an ad-hoc request or an extraction from existing code — Stage 0
> derives them with the user. Missing inputs are a reason to run Stage 0, never a reason
> to skip this skill and implement inline.

## Input Expectations

**Required:**

- Target project name and repository.
- Service name, or a one-line description of what the service should do.

**Derived in Stage 0 when absent:**

- Approved service specification or architecture notes.
- Service responsibilities and ownership boundaries.
- API or messaging contracts for the new service.
- Upstream and downstream dependencies.
- Acceptance criteria and operational expectations.
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

Run this stage first, always. It is a quick confirmation when an approved service
specification already exists, and a full derivation when it does not.

- **Restate the service's responsibility** in one or two sentences, in the user's terms
- **Derive its ownership boundaries** — what this service owns and what stays with
  existing services
- **Derive its API or messaging contracts** at signature level
- **Derive at least one measurable acceptance criterion** and the operational
  expectations (health, latency, failure behavior)
- **Identify upstream and downstream dependencies** and the integration points they touch
- **Identify governing instructions** — `.github/copilot-instructions.md`, any matching
  `**/*.instructions.md`, and relevant guidelines or ADRs via
  `jsdotnet-guidelines-mcpserver`
- **Confirm the derived scope with the user** before any code is written; do not proceed
  to Stage 1 without that confirmation

Escalate instead of continuing when the work is really a module inside an existing
service, or when the service boundary itself is an open architectural question — recommend
`orch-create-module`, `orch-adr`, `orch-architecture`, or `orch-blueprint` and ask the
user.

**Agents:** none required (orchestrator). Optionally `product-owner:product-owner` for
acceptance criteria wording; `architecture:architect` when the service boundary needs
review.

### Stage 1: Specification Intake
- **Review the service responsibility and boundaries confirmed in Stage 0**
- **Confirm API or messaging contracts** for the new service
- **Identify upstream/downstream dependencies**
- **Set acceptance criteria** and operational expectations

**Agents:** `product-owner:product-owner`, `architecture:architect`

### Stage 2: Implementation Planning
- **Map the confirmed design** to the repository structure
- **Plan service discovery and references** for the host project
- **Define configuration model** (env vars, secrets, defaults)
- **Define health checks and observability signals**

**Agents:** `architecture:architect`

### Stage 3: Implementation
- **Create the new service project** in the existing solution/repository
- **Implement service endpoints/workers** and core logic
- **Wire service into host orchestration** (for example AppHost/service catalog)
- **Configure dependencies** (database, queue, cache) as needed

**Agents:** `csharp-coding:coding`

### Final Phases (Shared)

After Service Implementation & Wiring, this skill runs the shared delivery phases defined
once in `instructions/orch-shared-phases.instructions.md` (code-modifying tier), in order:

1. **Build & Test** — build, unit tests, and E2E tests, run first.
2. **QA Validation** — new service functionality, so run the full automatic QA validation
   (Playwright checks on health endpoints and critical service flows plus `qa:qa-monitor`
   runtime monitoring, with evidence recorded).
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

With an approved service specification:

```
Orchestrate new service creation for:
- Project: "Orders.Platform" (existing)
- New service: "NotificationService"
- Responsibilities: Email and webhook notifications
- Integrations: AppHost, message broker, audit logging
- Runtime target: Local run + monitoring
```

Ad-hoc request — Stage 0 derives the rest:

```
Orchestrate new service creation for:
- Project: "Orders.Platform"
- New service: "Something that sends the order emails, out of the order API"
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

- Call `start_run` with `skillId: "orch-create-service"` and these stages: Scope Discovery,
  Specification Intake, Implementation Planning, Implementation, Build & Test, QA
  Validation, Personal Validation, Create Pull Request, Documentation Update, Summary.
- During **Scope Discovery**, present the restated responsibility, derived boundaries and
  contracts, and derived acceptance criteria as the stage output so the user can confirm
  or correct them.
- During **Specification Intake**, also open/update `markdown-canvas`
  (`markdown-preview`) with the confirmed service contract, and during
  **Implementation Planning**, open/update `markdown-canvas` with the design
  documentation and `diagram-canvas` (`mermaid-diagram`) with any accompanying Mermaid
  diagrams, per `instructions/canvas-usage.instructions.md`. Optional; skip gracefully if
  not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract.

## Skills Used

- `aspire` (optional) when wiring service resources into AppHost

## Reference

Source skill location: `plugins/copilot-app/skills/orch-create-service/SKILL.md`
