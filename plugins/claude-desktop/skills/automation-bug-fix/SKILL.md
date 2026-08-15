---
name: automation-bug-fix
description: >
  Pick up all open GitHub issues labelled 'bug', let the user confirm the selection,
  then start one worktree-isolated agent per issue using the orch-bug orchestration skill.
  Use when: triaging the bug backlog, starting parallel bug-fix sessions, or running
  a scheduled bug sweep to keep the backlog moving.
---

# Automation: Bug Fix

## Purpose

Fetch every open GitHub issue labelled `bug`, deduplicate against already-active
agents, let the user confirm the selection, then start one worktree agent per
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

- **`orch-bug`** (`plugins/claude-desktop`) — drives the full bug-resolution workflow:
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

### Phase 2 — Deduplicate Against Active Work

4. Check for work already in flight on the fetched issue numbers: run
   `git --no-pager worktree list` and `git branch --all` and match branch names carrying
   the issue number. Mark any issue that already has one as **skipped**.

5. Show the deduplication result:

   | # | Title | Work Exists | Action |
   |---|-------|-------------|--------|
   | #42 | `Login fails with special chars` | No | Will start |
   | #37 | `NPE on empty cart` | Yes — worktree `fix/37-empty-cart` | Skipped |

### Phase 3 — User Confirmation

6. Ask the user to confirm which issues to start agents for:
   - "All of the above" (up to the configured maximum).
   - A specific subset by issue number.

   Do not proceed until the user confirms.

7. If the total exceeds the configured maximum of **3**, warn the user and ask them
   to reduce the selection or raise the limit.

### Phase 4 — Start Agents

8. For each confirmed issue (sequentially, one at a time):

   a. Launch an `Agent` with `isolation: "worktree"` and `run_in_background: true` so each
      issue is fixed in its own checkout.
   b. Set the agent's description to: `#<number> — <issue title>` (truncated to 40 chars).
   c. Determine severity from issue labels: `critical` → critical, `high` → high,
      `medium` → medium, `low` → low. Fall back to the configured severity hint.
   d. Give it this kickoff prompt (fed to `orch-bug`):

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

   | Issue | Title | Severity | Assigned | Label | Agent | Status |
   |-------|-------|----------|----------|-------|---------|--------|
   | #42 | `Login fails with special chars` | High | `@me` | `in-progress` | `#42 — Login fails…` | `orch-bug` — waiting for plan approval |
   | #37 | `NPE on empty cart` | — | — | — | — | Skipped (work exists) |

10. Remind the user that each agent is plan-first — review and approve the
    `orch-bug` plan in each one before it begins implementation.

## Dashboard Interface

This skill reports progress through the `orch-dashboard` MCP server
(`plugins/claude-desktop/mcp/orch-dashboard/`). If the server is not configured, skip the
dashboard calls below and continue through standard chat interaction. Follow the shared
**Dashboard Reporting Contract** in `instructions/orch-shared-phases.instructions.md`
for the tool cadence.

- Open the dashboard per the shared contract, then call `start_run` with
  `skillId: "automation-bug-fix"` and these stages: Fetch Open Bug Issues,
  Deduplicate Against Active Work, User Confirmation, Start Agents,
  Summary.
- Before each phase, call `update_stage` with `status: "in_progress"`.
- After each phase, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary of that phase's result.
- Call `finish_run` with the final status and a summary once every confirmed
  session has been created.

See `plugins/claude-desktop/mcp/orch-dashboard/README.md` for the full dashboard tool
contract.

## Output

- One worktree-isolated agent per confirmed bug issue, driven by `orch-bug`.
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
