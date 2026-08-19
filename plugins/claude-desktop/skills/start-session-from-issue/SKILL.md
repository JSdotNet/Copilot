---
name: start-session-from-issue
description: >
  Turn GitHub issues into ready-to-run, plan-first session handoffs — one per issue, with
  the issue context and origin metadata baked in. Use when: picking up GitHub issues for
  implementation, onboarding work from the backlog, preparing parallel work per issue,
  converting issues into worktree sessions.
---

# Start Session from GitHub Issue

## Purpose

Fetch open GitHub issues matching a filter, let the user confirm the selection, then hand
back one ready-to-run, plan-first handoff per issue: the issue context, the GitHub origin
metadata, and a suggested branch, packaged as the first message of a new session.

This skill **prepares sessions; it does not run them.** It deliberately does not spawn an
agent per issue. A plan-first agent has to be able to ask about what is ambiguous and wait
for approval before implementing, and any `orch-*` skill the session goes on to run has to
hold the Personal Validation gate and write its own dashboard state. None of that works in a
sub-agent — `AskUserQuestion` is foreground-only and there is no user turn to wait for. See
**Session Ownership** and **Sub-Agent Constraints** in
`instructions/orch-execution-model.instructions.md`. Launched as its own session, a handoff is
plan-first for real.

## Inputs

- GitHub repository in `owner/repo` format (required).
- Issue filter — one or more of:
  - Label(s): e.g. `bug`, `feature`, `sprint-42`.
  - Milestone: milestone title or number.
  - Assignee: GitHub username (use `@me` for yourself).
  - State: `open` (default) or `all`.
- Maximum number of handoffs to prepare in one run (default: `5`; keeps a sweep reviewable).
- Base branch each session should branch from (default: repository default branch).

## Workflow

### Phase 1 — Fetch Matching Issues

1. List issues matching the filter:
   ```bash
   gh issue list --repo <owner/repo> --state open --label "<label>" --assignee "<user>" --milestone "<milestone>" --json number,title,body,labels,assignees,milestone
   ```
2. Present the list to the user with issue number, title, and labels.
3. Ask the user to confirm which issues to prepare handoffs for:
   - "All of the above" (up to the maximum).
   - A specific subset by issue number.
4. Do not proceed until the user confirms the selection.

### Phase 2 — Prepare Handoffs

5. For each confirmed issue, emit one handoff block. Keep it verbatim and self-contained so
   it works without this conversation:

```text
You are working on GitHub issue #<number>: "<issue title>".

GitHub issue origin:
Repository: <owner/repo>
Issue Number: <number>
Issue URL: <issue url>

Issue description:
<issue body>

Labels: <labels>
Milestone: <milestone if set>
Suggested branch: <type>/<number>-<slug> from <base branch>

Your task:
1. Read and understand the issue thoroughly.
2. Ask clarifying questions if the requirements are ambiguous.
3. Propose a detailed implementation plan before writing any code:
   - Files to create or modify.
   - Key design decisions.
   - Risks or assumptions.
4. Preserve the GitHub issue origin metadata for any subsequent `orch-*` orchestration so
   it can report the captured result and QA report back to the issue (pass it as
   `githubIssue` to `start_run`).
5. Wait for user approval of the plan before proceeding to implementation.

Do not start coding until the plan is approved.
```

6. **Never launch an agent to run a handoff.** Emitting the blocks is where this skill's job
   ends. The plan-first contract inside the block — ask what is ambiguous, wait for approval
   — only holds in a foreground session, which is the reason this skill hands off instead of
   spawning.

7. Give each handoff a suggested session title (`#<number> — <issue title>`, truncated to 40
   characters) and note that parallel issues want a separate worktree each, so their change
   sets do not collide.

### Phase 3 — Summary

8. Output a summary table:

| Issue | Title | Suggested session | Handoff |
|-------|-------|-------------------|---------|
| #42 | `Add login page` | `#42 — Add login page` | Ready to run |
| #37 | `Fix null pointer` | `#37 — Fix null pointe…` | Ready to run |

9. Tell the user how to launch: open one new session per handoff — a separate worktree
   session for each when the issues will be worked in parallel — and paste that issue's block
   as the first message. Each session is then plan-first in the foreground: it can ask about
   what is ambiguous, and it waits for approval before writing code.

## Dashboard Interface

This skill reports progress through the `orch-dashboard` MCP server
(`plugins/claude-desktop/mcp/orch-dashboard/`). If the server is not configured, skip the
dashboard calls below and continue through standard chat interaction. Follow the shared
**Dashboard Reporting Contract** in `instructions/orch-dashboard-contract.instructions.md`
for the tool cadence.

- Open the dashboard per the shared contract, then call `start_run` with
  `skillId: "start-session-from-issue"` and these stages: Fetch Matching
  Issues, Prepare Handoffs, Summary.
- Before each phase, call `update_stage` with `status: "in_progress"`.
- After each phase, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary of that phase's result.
- Call `finish_run` with the final status and a summary once every handoff has been emitted.
  This run covers the dispatch only; each session the user launches opens its own run.

See `plugins/claude-desktop/mcp/orch-dashboard/README.md` for the full dashboard tool
contract.

## Output

- One ready-to-run, plan-first handoff per confirmed issue, for the user to launch as its
  own session.
- Summary table with issue, suggested session title, and handoff status.
- No agents spawned.

## Notes

- If an issue already has an active session, worktree, or branch carrying its number, say so
  and ask the user before preparing a second handoff for it.
- Safe to run unattended or on a schedule: this skill only reads and reports. It claims
  nothing, writes no code, and starts no work — pair it with `automation-bug-fix` when the
  issues should also be assigned and labelled.
- For Jira issues, replace the GitHub issue fetch step with a Jira skill query
  using the same field mapping (issue key, summary, description, labels).
