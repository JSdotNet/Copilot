---
name: automation-bug-fix
description: >
  Pick up all open GitHub issues labelled 'bug', let the user confirm the selection, claim
  each one, then hand back a ready-to-run orch-bug invocation per issue for the user to
  launch as its own session. Use when: triaging the bug backlog, preparing parallel
  bug-fix work, or running a scheduled bug sweep to keep the backlog moving.
---

# Automation: Bug Fix

## Purpose

Fetch every open GitHub issue labelled `bug`, deduplicate against already-active work, let
the user confirm the selection, claim each confirmed issue, and hand back one ready-to-run
`orch-bug` invocation per issue.

This skill **dispatches; it does not orchestrate.** It deliberately does not spawn an agent
per issue. `orch-bug` runs through the `orchestrator` agent, which must own its own session
to hold the Personal Validation gate, write dashboard state, and ask the user a question — a
backgrounded orchestrator can do none of the three. See **Session Ownership** and
**Sub-Agent Constraints** in `instructions/orch-shared-phases.instructions.md`. The user
launches each handoff as its own session, where `orch-bug` behaves exactly as designed.

## Inputs

- GitHub repository in `owner/repo` format (required).
- Additional label filters to narrow the set — e.g. `critical`, `sprint-42` (optional;
  default: `bug` only).
- Maximum issues to claim and hand off in one run (default: `3`; prevents claiming the
  whole backlog at once).
- Severity hint for `orch-bug`: `critical`, `high`, `medium`, or `low`
  (optional; default: derived from issue labels when present, otherwise `medium`).
- Base branch each session should branch from (default: repository default branch).

> Issues are fetched regardless of current assignee. Once an issue is confirmed, it is
> assigned to `@me` and labelled `in-progress` so the handoff is not picked up twice.

## Skill Dependencies

This skill orchestrates the following installed skills:

- **`orch-bug`** (`plugins/claude-desktop`) — drives the full bug-resolution workflow:
  triage, root-cause analysis, TDD fix, testing, code review, and local-run monitoring.
  This skill does not invoke it — it prepares the invocation the user runs per issue.

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
   the issue number. Mark any issue that already has one as **skipped**. An issue already
   labelled `in-progress` counts as in flight — a previous run of this skill claimed it.

5. Show the deduplication result:

   | # | Title | Work Exists | Action |
   |---|-------|-------------|--------|
   | #42 | `Login fails with special chars` | No | Will start |
   | #37 | `NPE on empty cart` | Yes — worktree `fix/37-empty-cart` | Skipped |

### Phase 3 — User Confirmation

6. Ask the user to confirm which issues to prepare handoffs for:
   - "All of the above" (up to the configured maximum).
   - A specific subset by issue number.

   Do not proceed until the user confirms.

7. If the total exceeds the configured maximum of **3**, warn the user and ask them
   to reduce the selection or raise the limit.

### Phase 4 — Claim and Prepare Handoffs

8. For each confirmed issue (sequentially, one at a time):

   a. Determine severity from issue labels: `critical` → critical, `high` → high,
      `medium` → medium, `low` → low. Fall back to the configured severity hint.

   b. Claim the issue:

      ```bash
      # Assign to current user
      gh issue edit <number> --repo <owner/repo> --add-assignee "@me"

      # Mark as in progress
      gh issue edit <number> --repo <owner/repo> --add-label "in-progress"
      ```

      If the `in-progress` label does not yet exist in the repository, create it first:

      ```bash
      gh label create "in-progress" --repo <owner/repo> --color "0075ca"         --description "Issue is actively being worked on"
      ```

   c. Emit the ready-to-run handoff for that issue: the prompt the user pastes as the first
      message of a new session. Keep it verbatim and self-contained, so it works without
      this conversation.

   ```text
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
   Suggested branch: fix/<number>-<slug> from <base branch>

   Work through all orch-bug stages:
   1. Triage and reproduce the bug.
   2. Identify the root cause.
   3. Implement a TDD fix (failing test first, then minimal fix).
   4. Verify no regressions.
   5. Run locally and capture runtime evidence.

   Preserve the GitHub issue origin above and pass it as `githubIssue` to `start_run`, so
   the run reports its captured result and QA report back to the issue.
   ```

9. **Never launch an agent to run the handoff.** Emitting the block is where this skill's
   job ends. Spawning a background or worktree-isolated agent per issue would put the
   orchestrator in a position where it cannot gate, ask, or track — the reason this skill
   dispatches instead. If the user asks for the work to start now, hand them the first
   handoff and let them run it in this session or a new one.

### Phase 5 — Summary

10. Output a summary table:

    | Issue | Title | Severity | Assigned | Label | Handoff |
    |-------|-------|----------|----------|-------|---------|
    | #42 | `Login fails with special chars` | High | `@me` | `in-progress` | Ready to run |
    | #37 | `NPE on empty cart` | — | — | — | Skipped (work exists) |

11. Tell the user how to launch: open one new session per handoff — a new worktree session
    for each, so parallel fixes do not collide — and paste that issue's block as the first
    message. Each session then runs `orch-bug` as its own foreground orchestration, free to
    ask clarifying questions, hold Personal Validation, and report to the dashboard under
    its own run.

## Dashboard Interface

This skill reports progress through the `orch-dashboard` MCP server
(`plugins/claude-desktop/mcp/orch-dashboard/`). If the server is not configured, skip the
dashboard calls below and continue through standard chat interaction. Follow the shared
**Dashboard Reporting Contract** in `instructions/orch-shared-phases.instructions.md`
for the tool cadence.

- Open the dashboard per the shared contract, then call `start_run` with
  `skillId: "automation-bug-fix"` and these stages: Fetch Open Bug Issues,
  Deduplicate Against Active Work, User Confirmation, Claim and Prepare Handoffs,
  Summary.
- Before each phase, call `update_stage` with `status: "in_progress"`.
- After each phase, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary of that phase's result.
- Call `finish_run` with the final status and a summary once every confirmed issue is
  claimed and its handoff emitted. This run covers the dispatch only; each launched
  `orch-bug` session opens its own run.

See `plugins/claude-desktop/mcp/orch-dashboard/README.md` for the full dashboard tool
contract.

## Output

- One ready-to-run `orch-bug` invocation per confirmed bug issue, for the user to launch as
  its own session.
- Each confirmed issue assigned to `@me` and labelled `in-progress`.
- Summary table with issue, severity, assignment, label, and handoff status.
- No agents spawned, and no issue claimed twice.

## Notes

- Issues are fetched regardless of current assignee; assignment to `@me` happens when the
  handoff is prepared, not before.
- The `in-progress` label is created automatically if it does not exist.
- Issues are claimed sequentially to avoid `gh` rate limits.
- Hard default maximum is **3 issues per run** per repository. Raise it explicitly only when
  needed, so a sweep does not claim the whole backlog.
- Safe to run unattended or on a schedule: this skill only reads, claims, and reports. It
  never writes code, never runs a build, and never opens a pull request — those all happen
  in the sessions the user launches from its handoffs.
- If the `orch-bug` skill is not installed, the handoff still carries the full bug context;
  the session performs the stages manually without the structured orchestration wrapper.
- Severity is inferred from issue labels in this priority order:
  `critical` > `high` > `medium` > `low`. When no matching label is found the
  configured severity hint is used, defaulting to `medium`.
- For Jira bug tickets, replace Phase 1 with a Jira skill query using the same
  field mapping (key, summary, description, priority, fix-version).
