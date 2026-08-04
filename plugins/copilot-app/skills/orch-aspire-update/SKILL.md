---
name: orch-aspire-update
description: 'Orchestrate .NET Aspire upgrades with a plan-first workflow in GitHub Copilot App canvas. Creates and refines an upgrade plan, performs staged updates, enables new Aspire features, and validates runtime behavior with recorded results.'
---

# Orchestrate Aspire Update

Execute a complete Aspire update workflow using canvas interface, starting with a plan, refining it, then implementing and adopting new features safely.

## Input Expectations

- Repository or project name.
- Current Aspire version.
- Target Aspire version.
- New Aspire features to adopt (if any).
- Constraints (e.g., preserve local developer workflow stability).

## Workflow Stages

> **Cross-plugin agents are recommended, not required.** When a referenced plugin is
> not installed, skip the stage or perform it manually and continue with remaining
> stages. All agent transitions require explicit user approval before switching.

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
- **Start updated AppHost** and verify dashboard/service health — via `qa:qa` agent's `aspire-run` skill
- **Run smoke and integration checks on critical paths with Playwright** — `qa:qa` drives browser-based checks, capturing screenshot/video evidence
- **Monitor runtime logs, traces, and metrics continuously** — `qa:qa-monitor`:
  - Inside the GitHub Copilot App, run `qa-monitor` in a parallel child session (`create_session` + cross-session messaging) so monitoring is concurrent with Playwright validation.
  - Otherwise, use the `qa` plugin's `delegate-to-qa-monitor` skill for a same-session handoff.
- **Record validation evidence** (logs, health results, Playwright screenshots)
- **Publish upgrade validation report** with pass/fail per validation target

**Agents:** `qa:qa`, `qa:qa-monitor` (recommended); falls back to `csharp-coding:coding`, `development:testing`, `review:reviewer` running validation manually when the `qa` plugin isn't installed

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

## Output Expectations

- Baseline inventory documented.
- Update plan created and refined with risk controls.
- Aspire packages and integrations upgraded.
- Selected new features enabled and configured.
- Build and tests pass after upgrade.
- Runtime health validated on updated AppHost.
- Validation evidence recorded and report published.

## Canvas Interface (Planned)

> Canvas panels described below represent the target experience. No canvas extensions
> are implemented yet. The skill currently operates through standard chat interaction.

- Plan board (initial plan and refined plan side-by-side)
- Upgrade batch tracker with progress and blockers
- Feature adoption checklist for newly enabled Aspire capabilities
- Validation dashboard for build/test/runtime status
- Recording panel for logs, screenshots, and final verdict
- Integration buttons to switch to `csharp-coding:coding` agent (with approval)

## Reference

Source skill location: `plugins/copilot-app/skills/orch-aspire-update/SKILL.md`
