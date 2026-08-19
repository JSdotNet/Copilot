---
name: pr-remarks-resolve
description: >
  Collect the open review remarks on a Fincent pull request, propose a concrete solution per
  remark, get one batch approval from the user, then implement, push, reply to each reviewer
  thread, and resolve the threads that were fixed. Use when a Fincent PR has review comments
  that need to be addressed and answered.
---

# PR Remarks — Propose, Approve, Push, Reply

Close out the review remarks on a Fincent pull request end to end: read every open remark,
propose a solution for each, wait for the user to approve the plan, then implement the
approved changes, push them, reply to each reviewer thread, and resolve the threads that a
code change actually fixed.

This skill acts on remarks. `pr-review-architecture`, `pr-review-domain`, and
`pr-review-story` produce remarks; this skill answers them.

## When to use

- A Fincent PR has open review comments and the reviewer is waiting for changes.
- A review round finished and the remarks need to be turned into commits and replies.
- Re-review after a push left new remarks that still need answering.

Do not use for failing CI checks — that is `fix-pr-checks`. Do not use for a base-branch
conflict — that is `update-pr-branch`.

## Inputs

- **PR** — pull request number, URL, or branch. Default: the PR for the current branch.
- **Filter** (optional) — reviewer, file, or path to narrow the remarks handled this run.
- **Include resolved** (optional) — default `no`; only open threads are processed.

## Hard Constraints

- Never push a change before the user has approved the plan in Step 4.
- Never post a reply to a remark whose change was not actually implemented and pushed.
- Never resolve a thread classified `Discuss`, `Decline`, or `Defer` — the reviewer owns
  those. Only `Fix` threads are resolved.
- Never silence a remark by weakening a test, deleting an assertion, or suppressing a lint
  rule to make the concern disappear.
- Never claim in a reply that something is covered by a test unless that test exists and
  passes.
- Never edit or delete a reviewer's comment; only add replies.

## Workflow

### Step 1 — Resolve the PR and load context

Identify the PR and its branch:

```bash
gh pr view --json number,title,headRefName,baseRefName,url,reviewDecision
```

Confirm the local worktree is on the PR's head branch and up to date before changing
anything:

```bash
git status --short --branch
```

If the working tree is dirty, stop and report — do not mix unrelated local changes into the
remark fixes.

Note the Fincent story key (`FIN-xxx`) from the PR title, body, or branch name. It is needed
for the `Defer` follow-ups in Step 7.

### Step 2 — Collect the remarks

Inline review threads with their resolution state come from GraphQL:

```bash
gh api graphql -F owner=OWNER -F repo=REPO -F number=PR_NUMBER -f query='query($owner:String!,$repo:String!,$number:Int!){repository(owner:$owner,name:$repo){pullRequest(number:$number){reviewThreads(first:100){nodes{id isResolved isOutdated path line originalLine comments(first:20){nodes{databaseId author{login} body createdAt}}}}}}}'
```

PR-level review bodies and general discussion comments come from:

```bash
gh pr view PR_NUMBER --json reviews,comments
```

Keep, for every remark:

- Thread `id` (GraphQL node id) — needed to resolve it.
- `databaseId` of the **first** comment in the thread — needed to reply to it.
- File, line, reviewer, and the remark text.
- Whether the thread is already resolved or outdated.

Skip threads where `isResolved` is `true`. Flag `isOutdated` threads separately — the code
they point at has already moved, so verify whether the concern still applies.

### Step 3 — Read the code behind each remark

For each remark, read the actual code at the referenced file and line — never reason from
the remark text alone. Load the diff for context:

```bash
gh pr diff PR_NUMBER
```

Where a remark concerns domain modelling, layer boundaries, or story scope, apply the
criteria from the sibling Fincent review skills (`pr-review-domain`,
`pr-review-architecture`, `pr-review-story`) instead of inventing new criteria.

Consult the coding guidelines MCP server (`jsdotnet-coding-guidelines`) when a remark cites
a project convention, so the proposed fix matches the documented guideline rather than a
guess. If the server is unavailable, say so and propose based on surrounding code style.

### Step 4 — Propose the solution plan and get approval

Classify each remark and propose a concrete solution. Present the whole plan in one table
and stop for the user's approval:

| # | File:line | Reviewer | Remark (1 line) | Class | Proposed solution | Effort |
|---|---|---|---|---|---|---|
| 1 | `Domain/Order.cs:42` | @alice | Invariant not enforced in constructor | Fix | Move guard into `Order` ctor, add `OrderTests.Cannot_Create_Without_Customer` | S |
| 2 | `Api/OrdersController.cs:17` | @bob | Why not a query handler here? | Discuss | Ask whether the read path should move to a handler in this PR | — |
| 3 | `Infra/Repo.cs:88` | @alice | Rename to match ubiquitous language | Fix | Rename `GetData` to `FindByCustomer` and update 3 call sites | S |
| 4 | `Web/Page.razor:5` | @bob | Also add caching | Defer | Out of `FIN-123` scope; log follow-up story | — |

**Classification:**

- **Fix** — a real defect or guideline violation; a code change is required.
- **Discuss** — a question or an opinion; alignment is needed before acting.
- **Decline** — out of scope or already handled; a rationale is given instead of a change.
- **Defer** — valid but belongs in a follow-up story.

State explicitly under the table:

- Which items will produce code changes.
- Which items will only produce a reply.
- Anything the user must decide before the plan can run.

Then ask for approval of the plan as a whole. Accept a partial approval — the user may drop
items, reclassify them, or change a proposed solution. Re-present the table only if the
changes are substantial.

**Do not proceed past this step without an explicit approval.**

### Step 5 — Implement the approved fixes

For each approved `Fix` item, smallest change first:

1. Apply the change.
2. Add or update the test that proves the concern is addressed, when the remark is about
   behaviour.
3. Keep one commit per remark, or one commit per coherent group of remarks, and reference
   the remark in the message:

   ```bash
   git commit -m "Enforce customer invariant in Order constructor (review remark 1)"
   ```

Do not bundle unrelated cleanups into these commits.

### Step 6 — Validate, then push

Build and run the tests before pushing:

```bash
dotnet build
```

```bash
dotnet test
```

If anything is red, fix it before pushing. Then push and confirm the checks:

```bash
git push
```

```bash
gh pr checks PR_NUMBER
```

If the push made checks go red, hand off to `fix-pr-checks` before replying — a reply that
points at a broken build is worse than no reply.

### Step 7 — Reply to each remark

Only now, with the changes pushed, reply. Reply into the original thread using the first
comment's `databaseId`:

```bash
gh api --method POST repos/OWNER/REPO/pulls/PR_NUMBER/comments/COMMENT_DATABASE_ID/replies -f body="Fixed in abc1234 — the guard moved into the Order constructor and OrderTests.Cannot_Create_Without_Customer covers it."
```

For a PR-level remark that is not part of an inline thread:

```bash
gh pr comment PR_NUMBER --body "..."
```

Reply content per class:

| Class | Reply must contain |
|---|---|
| Fix | What changed, the commit SHA, and the test that proves it |
| Discuss | The specific question or trade-off, and the option you lean towards with the reason |
| Decline | Why the remark does not apply here, with the evidence (file, existing test, or ADR) |
| Defer | Why it is out of scope for this story, plus the follow-up story key or issue link |

For `Defer` items, create the follow-up first so the reply can link to it, using the
discovered Jira skill for a Fincent story or `gh issue create` for a repository-level task.
Never reply "will follow up later" without a link.

Replies are short, factual, and friendly. No apologising, and no restating the reviewer's
remark back to them.

### Step 8 — Resolve the fixed threads

Resolve only the threads whose remark was classified `Fix` and whose change is pushed:

```bash
gh api graphql -F threadId=THREAD_NODE_ID -f query='mutation($threadId:ID!){resolveReviewThread(input:{threadId:$threadId}){thread{id isResolved}}}'
```

Leave `Discuss`, `Decline`, and `Defer` threads open — the reviewer decides when those are
settled.

### Step 9 — Report

```text
## PR Remarks Resolved: #N — [PR title]  (FIN-xxx)

**Pushed**: <n> commits · **Checks**: pass / attention
**Remarks**: <n> total — <n> fixed · <n> discuss · <n> declined · <n> deferred

| # | File:line | Class | Action taken | Commit | Replied | Resolved |
|---|---|---|---|---|---|---|
| 1 | Domain/Order.cs:42 | Fix | Guard moved to ctor + test | abc1234 | yes | yes |
| 2 | Api/OrdersController.cs:17 | Discuss | Question posted | — | yes | open |
| 4 | Web/Page.razor:5 | Defer | Follow-up FIN-456 | — | yes | open |

### Waiting on the reviewer
- #2 — @bob: whether the read path moves to a query handler in this PR.

### Follow-ups created
- FIN-456 — Add caching to the orders page.
```

## Output

- Approval table from Step 4, with the classification and proposed solution per remark.
- Commits pushed, and the local build and test result behind them.
- Reply posted per remark, and the resolution state of each thread.
- Explicit list of what is still waiting on the reviewer, and every follow-up created.

## Related Skills

- `pr-review-architecture`, `pr-review-domain`, `pr-review-story` — produce the remarks this
  skill answers.
- `pr-remarks-review` (plugin: `review`) — triage-and-draft only; no push, no reply.
- `fix-pr-checks` (plugin: `claude-desktop`) — failing checks rather than review remarks.
- `update-pr-branch` (plugin: `claude-desktop`) — conflicts or an out-of-date base.

## Notes

- The reply endpoint takes the **comment** `databaseId`; the resolve mutation takes the
  **thread** GraphQL `id`. They are different identifiers for the same thread — capture both
  in Step 2.
- An `isOutdated` thread often means the remark was already fixed by a later commit. Verify
  before proposing a change, and reply pointing at the commit that fixed it.
- A reviewer who leaves the same remark on several lines wants one answer, not five. Group
  those into one plan item and reply on the first thread, referencing the rest.
- Suggested-change remarks (GitHub suggestion blocks) can be applied directly, but still
  read the surrounding code first — a suggestion can be correct in isolation and wrong in
  context.
