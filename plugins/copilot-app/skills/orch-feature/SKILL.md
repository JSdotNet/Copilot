---
name: orch-feature
description: 'Orchestrate feature work end to end using GitHub Copilot App canvas — from an ad-hoc request or an approved specification through implementation, validation, review, and personal approval. Use for new features, incremental changes to existing features, and small UI tweaks; missing scope, acceptance criteria, or architecture context is derived in Stage 0 rather than being a reason to skip orchestration.'
---

# Orchestrate Feature Development

Execute a feature implementation workflow — from an ad-hoc request or approved
requirements and architecture — through local validation using canvas interface.

> **Scope:** This skill covers feature work whether or not a prior specification or
> architecture orchestration ran. When an approved specification, acceptance criteria,
> and architecture notes exist, Stage 0 is a short intake and Stage 1 proceeds as usual.
> When they do not — an ad-hoc request, an incremental change, or a small UI tweak —
> Stage 0 derives them with the user. Missing inputs are a reason to run Stage 0, never
> a reason to skip this skill and implement inline.

## Input Expectations

**Required:**

- Feature name, or a one-line description of the desired behavior.

**Derived in Stage 0 when absent:**

- Acceptance criteria (at least one measurable criterion).
- Impacted code paths and architecture constraints for the affected area.
- Approved feature specification or story context.
- Parent epic or project context.
- Target milestone or sprint.
- Runtime validation target (e.g., local run + monitoring).

## Workflow Stages

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and every transition needs explicit user approval.
>
> Model choice per stage follows `instructions/orch-model-selection.instructions.md`
> (category defaults, overridable via personal global model selection or
> `.github/copilot-model-selection.md` in the consuming repo).

### Stage 0: Scope Discovery

Run this stage first, always. It is a quick confirmation when approved inputs already
exist, and a full derivation when they do not.

- **Restate the requested behavior** in one or two sentences, in the user's terms
- **Derive at least one measurable acceptance criterion** that makes the change
  verifiable; add more only where the request is genuinely multi-part
- **Identify the impacted code paths** and the integration points they touch
- **Identify governing instructions** — `.github/copilot-instructions.md`, any matching
  `**/*.instructions.md`, and relevant guidelines or ADRs via
  `jsdotnet-guidelines-mcpserver`
- **Confirm the derived scope with the user** before any code is written; do not proceed
  to Stage 1 without that confirmation

Escalate instead of continuing when the request needs a new architectural decision, a new
bounded context, or a cross-cutting redesign — recommend `orch-adr`, `orch-architecture`,
or `orch-blueprint` first and ask the user.

**Agents:** none required (orchestrator). Optionally `product-owner:product-owner` for
acceptance criteria wording; `architecture:architect` only when architectural impact is
suspected.

### Stage 1: Specification & Architecture Intake
- **Review the scope confirmed in Stage 0** and its acceptance criteria
- **Map the existing architecture guidance** to the impacted code paths
- **Confirm implementation constraints** and affected integration points
- **Define the local validation target** for the approved change

**Agents:** `product-owner:product-owner`, `architecture:architect`

### Stage 2: Implementation
- **Write code following standards** and patterns
- **Apply TDD** (test-driven development)
- **Maintain code coverage** targets
- **Document complex logic**

**Agents:** `csharp-coding:coding`

### Final Phases (Shared)

After Implementation, this skill runs the shared delivery phases defined once in
`instructions/orch-shared-phases.instructions.md` (code-modifying tier), in order:

1. **Build & Test** — build, unit tests, and E2E tests, run first.
2. **QA Validation** — new functionality, so run the full automatic QA validation
   (Playwright scenarios from the acceptance criteria plus `qa:qa-monitor` runtime
   monitoring, with evidence recorded).
3. **Personal Validation** — hand back to the user (no agent); present the code review and
   the recorded QA review, and start the application for the user to review.
4. **Create Pull Request** — only after explicit user approval.
5. **Documentation Update** — after the pull request exists, check whether the repository's
   governed documentation is now stale and, if so, update it and commit onto the PR branch;
   a clean no-op when nothing needs changing.
6. **GitHub Issue Update** — when the session was started from a GitHub issue, add a
   comment to that issue with the captured result and QA report; otherwise skip.
7. **Summary** — emit the run summary.

See `instructions/orch-shared-phases.instructions.md` for the full phase definitions;
update that file to change these phases for every orchestration.

## Usage Pattern

With an approved specification:

```
Orchestrate feature development for:
- Feature: "User Role-Based Access Control"
- Epic: "Security & Authorization"
- Acceptance criteria:
  * Admins can create/manage roles
  * Roles have fine-grained permissions
  * Audit log tracks role changes
- Target milestone: Next sprint
- Runtime target: Local run + monitoring
```

Ad-hoc request — Stage 0 derives the rest:

```
Orchestrate feature development for:
- Feature: "Extend the desktop app so sub-items can be dragged to reorder them"
```

## Definition of Done Checklist

- [ ] Scope restated and confirmed with the user
- [ ] At least one measurable acceptance criterion agreed
- [ ] Code complete and reviewed
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests passing
- [ ] Security scanning passed
- [ ] E2E test scenarios defined from acceptance criteria
- [ ] E2E validation executed successfully
- [ ] E2E run evidence captured (logs/screenshots)
- [ ] Validation result recorded and shared
- [ ] Personal validation approved by the user
- [ ] Pull request created after approval, with all checks passing

## Output Expectations

- Feature code complete and reviewed.
- Unit tests written with coverage above 80%.
- Integration and E2E tests passing.
- Security scanning passed.
- Validation evidence captured (logs, screenshots).
- Validation result recorded with pass/fail per scenario.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension. Follow the
shared **Dashboard Reporting Contract** in
`instructions/orch-shared-phases.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence, the QA Validation
`scenarios`/`monitoring` passthrough, and the Personal Validation → Create Pull Request
gating. If the extension is not installed, skip the canvas calls and continue through
standard chat interaction.

- Call `start_run` with `skillId: "orch-feature"` and these stages: Scope Discovery,
  Specification & Architecture Intake, Implementation, Build & Test, QA Validation,
  Personal Validation, Create Pull Request, Documentation Update, GitHub Issue Update, Summary.
- During **Scope Discovery**, present the restated behavior, derived acceptance criteria,
  and impacted code paths as the stage output so the user can confirm or correct them.
- During **Specification & Architecture Intake**, optionally open/update
  `markdown-canvas` (`markdown-preview`) or `diagram-canvas` (`mermaid-diagram`) with the
  provided specification or architecture artifacts, per
  `instructions/canvas-usage.instructions.md`.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-feature/SKILL.md`
