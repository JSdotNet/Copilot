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

## Agent Transition Rule (Shared)

- Cross-plugin agents are recommended, not required. When a referenced plugin is not
  installed, skip the stage or perform it manually and continue with the remaining
  stages.
- All agent transitions require explicit user approval before switching.

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
Validation, and is identical for every code-modifying skill.

- **Build all projects** and fail fast on any build error.
- **Run the unit test suite** and require it to pass.
- **Run the automated end-to-end (E2E) test suite** and require it to pass.
- **Stop and fix** before continuing when build, unit, or E2E tests fail — do not proceed
  to QA Validation or Personal Validation on a red build.

**Agents:** `csharp-coding:coding`, `development:testing` (recommended); performed manually
when those plugins are not installed.

## Phase: QA Validation

Applies to code-modifying orchestrations. Runs after Build & Test. Its depth is driven by
the kind of change:

- **Functional change or bug fix** → run automatic QA validation:
  - **Run the application locally** via the `qa:qa` agent's `aspire-run` skill.
  - **Execute the changed/affected scenarios with Playwright** — `qa:qa` drives each
    scenario (for a bug fix, the original reproduction steps plus the regression
    scenario), capturing screenshot/video evidence per checkpoint and failure.
  - **Monitor runtime behavior continuously** — `qa:qa-monitor` watches Aspire logs,
    traces, and metrics. Inside the GitHub Copilot App, run `qa-monitor` in a parallel
    child session (`create_session` + cross-session messaging) so monitoring runs
    concurrently with Playwright validation; otherwise use the `qa` plugin's
    `delegate-to-qa-monitor` skill for a same-session handoff.
  - **Record the QA result** with pass/fail per scenario and the captured evidence.
- **Dependency, package, framework, or SDK update with no functional change** (for example
  `orch-update-packages`) → reduce QA to a **startup-without-errors validation**: start the
  application, confirm the dashboard/health endpoints report healthy, and confirm the logs
  show no new errors. Full functional Playwright scenarios are not required unless the
  update changes user-facing behavior.
- **No functional change and nothing to run** → mark this phase `skipped` and record why.

**Agents:** `qa:qa`, `qa:qa-monitor` (recommended); falls back to `development:testing`,
`csharp-coding:coding`, `review:reviewer` running validation manually when the `qa` plugin
isn't installed.

## Phase: Personal Validation

Applies to every orchestration. This phase does **not** use an agent — it hands control
back to the user and waits for them.

- **Do not delegate to an agent and do not auto-approve.** Pause and wait for the user's
  explicit decision.
- **Present the code review** of the change set for the user to read.
- **Present the recorded QA review** from the QA agent (scenarios, pass/fail, evidence,
  and monitoring findings) when QA Validation ran.
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
- **Prefer the `JSdotNet` account** for GitHub CLI/API operations per repository policy.

**Agents:** `review:reviewer`
**Skills Used:** `pr-jsdotnet`

## Phase: Summary

Applies to every orchestration.

- **Summarize the delivered outcome** and the created pull request (if any).
- **Emit the run summary** once the pull request is created, or the run concludes without
  one.

**Agents:** `review:reviewer`

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
  with `status: "pass"|"fail"|"flaky"`, `notes`, and Playwright screenshot/recording
  `evidence` paths) and `monitoring` (the Aspire log/trace summary and any
  Error/Critical/Warning findings) so the dashboard renders QA results with evidence
  inline.
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
- [ ] QA Validation depth matches the change kind (functional/bug vs. startup-only vs.
      skipped).
- [ ] Personal Validation waits for the user and uses no agent.
