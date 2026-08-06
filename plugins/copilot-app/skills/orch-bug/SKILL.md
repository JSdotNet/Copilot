---
name: orch-bug
description: 'Orchestrate bug resolution workflow from triage through local run and monitoring using GitHub Copilot App canvas. Manages bug lifecycle including reproduction, root cause analysis, TDD fix implementation (test first), verification, and local runtime validation.'
---

# Orchestrate Bug Resolution

Execute a complete bug fix workflow from identification through local runtime validation using test-driven development (TDD) approach.

> **Precondition:** This skill assumes the bug report, reproduction context, and affected
> architecture area are already known well enough to implement a fix. Use it to analyze and
> fix the bug, not to create the initial product specification.

## Input Expectations

- Bug description and reproduction steps.
- Existing incident notes, issue details, or other approved bug context.
- Severity level (critical, high, medium, low).
- Affected versions or environments.
- Root cause hypothesis (if known).
- Fix type (hotfix or standard).
- Runtime validation target (e.g., local run + monitoring).

## Workflow Stages

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and every transition needs explicit user approval.
>
> Model choice per stage follows `instructions/orch-model-selection.instructions.md`
> (category defaults, overridable via `.github/copilot-model-selection.md` in the
> consuming repo).

### Stage 1: Bug Intake & Reproduction
- **Reproduce the bug** following provided steps
- **Determine severity** and impact assessment
- **Identify affected versions** and users
- **Create detailed bug report** with logs/traces
- **Assign priority** (critical, high, medium, low)

**Agents:** `product-owner:product-owner`

### Stage 2: Root Cause Analysis
- **Debug issue** using logs and diagnostics
- **Identify root cause** in codebase
- **Check for related bugs** (similar patterns)
- **Document findings** for the fix
- **Create minimal reproduction case**

**Agents:** `csharp-coding:coding`

### Stage 3: Implementation
- **Create failing test first** that reproduces the bug
- **Write test case** that fails with current code
- **Implement minimal fix** addressing root cause
- **Make test pass** with the fix
- **Add regression tests** to prevent recurrence
- **Refactor** if needed for code quality
- **Verify fix** doesn't break other functionality

**Agents:** `csharp-coding:coding` (switch to coding agent for TDD implementation)

### Final Phases (Shared)

After Fix Implementation, this skill runs the shared delivery phases defined once in
`instructions/orch-shared-phases.instructions.md` (code-modifying tier), in order:

1. **Build & Test** — build, unit tests (including the new regression test), and E2E
   tests, run first.
2. **QA Validation** — bug fix, so run targeted QA validation: `qa:qa` re-runs the
   original reproduction steps plus the regression scenario with `qa:qa-monitor` runtime
   monitoring, and records pass/fail plus findings. Capture evidence only when requested
   or when a failure needs supporting artifacts.
3. **Personal Validation** — hand back to the user (no agent); present the code review and
   the recorded QA review, and start the application for the user to review.
4. **Create Pull Request** — only after explicit user approval.
5. **Summary** — emit the run summary.

See `instructions/orch-shared-phases.instructions.md` for the full phase definitions;
update that file to change these phases for every orchestration.

## Severity Levels & Response Times

| Severity | Description | Response | Local Validation |
|----------|-------------|----------|------------------|
| Critical | System down, data loss, security | Immediate | Immediate local verification |
| High | Major feature broken, significant impact | 2-4 hours | Same day local run + monitoring |
| Medium | Feature degraded, workaround exists | 1-2 days | Local verification in current sprint |
| Low | Minor issue, cosmetic, edge case | 1 week | Local verification in normal cycle |

## Usage Pattern

```
Orchestrate bug fix for:
- Bug: "Login fails with special characters in password"
- Severity: High (affects 5% of users)
- Affected versions: 2.1.0, 2.1.1
- Root cause: Insufficient input sanitization
- Fix type: Hotfix
- Runtime target: Local run + monitoring
```

## Critical Bug Fast-Track Process

```
1. Fix: Minimal changes, test thoroughly
2. PR: Immediate review (no waiting)
3. Validate: Reproduction test + regression suite
4. Run locally: Verify startup and impacted flows
5. Monitor: Logs/health until stability confirmed
```

## Output Expectations

- Root cause documented.
- Failing test created that reproduces the bug.
- Minimal fix implemented; test passes.
- Regression tests added.
- No side effects in existing functionality.
- Local runtime findings recorded (logs, traces, and optional evidence when needed).
- Validation result recorded with pass/fail status.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension. Follow the
shared **Dashboard Reporting Contract** in
`instructions/orch-shared-phases.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence, the QA Validation
`scenarios`/`monitoring` passthrough, and the Personal Validation → Create Pull Request
gating. If the extension is not installed, skip the canvas calls and continue through
standard chat interaction.

- Call `start_run` with `skillId: "orch-bug"` and these stages: Bug Intake &
  Reproduction, Root Cause Analysis, Implementation, Build & Test, QA Validation,
  Personal Validation, Create Pull Request, Summary.
- During **Bug Intake & Reproduction**, also open/update `markdown-canvas` (`markdown-preview`)
  with the drafted bug report content, per `instructions/canvas-usage.instructions.md`.
  Optional; skip gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-bug/SKILL.md`
