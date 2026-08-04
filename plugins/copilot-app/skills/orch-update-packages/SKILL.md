---
name: orch-update-packages
description: 'Orchestrate dependency and package update workflows using GitHub Copilot App canvas. Coordinates safe updates of NuGet packages, npm modules, SDKs, and tools across projects with security scanning, compatibility testing, and local runtime monitoring.'
---

# Orchestrate Update Packages

Execute a complete package update workflow with validation, testing, and local runtime monitoring using canvas interface.

## Input Expectations

- Project name and location.
- Update scope (security, critical patches, minor, major).
- Testing strategy (core tests, full suite, extended).
- Runtime validation target (e.g., local run + monitoring).
- Notification preferences on completion.

## Workflow Stages

> **Cross-plugin agents are recommended, not required.** When a referenced plugin is
> not installed, skip the stage or perform it manually and continue with remaining
> stages. All agent transitions require explicit user approval before switching.

### Stage 1: Dependency Analysis
- **Scan all dependencies** for updates available
- **Check security vulnerabilities** (CVE, advisory warnings)
- **Identify breaking changes** in major versions
- **Review changelogs** and release notes

**Agents:** `csharp-coding:coding`, `development:developer`

### Stage 2: Update Planning
- **Categorize updates** (security, patch, minor, major)
- **Prioritize critical/security updates** first
- **Plan rollback strategy** for risky updates
- **Coordinate with stakeholders** for major version upgrades

**Agents:** `product-owner:product-owner`, `development:development-plan`

### Stage 3: Staged Updates
- **Create update branch** per update batch
- **Update packages** using appropriate package managers:
  - NuGet: `nuget-manager` skill
  - npm: Package manager commands
  - .NET SDK: `dotnet` CLI
- **Verify lockfiles** and dependency resolution

**Agents:** `csharp-coding:coding`, `development:developer`

### Stage 4: Compatibility Testing
- **Run full test suite** against updated dependencies
- **Check API compatibility** for breaking changes
- **Perform integration tests** across services
- **Validate build pipeline** with new versions

**Agents:** `development:testing`, `review:reviewer`

### Stage 5: Security Validation
- **Run SAST scanning** (Aikido, Snyk, etc.)
- **Check for security advisories** in updated packages
- **Review dependency tree** for transitive vulnerabilities
- **Document any exceptions** to security policy

**Agents:** `csharp-coding:coding`, `development:security`

### Stage 6: Code Review & Quality Gates
- **Review dependency changes** in PR
- **Check for deprecated API usage**
- **Validate performance metrics**
- **Approve for local runtime validation**

**Agents:** `review:reviewer`, `csharp-coding:coding`

### Stage 7: Local Run & Monitoring
- **Run the updated project locally** (`qa:qa` agent's `aspire-run` skill)
- **Validate with Playwright** — `qa:qa` runs smoke tests and key user scenarios, capturing screenshot/video evidence
- **Monitor application health** after updates — `qa:qa-monitor` continuously watches Aspire logs/traces/metrics:
  - Inside the GitHub Copilot App, run `qa-monitor` in a parallel child session (`create_session` + cross-session messaging) so monitoring is concurrent with Playwright validation.
  - Otherwise, use the `qa` plugin's `delegate-to-qa-monitor` skill for a same-session handoff.
- **Capture runtime observations** and blockers, merging Playwright evidence with monitoring findings

**Agents:** `qa:qa`, `qa:qa-monitor` (recommended); falls back to `development:developer`, `csharp-coding:coding` running validation manually when the `qa` plugin isn't installed

## Usage Pattern

```
Orchestrate package updates for:
- Project: "PaymentService"
- Update types: Security, critical patches
- Testing: Full integration test suite
- Runtime target: Local run + monitoring
- Notify: On completion with changelog summary
```

## Update Categories

| Category | Urgency | Testing | Local Validation |
|----------|---------|---------|------------------|
| Security patches | Critical | Full suite | Fast-track |
| Bug fix patches | High | Core tests | Standard |
| Minor versions | Medium | Full suite | Staged locally |
| Major versions | Low | Extended | Careful local review |

## Output Expectations

- Dependency scan completed with CVE severity levels.
- Updates categorized and prioritized.
- Packages updated with lockfiles verified.
- Full test suite passing after updates.
- Security scanning completed with no new vulnerabilities.
- Application runs locally with healthy status.
- Changelog summary generated.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). If the extension is not
installed, skip the canvas calls below and continue through standard chat
interaction.

- Open canvas `orch-dashboard`, then call `start_run` with
  `skillId: "orch-update-packages"` and these stages: Dependency Analysis,
  Update Planning, Staged Updates, Compatibility Testing, Security
  Validation, Code Review & Quality Gates, Local Run & Monitoring.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. CVEs found, updated
  package versions, or test/validation results.
- For the **Local Run & Monitoring** stage, also pass `scenarios` (each
  smoke-test/user-scenario check with `status: "pass"|"fail"|"flaky"` and
  Playwright evidence paths) and `monitoring` (the Aspire log/trace
  findings) so the dashboard renders QA results with evidence inline.
- Call `finish_run` with the final status and a summary once updates are
  validated locally.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-update-packages/SKILL.md`
