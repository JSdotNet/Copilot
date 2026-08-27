---
name: automation-bug-fix
description: 'Pick up all open GitHub issues labelled ''bug'', let the user confirm the selection, then start one Copilot session per issue using the orch-bug orchestration skill.'
disable-model-invocation: true
---

# Automation: Bug Fix

## Purpose

Fetch every open GitHub issue labelled `bug`, deduplicate against already-active
sessions, let the user confirm the selection, then create one Copilot session per
confirmed issue. Each session starts with the `orch-bug` orchestration so it immediately
enters the full triage → root-cause → TDD-fix → review → local-run workflow.

## Inputs

- GitHub repository in `owner/repo` format (required).
- Additional label filters to narrow the set — e.g. `critical`, `sprint-42` (optional;
  default: `bug` only).
- Maximum sessions to start in one run (default: `3`; prevents accidental mass creation).
- Severity hint for `orch-bug`: `critical`, `high`, `medium`, or `low`
  (optional; default: derived from issue labels when present, otherwise `medium`).
- Base branch for new sessions (default: repository default branch).

> Issues are fetched regardless of current assignee. After a session is created,
> the issue is automatically assigned to `@me` and labelled `in-progress`.

## Skill Dependencies

This skill orchestrates the following installed skills:

- **`orch-bug`** (`plugins/copilot-app`) — drives the full bug-resolution workflow:
  triage, root-cause analysis, TDD fix, testing, code review, and local-run monitoring.
  Invoked as the kickoff orchestration for every session this skill creates.

## Workflow

### Phase 1 — Fetch Open Bug Issues

1. List all open issues labelled `bug` (plus any additional label filters):

   ```bash
   gh issue list --repo <owner/repo> --state open --label "bug" \
     --json number,title,body,labels,assignees,milestone,url
   ```

2. Present the full list to the user — include **all** unassigned and assigned issues:

   | # | Title | Labels | Assignees | Milestone |
   |---|-------|--------|-----------|-----------|
   | #42 | `Login fails with special chars` | `bug`, `high` | `@alice` | v2.1 |
   | #37 | `NPE on empty cart` | `bug` | — | — |

3. If no issues are found, report that and stop.

### Phase 2 — Deduplicate Against Active Sessions

4. Check for existing Copilot sessions linked to the fetched issue numbers using the
   app's session list. Mark any issue that already has an active session as **skipped**.

5. Show the deduplication result:

   | # | Title | Session Exists | Action |
   |---|-------|----------------|--------|
   | #42 | `Login fails with special chars` | No | Will create |
   | #37 | `NPE on empty cart` | Yes — `#37 — NPE on empty cart` | Skipped |

### Phase 3 — User Confirmation

6. Ask the user to confirm which issues to start sessions for:
   - "All of the above" (up to the configured maximum).
   - A specific subset by issue number.

   Do not proceed until the user confirms.

7. If the total exceeds the configured maximum of **3**, warn the user and ask them
   to reduce the selection or raise the limit.

### Phase 4 — Create Sessions

8. For each confirmed issue (sequentially, one at a time):

   a. Create a new Copilot session linked to the issue.
   b. Set the session name to: `#<number> — <issue title>` (truncated to 40 chars).
   c. Determine severity from issue labels: `critical` → critical, `high` → high,
      `medium` → medium, `low` → low. Fall back to the configured severity hint.
   d. Start the session with this kickoff prompt (fed to `orch-bug`):

   ```
   Use the orch-bug skill.

   Bug: "<issue title>"
   GitHub issue: #<number> in <owner/repo>
   URL: <issue url>

   Issue description:
   <issue body>

   Labels: <labels>
   Milestone: <milestone or "none">
   Severity: <derived severity>
   Fix type: <"hotfix" if labelled hotfix or critical, otherwise "standard">
   Runtime validation target: local run + monitoring

   Work through all orch-bug stages:
   1. Triage and reproduce the bug.
   2. Identify the root cause.
   3. Implement a TDD fix (failing test first, then minimal fix).
   4. Verify no regressions.
   5. Run locally and capture runtime evidence.

   Propose a plan first. Wait for user approval before writing any code.
   ```

   e. Immediately after the session is created, claim the issue:

      ```bash
      # Assign to current user
      gh issue edit <number> --repo <owner/repo> --add-assignee "@me"

      # Mark as in progress
      gh issue edit <number> --repo <owner/repo> --add-label "in-progress"
      ```

      If the `in-progress` label does not yet exist in the repository, create it first:

      ```bash
      gh label create "in-progress" --repo <owner/repo> --color "0075ca" \
        --description "Issue is actively being worked on"
      ```

   f. After each session is created, output the session name and ID so the user
      can navigate to it.

### Phase 5 — Summary

9. Output a summary table:

   | Issue | Title | Severity | Assigned | Label | Session | Status |
   |-------|-------|----------|----------|-------|---------|--------|
   | #42 | `Login fails with special chars` | High | `@me` | `in-progress` | `#42 — Login fails…` | `orch-bug` — waiting for plan approval |
   | #37 | `NPE on empty cart` | — | — | — | — | Skipped (session exists) |

10. Remind the user that each session is in plan mode — review and approve the
    `orch-bug` plan in each session before the agent begins implementation.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). If the extension is not
installed, skip the canvas calls below and continue through standard chat
interaction. Follow the shared **Dashboard Reporting Contract** in
`instructions/orch-shared-phases.instructions.md` to resolve the dashboard provider;
prefer `extensionId: "plugin:copilot-app:orch-dashboard"` when opening or inspecting the
canvas.

- Open the dashboard per the shared contract, then call `start_run` with
  `skillId: "automation-bug-fix"` and these stages: Fetch Open Bug Issues,
  Deduplicate Against Active Sessions, User Confirmation, Create Sessions,
  Summary.
- Before each phase, call `update_stage` with `status: "in_progress"`.
- After each phase, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary of that phase's result.
- Call `finish_run` with the final status and a summary once every confirmed
  session has been created.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.

## Output

- One Copilot session per confirmed bug issue, driven by `orch-bug`.
- Each confirmed issue assigned to `@me` and labelled `in-progress`.
- Summary table with issue, severity, assignment, label, session name, and status.
- No duplicate sessions created.

## Notes

- Issues are fetched regardless of current assignee; assignment to `@me` happens
  after session creation, not before.
- The `in-progress` label is created automatically if it does not exist.
- Sessions are created sequentially to avoid rate limits.
- Hard default maximum is **3 sessions per run** per repository. Raise it explicitly
  only when needed to avoid runaway session creation.
- If the `orch-bug` skill is not installed, the session still starts with the full
  bug context in the kickoff prompt; the agent will perform the stages manually
  without the structured orchestration wrapper.
- Severity is inferred from issue labels in this priority order:
  `critical` > `high` > `medium` > `low`. When no matching label is found the
  configured severity hint is used, defaulting to `medium`.
- For Jira bug tickets, replace Phase 1 with a Jira skill query using the same
  field mapping (key, summary, description, priority, fix-version).
