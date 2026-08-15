---
name: update-open-sessions
description: >
  Rebase or merge every open worktree session onto the latest source branch.
  Use when: syncing open feature branches before review, pulling in upstream fixes,
  keeping worktrees up to date, preparing sessions for PR submission.
---

# Update Open Sessions

## Purpose

Fetch the latest commits from the source branch and apply them to every open
worktree session branch, keeping all in-progress work in sync with the trunk.

## Inputs

- Source branch to update from (default: repository default branch, usually `main` or `master`).
- Update strategy: `rebase` (default) or `merge`.
- Sessions to update: `all` (default) or a specific list of session branch names.
- Conflict behaviour: `skip` (default — leave conflicted sessions untouched and report them)
  or `abort` (roll back the update for any session with conflicts).

## Workflow

### Phase 1 — Discover Open Sessions

1. List all git worktrees to discover open session branches:
   ```bash
   git --no-pager worktree list
   ```
2. Identify the source branch HEAD:
   ```bash
   git --no-pager log <source-branch> -1 --oneline
   ```
3. For each worktree, check whether the source branch has new commits since the
   session branched off:
   ```bash
   git --no-pager log <session-branch>..<source-branch> --oneline
   ```
4. Present the status table to the user and ask for confirmation before proceeding:

| Session | Branch | Behind by | Action |
|---------|--------|-----------|--------|
| `<name>` | `feature/x` | 3 commits | Will rebase |
| `<name>` | `feature/y` | 0 commits | Up to date — skip |

### Phase 2 — Update Each Session

5. For each session that is behind (in order):
   a. Change into the worktree directory.
   b. Fetch the latest source branch:
      ```bash
      git fetch origin <source-branch>
      ```
   c. Apply the chosen update strategy:

   **Rebase:**
   ```bash
   git rebase origin/<source-branch>
   ```

   **Merge:**
   ```bash
   git merge --no-edit origin/<source-branch>
   ```

   d. If the operation exits with conflicts:
      - If strategy is `skip`: run `git rebase --abort` or `git merge --abort`,
        mark session as **Conflict — skipped**, and continue to the next session.
      - If strategy is `abort`: roll back all changes made so far and stop.

6. After a successful update, record the new HEAD for the session.

### Phase 3 — Summary

7. Output a final summary table:

| Session | Branch | Result | New HEAD |
|---------|--------|--------|----------|
| `<name>` | `feature/x` | ✅ Updated | `abc1234` |
| `<name>` | `feature/y` | ⏭ Already up to date | `def5678` |
| `<name>` | `feature/z` | ⚠️ Conflict — skipped | — |

8. For any session marked **Conflict — skipped**:
   - List the conflicting files.
   - Suggest the user open that session and resolve conflicts manually before
     re-running this automation.

## Dashboard Interface

This skill reports progress through the `orch-dashboard` MCP server
(`plugins/claude-desktop/mcp/orch-dashboard/`). If the server is not configured, skip the
dashboard calls below and continue through standard chat interaction. Follow the shared
**Dashboard Reporting Contract** in `instructions/orch-shared-phases.instructions.md`
for the tool cadence.

- Open the dashboard per the shared contract, then call `start_run` with
  `skillId: "update-open-sessions"` and these stages: Discover Open Sessions,
  Update Each Session, Summary.
- Before each phase, call `update_stage` with `status: "in_progress"`.
- After each phase, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary of that phase's result.
- Call `finish_run` with the final status and a summary once every session has
  been updated.

See `plugins/claude-desktop/mcp/orch-dashboard/README.md` for the full dashboard tool
contract.

## Output

- All sessions behind the source branch are updated (rebased or merged).
- Summary table with result per session.
- Conflict report with file list for any sessions that could not be updated.

## Notes

- This automation only modifies local worktree branches; it does not push to remote.
  Push manually or via the session's normal PR workflow after reviewing the update.
- Run this automation before submitting PRs to reduce merge conflicts at review time.
- Worktrees created for background agents are plain git worktrees, so the commands above
  apply to them unchanged. Update a worktree only when no agent is currently running in it.
