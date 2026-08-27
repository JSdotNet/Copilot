---
applyTo: 'skills/orch-*/SKILL.md'
description: Defines the shared closing phases every orch-* orchestration runs — Personal Validation, Create Pull Request, Documentation Update, GitHub Issue Update, and Summary — plus the tier position of the Build & Test and QA Validation phase skills.
---

# Shared Delivery Phases (Orchestration-Owned)

Part of the shared `orch-*` contract indexed by `orch-shared-phases.instructions.md`.
Read this file when the run reaches Personal Validation; the two phases before it are
skills, named below.

## Phase: Build & Test

Applies to code-modifying orchestrations. Runs first, before QA Validation and Personal
Validation, and is identical for every code-modifying skill.

**Defined in `skills/phase-build-test/SKILL.md`** — steps, agents, MCP servers, and
dashboard reporting all live there. The orchestrator invokes that skill; this file does not
restate it. What stays here is its place in the tier: build every project, run the unit
suite, run the automated end-to-end suite, and never continue to QA Validation or Personal
Validation on a red build or a failing test. When all three are green, continue to QA
Validation without a confirmation prompt.

**Model Category:** Implementation & Coding (see `orch-model-selection.instructions.md`).

## Phase: QA Validation

Applies to code-modifying orchestrations. Runs after Build & Test.

**Defined in `skills/phase-qa-validation/SKILL.md`** — depth selection per change kind, the
required-tooling policy, Playwright and Aspire preflight, evidence rules, repo context, and
revalidation after requested changes all live there. The orchestrator invokes that skill with
the change kind and the repo context it resolved at the start of the run; this file does not
restate any of it.

What stays here is the contract around the phase:

- **Depth follows the change kind** the orchestrator persisted with `set_run_context`: new
  functionality gets Playwright QA with capture, a bug fix or a change to existing behavior
  gets targeted verification, a dependency update gets startup-only validation, and a change
  with nothing to run is `skipped` with the reason recorded.
- **Required tooling is required.** When the selected depth needs the `playwright` or Aspire
  MCP server and it is unavailable, mark the phase `blocked`, name the missing server and
  the setup action, and stop before Personal Validation. Never complete this phase through a
  degraded fallback, and never present browser-snapshot output as Playwright evidence.
- **A background monitor you started, you stop.** Collect `qa:qa-monitor`'s summary with
  `SendMessage` and end it with `TaskStop` before marking the phase done — see
  **Delegation Order** in `orch-execution-model.instructions.md`.

**Model Category:** Testing, QA & Monitoring (see `orch-model-selection.instructions.md`).

## Phase: Personal Validation

Applies to every orchestration. This phase does **not** use an agent — it hands control
back to the user and waits for them.

- **Do not delegate to an agent and do not auto-approve.** Pause and wait for the user's
  explicit decision.
- **Present the code review** of the change set for the user to read.
- **Present the recorded QA review** from the QA agent (scenarios, pass/fail, monitoring
  findings, and any captured evidence when applicable) when QA Validation ran.
- **Start the application for the user** when the run produced a code change, using the resolved repo context startup command or the command proven during QA Validation. Do not stop at listing commands unless startup is impossible; if startup fails, block Personal Validation with the actual failure and recovery command.
- **Publish quick review links in the dashboard** for the running target, such as the primary app URL, Aspire dashboard, health page, or any route that needs review. Pass them to `update_stage` as `links` on the Personal Validation stage so the user can open the review target directly from the dashboard.
- **Wait for explicit user approval** before any pull request is created.
- **When the user requests changes**, record `approval: "rejected"` with the user's wording,
  reopen the appropriate implementation or specification stage in the same run, apply the
  requested changes, and then repeat Build & Test, QA Validation, and Personal Validation.
  The run must not advance to Create Pull Request while the rejected decision is persisted.
- **When returning to Personal Validation after requested changes**, record
  `approval: "pending"` before the handoff so the revised change set still requires
  explicit approval.
- **Record every Personal Validation decision durably** with `set_run_context`
  (`approval: "pending"`, `"approved"`, or `"rejected"`, plus the user's wording as
  `approvalNote`) so the gate survives a session resume.
- **Do not leave a runtime running behind an unanswered gate.** This phase starts the
  application for the user, and it must stay up while they review — but the orchestration
  still owns it. If the user defers the decision, ends the session, or otherwise steps
  away without approving or rejecting, shut down the runtime and any
  orchestration-owned browser windows under the same rules as **Create Pull Request**,
  leave `approval: "pending"`, and record in the stage output that the gate is still open
  and the app was stopped. A resumed run restarts the app before asking again. Waiting on a
  human is expected; leaving Aspire and a browser running for hours while nothing happens is
  not.

## Phase: Create Pull Request

Applies to every orchestration.

- **Create the pull request only after explicit user approval** in Personal Validation —
  never before, and only when the persisted `approval` in the run state is `approved`.
- **Shut down validation runtime before creating the pull request** — and, more generally,
  before the run leaves your hands by any exit: a pull request, a `blocked` or `cancelled`
  `finish_run`, or a gate the user has stepped away from. If QA Validation or
  Personal Validation started Aspire or another local application runtime, stop it and
  confirm it is no longer running before invoking any PR creation command. Prefer the
  repository's proven shutdown command or `aspire stop` for Aspire-backed runs, and block
  this phase with the actual shutdown error if the runtime cannot be stopped safely.
- **Close orchestration-owned browser windows before creating the pull request.** Close only
  browser windows or tabs opened for QA, Playwright evidence capture, or Personal
  Validation review. Do not close the `orch-dashboard` tab, the diagram/document viewer tabs, or
  unrelated user browser sessions.
- **Write the PR description** from the change set, code review outcome, and validation
  evidence.
- **Apply any PR-time improvements** (final polish, labels, changelog) as part of this
  phase.
- **Skip this phase** (mark it `skipped`) when the run produces no change set to submit.

**Agents:** *(default)*

**Model Category:** Review (see `orch-model-selection.instructions.md`). No dedicated agent
runs this phase by default, so the orchestrator performs it directly under the category's
resolved model.

## Phase: Documentation Update

Applies to code-modifying orchestrations. Runs **after** Create Pull Request and before Summary.
Its job is to stop a change from shipping while the repository's own governed documentation drifts
out of date. It is **conditional**: it is a clean no-op when nothing is stale, and never forces a
pointless commit.

- **Skip this phase** (mark it `skipped`) when Create Pull Request was skipped — there is no change
  set and no PR branch to update.
- **Discover the repository's documentation surface.** Read the target repo's own conventions —
  `CLAUDE.md`, any repo `*.instructions.md`, and the checked-in
  knowledge/doc folders it governs (for example `.arc42/`, `.domain/`, `.tech/`, `.design/`,
  `.backlog/`, `.ai/`, `docs/`, and `README.md`) together with their per-chapter metadata format.
- **Decide whether documentation is now stale.** Compare the landed change set against that surface:
  did architecture, technology, deployment, a public API/contract, configuration, dependencies, or
  user-facing behavior change in a way the governed docs should record?
- **When updates are needed**, make them following the repo's own conventions (metadata blocks,
  per-chapter format), then **commit and push onto the existing pull request branch** so the open
  PR is updated in place — a doc change that stays uncommitted is a bug. Record what changed in the
  stage `output`, and reflect it in the PR body when it helps the reviewer.
- **Never rewrite the PR branch history.** Add a **new commit** only. By the time this phase runs
  the pull request is open and a reviewer may already be reading it, so this phase must never
  amend, rebase, squash, or force-push the branch — doing so silently detaches existing review
  comments and changes code under someone mid-review.
- **Fail loudly if the commit or push is rejected.** A rejected push is expected in practice when
  the branch has moved (a reviewer pushed a suggestion or a maintainer updated the branch). On a
  failed commit or push, **mark this stage `blocked` (never `done`) with the actual error surfaced
  in the `output`** — marking it `done` would let the user believe the documentation shipped when
  it did not, the exact silent drift this phase exists to prevent. Recovery: pull/rebase the
  **local** work onto the updated remote branch and retry the push once (this rebases your own
  unpushed doc commit, not the PR branch's published history); if it still fails, stop and report.
- **When nothing is stale**, mark this phase `done` with an `output` naming what was checked and why
  no change was needed. **Do not create a commit.**

Because this phase runs after the user-approved Create Pull Request and touches **documentation
only, never code**, it does not re-open the Personal Validation gate; the documentation commit is
surfaced in the pull request for the reviewer. If a documentation change turns out to require code
edits, treat that as new implementation work and route it back through the earlier phases rather
than committing code here.

**Agents:** `documentation:documentation` (recommended), run as a sub-agent in the **same worktree**
so its commit lands on the pull request branch; falls back to `csharp-coding:coding` or the
orchestrator performing it directly when that plugin is not installed.

**MCP Servers:** `jsdotnet-guidelines-mcpserver` *(optional, for governed-asset documentation
conventions)*

**Model Category:** Documentation & Low-Complexity (see `orch-model-selection.instructions.md`).

## Phase: GitHub Issue Update

Applies to every orchestration. Runs after the pull request and any documentation update
work, and before Summary.

- **Detect whether the session was started from a GitHub issue** by checking the run's
  `githubIssue` metadata when available, then the issue origin block that
  `start-session-from-issue` or `automation-bug-fix` recorded when it claimed the issue and
  routed this orchestration (`GitHub issue origin`, `Repository`, `Issue Number`, and
  `Issue URL`).
- **Skip this phase** (mark it `skipped`) when no GitHub issue origin is present, when the
  issue number or repository cannot be determined, or when GitHub issue tooling is not
  available. Include the reason in the stage `output`.
- **Add a new issue comment instead of rewriting the issue body.** The comment must include
  the captured orchestration result, pull request link when one exists, Personal Validation
  decision, and the recorded QA report.
- **Include the QA report from the QA Validation stage** for code-modifying orchestrations:
  scenario pass/fail/flaky status, monitoring findings, and captured evidence or dashboard
  report links when available. If QA Validation was skipped or does not apply, state that
  explicitly in the comment rather than inventing a result.
- **Use configured GitHub issue tooling first**, such as an installed GitHub plugin skill or
  MCP integration; fall back to `gh issue comment --repo <owner/repo> <number> --body-file
  <file>` when available. Do not create a new issue.
- **Fail loudly on update errors.** If posting the comment fails, mark this stage `blocked`
  with the actual error in `output`; do not mark it `done` or silently continue to Summary.

**Agents:** *(default)*

**Model Category:** Documentation & Low-Complexity (see `orch-model-selection.instructions.md`).
No dedicated agent runs this phase by default, so the orchestrator performs it directly under
the category's resolved model.

## Phase: Summary

Applies to every orchestration.

- **Summarize the delivered outcome**, the created pull request (if any), and the
  GitHub issue update outcome when applicable.
- **Emit the run summary** once the pull request and any applicable GitHub issue update are
  complete, or the run concludes without
  one.

**Agents:** `orchestrator` agent

**Model Category:** Documentation & Low-Complexity (see `orch-model-selection.instructions.md`).
No dedicated agent runs this phase; the orchestrator summarizes directly under the
category's resolved model.
