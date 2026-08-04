---
name: automation: whats-new
description: >
  Check one or more GitHub repositories for what changed since the last run: new commits
  merged to the main branch, open pull requests, and active branches without a PR yet.
  Correlates each item with related Jira tickets or GitHub issues where discoverable, and
  persists a per-repo checkpoint so the next run only reports genuinely new activity.
  Use when: periodic delivery check-ins, standups, release readiness reviews, or catching up
  on multiple repositories after time away.
---

# Automation: What's New

## Purpose

Give a concise, de-duplicated "what shipped and what's in flight" report across one or more
repositories, without re-reporting items already seen on a previous run. Covers three sources
per repo: commits landed on the main branch, currently open pull requests, and branches that
exist but have no open PR yet (candidate stale or forgotten work). Each item is enriched with
any Jira ticket or GitHub issue reference it can be traced back to.

## Inputs

- Repos: comma-separated list of `owner/repo` (required — no default, this automation is
  built to run across multiple repositories in one pass).
- Main branch override: per-repo `owner/repo=branch` pairs (optional; default is each repo's
  actual default branch, auto-detected).
- Include open PRs: `true` (default) or `false`.
- Include branches without an open PR: `true` (default) or `false`.
- Jira base URL: e.g. `https://yourteam.atlassian.net` (optional; used to build ticket links
  when a Jira MCP tool is not available to fetch live ticket data).
- Stale branch threshold: number of days with no commits before a branch-without-PR is
  flagged as **stale** (default: `14`).
- First-run look-back window: number of days of history to report when a repo has no prior
  checkpoint (default: `7`).
- State file path (optional; default: `.copilot/state/whats-new/state.json` relative to the
  repository this automation is run from — i.e. the control repo, not the tracked repos).

## Skill Dependencies

This skill has no hard skill dependencies. It uses `gh` CLI (already authenticated in the
session) for all GitHub data, and optionally a Jira MCP tool if one is configured for live
ticket lookups. Falls back to constructing a Jira browse link from the configured base URL
when no Jira tool is available.

## State Model

Maintain one JSON file (path from Inputs, default `.copilot/state/whats-new/state.json`) with
one entry per repo:

```json
{
  "owner/repo": {
    "main_branch": "main",
    "last_run_at": "2026-08-04T12:00:00Z",
    "last_seen_commit_sha": "abc1234",
    "known_pr_numbers": [101, 102],
    "known_branches": {
      "feature/foo": "def5678"
    }
  }
}
```

- `last_seen_commit_sha` is the newest main-branch commit SHA reported in the previous run —
  used as the boundary for "new commits since last time."
- `known_pr_numbers` is the set of open PR numbers already reported; a PR is only re-reported
  if its `updated_at` moved past `last_run_at` (i.e. it changed since last seen).
- `known_branches` maps branch name to the tip SHA last reported; a branch is only re-reported
  as new/changed if its tip SHA differs from the stored value.
- If the state file or a repo entry does not exist yet, treat that repo as a **first run**:
  use the look-back window instead of a commit-SHA boundary, and report all currently open
  PRs and PR-less branches once.

## Workflow

### Phase 1 — Load Checkpoint

1. Read the state file at the configured path. If missing, initialize an empty state object
   and note that every configured repo will run in first-run mode.
2. For each repo in the Repos input, look up its entry (if any) and resolve the main branch:
   use the per-repo override if given, otherwise fetch the repo's actual default branch:
   ```bash
   gh api repos/<owner>/<repo> --jq .default_branch
   ```

### Phase 2 — Gather New Main-Branch Commits

3. For each repo, fetch commits on the main branch:
   ```bash
   gh api repos/<owner>/<repo>/commits --field sha=<main-branch> --paginate
   ```
4. Determine the new commit set:
   - **Repeat run:** commits strictly after `last_seen_commit_sha` in the returned list
     (stop once that SHA is reached; if it's not found at all within a reasonable page depth,
     treat as first run and fall back to the look-back window instead, noting the SHA was
     not found — e.g. due to a force-push or history rewrite).
   - **First run:** commits with `commit.author.date` within the look-back window.
5. For each new commit, capture: short SHA, author, date, first line of the commit message,
   and the commit URL.

### Phase 3 — Gather Open Pull Requests

6. If "Include open PRs" is enabled, fetch open PRs:
   ```bash
   gh pr list --repo <owner>/<repo> --state open --json number,title,author,headRefName,url,updatedAt,createdAt,body
   ```
7. Classify each PR:
   - **New** — number not in `known_pr_numbers`.
   - **Updated** — number known, but `updatedAt` is after `last_run_at`.
   - **Unchanged** — skip from the report entirely (already seen, nothing changed).

### Phase 4 — Gather Branches Without an Open PR

8. If "Include branches without an open PR" is enabled, list all branches and their tip commit:
   ```bash
   gh api repos/<owner>/<repo>/branches --paginate --jq '.[] | {name: .name, sha: .commit.sha}'
   ```
9. Exclude the main branch and any branch that has an open PR (from Phase 3).
10. For each remaining branch, fetch its tip commit date:
    ```bash
    gh api repos/<owner>/<repo>/commits/<sha> --jq '.commit.author.date'
    ```
11. Classify each branch:
    - **New** — not in `known_branches`.
    - **Updated** — known, but tip SHA changed since `known_branches[name]`.
    - **Stale** — tip commit date is older than the stale-branch threshold; flag regardless of
      new/updated status.
    - **Unchanged** — same SHA as last run and not stale — skip from the report.

### Phase 5 — Correlate Tickets

12. For every commit message, PR title/body, and branch name gathered above, extract ticket
    references using these patterns (a single item may match more than one):
    - **Jira key:** `[A-Z][A-Z0-9]{1,9}-\d+` (e.g. `PROJ-123`).
    - **GitHub issue, closing keyword:** `(close[sd]?|fix(es|ed)?|resolve[sd]?)\s+#(\d+)`
      (case-insensitive).
    - **GitHub issue, bare reference:** `#(\d+)` when not already matched above.
13. For each Jira key found:
    - If a Jira MCP tool is configured, fetch the ticket's summary and status.
    - Otherwise, if a Jira base URL is configured, build a link: `<base-url>/browse/<KEY>`
      without fetching live data.
    - If neither is available, report the raw key only.
14. For each GitHub issue reference found, fetch the issue's title and state:
    ```bash
    gh issue view <number> --repo <owner>/<repo> --json title,state,url
    ```
15. Attach resolved ticket/issue context to the originating commit, PR, or branch item.

### Phase 6 — Report

16. Produce one report covering all configured repos:

    ```
    ## What's New — <ISO date>
    Repos: <owner/repo, ...> | Since: <last run timestamp, or "first run (last <n> days)">

    ### <owner/repo>

    #### New commits on `<main-branch>` (<count>)

    | Commit | Author | Date | Message | Ticket |
    |--------|--------|------|---------|--------|
    | `abc1234` | <author> | <date> | <message> | [PROJ-123](<link>) — <summary/status> |

    #### Pull requests (<new-count> new, <updated-count> updated)

    | PR | Title | Author | Branch | Status | Ticket |
    |----|-------|--------|--------|--------|--------|
    | #101 | <title> | <author> | `<branch>` | 🆕 New | #45 <issue title> (open) |
    | #98 | <title> | <author> | `<branch>` | 🔄 Updated | — |

    #### Branches without an open PR (<count>)

    | Branch | Tip | Last commit | Status | Ticket |
    |--------|-----|-------------|--------|--------|
    | `<branch>` | `<sha>` | <date> | 🆕 New | PROJ-456 |
    | `<branch>` | `<sha>` | <date> | ⚠️ Stale (<n> days) | — |

    ---
    ```

17. If a repo has no new activity in any category, record a single line:
    `No new commits, PR changes, or branch changes since <last run timestamp>.`
18. Append a footer:
    ```
    ---
    *Generated by `automation: whats-new` on <ISO datetime UTC>.*
    *Checkpoint saved to `<state file path>`.*
    ```

### Phase 7 — Persist Checkpoint

19. For each repo processed, update its state entry:
    - `last_run_at` → current UTC timestamp.
    - `last_seen_commit_sha` → newest main-branch commit SHA seen this run.
    - `known_pr_numbers` → all currently open PR numbers (drop merged/closed ones).
    - `known_branches` → all currently existing non-main branches without an open PR, mapped
      to their tip SHA (drop branches that were deleted or now have a PR).
20. Write the updated state object back to the state file, creating parent directories if
    needed. Do not overwrite entries for repos that were not part of this run's Repos input.

### Phase 8 — Follow-Up (Optional)

21. After presenting the report, ask whether to act on any notable item:
    - If a branch is flagged **Stale** with no linked ticket: suggest confirming with the
      author whether it should be revived, converted to a PR, or deleted.
    - If a PR references a Jira ticket that is already **Done**/closed: flag as a candidate
      for merge or closure.
    - If a new commit or PR has no discoverable ticket reference at all: note it for manual
      traceability follow-up if the team requires ticket linkage.

## Output

- Consolidated "what's new" report across all configured repos, grouped by repo and split
  into new commits, PR changes, and branch changes.
- Ticket/issue context attached to each item where discoverable.
- Updated checkpoint file so the next run reports only genuinely new activity.
- Optional follow-up suggestions for stale branches and closeable PRs.

## Notes

- Schedule this automation to run periodically (e.g. daily or weekly) via the app's workflow
  scheduler, pointed at a session in the control repo that holds the state file. Running it
  ad hoc works the same way — the checkpoint makes each run additive regardless of cadence.
- The state file is local to whichever repo/session runs this automation; it does not need to
  live in any of the tracked repos and should not be committed to them.
- If a repo's main branch history was rewritten (force-push) such that `last_seen_commit_sha`
  is no longer reachable, this automation falls back to the look-back window for that repo
  only and notes the fallback in the report so it isn't mistaken for a silent gap.
- Ticket correlation is best-effort text matching; it will miss tickets referenced only in
  linked external tools with no ID pattern in the commit/PR/branch text.
- For very active repos, `gh api ... --paginate` on commits/branches can be slow; consider
  narrowing with a `since` parameter aligned to `last_run_at` for repeat runs to reduce calls.
