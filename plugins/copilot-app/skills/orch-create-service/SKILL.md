---
name: orch-create-service
description: 'Orchestrate creating a new service in an existing project using GitHub Copilot App canvas. Coordinates service design, implementation, project wiring, testing, local run, and monitoring.'
---

# Orchestrate Create Service in Existing Project

Execute a complete workflow for adding a new service to an existing project, with local run and monitoring as the final readiness gate.

## Workflow Stages

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
- **Start host and new service locally**
- **Validate health endpoints** and critical service flows
- **Run smoke checks** across integration points
- **Monitor logs and runtime behavior** for stability
- **Record readiness status** and follow-up actions

**Agents:** `csharp-coding:coding`, `development:developer`, `review:reviewer`

## Usage Pattern

```
Orchestrate new service creation for:
- Project: "Orders.Platform" (existing)
- New service: "NotificationService"
- Responsibilities: Email and webhook notifications
- Integrations: AppHost, message broker, audit logging
- Runtime target: Local run + monitoring
```

## Canvas Interface

This skill opens a **service creation canvas** in GitHub Copilot App showing:

- **Service scope panel** with contracts and responsibilities
- **Integration map** for dependencies and service references
- **Implementation tracker** for project, wiring, and configuration
- **Testing dashboard** for unit and integration readiness
- **Local run and monitoring panel** for startup, health, and logs
- **Integration buttons** to switch to `csharp-coding:coding` agent

## Integration Points

- **Product Owner Plugin**: Service requirements and acceptance criteria
- **Development Plugin**: Execution planning and integration support
- **Architecture Plugin**: Service design and boundary decisions
- **csharp-coding Plugin**: Service implementation and testing
- **Review Plugin**: Quality and risk checks
- **GitHub Copilot App**: Canvas-based orchestration and status tracking

## Skills Used

- `aspire` (optional) when wiring service resources into AppHost

## Reference

Source skill location: `plugins/copilot-app/skills/orch-create-service/SKILL.md`
