---
name: orch-aspire-update
description: 'Orchestrate .NET Aspire upgrades with a plan-first workflow in GitHub Copilot App canvas. Creates and refines an upgrade plan, performs staged updates, enables new Aspire features, and validates runtime behavior with recorded results.'
---

# Orchestrate Aspire Update

Execute a complete Aspire update workflow using canvas interface, starting with a plan, refining it, then implementing and adopting new features safely.

## Workflow Stages

### Stage 1: Baseline & Plan Creation
- **Inventory current Aspire stack** (packages, SDK constraints, AppHost integrations)
- **Capture baseline behavior** (build, tests, runtime health)
- **Create initial update plan** with scope, sequencing, and rollback strategy
- **Define success criteria** for upgrade completion and feature adoption

**Agents:** `development:development-plan`, `csharp-coding:coding`

### Stage 2: Plan Refinement
- **Review release notes and breaking changes** for target Aspire versions
- **Refine plan** with risk controls, migration notes, and dependency ordering
- **Split work into execution batches** (low-risk first, high-risk last)
- **Finalize feature-adoption plan** for new Aspire capabilities to enable

**Agents:** `architecture:architect`, `review:reviewer`, `development:development-plan`

### Stage 3: Staged Aspire Upgrade
- **Create upgrade branch** and apply package updates in batches
- **Upgrade AppHost integrations** and related service references
- **Resolve breaking changes** in configuration and wiring
- **Keep changes incremental** and reversible per batch

**Agents:** `csharp-coding:coding`, `development:developer`  
**Skills Used:** `aspire`, `nuget-manager`

### Stage 4: New Feature Adoption
- **Enable selected Aspire features** from the refined plan
- **Adopt feature configuration** in AppHost and service projects
- **Add or update telemetry/health setup** when required by new features
- **Record enabled features** and expected operational impact in canvas notes

**Agents:** `csharp-coding:coding`, `architecture:architect`  
**Skills Used:** `aspire`, `open-telemetry`

### Stage 5: Validation & Recording
- **Compile and test** the full solution after upgrade and feature adoption
- **Start updated AppHost** and verify dashboard/service health
- **Run smoke and integration checks** on critical paths
- **Record validation evidence** (logs, health results, screenshots)
- **Publish upgrade validation report** with pass/fail per validation target

**Agents:** `csharp-coding:coding`, `development:testing`, `review:reviewer`

## Usage Pattern

```
Orchestrate Aspire update for:
- Repository: "Orders.Platform"
- Current Aspire: 9.x
- Target Aspire: 9.latest
- New features to adopt: improved telemetry defaults, updated service discovery configuration
- Constraints: preserve local developer workflow stability
- Output: refined upgrade plan + validation recording report
```

## Definition of Done Checklist

- [ ] Baseline inventory completed
- [ ] Initial update plan created
- [ ] Plan refined with risks and batch sequencing
- [ ] Aspire packages and integrations upgraded
- [ ] Selected new Aspire features enabled
- [ ] Build and tests pass after upgrade
- [ ] Runtime health validated on updated AppHost
- [ ] Validation evidence recorded and report published

## Canvas Interface

This skill opens an **Aspire update canvas** in GitHub Copilot App showing:

- **Plan board** (initial plan and refined plan side-by-side)
- **Upgrade batch tracker** with progress and blockers
- **Feature adoption checklist** for newly enabled Aspire capabilities
- **Validation dashboard** for build/test/runtime status
- **Recording panel** for logs, screenshots, and final verdict
- **Integration buttons** to switch to `csharp-coding:coding` agent for implementation

## Integration Points

- **Development Plugin**: Planning and staged execution coordination
- **csharp-coding Plugin**: Coding agent for upgrade and migration implementation
- **Architecture Plugin**: Breaking-change and design impact review
- **Review Plugin**: Validation and risk-focused review
- **GitHub Copilot App**: Canvas-based orchestration and evidence tracking

## Reference

Source skill location: `plugins/copilot-app/skills/orch-aspire-update/SKILL.md`
