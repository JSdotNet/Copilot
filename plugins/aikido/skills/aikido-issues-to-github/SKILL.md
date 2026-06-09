---
name: aikido-issues-to-github
description: >
  Create GitHub issues from open Aikido security findings.
  Use when: triaging Aikido findings, translating security issues to tracked work,
  syncing Aikido findings to GitHub, bulk issue creation from Aikido feed.
---

# Aikido Issues to GitHub

## Purpose

Fetch open security findings from the Aikido feed and create one GitHub issue per
new finding, enriched with severity, type, remediation steps, and a stable Aikido
issue ID fingerprint to prevent duplicates on re-runs.

## Inputs

- Aikido scope — one of: `repo_name`, `cloud_name`, `vm_name`, `domain_name`, `container_name` (required).
- Minimum severity to include: `critical`, `high`, `medium`, `low` (default: `high`).
- Issue types to include (optional): defaults to all types.
- GitHub repository in `owner/repo` format (required).
- Labels to apply (default: `security`, `aikido`; severity label such as `severity:critical` is added automatically).
- Assignee GitHub username (optional).
- Dry-run mode: `true` previews what would be created without creating issues (default: `false`).

## Workflow

### Phase 1 — Fetch Aikido Findings

1. Call `aikido_issues_list` for the given scope and filters.
   Use pagination to retrieve all matching findings.
2. List all findings with: title, type, severity, affected file or component.

### Phase 2 — Deduplicate Against Open GitHub Issues

3. For each finding, search existing open GitHub issues for the Aikido issue ID fingerprint:
   ```bash
   gh issue list --repo <owner/repo> --state open --search "aikido-id:<aikido-issue-id>" --json number,title
   ```
4. Mark findings that already have a matching open issue as **skipped**.
5. Present the full list — to-create and skipped — and ask for confirmation before proceeding.
   In dry-run mode, stop here with the preview.

### Phase 3 — Create GitHub Issues

6. For each finding not already tracked, create a GitHub issue using this structure:

**Title:** `[Security] <Finding Title> (<Severity>)`

**Body:**

```markdown
## Aikido Security Finding

| Field | Value |
|-------|-------|
| **Aikido ID** | `aikido-id:<aikido-issue-id>` |
| **Type** | `<sast | leaked_secret | iac | open_source | …>` |
| **Severity** | `<Critical | High | Medium | Low>` |
| **Scope** | `<repo/cloud/container name>` |
| **Affected** | `<file path and line, or component name>` |

## Description

<finding description from Aikido>

## Remediation

<remediation steps from Aikido>

## References

- [View in Aikido](https://app.aikido.dev)
```

7. Apply labels: `security`, `aikido`, and severity label (e.g., `severity:critical`).
8. Apply optional assignee.
9. Record the created issue number against the Aikido issue ID.

### Phase 4 — Summary

10. Output a summary table:

| Finding | Type | Severity | Action | Issue |
|---------|------|----------|--------|-------|
| `SQL injection in users.cs` | sast | Critical | Created | #42 |
| `Hardcoded AWS key` | leaked_secret | High | Skipped (existing #38) | #38 |

## Output

- One GitHub issue per new Aikido finding above the severity threshold.
- Summary table with action taken for each finding.
- No duplicate issues created (deduplication by `aikido-id:<id>` fingerprint).

## Notes

- The `aikido-id:<id>` fingerprint in the issue body is the deduplication key.
  Do not edit or remove it from issue bodies.
- Accepted-risk and suppressed findings in Aikido will not appear in the feed
  and will not be synced.
- For Jira integration, replace the GitHub issue creation step with a Jira ticket
  using the Jira skill, keeping the same field mapping.
- Run this skill after each security sprint to sync newly discovered findings.
- Label `severity:critical` and `severity:high` issues automatically so they appear
  in priority filters.
