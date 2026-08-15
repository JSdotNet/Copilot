---
name: start-session-from-issue
description: >
  Start one worktree-isolated background agent per GitHub issue, in plan-first mode.
  Use when: picking up GitHub issues for implementation, onboarding work from the backlog,
  running parallel work per issue, converting issues into isolated worktree sessions.
---

# Start Session from GitHub Issue

## Purpose

Fetch open GitHub issues matching a filter, let the user confirm the selection,
then start one background agent per issue in its own git worktree, instructed to plan
first so it analyses the issue and proposes an approach before writing any code.

## Inputs

- GitHub repository in `owner/repo` format (required).
- Issue filter — one or more of:
  - Label(s): e.g. `bug`, `feature`, `sprint-42`.
  - Milestone: milestone title or number.
  - Assignee: GitHub username (use `@me` for yourself).
  - State: `open` (default) or `all`.
- Maximum number of agents to start in one run (default: `5`; prevents accidental mass creation).
- Base branch to branch each worktree from (default: repository default branch).

## Workflow

### Phase 1 — Fetch Matching Issues

1. List issues matching the filter:
   ```bash
   gh issue list --repo <owner/repo> --state open --label "<label>" --assignee "<user>" --milestone "<milestone>" --json number,title,body,labels,assignees,milestone
   ```
2. Present the list to the user with issue number, title, and labels.
3. Ask the user to confirm which issues to start agents for:
   - "All of the above" (up to the maximum).
   - A specific subset by issue number.
4. Do not proceed until the user confirms the selection.

### Phase 2 — Start Agents

5. For each confirmed issue (in order, one at a time):
   a. Launch an `Agent` with `isolation: "worktree"` and `run_in_background: true`, so each
      issue gets its own checkout and none of them collide on the same files.
   b. Set the agent's description to: `#<number> — <issue title>` (truncated to 40 characters).
   c. Use this kickoff prompt, which keeps the agent plan-first:

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
   it can report the captured result and QA report back to the issue (pass it as
   `githubIssue` to `start_run`).
5. Wait for user approval of the plan before proceeding to implementation.

Do not start coding until the plan is approved.
```

6. After each agent starts, output its name and worktree path so the user can follow it,
   and note that follow-up steering goes through `SendMessage` with that agent's ID.

### Phase 3 — Summary

7. Output a summary table:

| Issue | Title | Agent | Status |
|-------|-------|-------|--------|
| #42 | `Add login page` | `#42 — Add login page` | Planning — waiting |
| #37 | `Fix null pointer` | `#37 — Fix null pointe…` | Planning — waiting |

8. Remind the user that each agent is **plan-first** — review and approve its proposed
   plan before telling it to implement.

## Dashboard Interface

This skill reports progress through the `orch-dashboard` MCP server
(`plugins/claude-desktop/mcp/orch-dashboard/`). If the server is not configured, skip the
dashboard calls below and continue through standard chat interaction. Follow the shared
**Dashboard Reporting Contract** in `instructions/orch-shared-phases.instructions.md`
for the tool cadence.

- Open the dashboard per the shared contract, then call `start_run` with
  `skillId: "start-session-from-issue"` and these stages: Fetch Matching
  Issues, Start Agents, Summary.
- Before each phase, call `update_stage` with `status: "in_progress"`.
- After each phase, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary of that phase's result.
- Call `finish_run` with the final status and a summary once every agent has
  been started.

See `plugins/claude-desktop/mcp/orch-dashboard/README.md` for the full dashboard tool
contract.

## Output

- One worktree-isolated background agent per confirmed issue, started plan-first.
- Summary table with issue, agent name, and status.

## Notes

- Agents are started sequentially to avoid rate limits.
- If an issue already has an active agent or worktree, ask the user before duplicating it.
- For Jira issues, replace the GitHub issue fetch step with a Jira skill query
  using the same field mapping (issue key, summary, description, labels).
