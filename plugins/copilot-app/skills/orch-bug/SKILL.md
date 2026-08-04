---
name: orch-bug
description: 'Orchestrate bug resolution workflow from triage through local run and monitoring using GitHub Copilot App canvas. Manages bug lifecycle including reproduction, root cause analysis, TDD fix implementation (test first), verification, and local runtime validation.'
---

# Orchestrate Bug Resolution

Execute a complete bug fix workflow from identification through local runtime validation using test-driven development (TDD) approach.

## Input Expectations

- Bug description and reproduction steps.
- Severity level (critical, high, medium, low).
- Affected versions or environments.
- Root cause hypothesis (if known).
- Fix type (hotfix or standard).
- Runtime validation target (e.g., local run + monitoring).

## Workflow Stages

> **Cross-plugin agents are recommended, not required.** When a referenced plugin is
> not installed, skip the stage or perform it manually and continue with remaining
> stages. All agent transitions require explicit user approval before switching.

### Stage 1: Bug Triage & Analysis
- **Reproduce the bug** following provided steps
- **Determine severity** and impact assessment
- **Identify affected versions** and users
- **Create detailed bug report** with logs/traces
- **Assign priority** (critical, high, medium, low)

**Agents:** `product-owner:product-owner`, `development:developer`, `review:reviewer`

### Stage 2: Root Cause Analysis
- **Debug issue** using logs and diagnostics
- **Identify root cause** in codebase
- **Check for related bugs** (similar patterns)
- **Document findings** for the fix
- **Create minimal reproduction case**

**Agents:** `csharp-coding:coding`, `development:developer`

### Stage 3: Fix Implementation (TDD Approach)
- **Create failing test first** that reproduces the bug
- **Write test case** that fails with current code
- **Implement minimal fix** addressing root cause
- **Make test pass** with the fix
- **Add regression tests** to prevent recurrence
- **Refactor** if needed for code quality
- **Verify fix** doesn't break other functionality

**Agents:** `csharp-coding:coding` (switch to coding agent for TDD implementation)

### Stage 4: Testing & Verification
- **Run unit tests** including new regression test
- **Perform integration testing** on affected features
- **Test edge cases** and boundary conditions
- **Verify fix** in reproduction environment
- **Check for side effects**

**Agents:** `development:testing`, `csharp-coding:coding`

### Stage 5: Code Review & Security
- **Submit PR for urgent review** (critical bugs)
- **Address review feedback** immediately
- **Run security scanning** for vulnerability checks
- **Verify all automated checks** pass
- **Approve for immediate merge** (critical) or normal review

**Agents:** `review:reviewer`, `csharp-coding:coding`

### Stage 6: Local Run & Monitoring
- **Run fixed build locally** in reproduction-like conditions
- **Execute local smoke tests** for impacted flows
- **Monitor logs and health metrics** for regression signals
- **Capture runtime evidence** (logs, screenshots, traces)
- **Confirm issue closure criteria** before handoff

**Agents:** `csharp-coding:coding`, `development:developer`

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
1. Branch: hotfix/bug-id
2. Fix: Minimal changes, test thoroughly
3. PR: Immediate review (no waiting)
4. Validate: Reproduction test + regression suite
5. Run locally: Verify startup and impacted flows
6. Monitor: Logs/health until stability confirmed
```

## Output Expectations

- Root cause documented.
- Failing test created that reproduces the bug.
- Minimal fix implemented; test passes.
- Regression tests added.
- No side effects in existing functionality.
- Local runtime evidence captured (logs, traces).
- Validation result recorded with pass/fail status.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). If the extension is not
installed, skip the canvas calls below and continue through standard chat
interaction.

- Open canvas `orch-dashboard`, then call `start_run` with
  `skillId: "orch-bug"` and these stages: Bug Triage & Analysis, Root Cause
  Analysis, Fix Implementation (TDD Approach), Testing & Verification, Code
  Review & Security, Local Run & Monitoring.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. severity, root
  cause, red/green/refactor result, or monitoring evidence.
- Call `finish_run` with the final status and a summary once the fix is
  verified locally.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-bug/SKILL.md`
