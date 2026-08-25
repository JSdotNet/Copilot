---
name: build-bounded-context
description: 'Build direction, bounded-context kind: turn an agreed but unbuilt .domain/<context>/ folder into a change brief plus a change category for establishing the boundary, then stop. Use when: a bounded context is modelled but no module implements it, the context map names a context that does not exist in code, an anti-corruption layer is agreed but absent, build the bounded context we agreed. Emits outcomes, invariants, ubiquitous language, out-of-scope, and acceptance checks; never edits source or test trees. DO NOT USE FOR: writing a chapter from a bounded-context that already exists in code (use capture-bounded-context), or for the aggregate, feature, or building-block chapters around it (use the matching build-* skill).'
---

# Build a bounded context from its folder

## Purpose

A bounded context is modelled in `.domain/<context>/` and agreed, and the code
has no boundary corresponding to it — or has one whose dependencies violate what
`dependencies.md` states. This skill reads the folder and produces a **change
brief** for establishing the boundary: outcomes, invariants, ubiquitous
language, out of scope, acceptance checks, plus one change category.

Then it stops. It does not name a delivery skill, does not choose a module or
service topology, and does not touch a source or test tree.

This is the largest brief in the family, and it must not be mistaken for the sum
of its chapters. What it briefs is the **boundary**: where the line runs, what
crosses it and how, and what must not cross. The aggregates, features, and terms
inside it each have their own build pass, and the brief names them as follow-on
work rather than absorbing them.

Read `assets/code-sync-protocol.md` before starting. It carries the counterpart
resolution ladder, the evidence rules, the five-way drift verdict, the status
rules, and the change-brief contract — none of which are repeated here.

## Inputs

- **Target context folder.** `.domain/<context>/`, as a path or a context name.
- **Repository root.** Default to the current working directory.

The status gate applies to the folder's **file-level** `status` values. A
context whose `domain.md` is `draft` is not an agreed boundary.

## Chapter status gate

Check `status` before doing anything else, per the protocol's status rules:

- `active` — proceed.
- `draft` or `proposed` — stop and confirm. State what the chapter claims and
  that it is not yet agreed, then ask whether to build it as written or settle
  the chapter through `orch-domain` first.
- `deprecated` — do not build. Report it and stop.

## Spec-to-code mapping

What each file in the folder has to become, and where to look to see whether it
is already there:

| Chapter element | What building it requires | Where to check |
|---|---|---|
| The context itself | A code boundary that holds the model and does not leak its types: a project, module, assembly, schema, or deployable unit | The existing project structure and namespace roots |
| `dependencies.md` outbound | Each outbound relationship implemented with the named DDD pattern and mechanism — including a translator where the pattern is an anti-corruption layer | Existing project references, clients, and subscriptions |
| `dependencies.md` inbound | Each documented dependent able to consume what it relies on, through the named contract | Existing published contracts and their consumers |
| `dependencies.md` absences | No dependency crossing the boundary except the documented ones — this is the boundary's real invariant | Every reference crossing the candidate line today |
| `domain.md` inventory | The aggregates, services, and events existing inside the boundary — each its own build pass | The chapters and their counterparts |
| `features.md` inventory | The capabilities the boundary delivers — each its own build pass | The chapters and their counterparts |
| `naming.md` | The vocabulary used inside the boundary, with no synonym leaking in from a neighbour | Existing type and field names near the line |

The strongest acceptance check for a bounded context is **negative**: no
dependency crosses the boundary except the ones `dependencies.md` documents.
That is checkable — by project reference, by namespace rule, by an architecture
test — and it is the check that keeps the boundary a boundary after the first
delivery. Put it in the brief.

Where the boundary already exists but its dependencies violate
`dependencies.md`, the category is `change to existing behaviour` and the work
is mostly introducing translation at the crossings. List the crossings.

## Workflow

1. **Load governed context.** Read `assets/code-sync-protocol.md`,
   `knowledge-domain.instructions.md`, and
   `knowledge-chapter-metadata.instructions.md`. Read every file in the target
   context folder, plus `.domain/context-map.md` for the strategic relationships
   and `.arc42/05-building-block-view.md` for where the boundary would sit in
   the architecture.

2. **Apply the status gate.** Above. Do not proceed past a `draft`, `proposed`,
   or `deprecated` chapter without the stated confirmation.

3. **Resolve the counterpart.** Work the protocol's resolution ladder to
   establish whether the counterpart exists in code at all, and if so in what
   form. Record which rung matched. This determines the change category: no
   counterpart is `new functionality`; a counterpart that works but does less is
   `change to existing behaviour`; a counterpart that is supposed to already
   satisfy an agreed chapter and does not is a `defect`.

4. **Read what already exists.** Establish what exists today at and across the
   candidate line: the project structure, every reference crossing it, the
   persistence model, and the integration points. Read the architecture tests,
   if any, that already constrain it. The brief must not ask for work that is
   already done. Apply the protocol's evidence rules: a passing test is evidence
   the rule holds; a disabled test or a TODO promising it is not.

5. **Reach a verdict.** Land on exactly one of the protocol's five verdicts.
   `spec-ahead` is the case this skill exists for. On `aligned`, stop and say
   so. On `code-ahead`, stop and hand the scope to `capture-bounded-context`;
   the chapter is stale, not unbuilt. On `conflict`, stop and ask — a conflict
   never becomes a `defect` brief on this skill's own authority.

6. **Extract the ubiquitous language.** Collect the context's vocabulary from
   `naming.md` with aliases, and note the neighbouring contexts' terms that must
   **not** appear inside the boundary untranslated.

7. **Draw the out-of-scope boundary.** Name what this change does not do: every
   aggregate, feature, and term chapter inside the folder — each its own build
   pass — and the neighbouring contexts' internals. An unstated boundary is the
   one that gets crossed.

8. **Derive the acceptance checks.** State the positive checks — the boundary
   exists, each documented dependency works through its named pattern — and the
   negative one: nothing crosses the boundary that `dependencies.md` does not
   document, assertable as an architecture or reference test. State what the
   tests must establish; do not write them.

9. **Emit the change brief and stop.** Assemble the five parts and the change
   category per the protocol. Then stop. Do not open a source file for editing,
   do not create a test, do not name a delivery orchestration.

10. **Report.** Close with the protocol's report table, one row per chapter in
    scope, with the brief attached.

## Output expectations

- Exactly one change category: `new functionality`,
  `change to existing behaviour`, or `defect`, with the reasoning for it.
- **Outcomes**, **invariants**, **ubiquitous language**, **out of scope**, and
  **acceptance checks**, as the protocol defines them.
- The boundary stated as a line, with what may cross it and by which named DDD
  pattern and mechanism.
- A negative acceptance check: no undocumented dependency crosses the boundary.
- Every existing crossing that violates `dependencies.md` listed, since
  introducing translation at each one is the work.
- The chapters inside the folder named as follow-on build passes, not absorbed
  into this brief.
- The neighbouring contexts' terms that must not appear untranslated inside the
  boundary.
- The protocol's report table, with the verdict and the evidence behind it.
- No change to any file in the repository.

## Do not

- Do not edit source code, test code, project files, or infrastructure files.
  This skill emits a brief.
- Do not name a code-side delivery or orchestration skill of any kind. The brief
  stops at the brief; which flow picks it up is the user's decision, made after
  reading it.
- Do not edit the chapter. Building a chapter does not change it — if the
  chapter is wrong, that is a `conflict` or a `code-ahead` verdict, not an edit.
- Do not build from a `draft` or `proposed` chapter without explicit
  confirmation, and never from a `deprecated` one.
- Do not turn a `conflict` into a `defect` brief. Stop and ask which side is
  wrong.
- Do not ask for work that already exists — read the counterpart first.
- Do not treat a TODO, a comment, or a disabled test as proof that something is
  already built.
- Do not absorb the folder's chapters into this brief. The boundary is the
  scope; the aggregates, features, and terms are their own passes.
- Do not choose a topology — module, library, separate service, separate
  database. The brief states the boundary and what crosses it.
- Do not omit the negative acceptance check. Without it the boundary erodes on
  the first delivery.
- Do not brief a neighbouring context's internals. Only the crossings are in
  scope.
- Do not proceed when the folder's file-level `status` values are `draft`. A
  boundary is expensive to move; confirm it first.
