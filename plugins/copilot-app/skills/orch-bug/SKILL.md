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
- **Run fixed build locally** in reproduction-like conditions (`qa:qa` agent's `aspire-run` skill)
- **Validate the fix with Playwright** — `qa:qa` re-runs the original reproduction steps plus the new regression scenario, capturing screenshot/video evidence
- **Monitor logs and health metrics** for regression signals — `qa:qa-monitor` continuously watches Aspire logs/traces/metrics for the duration of validation:
  - Inside the GitHub Copilot App, run `qa-monitor` in a parallel child session (`create_session` + cross-session messaging) so monitoring is concurrent with Playwright validation.
  - Otherwise, use the `qa` plugin's `delegate-to-qa-monitor` skill for a same-session handoff.
- **Capture runtime evidence** (logs, screenshots, traces) and merge Playwright evidence with monitoring findings
- **Confirm issue closure criteria** before handoff

**Agents:** `qa:qa`, `qa:qa-monitor` (recommended); falls back to `csharp-coding:coding`, `development:developer` running validation manually when the `qa` plugin isn't installed

## Severity Levels & Response Times

| Severity | Description | Response | Local Validation |
|----------|-------------|----------|------------------|
| Critical | System down, data loss, security | Immediate | Immediate local verification |
| High | Major feature broken, significant impact | 2-4 hours | Same day local run + monitoring |
| Medium | Feature degraded, workaround exists | 1-2 days | Local verification in current sprint |
| Low | Minor issue, cosmetic, edge case | 1 week | Local verification in normal cycle |

### Stage 7: Personal Validation
- **Present the completed work** and its evidence to the user for review
- **Confirm the outcome** against the skill's goals and acceptance criteria
- **Wait for explicit user approval** before any pull request is created

**Agents:** `review:reviewer`

### Stage 8: Create Pull Request
- **Create the pull request only after explicit user approval** in Personal Validation — never before
- **Write the PR description** from the change set and validation evidence
- **Apply any PR-time improvements** (final polish, labels, changelog) as part of this stage
- **Skip this stage** (mark it `skipped`) when the run produces no change set to submit
- **Prefer the `JSdotNet` account** for GitHub CLI/API operations per repository policy

**Agents:** `review:reviewer`
**Skills Used:** `pr-jsdotnet`

### Stage 9: Summary
- **Summarize the delivered outcome** and the created pull request (if any)
- **Emit the run summary** once the pull request is created, or the run concludes without one

**Agents:** `review:reviewer`

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
  Review & Security, Local Run & Monitoring, Personal Validation, Create Pull Request, Summary.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. severity, root
  cause, red/green/refactor result, or monitoring evidence.
- For the **Local Run & Monitoring** stage, also pass `scenarios` (the
  original reproduction steps plus the regression scenario, each with
  `status: "pass"|"fail"|"flaky"` and Playwright evidence paths) and
  `monitoring` (the Aspire log/trace findings) so the dashboard renders QA
  results with evidence inline.
- Keep **Personal Validation** and **Create Pull Request** as separate stages:
  gate **Create Pull Request** on explicit user approval recorded in **Personal
  Validation** (mark it `skipped` when there is no change set to submit), and
  record all PR-time changes under the **Create Pull Request** stage output —
  never create the pull request before personal validation.
- Mark the **Summary** stage `in_progress` then `done`, and call `finish_run`
  with the final status and summary once the pull request is created (or the run
  concludes without one).
- During **Bug Triage & Analysis**, also open/update `markdown-canvas`
  (`markdown-preview`) with the drafted bug report content, per
  `instructions/canvas-usage.instructions.md`. Optional; skip gracefully if not
  installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-bug/SKILL.md`
