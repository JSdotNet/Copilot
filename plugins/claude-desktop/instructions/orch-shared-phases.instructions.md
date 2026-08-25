---
applyTo: 'skills/orch-*/SKILL.md'
description: Index of the shared orch-* orchestration contract — which phases each tier runs, how skills reference them, and which file owns each part (execution model, delivery phases, dashboard contract, and the two phase skills).
---

# Shared Orchestration Phases (Orchestration-Owned)

## Purpose

- Define the phases that every `orch-*` skill shares **once**, so a maintainer edits
  them in one place instead of in ~14 `SKILL.md` files.
- Each `orch-*/SKILL.md` keeps only its skill-specific stages inline and references the
  matching phases by their exact names.
- To change a shared phase for every orchestration, edit the file that owns it — see
  **Where Each Part Lives**; do not re-copy the prose into individual skills.

## Where Each Part Lives

This file is the index: which phases a tier runs, how skills reference them, and the
transition rule. The definitions live in three companion files, so a run reads the part it
is actually in. They were previously one 47 KB file, which meant every run carried the
phases it had not reached yet and the ones its tier would never run — on every turn, until
the run ended.

| File | Holds | Read it |
| --- | --- | --- |
| `orch-execution-model.instructions.md` | Code-modifying context and escalation, MCP server strategy, session ownership, delegation order, sub-agent constraints, run state and resume, **Session Handoff** | Once, at the start of the run |
| `orch-model-selection.instructions.md` | Category → model resolution and the personal override | Once, before `start_run` |
| `orch-dashboard-contract.instructions.md` | The dashboard reporting contract, surfacing the dashboard, context and token insight | Once, before the first `update_stage` |
| `orch-repo-context.instructions.md` | The `.claude/orch-context.md` convention | **Only if `.claude/orch-context.md` exists.** Check for the file first; when it is absent there is no convention to apply |
| `orch-delivery-phases.instructions.md` | Personal Validation, Create Pull Request, Documentation Update, GitHub Issue Update, Summary | **Only when the run reaches Personal Validation** — not at the start |
| `dashboard-usage.instructions.md` | When to open the Markdown and Mermaid viewers | **Only when a stage renders a diagram or document** |
| `skills/phase-build-test/SKILL.md` and `skills/phase-qa-validation/SKILL.md` | Build & Test and QA Validation, in full | When the orchestrator invokes them. It reads them itself, because it owns depth selection and the dashboard stage; the sub-agent it delegates to receives the instruction, not the file |

Build & Test and QA Validation are **not** defined in this file or in its companions. They
are invokable skills and their procedure lives only there; the instruction files name them,
their position in the tier, and their model category, and stop.

**This table is a rule, not a reading suggestion.** Loading the whole set up front costs
what the single 47 KB file cost and defeats the split entirely — and it costs it on *every
turn* for the rest of the run, because everything read stays in the prompt. Roughly a third
of these bytes belong to phases a given run has not reached, or to a convention its
repository does not use. A run that reads all of them has not been more thorough; it has
paid for the prose it did not need, repeatedly.

Re-reading a file the run already loaded is free — it is already in context. Reading one it
does not need is not.

## How Skills Reference These Phases

- A skill lists its shared phases under a `### Final Phases (Shared)` heading and links to
  the file that defines them. Those files are the source of truth; the skill only names which
  phases it runs and adds skill-specific notes (for example the QA scope).
- Claude Code does not auto-inline any of these files into a running skill, so the reference
  in each skill must name the phases explicitly and point at the file that defines them.
- The `orchestrator` agent (`agents/orchestrator.agent.md`) runs these phases in order,
  drives the dashboard, and enforces the Personal Validation gate. The two heavy
  code-modifying phases are packaged as invokable skills so their procedure is maintained
  once:
  - **Build & Test** → `skills/phase-build-test/SKILL.md`.
  - **QA Validation** → `skills/phase-qa-validation/SKILL.md`.
- Personal Validation, Create Pull Request, Documentation Update, GitHub Issue Update, and
  Summary stay defined as prose in `orch-delivery-phases.instructions.md` rather than as
  skills — short, linear phases where a separate skill would only add indirection.
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

## Phase Tiers

- **Code-modifying orchestrations** — `orch-feature`, `orch-bug`, `orch-structure`, `orch-create-module`,
  `orch-create-service`, `orch-create-mvp`, `orch-update-packages`, `orch-aspire-update`,
  `orch-project` — run, in order: **Build & Test → QA Validation → Personal Validation →
  Create Pull Request → Documentation Update → GitHub Issue Update → Summary**.
- **Documentation/config orchestrations** — `orch-adr`, `orch-tdr`, `orch-arc42`,
  `orch-blueprint`, `orch-architecture`, `orch-repo` — run: **Personal Validation →
  Create Pull Request → GitHub Issue Update → Summary** (no Build & Test or QA Validation, because they
  produce no runnable code change).
- **`orch-fallback`** has no fixed tier: it runs the code-modifying tier when its Routing
  Check determines a code-modifying change kind, and the documentation/config tier
  otherwise. It reports the resolved tier's phase names in `start_run`.
- **Session Handoff belongs to no tier.** It is an interrupt rather than a step: it fires
  whenever the run-level context gauge reaches the handoff threshold, at whatever stage the
  run has reached, and the run then resumes on that same stage in a fresh session. See
  **Session Handoff** in `orch-execution-model.instructions.md`.

## Reference Convention

- Each skill ends with a `## Reference` section naming its own source location, for
  example ``Source skill location: `plugins/claude-desktop/skills/<skill>/SKILL.md` ``.

## Quality Checks

- [ ] Shared phase prose is edited in the file that owns it (see **Where Each Part
      Lives**), not copied into individual skills and not duplicated across those files.
- [ ] Each skill names its shared phases and links to this index.
- [ ] Build & Test runs before QA Validation and Personal Validation for code-modifying
      skills.
- [ ] Code-modifying orchestrations continue through Build & Test and QA Validation without
      extra confirmation prompts, stopping at Personal Validation for the user's decision.
- [ ] QA Validation depth matches the change kind (new functionality vs. bug/existing-flow
      verification vs. startup-only vs. skipped).
- [ ] Personal Validation waits for the user and uses no agent.
- [ ] The orchestration runs in one owner session; heavy work is delegated to sub-agents in
      the same worktree, and background sub-agents are used only for concurrent monitoring.
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
- [ ] Build & Test and QA Validation procedure lives only in `phase-build-test` and
      `phase-qa-validation`; the instruction files name them without restating them.
- [ ] A run hands off to a fresh session when the context gauge reaches the handoff
      threshold, instead of running on until compaction interrupts it — with the gating
      decisions and the handoff note persisted on the run before the session ends.
- [ ] A resumed session reads the handoff note off the run before re-deriving context it
      was already handed.
