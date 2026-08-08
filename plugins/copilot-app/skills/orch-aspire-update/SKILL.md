---
name: orch-aspire-update
description: 'Orchestrate .NET Aspire upgrades with a plan-first workflow in GitHub Copilot App canvas. Creates and refines an upgrade plan, performs staged updates, enables new Aspire features, and validates runtime behavior with recorded results.'
---

# Orchestrate Aspire Update

Execute a complete Aspire update workflow using canvas interface, starting with a plan, refining it, then implementing and adopting new features safely.

> **Precondition:** This skill assumes the target upgrade scope, success criteria, and
> architecture/runtime constraints are already agreed. Use it to execute that approved
> upgrade path.

## Input Expectations

- Repository or project name.
- Approved upgrade scope or maintenance directive.
- Current Aspire version.
- Target Aspire version.
- New Aspire features to adopt (if any).
- Constraints (e.g., preserve local developer workflow stability).

## Workflow Stages

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and every transition needs explicit user approval.
>
> Model choice per stage follows `instructions/orch-model-selection.instructions.md`
> (category defaults, overridable via `.github/copilot-model-selection.md` in the
> consuming repo).

### Stage 1: Upgrade Intake & Baseline
- **Inventory current Aspire stack** (packages, SDK constraints, AppHost integrations)
- **Capture baseline behavior** (build, tests, runtime health)
- **Confirm the approved upgrade scope** and rollback boundaries
- **Define success criteria** for upgrade completion and feature adoption

**Agents:** `csharp-coding:coding`

### Stage 2: Plan Refinement
- **Review release notes and breaking changes** for target Aspire versions
- **Refine plan** with risk controls, migration notes, and dependency ordering
- **Split work into execution batches** (low-risk first, high-risk last)
- **Finalize feature-adoption plan** for new Aspire capabilities to enable

**Agents:** `architecture:architect`

### Stage 3: Implementation
- **Apply package updates in batches**
- **Upgrade AppHost integrations** and related service references
- **Resolve breaking changes** in configuration and wiring
- **Keep changes incremental** and reversible per batch

**Agents:** `csharp-coding:coding`  
**Skills Used:** `aspire`, `nuget-manager`

### Stage 4: New Feature Adoption
- **Enable selected Aspire features** from the refined plan
- **Adopt feature configuration** in AppHost and service projects
- **Add or update telemetry/health setup** when required by new features
- **Record enabled features** and expected operational impact in canvas notes

**Agents:** `csharp-coding:coding`, `architecture:architect`  
**Skills Used:** `aspire`, `open-telemetry`

### Final Phases (Shared)

After New Feature Adoption, this skill runs the shared delivery phases defined once in
`instructions/orch-shared-phases.instructions.md` (code-modifying tier), in order:

1. **Build & Test** — build, unit tests, and E2E tests, run first (post-upgrade
   compilation and regression checks).
2. **QA Validation** — framework upgrade, so run QA validation focused on startup health
   plus Playwright smoke checks on the critical paths affected by the upgrade and adopted
   features, with `qa:qa-monitor` runtime monitoring. Capture evidence only for adopted
   new functionality or when failure analysis needs it.
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
- [ ] Validation findings recorded and report published; attach capture only for adopted new functionality or when needed for failures

## Output Expectations

- Baseline inventory documented.
- Update plan created and refined with risk controls.
- Aspire packages and integrations upgraded.
- Selected new features enabled and configured.
- Build and tests pass after upgrade.
- Runtime health validated on updated AppHost.
- Validation findings recorded and report published, with capture attached only when applicable.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension. Follow the
shared **Dashboard Reporting Contract** in
`instructions/orch-shared-phases.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence, the QA Validation
`scenarios`/`monitoring` passthrough, and the Personal Validation → Create Pull Request
gating. If the extension is not installed, skip the canvas calls and continue through
standard chat interaction.

- Call `start_run` with `skillId: "orch-aspire-update"` and these stages: Upgrade Intake &
  Baseline, Plan Refinement, Implementation, New Feature Adoption, Build & Test, QA
  Validation, Personal Validation, Create Pull Request, Documentation Update, Summary.
- During **Plan Refinement**, also open/update `markdown-canvas` (`markdown-preview`) with
  the refined upgrade plan, per `instructions/canvas-usage.instructions.md`. Optional; skip
  gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-aspire-update/SKILL.md`
