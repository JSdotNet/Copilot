---
name: orch-update-packages
description: 'Orchestrate dependency and package update workflows using GitHub Copilot App canvas. Coordinates safe updates of NuGet packages, npm modules, SDKs, and tools across projects with security scanning, compatibility testing, and local runtime monitoring.'
---

# Orchestrate Update Packages

Execute a complete package update workflow with validation, testing, and local runtime monitoring using canvas interface.

> **Scope:** This skill derives its own update scope. Stage 1 (Dependency Analysis) and
> Stage 2 (Update Planning) scan the dependency graph, classify what is available, and
> produce the categorized, prioritized update run — so a request as small as "update the
> packages" is in scope. When an approved maintenance directive or update scope already
> exists, those stages confirm and align to it instead of deriving from scratch.
>
> Escalate only when the request is really a maintenance *policy* decision — for example
> standing rules on major-version adoption or supported framework baselines. Recommend
> `orch-architecture` for the policy, or `orch-adr` to record it, and ask the user.

## Input Expectations

**Required:**

- Project name and location.

**Derived in Stages 1–2 when absent:**

- Approved update scope or maintenance directive.
- Update scope (security, critical patches, minor, major).
- Testing strategy (core tests, full suite, extended).
- Risk tolerance and rollback boundaries.
- Runtime validation target (e.g., local run + monitoring).
- Notification preferences on completion.

## Workflow Stages

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and every transition needs explicit user approval.
>
> Model choice per stage follows `instructions/orch-model-selection.instructions.md`
> (category defaults, overridable via `.github/copilot-model-selection.md` in the
> consuming repo).

### Stage 1: Dependency Analysis
- **Scan all dependencies** for updates available
- **Check security vulnerabilities** (CVE, advisory warnings)
- **Identify breaking changes** in major versions
- **Review changelogs** and release notes

**Agents:** `csharp-coding:coding`

### Stage 2: Update Planning
- **Categorize updates** (security, patch, minor, major)
- **Prioritize critical/security updates** first
- **Plan rollback strategy** for risky updates
- **Confirm the resulting update run with the user** — the categorized scope, the testing
  strategy, and anything deliberately deferred
- **Coordinate with stakeholders** for major version upgrades

**Agents:** `product-owner:product-owner`

### Stage 3: Implementation
- **Update packages** using appropriate package managers:
  - NuGet: `nuget-manager` skill
  - npm: Package manager commands
  - .NET SDK: `dotnet` CLI
- **Verify lockfiles** and dependency resolution

**Agents:** `csharp-coding:coding`

### Stage 4: Security Validation
- **Run SAST scanning** (Aikido, Snyk, etc.)
- **Check for security advisories** in updated packages
- **Review dependency tree** for transitive vulnerabilities
- **Document any exceptions** to security policy

**Agents:** `csharp-coding:coding`

### Final Phases (Shared)

After Security Validation, this skill runs the shared delivery phases defined once in
`instructions/orch-shared-phases.instructions.md` (code-modifying tier), in order:

1. **Build & Test** — build, unit tests, and E2E tests, run first (this covers the
   compatibility and build-pipeline checks for the updated dependencies).
2. **QA Validation** — dependency update with no functional change, so reduce QA to a
   startup-without-errors validation: start the app, confirm healthy dashboard/health
   endpoints, and confirm no new errors in the logs. Escalate to full Playwright
   validation only when an update introduces new user-facing behavior, and require capture
   only in that case.
3. **Personal Validation** — hand back to the user (no agent); present the code review and
   the recorded QA review, and start the application for the user to review.
4. **Create Pull Request** — only after explicit user approval.
5. **Summary** — emit the run summary.

See `instructions/orch-shared-phases.instructions.md` for the full phase definitions;
update that file to change these phases for every orchestration.

## Usage Pattern

With an agreed update scope:

```
Orchestrate package updates for:
- Project: "PaymentService"
- Update types: Security, critical patches
- Testing: Full integration test suite
- Runtime target: Local run + monitoring
- Notify: On completion with changelog summary
```

Ad-hoc request — Stages 1–2 derive the rest:

```
Orchestrate package updates for:
- Project: "PaymentService"
- "Update the packages"
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

This skill reports progress through the `orch-dashboard` canvas extension. Follow the
shared **Dashboard Reporting Contract** in
`instructions/orch-shared-phases.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence, the QA Validation
`scenarios`/`monitoring` passthrough, and the Personal Validation → Create Pull Request
gating. If the extension is not installed, skip the canvas calls and continue through
standard chat interaction.

- Call `start_run` with `skillId: "orch-update-packages"` and these stages: Dependency
  Analysis, Update Planning, Implementation, Security Validation, Build & Test, QA
  Validation, Personal Validation, Create Pull Request, Summary.
- During **Update Planning**, also open/update `markdown-canvas` (`markdown-preview`) with
  the drafted update/rollback plan, per `instructions/canvas-usage.instructions.md`.
  Optional; skip gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-update-packages/SKILL.md`
