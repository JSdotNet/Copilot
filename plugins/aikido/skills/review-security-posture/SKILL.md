---
name: review-security-posture
description: >
  Retrieve and prioritize all open Aikido security findings across a repository or scope.
  Use when: assessing the overall security health of a project, planning a security sprint,
  preparing for a security review, or onboarding to a codebase's security state.
---

# Review Security Posture

## Purpose

Produce a prioritized, actionable security dashboard for a repository or scope by
querying all open findings from the Aikido feed. Group findings by severity and type,
highlight what needs immediate attention, and recommend a remediation order.

## Inputs

- Scope — one of:
  - `repo_name`: repository name as registered in Aikido (required if no other scope is set).
  - `cloud_name`, `vm_name`, `domain_name`, `container_name`: alternative scope filters.
- Issue types to include (optional): `sast`, `leaked_secret`, `iac`, `open_source`, `cloud`,
  `cloud_instance`, `docker_container`, `malware`, `eol`, `license`, `surface_monitoring`,
  `scm_security`, `ai_pentest` (default: all types).
- Minimum severity: `critical`, `high`, `medium`, `low` (default: `low` — show all).

## Workflow

### Phase 1 — Fetch All Issues

1. Confirm the scope from the user's request.
2. Call `aikido_issues_list` for the given scope. Use pagination to retrieve all results
   (repeat with `page` increment until fewer than `per_page` results are returned).
3. Collect all open findings into a working set.

### Phase 2 — Group and Prioritize

4. Group findings by severity: **Critical → High → Medium → Low**.
5. Within each severity group, sub-group by issue type:
   - Code-fixable: `sast`, `leaked_secret`, `iac`
   - Dependency / supply chain: `open_source`, `malware`
   - Infrastructure / cloud: `cloud`, `cloud_instance`, `docker_container`
   - Compliance / lifecycle: `eol`, `license`, `scm_security`
   - Runtime / monitoring: `surface_monitoring`, `ai_pentest`

### Phase 3 — Present Dashboard

6. Output a summary table:

```
Security Posture — <scope>
Date: <today>

| Severity | Total | Code-fixable | Triage-only |
|----------|-------|--------------|-------------|
| Critical | N     | N            | N           |
| High     | N     | N            | N           |
| Medium   | N     | N            | N           |
| Low      | N     | N            | N           |
| Total    | N     | N            | N           |
```

7. List the top findings (Critical and High) with details:

| # | Severity | Type | Title | File / Component | Remediation |
|---|----------|------|-------|------------------|-------------|
| 1 | Critical | sast | SQL injection | `src/api/users.cs:42` | Use parameterized queries |
| 2 | High | leaked_secret | AWS key in config | `appsettings.json:15` | Rotate and move to secret manager |

8. For Medium and Low findings, output a collapsed count grouped by type only.
   Full details are available on request.

### Phase 4 — Recommend Remediation Order

9. Propose a prioritized action plan:
   - **Immediate**: all Critical findings (code-fixable first).
   - **This sprint**: all High findings.
   - **Backlog**: Medium and Low findings.
   - **Triage-only**: list non-code issues with recommended owner (cloud team, ops, etc.).

10. Estimate rough effort:
    - Each `sast` or `leaked_secret` fix: ~30 min per finding.
    - Each `iac` fix: ~15 min per finding.
    - Dependency upgrade (`open_source`): depends on breaking changes.

### Phase 5 — Suggested Next Steps

11. Present options:
    - **Fix now** — invoke `fix-security-issue` for a specific finding.
    - **Sync to GitHub** — invoke `aikido-issues-to-github` to create tracked issues for all findings.
    - **Drill down** — re-run `aikido_issues_list` filtered to a specific type or severity.
    - **Export** — produce a Markdown report of all findings for offline review.

## Output

- Summary table with counts per severity and fixability.
- Detailed list of Critical and High findings.
- Prioritized action plan.
- Suggested next steps.

## Notes

- Re-run this skill after completing a fix sprint to measure progress.
- If `aikido_issues_list` returns no results for a repo, verify the repo name matches
  exactly as registered in Aikido (case-sensitive).
- Accepted-risk findings appear in the Aikido feed as suppressed; they will not show
  in this report unless the Aikido feed includes them.
