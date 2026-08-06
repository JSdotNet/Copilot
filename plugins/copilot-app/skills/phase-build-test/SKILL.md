---
name: phase-build-test
description: 'Shared Build & Test phase for code-modifying orch-* orchestrations. Builds all projects and runs the unit and end-to-end suites first, failing fast on any red result. Invoked in order by the orchestrator agent.'
---

# Phase: Build & Test

Reusable **Build & Test** phase shared by every code-modifying `orch-*` orchestration. The
`orchestrator` agent invokes this skill first — before QA Validation and Personal
Validation — so build and test behavior lives in one place instead of in each skill.

## When To Run

- Run for code-modifying orchestrations (`orch-feature`, `orch-bug`, `orch-create-module`,
  `orch-create-service`, `orch-create-mvp`, `orch-update-packages`, `orch-aspire-update`,
  `orch-project`).
- Always run this phase **first**, after the skill's own unique stages produce a change set.
- Documentation/config orchestrations skip this phase.

## Inputs

- The change set produced by the calling orchestration.
- Optional project-specific build/test entry points (solution, test projects, E2E runner).

## Steps

1. **Build all projects** and fail fast on any build error.
2. **Run the unit test suite** and require it to pass.
3. **Run the automated end-to-end (E2E) test suite** and require it to pass.
4. **Stop and fix on red** — do not hand control to QA Validation or Personal Validation
   while the build, unit, or E2E tests are failing.

## Outputs

- Build result (pass/fail) and the failing targets when red.
- Unit and E2E test results with pass/fail counts.
- A go/no-go signal for the next phase (QA Validation).

## Dashboard Reporting

- Report as the `Build & Test` stage via the shared **Dashboard Reporting Contract** in
  `instructions/orch-shared-phases.instructions.md` (`update_stage` `in_progress` → `done`
  or `blocked`).

## Agents

- `csharp-coding:coding` (recommended); performed manually when that plugin is not
  installed. Agent transitions require explicit user approval.

## Reference

Source skill location: `plugins/copilot-app/skills/phase-build-test/SKILL.md`.
Phase definition: `plugins/copilot-app/instructions/orch-shared-phases.instructions.md`.
