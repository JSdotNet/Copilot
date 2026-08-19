---
applyTo: 'skills/orch-*/SKILL.md'
description: Defines where an orch-* orchestration runs and how its work is delegated — implementation context and escalation, MCP server strategy, session ownership, delegation order, sub-agent constraints, session handoff, and run state and resume.
---

# Orchestration Execution Model (Orchestration-Owned)

Part of the shared `orch-*` contract indexed by `orch-shared-phases.instructions.md`.
Read this file once, at the start of a run.

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
  constraints, template conventions, and repository instruction guidance.
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
3. **Run a background sub-agent only for genuinely concurrent long-running work** — in
   practice, `qa:qa-monitor` tailing Aspire logs while Playwright drives scenarios. Launch
   it with the `Agent` tool's `run_in_background`, steer it with `SendMessage`, and do not
   background work merely to save context.
4. **Stop every background sub-agent you started, in the same phase that started it.**
   `qa-monitor` is built to poll until told otherwise — its own instructions say not to stop
   monitoring — so nothing ends it on its own. Ask it for its final summary with
   `SendMessage`, then end it with `TaskStop`. A monitor left running keeps polling Aspire
   after the run has moved on, and a phase must never complete with a background agent it
   started still alive.

Whichever form is used, pass the model resolved for that stage's category per
`instructions/orch-model-selection.instructions.md` in the `Agent` call's `model`.

**Escalate to sub-agent delegation when the run-level context gauge approaches its limit.**
The gauge described in **Context and Token Insight** (`orch-dashboard-contract.instructions.md`)
is the signal: when the owner session's context is filling up, move the next heavy step —
broad exploration, large refactors, verbose build/test output — to a sub-agent so its cost
lands in a separate context window, instead of continuing inline until compaction interrupts
the run mid-orchestration. The gauge ignores sub-agent samples, so this genuinely relieves the owner
session's context. This is the existing delegation order applied earlier, not a new
mechanism; background sub-agents remain reserved for concurrent monitoring.

### Sub-Agent Constraints

- **Keep sub-agents in the owner's worktree.** A plain `Agent` call shares the worktree, so
  the change set, the running application, and evidence paths all stay valid. Only pass
  `isolation: "worktree"` when parallel agents would otherwise write the same files — an
  isolated agent cannot see the owner's uncommitted change set and must not be asked to
  build, test, or validate it.
- **Evidence must land in the owner's worktree.** Instruct any isolated or background agent
  to write evidence under the owner worktree root, or copy it back before the owner reports
  it. The dashboard serves evidence only from that root and rejects paths outside it.
- The owner session reports a sub-agent's findings; a sub-agent never calls dashboard tools.
- **A sub-agent never prompts the user.** `AskUserQuestion` is foreground-only — the harness
  strips it from sub-agents, so a sub-agent that reaches for it errors out mid-stage, and
  "wait for the user to approve" has no user turn to wait for. When a sub-agent hits a
  decision it does not own, it **stops and returns the decision to its caller** as
  structured findings: the question, the options it sees, its recommendation, and the
  default it would take if told to proceed. The owner session is the only one that asks the
  user and the only one that records the answer. Never invent an answer and continue, and
  never end a sub-agent's turn waiting for input that cannot arrive.
- **The Personal Validation gate belongs to the owner session, always.** A sub-agent —
  including a backgrounded or worktree-isolated one — cannot hold it: it cannot hand control
  back to the user and cannot persist `approval`. A sub-agent runs up to the gate, returns
  its change set, evidence, and code review, and stops. The session that launched it takes
  the gate.
- **Never run an orchestration as a sub-agent.** An `orch-*` run needs all three of the
  capabilities a sub-agent lacks: the user turn behind Personal Validation, `AskUserQuestion`
  for a decision it does not own, and ownership of the dashboard run (which the two rules
  above reserve for the owner session, and whose telemetry is session-wide). So the
  `orchestrator` agent is always a session's main loop, never something another agent spawns.
  Parallelism across items comes from **more sessions**, not from nesting orchestrations: a
  skill that fans out over issues or PRs prepares one ready-to-run invocation per item and
  hands them back for the user to launch, as `automation-bug-fix` and
  `start-session-from-issue` do. Delegation *within* a run — build, test, QA, large edits —
  stays sub-agent work as described under **Delegation Order**.

### Session Handoff

Delegation relieves a *step*; it does not relieve a *run*. Every turn re-reads the whole
context, so a long-lived owner session pays more for the same work at its last stage than it
did at its first, and a run that outgrows the window loses to compaction exactly the detail
it was carrying that context for. Handoff caps the **session**, not the run: the run
continues in a fresh session, from the state already on disk.

The plugin's telemetry hook announces the gauge crossings that drive this — once per
crossing, on the tool call that crosses it, latched so it does not repeat:

| Gauge | Signal | What the run does |
| --- | --- | --- |
| **60%** | `delegate` | Push the next heavy step to a sub-agent in the same worktree, per **Delegation Order** above. |
| **75%** | `prepare-handoff` | Persist the decisions that gate later phases, finish the stage in flight, and start no further heavy stage inline. |
| **85%** | `hand-off` | Hand off now. |

The warnings are a backstop, not a schedule. A stage already known to be expensive — a broad
refactor, a full QA pass — is worth handing off *before* starting it rather than partway
through.

**Handing off**, in the session that is ending:

1. **Persist what gates a later phase** with `set_run_context`: `changeKind`, and
   `approval` plus the user's wording when Personal Validation has already decided.
   Conversation memory does not survive the handoff; the run JSON does.
2. **Leave the stage in flight `in_progress`.** Do not mark it `done` to leave things
   tidy — a resumed run continues from the first stage that is not `done`, so a stage
   rounded up to `done` is a stage the next session skips.
3. **Mark the handoff** with `set_run_context` (`handoff: true`), passing `handoffNote`:
   what is finished, what is not, the files and evidence paths the next session needs, and
   the exact invocation to resume with. This is what separates a handoff from an abandoned
   run — without it the run is merely idle, `start_run` refuses to reattach, and the next
   session opens a duplicate. The note lands on the run, where `get_run` and `list_runs`
   surface it, rather than in a conversation the next session cannot read.
4. **Commit the work in progress, or describe it in the note.** The next session inherits the
   worktree but none of the reasoning behind an uncommitted diff.
5. **Hand the user the resume invocation and stop.** Do not start the next session yourself:
   a run's owner session is a foreground session with a user turn behind it — see **Never run
   an orchestration as a sub-agent** above.

**Resuming** is the ordinary resume path, not a special mode. `start_run` with the same
`skillId` reattaches and returns `resumed: true` — it accepts a handed-off run even though
that run is idle by every other signal — and clears the marker so telemetry attributes the
new session's work to the run again. The run continues from the first stage that is not
`done`. Read `handoff.note` from `get_run` **before** re-deriving anything: it exists so
the fresh session does not pay a second time to rediscover what the previous one knew.

**When not to hand off.** Two cases, both where the handoff costs more than it saves: the run
is one short stage from `finish_run`, or the user is at the Personal Validation gate right
now. Finish instead, and note the pressure in the Summary. Everywhere else a handoff mid-stage
plus a re-read of the change set costs less than one compaction — and far less than the stages
that would otherwise follow it in a session already this full.

### Run State and Resume

- **The run JSON is the source of truth**, not the conversation. It lives at
  `<state dir>/runs/<runId>.json` (the `stateDir` returned by `open_dashboard`) and survives
  compaction, restart, and session resume.
- **On start, reattach before creating.** `start_run` resumes an existing `in_progress`
  run for the same `skillId` by default and returns `resumed: true` with the stored run.
  Continue from the first stage that is not `done`; pass `resume: false` only to
  deliberately start a second run of the same skill.
- **An idle run is abandoned work, not resumable work.** A run only leaves `in_progress`
  through `finish_run`, so one left waiting at an unanswered Personal Validation gate stays
  `in_progress` indefinitely. The dashboard derives an `idle` flag for those (session ended,
  or nothing advanced the run for hours) and `start_run` will not reattach to one. When
  `list_runs` shows an idle run, do not silently continue it: either close it with
  `finish_run` (`cancelled`, with a summary saying where it stopped) or confirm with the
  user that it should be picked up, then advance a stage so it counts as live again.
- **A handed-off run is the exception, and it says so.** `handoffPending: true` on a run that
  is also `idle` means the previous session ended deliberately at a context threshold for
  another session to continue — not that the work was dropped. Continue it: `start_run` for
  the same `skillId` reattaches, and `handoff.note` says where it stopped. Do not close it
  with `finish_run` as abandoned work, and do not treat a missing marker as one: an idle run
  with no marker is abandoned, whatever the conversation claims. See **Session Handoff**
  above.
- **Persist the decisions that gate later phases** with `set_run_context`:
  - `changeKind` (`new-functionality` / `bug-fix` / `dependency-update` / `none`) as soon
    as it is known, so a resumed run selects the same QA depth.
  - `approval` (`pending` / `approved` / `rejected`) at every Personal Validation decision.
- **Never create a pull request unless the persisted `approval` is `approved`.** If the
  run state says `pending` after a resume, re-run Personal Validation — do not rely on
  conversation memory of an approval.
- **When Personal Validation rejects or requests changes**, set `approval: "rejected"` with
  the user's wording, return to the appropriate implementation/specification stage, mark that
  stage `in_progress`, apply the requested changes, and then repeat Build & Test, QA
  Validation, and Personal Validation. Before the repeated Personal Validation handoff, reset
  `approval: "pending"` so Create Pull Request remains locked until the user approves the
  revised change set.
