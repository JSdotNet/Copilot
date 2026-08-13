---
applyTo: 'skills/orch-*/SKILL.md'
description: Defines the reusable delivery and validation phases shared by all orch-* orchestration skills (Build & Test, QA Validation, Personal Validation, Create Pull Request, Documentation Update, GitHub Issue Update, Summary) and the orch-dashboard reporting contract, so the shared content is maintained in one place.
---

# Shared Orchestration Phases (Orchestration-Owned)

## Purpose

- Define the phases that every `orch-*` skill shares **once**, so a maintainer edits
  them here instead of in ~14 `SKILL.md` files.
- Each `orch-*/SKILL.md` keeps only its skill-specific stages inline and references the
  matching phases below by their exact names.
- To change a shared phase for every orchestration, edit this file; do not re-copy the
  prose into individual skills.

## How Skills Reference These Phases

- A skill lists its shared phases under a `### Final Phases (Shared)` heading and links
  to this file. The linked file is the source of truth; the skill only names which
  phases it runs and adds skill-specific notes (for example the QA scope).
- The GitHub Copilot CLI does not auto-inline this file into a running skill, so the
  reference in each skill must name the phases explicitly and point here for their
  definitions.
- The `orchestrator` agent (`agents/orchestrator.agent.md`) runs these phases in order,
  drives the dashboard, and enforces the Personal Validation gate. The two heavy
  code-modifying phases are packaged as invokable skills so their procedure is maintained
  once:
  - **Build & Test** → `skills/phase-build-test/SKILL.md`.
  - **QA Validation** → `skills/phase-qa-validation/SKILL.md`.
- Personal Validation, Create Pull Request, Documentation Update, GitHub Issue Update, and Summary stay defined in
  this file (short, linear phases where a separate skill would only add indirection).
- Model choice for every phase (and every skill-specific stage) is resolved once, centrally,
  from `instructions/orch-model-selection.instructions.md` — do not describe model choice
  here or in individual skills.

## Agent Transition Rule (Shared)

- Cross-plugin agents are recommended, not required. When a referenced plugin is not
  installed, skip the stage or perform it manually and continue with the remaining
  stages.
- Internal orchestration transitions **do not require separate user approval**. The
  orchestrator may move between its own stages, sub-agents, and phase skills without
  pausing, so the run can build, test, and continue up to Personal Validation.
- The required user approval gate is **Personal Validation**. Stop there before creating a
  pull request, updating issues, or marking the orchestration complete.

## Code-Modifying Orchestration Context

- `orch-feature`, `orch-bug`, `orch-structure`, `orch-create-module`, `orch-create-service`,
  `orch-create-mvp`, `orch-update-packages`, `orch-aspire-update`, and
  `orch-project` are **implementation-focused** orchestrations.
- Each of these skills **owns establishing its own implementation context** in its first
  stage — scope, acceptance or verification criteria, impacted code paths, and the
  governing instructions and guidelines for the affected area.
- When a specification, acceptance criteria, architecture decision, or equivalent
  implementation note already exists, that first stage is a short intake: read it, align
  to it, and continue. Documentation and specification orchestrations —
  `orch-architecture`, `orch-arc42`, `orch-blueprint`, `orch-adr`, and `orch-tdr` — remain
  the preferred upstream source of that context when they have already run.
- When it does not exist, the first stage **derives it from the request and the codebase**
  and records the derived assumptions before continuing. Missing context is a reason to run
  that stage — never a reason to stop, hand the request back, or skip the orchestration and
  implement inline.
- Ad-hoc, incremental, and one-line requests are in scope for these skills. They enter
  through the same first stage as fully specified work.

### Escalation (the only stop conditions)

Stop and route the work when the request needs a decision the orchestration does not own.
Name the successor and invoke it after user approval; do not end the turn by asking the
user to run something themselves.

| Situation | Route to |
|---|---|
| The change requires a new architectural decision | `orch-adr` |
| The change requires a new bounded context or service boundary | `orch-create-service`, or `orch-architecture` for the boundary decision |
| The change requires a cross-cutting redesign | `orch-blueprint`, or `orch-arc42` for structured architecture documentation |
| Accepting known debt instead of fixing it | `orch-tdr` |

Everything else — an unwritten specification, absent acceptance criteria, a bug with no
reproduction, a request that arrived as one sentence — is derived in the skill's first
stage, not escalated.

### Exception: `orch-feature` and `orch-bug`

- `orch-feature` and `orch-bug` handle the most common ad-hoc requests, so they own a
  **Stage 0: Scope Discovery** that derives missing scope, acceptance or verification
  criteria, and impacted code paths from the request and codebase.
- For those two skills, missing context is a reason to run Stage 0 — not a reason to stop,
  and never a reason to skip the orchestration and implement inline.
- Stopping still applies when the change requires a new architectural decision, a new
  bounded context, or a cross-cutting redesign. In that case route to `orch-adr`,
  `orch-architecture`, or `orch-blueprint` only after the user approves that escalation.
- The other code-modifying orchestrations use the same Personal Validation gate and only
  stop early for the escalation cases above.

## MCP Server Strategy (Shared)

- Use `jsdotnet-guidelines-mcpserver` for repository standards, governed asset
  constraints, template conventions, and Copilot instruction guidance.
- Use `jsdotnet-design-mcpserver` only for UX-specific design work such as wireframes,
  user flows, and design artifacts. Do not use it for the architecture, ADR, TDR, or
  general implementation phases documented in the current `orch-*` skills unless a flow
  explicitly adds UX design work.
- Use `microsoft-learn` during implementation-focused phases when official
  Microsoft/.NET/Azure/Aspire documentation or code samples are needed. Prefer targeted
  lookups tied to the stack being changed; do not turn implementation phases back into
  broad research passes.
- Use `playwright` in QA Validation when browser-based scenarios or visual evidence are
  required. Skip it when the validation mode is startup-only or the change has no browser
  surface.
- Prefer the narrowest server that matches the phase. Do not query all four servers by
  default.

## Execution Model (Shared)

Defines *where* an orchestration runs and *how* its progress is tracked. Applies to every
`orch-*` skill.

### Session Ownership

- **One owner session.** The `orchestrator` agent runs the orchestration in the session it
  was invoked from and stays the sole owner of the run: it alone calls `start_run`,
  `update_stage`, `set_run_context`, and `finish_run`, and it alone holds the Personal
  Validation gate. Never delegate dashboard writes or the approval decision.
- **Never start a second orchestration in the same session** while a run is
  `in_progress`; the dashboard's tool-activity insight is session-wide and would
  mis-attribute the work.

### Delegation Order

1. **Do it inline** for short, decision-heavy steps that need the run's context.
2. **Delegate to a sub-agent (default for heavy work).** Use a sub-agent for build, test,
   Playwright execution, and large code changes. A sub-agent gets its own context but the
   **same worktree**, so evidence paths, the change set, and the running application all
   stay valid for the owner session. This keeps verbose output out of the orchestrator's
   context without breaking the dashboard.
3. **Create a child session only for genuinely concurrent long-running work** — in
   practice, `qa:qa-monitor` tailing Aspire logs while Playwright drives scenarios. Do not
   use a child session merely to save context.

Whichever form is used, pass the model resolved for that stage's category per
`instructions/orch-model-selection.instructions.md` on the `task` / `create_session` call.

**Escalate to sub-agent delegation when the run-level context gauge approaches its limit.**
The gauge described in **Context and Token Insight** below is the signal: when the owner
session's context is filling up, move the next heavy step — broad exploration, large
refactors, verbose build/test output — to a sub-agent so its cost lands in a separate
context window, instead of continuing inline until compaction interrupts the run
mid-orchestration. The gauge ignores sub-agent samples, so this genuinely relieves the owner
session's context. This is the existing delegation order applied earlier, not a new
mechanism; child sessions remain reserved for concurrent monitoring.

### Child Session Constraints

When a child session is used (`create_session` + cross-session messaging):

- The child runs in a **different worktree**. It cannot see the owner session's uncommitted
  change set and must not be asked to build, test, or validate the change there.
- **Evidence must land in the owner session's workspace.** Instruct the child to write
  evidence under the owner workspace path, or copy it back before the owner reports it.
  The dashboard serves evidence only from the owner workspace and rejects paths outside it.
- The owner session reports the child's findings; the child never calls dashboard actions.

### Run State and Resume

- **The run JSON is the source of truth**, not the conversation. It lives at
  `<session workspace>/orchestration-runs/<runId>.json` and survives compaction, restart,
  and session resume.
- **On start, reattach before creating.** `start_run` resumes an existing `in_progress`
  run for the same `skillId` by default and returns `resumed: true` with the stored run.
  Continue from the first stage that is not `done`; pass `resume: false` only to
  deliberately start a second run of the same skill.
- **Persist the decisions that gate later phases** with `set_run_context`:
  - `changeKind` (`new-functionality` / `bug-fix` / `dependency-update` / `none`) as soon
    as it is known, so a resumed run selects the same QA depth.
  - `approval` (`pending` / `approved` / `rejected`) at the Personal Validation decision.
- **Never create a pull request unless the persisted `approval` is `approved`.** If the
  run state says `pending` after a resume, re-run Personal Validation — do not rely on
  conversation memory of an approval.

## Phase Tiers

- **Code-modifying orchestrations** — `orch-feature`, `orch-bug`, `orch-structure`, `orch-create-module`,
  `orch-create-service`, `orch-create-mvp`, `orch-update-packages`, `orch-aspire-update`,
  `orch-project` — run, in order: **Build & Test → QA Validation → Personal Validation →
  Create Pull Request → Documentation Update → GitHub Issue Update → Summary**.
- **Documentation/config orchestrations** — `orch-adr`, `orch-tdr`, `orch-arc42`,
  `orch-blueprint`, `orch-architecture`, `orch-repo` — run: **Personal Validation →
  Create Pull Request → GitHub Issue Update → Summary** (no Build & Test or QA Validation, because they
  produce no runnable code change).

## Phase: Build & Test

Applies to code-modifying orchestrations. Runs first, before QA Validation and Personal
Validation, and is identical for every code-modifying skill. Packaged as the
`phase-build-test` skill (`skills/phase-build-test/SKILL.md`); the orchestrator invokes it
rather than re-describing the steps.

- **Build all projects** and fail fast on any build error.
- **Run the unit test suite** and require it to pass.
- **Run the automated end-to-end (E2E) test suite** and require it to pass.
- **Stop and fix** before continuing when build, unit, or E2E tests fail — do not proceed
  to QA Validation or Personal Validation on a red build. When build and tests are green,
  continue directly to QA Validation and then Personal Validation.

**Agents:** `csharp-coding:coding` (recommended); performed manually when that plugin is not
installed.

**MCP Servers:** `microsoft-learn` *(optional, targeted official lookup only)*

**Model Category:** Implementation & Coding (see `orch-model-selection.instructions.md`).

## Phase: QA Validation

Applies to code-modifying orchestrations. Runs after Build & Test. Packaged as the
`phase-qa-validation` skill (`skills/phase-qa-validation/SKILL.md`); the orchestrator
invokes it and passes the change kind so depth is selected automatically:

- **New functionality** → run automatic QA validation with capture:
  - **Run the application locally** via the `qa:qa` agent using the `aspire` /
    `aspire-run` skill.
  - **Execute the changed/affected scenarios with Playwright** — via the `playwright` MCP
    server, `qa:qa` drives each scenario, capturing screenshot/video evidence per
    checkpoint and failure.
  - **Monitor runtime behavior continuously** — `qa:qa-monitor` watches Aspire logs,
    traces, and metrics. Inside the GitHub Copilot App, run `qa-monitor` in a parallel
    child session (`create_session` + cross-session messaging) so monitoring runs
    concurrently with Playwright validation; otherwise use the `qa` plugin's
    `delegate-to-qa-monitor` skill for a same-session handoff.
  - **Record the QA result** with pass/fail per scenario and the captured evidence.
- **Bug fix or change to existing functionality** → run targeted QA validation without
  required capture:
  - **Run the application locally** via the `aspire` / `aspire-run` skill and exercise the
    affected scenarios.
  - **Use Playwright when it helps reproduce or verify the flow**, but only capture
    screenshot/video evidence when the user asks for it or when a failure needs evidence.
  - **Record pass/fail and monitoring findings** for the affected scenarios.
- **Dependency, package, framework, or SDK update with no functional change** (for example
  `orch-update-packages`) → reduce QA to a **startup-without-errors validation**: start the
  application, confirm the dashboard/health endpoints report healthy, and confirm the logs
  show no new errors. Full functional Playwright scenarios and capture are not required
  unless the update introduces new user-facing behavior.
- **No functional change and nothing to run** → mark this phase `skipped` and record why.

**Repo Context:** when the consuming repository supplies `.github/copilot-orch-context.md`,
its startup command, base URLs, healthy-startup signals, and declared QA depth take
precedence over discovery and over the automatic depth selection above, and a repository
declaring no runnable application makes this phase `skipped`. See
`orch-repo-context.instructions.md`; the `phase-qa-validation` skill applies it.

**Agents:** `qa:qa`, `qa:qa-monitor` (recommended); falls back to
`csharp-coding:coding` running validation manually when the `qa` plugin isn't installed.

**MCP Servers:** `playwright` *(when browser-based validation is needed; capture is required only for new functionality unless explicitly requested)*

**Skills Used:** `aspire`, `aspire-run`

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
- **Wait for explicit user approval** before any pull request is created, and fold
  requested changes back into the earlier stages when needed.
- **Record the decision durably** with `set_run_context` (`approval: "approved"` or
  `"rejected"`, plus the user's wording as `approvalNote`) so the gate survives a session
  resume.

## Phase: Create Pull Request

Applies to every orchestration.

- **Create the pull request only after explicit user approval** in Personal Validation —
  never before, and only when the persisted `approval` in the run state is `approved`.
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
  `.github/copilot-instructions.md`, any repo `*.instructions.md`, and the checked-in
  knowledge/doc folders it governs (for example `.arc42/`, `.domain/`, `.tech/`, `.design/`,
  `.backlog/`, `docs/`, and `README.md`) together with their per-chapter metadata format.
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

- **Detect whether the session was started from a GitHub issue** by checking the session's
  issue linkage metadata when available, then the kickoff prompt metadata produced by
  `start-session-from-issue` (`GitHub issue origin`, `Repository`, `Issue Number`, and
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

## Dashboard Reporting Contract (Shared)

Every `orch-*` skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). First check the canvas with
`list_canvas_capabilities`. Start with only `canvasId: "orch-dashboard"`; when the host
reports multiple matching providers, retry with the exact advertised provider identifier
for this extension, usually `plugin:copilot-app:orch-dashboard`. Do not use the
package-level identifier `plugin:copilot-app` as a canvas `extensionId`, because it does
not identify a registered canvas provider.

- If `orch-dashboard` is not installed or not advertised, skip the canvas calls and
  continue through standard chat interaction.
- If `orch-dashboard` is advertised but `open_canvas`, `invoke_canvas_action`, or any
  required dashboard action (`start_run`, `update_stage`, `set_run_context`,
  `finish_run`) is unavailable, treat it as a tooling/runtime capability issue. Do not
  silently fall back to chat-only tracking; block the orchestration and report the missing
  capability.

- **Open** canvas `orch-dashboard` with the same resolved provider identifier when one was
  required, then call `start_run` with the skill's `skillId`, the full ordered stage list
  (its skill-specific stages followed by the shared phase names for its tier), and the
  `changeKind` when it is already known. `start_run` reattaches to an
  existing `in_progress` run for the same skill and returns `resumed: true`; continue from
  the first stage that is not `done` instead of restarting the orchestration.
- **Persist gating state** with `set_run_context`: the `changeKind` as soon as it is
  determined, and the `approval` decision recorded in Personal Validation.
- **Before each stage**, call `update_stage` with `status: "in_progress"`.
- **After each stage**, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary.
- **For the Personal Validation phase**, pass `links` for the started app and any dashboard or review target URLs, so the dashboard renders direct buttons next to the stage output instead of making the user copy commands.
- **For the QA Validation phase**, also pass `scenarios` (one entry per tested scenario
  with `status: "pass"|"fail"|"flaky"`, `notes`, and optional Playwright
  screenshot/recording `evidence` paths) and `monitoring` (the Aspire log/trace summary
  and any Error/Critical/Warning findings) so the dashboard renders QA results with
  evidence inline when it exists.
- **Keep Personal Validation and Create Pull Request as separate stages**: gate Create
  Pull Request on explicit user approval recorded in Personal Validation (mark it
  `skipped` when there is no change set to submit), and record all PR-time changes under
  the Create Pull Request stage output — never create the pull request before personal
  validation.
- **For the Documentation Update phase** (code-modifying tier only), run it after Create
  Pull Request: mark it `in_progress`, then `done` with an `output` naming the governed docs
  updated and the new commit pushed onto the existing PR branch, or `done` describing what was
  checked when no update was needed, or `skipped` when Create Pull Request was skipped. It
  adds a new commit only — never amend, rebase, squash, or force-push the PR branch — and it
  never creates a commit when no documentation is stale. If the commit or push is rejected,
  mark the stage `blocked` with the actual error in the `output`, never `done`.
- **For the GitHub Issue Update phase**, run it after Documentation Update for code-modifying
  orchestrations and after Create Pull Request for documentation/config orchestrations. Mark
  it `done` after adding the result and QA report comment to the originating issue, `skipped`
  when the session was not started from a GitHub issue, or `blocked` with the actual error
  when the comment cannot be posted.
- **Mark the Summary stage** `in_progress` then `done`, and call `finish_run` with the final
  status and summary once the pull request and any applicable GitHub issue update are complete
  (or the run concludes without one).

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract, and `instructions/canvas-usage.instructions.md` for when to also open the
`markdown-canvas`/`diagram-canvas` content previews.

## Context and Token Insight (Shared)

The dashboard's **Context** panel reports context-window and token consumption alongside
the tool-activity Insight panel. Both are captured automatically by the extension from
session telemetry; the orchestrating agent does not report them.

- **Per-stage token delta** (the `Token delta:` badge on each stage) — the tokens of every model
  call that completed while that stage was `in_progress`, with reasoning and prompt cache
  read/write tracked separately, plus a subtotal for sub-agent usage so delegated cost stays
  visible. It is a delta rather than an absolute reading at the stage boundary, because
  compaction can reset the absolute mid-stage. Two figures are shown:
  - **Input + output** — the headline total. `inputTokens` counts the *whole* prompt, most
    of which is normally served from the prompt cache on later turns, so this figure can
    legitimately run to several times the model's context window. It measures throughput,
    **not** context occupancy.
  - **Uncached** (`input − cache reads + output`) — the fresh tokens the stage actually
    pushed through the model. This is the figure that approximates real context pressure.
- **Run-level context gauge** — the latest `currentTokens` against `tokenLimit` as a
  percentage, the component breakdown (system, conversation, tool definitions), the peak
  observed during the run, and the count and reasons of compaction and truncation events.
  The gauge deliberately **ignores sub-agent samples**, because a sub-agent runs in its own
  context window.

How to use these:

- **Never invent, estimate, or hand-write token numbers** into `update_stage` output,
  `set_run_context`, or the run summary. The extension owns these values; a written-in
  figure would conflict with the captured one. Keep stage `output` focused on what the
  stage did and produced.
- **Never read the headline input + output figure as context consumption.** A stage showing
  a multi-million-token total against a 200k window is normal cache behavior, not an
  emergency. Compare stages on the **uncached** figure, and read occupancy off the run-level
  gauge.
- **Read the uncached per-stage figure as the signal for which phase is expensive.** A stage
  whose uncached delta dwarfs the rest — especially one with a large sub-agent subtotal — is
  evidence that the stage should be split into smaller stages or delegated, and is worth
  naming in the Summary phase as a qualitative observation.
- **Act on the run-level gauge before it forces compaction.** As it approaches the limit,
  apply the escalation in **Execution Model → Delegation Order**: push the next heavy step
  to a sub-agent in the same worktree. Because the gauge ignores sub-agent samples,
  delegating genuinely relieves the owner session's context rather than just relabelling the
  cost. Compaction and truncation counts rising during a run mean the mitigation came too
  late.
- **Runs that predate this capture simply omit the panel and its fields** — treat their
  absence as "not recorded", not as zero.

**Caveat — attribution is session-wide.** Token telemetry, like the existing tool-activity
insight, is captured per session, not per run. Any model call made while a run is
`in_progress` is attributed to that run and to its current stage, including unrelated work
done in the same session. This is the reason for the **one orchestration per session** rule
in the Execution Model; interpret the numbers as an upper bound when other work happened
alongside the run.

## Reference Convention

- Each skill ends with a `## Reference` section naming its own source location, for
  example ``Source skill location: `plugins/copilot-app/skills/<skill>/SKILL.md` ``.

## Quality Checks

- [ ] Shared phase prose is edited here, not copied into individual skills.
- [ ] Each skill names its shared phases and links to this file.
- [ ] Build & Test runs before QA Validation and Personal Validation for code-modifying
      skills.
- [ ] Code-modifying orchestrations continue through Build & Test and QA Validation without
      extra confirmation prompts, stopping at Personal Validation for the user's decision.
- [ ] QA Validation depth matches the change kind (new functionality vs. bug/existing-flow
      verification vs. startup-only vs. skipped).
- [ ] Personal Validation waits for the user and uses no agent.
- [ ] The orchestration runs in one owner session; heavy work is delegated to sub-agents in
      the same worktree, and child sessions are used only for concurrent monitoring.
- [ ] `start_run` reattaches to an existing `in_progress` run instead of duplicating it.
- [ ] Change kind and the Personal Validation approval are persisted with
      `set_run_context`, and no pull request is created while approval is `pending`.
- [ ] For code-modifying skills, Documentation Update runs after Create Pull Request, commits any
      governed-doc changes onto the existing PR branch, and is a no-op (no commit) when nothing is
      stale.
- [ ] GitHub Issue Update runs before Summary, posts the captured result and QA report only when
      the session was started from a GitHub issue, and is skipped with a reason otherwise.
- [ ] Model choice per phase follows `instructions/orch-model-selection.instructions.md`
      and is never hardcoded in a skill or phase.
- [ ] Token and context figures are left to the dashboard's automatic capture and are never
      hand-written into stage output or the run summary.
- [ ] Stage cost is compared on the uncached token figure, and the headline input + output
      total is never read as context occupancy.
- [ ] Heavy work is escalated to a sub-agent as the run-level context gauge approaches its
      limit, rather than continuing inline until compaction hits.
