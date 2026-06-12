---
name: scan-code
description: >
  Scan local code files with Aikido for SAST vulnerabilities and hardcoded secrets.
  Use when: finishing a feature, reviewing a file for security, scanning before a commit,
  or running a targeted scan on a specific path or file type.
---

# Scan Code with Aikido

## Purpose

Run Aikido security scans on local workspace files and report all findings with severity,
location, and remediation guidance. Use as a security gate before merging or before
finalizing security-sensitive code changes.

## Inputs

- Target path(s): file, directory, or workspace root (default: workspace root).
- Scan mode: `full` (SAST + secrets, default), `sast` (code only), `secrets` (credentials only).
- Minimum severity to report: `critical`, `high`, `medium`, `low`, `all` (default: `all`).

## Workflow

### Phase 1 — Choose Scan Scope

1. Determine the target path from the user's request or default to the workspace root.
2. Choose the scan tool based on the requested mode:
   - `full` → `aikido_full_scan`
   - `sast` → `aikido_sast_scan`
   - `secrets` → `aikido_secrets_scan`

> If the Aikido MCP server is not available, stop and tell the user to configure it
> using the setup instructions in `agents/aikido.agent.md` before proceeding.

### Phase 2 — Run Scan

3. Call the selected Aikido MCP tool with the target path.
4. Collect all findings from the scan result.

### Phase 3 — Report Findings

5. Filter findings by the minimum severity threshold.
6. Group findings by severity in this order: **Critical → High → Medium → Low → Info**.
7. For each finding, report:

| Field | Value |
|---|---|
| **Severity** | Critical / High / Medium / Low / Info |
| **Type** | sast / leaked_secret / iac / … |
| **File** | `<file path>` |
| **Line** | `<line number>` |
| **Rule** | `<rule or vulnerability name>` |
| **Description** | Short description of the issue |
| **Remediation** | Recommended fix |

8. If no findings are reported, confirm the scan completed cleanly.

### Phase 4 — Next Steps

9. Present a summary:

```
Scan complete.
Target: <path>
Mode: <full | sast | secrets>
Findings: <N critical, N high, N medium, N low>
```

10. Suggest next actions:
    - **Fix now** — invoke `fix-security-issue` for each critical or high finding.
    - **Defer** — note finding as known risk and continue.
    - **Sync to GitHub** — invoke `aikido-issues-to-github` to create tracked issues.

## Output

- Grouped, severity-ordered list of findings with file, line, rule, and remediation.
- Summary count per severity level.
- Suggested next actions.

## Notes

- `aikido_full_scan` covers both SAST and secrets in a single pass. Prefer it as the default.
- Use `aikido_sast_scan` or `aikido_secrets_scan` during tight fix-iteration loops for speed.
- Always run at minimum `aikido_full_scan` before finalizing changes to: authentication,
  authorization, data validation, cryptography, secrets handling, or dependency configurations.
- A clean scan result does not replace a full code review — it covers known vulnerability patterns.
