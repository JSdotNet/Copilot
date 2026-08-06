---
applyTo: 'skills/orch-*/SKILL.md'
description: Defines the reusable delivery and validation phases shared by all orch-* orchestration skills (Build & Test, QA Validation, Personal Validation, Create Pull Request, Summary) and the orch-dashboard reporting contract, so the shared content is maintained in one place.
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
- Personal Validation, Create Pull Request, and Summary stay defined in this file (short,
  linear phases where a separate skill would only add indirection).

## Agent Transition Rule (Shared)

- Cross-plugin agents are recommended, not required. When a referenced plugin is not
  installed, skip the stage or perform it manually and continue with the remaining
  stages.
- All agent transitions require explicit user approval before switching.

## Code-Modifying Orchestration Preconditions

- `orch-feature`, `orch-bug`, `orch-create-module`, `orch-create-service`,
  `orch-create-mvp`, `orch-update-packages`, `orch-aspire-update`, and
  `orch-project` are **implementation-focused** orchestrations.
- These skills assume the requested change already has enough approved context to build
  from: specification, acceptance criteria, architecture decisions, or equivalent
  implementation notes.
- Treat documentation and specification orchestrations — `orch-architecture`,
  `orch-arc42`, `orch-blueprint`, `orch-adr`, `orch-tdr`, and future spec-update
  workflows — as the upstream source of that context.
- Code-modifying orchestrations may review and align to those inputs, but they should not
  restart broad requirements discovery or architecture definition from scratch.
- If the required implementation context is missing or unapproved, stop and ask the user
  to provide it or run the appropriate documentation/specification orchestration first.

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

## Phase Tiers

- **Code-modifying orchestrations** — `orch-feature`, `orch-bug`, `orch-create-module`,
  `orch-create-service`, `orch-create-mvp`, `orch-update-packages`, `orch-aspire-update`,
  `orch-project` — run, in order: **Build & Test → QA Validation → Personal Validation →
  Create Pull Request → Summary**.
- **Documentation/config orchestrations** — `orch-adr`, `orch-tdr`, `orch-arc42`,
  `orch-blueprint`, `orch-architecture`, `orch-repo` — run: **Personal Validation →
  Create Pull Request → Summary** (no Build & Test or QA Validation, because they
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
  to QA Validation or Personal Validation on a red build.

**Agents:** `csharp-coding:coding` (recommended); performed manually when that plugin is not
installed.

**MCP Servers:** `microsoft-learn` *(optional, targeted official lookup only)*

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

**Agents:** `qa:qa`, `qa:qa-monitor` (recommended); falls back to
`csharp-coding:coding` running validation manually when the `qa` plugin isn't installed.

**MCP Servers:** `playwright` *(when browser-based validation is needed; capture is required only for new functionality unless explicitly requested)*

**Skills Used:** `aspire`, `aspire-run`

## Phase: Personal Validation

Applies to every orchestration. This phase does **not** use an agent — it hands control
back to the user and waits for them.

- **Do not delegate to an agent and do not auto-approve.** Pause and wait for the user's
  explicit decision.
- **Present the code review** of the change set for the user to read.
- **Present the recorded QA review** from the QA agent (scenarios, pass/fail, monitoring
  findings, and any captured evidence when applicable) when QA Validation ran.
- **Start the application for the user** when the run produced a code change, so they can
  review the running result themselves before deciding.
- **Wait for explicit user approval** before any pull request is created, and fold
  requested changes back into the earlier stages when needed.

## Phase: Create Pull Request

Applies to every orchestration.

- **Create the pull request only after explicit user approval** in Personal Validation —
  never before.
- **Write the PR description** from the change set, code review outcome, and validation
  evidence.
- **Apply any PR-time improvements** (final polish, labels, changelog) as part of this
  phase.
- **Skip this phase** (mark it `skipped`) when the run produces no change set to submit.

**Agents:** *(default)*

## Phase: Summary

Applies to every orchestration.

- **Summarize the delivered outcome** and the created pull request (if any).
- **Emit the run summary** once the pull request is created, or the run concludes without
  one.

**Agents:** `orchestrator` agent

## Dashboard Reporting Contract (Shared)

Every `orch-*` skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). If the extension is not installed,
skip the canvas calls and continue through standard chat interaction.

- **Open** canvas `orch-dashboard`, then call `start_run` with the skill's `skillId` and
  the full ordered stage list (its skill-specific stages followed by the shared phase
  names for its tier).
- **Before each stage**, call `update_stage` with `status: "in_progress"`.
- **After each stage**, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary.
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
- **Mark the Summary stage** `in_progress` then `done`, and call `finish_run` with the
  final status and summary once the pull request is created (or the run concludes without
  one).

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract, and `instructions/canvas-usage.instructions.md` for when to also open the
`markdown-canvas`/`diagram-canvas` content previews.

## Reference Convention

- Each skill ends with a `## Reference` section naming its own source location, for
  example ``Source skill location: `plugins/copilot-app/skills/<skill>/SKILL.md` ``.

## Quality Checks

- [ ] Shared phase prose is edited here, not copied into individual skills.
- [ ] Each skill names its shared phases and links to this file.
- [ ] Build & Test runs before QA Validation and Personal Validation for code-modifying
      skills.
- [ ] QA Validation depth matches the change kind (new functionality vs. bug/existing-flow
      verification vs. startup-only vs. skipped).
- [ ] Personal Validation waits for the user and uses no agent.
