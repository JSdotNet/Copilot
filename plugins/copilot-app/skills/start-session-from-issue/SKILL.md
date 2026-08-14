---
name: start-session-from-issue
description: >
  Create a Copilot session per GitHub issue and start in plan mode.
  Use when: picking up GitHub issues for implementation, onboarding work from the backlog,
  starting parallel sessions per issue, converting issues to Copilot worktree sessions.
---

# Start Session from GitHub Issue

## Purpose

Fetch open GitHub issues matching a filter, let the user confirm the selection,
then create one Copilot session per issue in **plan mode** so the agent analyses
the issue and proposes a plan before writing any code.

## Inputs

- GitHub repository in `owner/repo` format (required).
- Issue filter — one or more of:
  - Label(s): e.g. `bug`, `feature`, `sprint-42`.
  - Milestone: milestone title or number.
  - Assignee: GitHub username (use `@me` for yourself).
  - State: `open` (default) or `all`.
- Maximum number of sessions to start in one run (default: `5`; prevents accidental mass creation).
- Base branch to branch new sessions from (default: repository default branch).

## Workflow

### Phase 1 — Fetch Matching Issues

1. List issues matching the filter:
   ```bash
   gh issue list --repo <owner/repo> --state open --label "<label>" --assignee "<user>" --milestone "<milestone>" --json number,title,body,labels,assignees,milestone
   ```
2. Present the list to the user with issue number, title, and labels.
3. Ask the user to confirm which issues to start sessions for:
   - "All of the above" (up to the maximum).
   - A specific subset by issue number.
4. Do not proceed until the user confirms the selection.

### Phase 2 — Create Sessions

5. For each confirmed issue (in order, one at a time):
   a. Create a new Copilot session linked to the issue.
   b. Set the session name to: `#<number> — <issue title>` (truncated to 40 characters).
   c. Start the session in **plan mode** with this kickoff prompt:

```
You are working on GitHub issue #<number>: "<issue title>".

GitHub issue origin:
Repository: <owner/repo>
Issue Number: <number>
Issue URL: <issue url>

Issue description:
<issue body>

Labels: <labels>
Milestone: <milestone if set>

Your task:
1. Read and understand the issue thoroughly.
2. Ask clarifying questions if the requirements are ambiguous.
3. Propose a detailed implementation plan before writing any code:
   - Files to create or modify.
   - Key design decisions.
   - Risks or assumptions.
4. Preserve the GitHub issue origin metadata for any subsequent `orch-*` orchestration so
   it can report the captured result and QA report back to the issue.
5. Wait for user approval of the plan before proceeding to implementation.

Do not start coding until the plan is approved.
```

6. After each session is created, output the session name and a link or ID so the
   user can navigate to it.

### Phase 3 — Summary

7. Output a summary table:

| Issue | Title | Session | Status |
|-------|-------|---------|--------|
| #42 | `Add login page` | `#42 — Add login page` | Plan mode — waiting |
| #37 | `Fix null pointer` | `#37 — Fix null pointe…` | Plan mode — waiting |

8. Remind the user that each session is in **plan mode** — review and approve the
   plan in each session before the agent starts implementation.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). If the extension is not
installed, skip the canvas calls below and continue through standard chat
interaction. Follow the shared **Dashboard Reporting Contract** in
`instructions/orch-shared-phases.instructions.md` to resolve the dashboard provider;
prefer `extensionId: "plugin:copilot-app:orch-dashboard"` when opening or inspecting the
canvas.

- Open the dashboard per the shared contract, then call `start_run` with
  `skillId: "start-session-from-issue"` and these stages: Fetch Matching
  Issues, Create Sessions, Summary.
- Before each phase, call `update_stage` with `status: "in_progress"`.
- After each phase, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary of that phase's result.
- Call `finish_run` with the final status and a summary once every session has
  been created.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.

## Output

- One Copilot session per confirmed issue, started in plan mode.
- Summary table with issue, session name, and status.

## Notes

- Sessions are created sequentially to avoid rate limits.
- If an issue already has an active session, ask the user before creating a duplicate.
- For Jira issues, replace the GitHub issue fetch step with a Jira skill query
  using the same field mapping (issue key, summary, description, labels).
