---
name: orch-feature
description: 'Orchestrate feature development from planning through local run and monitoring using GitHub Copilot App canvas. Manages the feature lifecycle across design, implementation, testing, review, and local validation with handoffs to csharp-coding for implementation.'
---

# Orchestrate Feature Development

Execute a complete feature development workflow from backlog to local validation using canvas interface.

## Input Expectations

- Feature name and description.
- Parent epic or project context.
- Acceptance criteria (at least one measurable criterion).
- Target milestone or sprint.
- Runtime validation target (e.g., local run + monitoring).

## Workflow Stages

> **Cross-plugin agents are recommended, not required.** When a referenced plugin is
> not installed, skip the stage or perform it manually and continue with remaining
> stages. All agent transitions require explicit user approval before switching.

### Stage 1: Feature Specification
- **Define feature requirements** and scope
- **Write user stories** with acceptance criteria
- **Identify stakeholders** and dependencies
- **Create design mockups** (if UI-focused)
- **Estimate effort** and assign points

**Agents:** `product-owner:product-owner`, `development:development-plan`

### Stage 2: Architecture & Design
- **Design data models** and API contracts
- **Document system changes** and impacts
- **Plan integration points**
- **Define local validation strategy**
- **Identify potential risks**

**Agents:** `architecture:architect`, `development:developer`

### Stage 3: Implementation
- **Create feature branch** with clear naming
- **Write code following standards** and patterns
- **Apply TDD** (test-driven development)
- **Maintain code coverage** targets
- **Document complex logic**

**Agents:** `csharp-coding:coding`, `development:developer`

### Stage 4: Testing & Validation
- **Run unit tests** for code coverage
- **Perform integration testing**
- **Execute user acceptance testing** (UAT)
- **Test edge cases** and error handling
- **Performance testing** if applicable

**Agents:** `development:testing`, `csharp-coding:coding`, `review:reviewer`

### Stage 5: Code Review & Quality
- **Conduct code review** of the change set (no pull request yet)
- **Address review feedback** and suggestions
- **Run security scanning** (SAST, dependency checks)
- **Verify all checks** pass (lint, build, tests)

**Agents:** `review:reviewer`, `csharp-coding:coding`

### Stage 6: E2E Validation & Result Recording
- **Prepare end-to-end test scenarios** from acceptance criteria
- **Run feature locally** and confirm startup stability (`qa:qa` agent's `aspire-run` skill)
- **Execute E2E scenarios with Playwright** — `qa:qa` drives the browser through each acceptance-criteria scenario, capturing screenshot/video evidence for every checkpoint and failure
- **Monitor runtime behavior** (logs, traces, metrics) continuously during validation — `qa:qa-monitor`:
  - Inside the GitHub Copilot App, run `qa-monitor` in a parallel child session (`create_session` + cross-session messaging) so monitoring is concurrent with Playwright validation.
  - Otherwise, use the `qa` plugin's `delegate-to-qa-monitor` skill for a same-session handoff.
- **Capture evidence** (Playwright screenshots/recordings, Aspire log/trace findings, and run metadata)
- **Record validation result** with pass/fail status per scenario
- **Publish validation summary** for local acceptance decision input

**Agents:** `qa:qa`, `qa:qa-monitor` (recommended); falls back to `development:testing`, `csharp-coding:coding`, `review:reviewer` running validation manually when the `qa` plugin isn't installed

### Stage 7: Personal Validation
- **Present the change set** and validation evidence to the user for review
- **Walk through acceptance criteria** and E2E results together
- **Wait for explicit user approval** before any pull request is created
- **Fold requested changes** back into earlier stages when needed

**Agents:** `review:reviewer`

### Stage 8: Create Pull Request
- **Create the pull request only after explicit user approval** in Personal Validation — never before
- **Write the PR description** from acceptance criteria, review outcome, and validation evidence
- **Apply any PR-time improvements** (final polish, changelog, labels) as part of this stage
- **Confirm all checks pass** on the pull request
- **Prefer the `JSdotNet` account** for GitHub CLI/API operations per repository policy

**Agents:** `csharp-coding:coding`, `review:reviewer`
**Skills Used:** `pr-jsdotnet`

### Stage 9: Summary
- **Summarize the delivered feature**, validation outcome, and the created pull request
- **Emit the run summary** once the pull request is created (or the run concludes without one)

**Agents:** `review:reviewer`

## Usage Pattern

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

## Definition of Done Checklist

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

This skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). If the extension is not
installed, skip the canvas calls below and continue through standard chat
interaction.

- Open canvas `orch-dashboard`, then call `start_run` with
  `skillId: "orch-feature"` and these stages: Feature Specification,
  Architecture & Design, Implementation, Testing & Validation, Code Review &
  Quality, E2E Validation & Result Recording, Personal Validation, Create Pull
  Request, Summary.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. acceptance criteria,
  coverage numbers, review outcome, or E2E pass/fail results.
- For the **E2E Validation & Result Recording** stage, also pass
  `scenarios` (one entry per tested scenario with `status: "pass"|"fail"|"flaky"`,
  `notes`, and Playwright screenshot/recording `evidence` paths) and
  `monitoring` (the Aspire log/trace summary and any Error/Critical/Warning
  findings) so the dashboard renders QA results with evidence inline.
- Keep **Personal Validation** and **Create Pull Request** as separate stages:
  gate **Create Pull Request** on explicit user approval recorded in **Personal
  Validation**, and record all PR-time changes under the **Create Pull Request**
  stage output — never create the pull request before personal validation.
- Mark the **Summary** stage `in_progress` then `done`, and call `finish_run`
  with the final status and summary once the pull request is created (or the run
  concludes without one).
- During **Feature Specification**, also open/update `markdown-canvas`
  (`markdown-preview`) with the drafted user stories, and during
  **Architecture & Design**, open/update `markdown-canvas` with the data
  model/API contract documentation and `diagram-canvas` (`mermaid-diagram`) with
  any accompanying Mermaid diagrams, per `instructions/canvas-usage.instructions.md`.
  Optional; skip gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-feature/SKILL.md`
