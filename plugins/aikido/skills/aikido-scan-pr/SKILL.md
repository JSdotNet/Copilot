---
name: aikido-scan-pr
description: >
  Scan a pull request with Aikido and surface findings that touch changed files.
  Use when: reviewing a PR for security issues before merging, checking AI-generated
  code changes, or enforcing a security gate on a feature branch.
---

# Scan Pull Request with Aikido

## Purpose

Run Aikido security scans on the current workspace, then filter and highlight findings
that are relevant to the files changed in a pull request. Produces a PR-level security
summary and optionally creates GitHub review annotations.

## Inputs

- Pull request number (required) or `current` to use the current branch's open PR.
- GitHub repository in `owner/repo` format (required).
- Scan mode: `full` (SAST + secrets, default), `sast` (code only), `secrets` (credentials only).
- Minimum severity to report: `critical`, `high`, `medium`, `all` (default: `high`).
- Create review comments: `true` stages inline PR review comments for critical and high findings
  (default: `false` — summary only).

## MCP Prerequisite

> If the Aikido MCP server (`aikido_full_scan`, `aikido_sast_scan`, or `aikido_secrets_scan`) is not available,
> stop immediately and tell the user to configure it using the setup instructions in `agents/aikido.agent.md`.

## Workflow

### Phase 1 — Get Changed Files

1. Fetch the list of files changed in the PR:
   ```bash
   gh pr diff <pr-number> --repo <owner/repo> --name-only
   ```
2. Store the changed file paths as the focus set for filtering scan results.

### Phase 2 — Run Aikido Scan

3. Choose the scan tool based on the requested mode:
   - `full` → `aikido_full_scan`
   - `sast` → `aikido_sast_scan`
   - `secrets` → `aikido_secrets_scan`
4. Call the selected Aikido MCP tool on the workspace root.

> **Note:** Aikido scans the full workspace. Changed-file filtering is applied in Phase 3 to
> focus the report. All workspace findings are still available on request.

### Phase 3 — Filter and Prioritize

5. Split findings into two groups:
   - **PR-relevant**: findings in files that appear in the changed file list.
   - **Pre-existing**: findings in unchanged files (reported as context only, not blocking).
6. Apply the minimum severity filter to the PR-relevant group.
7. Group PR-relevant findings by severity: **Critical → High → Medium → Low**.

### Phase 4 — Report

8. Output a PR security summary:

```
PR Security Scan — #<pr-number>
Branch: <branch-name>
Changed files: <N>
Scan mode: <full | sast | secrets>

PR-relevant findings:
  Critical: N
  High:     N
  Medium:   N
  Low:      N

Pre-existing workspace findings (not in this PR): N total
```

9. List all PR-relevant findings with details:

| Severity | Type | File | Line | Rule | Remediation |
|----------|------|------|------|------|-------------|
| Critical | sast | `src/api/users.cs` | 42 | SQL Injection | Use parameterized queries |
| High | leaked_secret | `appsettings.json` | 15 | AWS Access Key | Rotate and move to Key Vault |

10. For pre-existing findings, output a count only (not a full list) to avoid noise.

### Phase 5 — Actions

11. Present options:
    - **Fix now** — invoke `fix-security-issue` for each Critical or High PR-relevant finding.
    - **Create review comments** — stage inline PR comments for each PR-relevant finding
      (requires `create review comments: true` or explicit user approval).
    - **Sync to GitHub** — invoke `aikido-issues-to-github` to create tracked issues for pre-existing findings.
    - **Mark as accepted risk** — note the finding as known risk and continue.

12. If `create review comments` is enabled, stage one comment per PR-relevant finding:

**Comment format:**

```
🔒 **Aikido Security Finding**

**Severity:** Critical
**Type:** sast
**Rule:** SQL Injection
**Description:** <description>
**Remediation:** <remediation steps>
```

## Output

- PR security summary with counts by severity.
- Detailed list of PR-relevant findings.
- Pre-existing finding count for context.
- Optional inline PR review comments.

## Notes

- This skill scans the full workspace; changed-file filtering is post-processing.
  If a finding exists in an unchanged file, it is reported as pre-existing context,
  not as a PR blocker.
- Critical and High PR-relevant findings should block the PR until resolved or
  explicitly accepted by the team.
- Run this skill as part of every PR review that touches security-sensitive code.
- For automated enforcement, add an instruction to your `AGENTS.md`:
  ```
  Scan any new or modified code with `aikido_full_scan` before finalizing changes.
  This security check is required.
  ```
