---
name: build-term
description: 'Build direction, term kind: turn an agreed `type: term` chapter in .domain/<context>/naming.md whose canonical name the code does not use into a rename change brief plus a change category, then stop. Use when: code uses a synonym the naming registry deprecated, a term was renamed in the model but not in code, align code names with the ubiquitous language. Emits outcomes, invariants, ubiquitous language, out-of-scope, and acceptance checks; never edits source or test trees. DO NOT USE FOR: writing a chapter from a term that already exists in code (use capture-term), or for the aggregate, feature, bounded-context, or building-block chapters around it (use the matching build-* skill).'
---

# Build a term from its chapter

## Purpose

A canonical term is agreed in `.domain/<context>/naming.md`, and the code does
not use it — the concept still goes by one of the `aliases`, or by a name the
registry has dropped. This skill reads the chapter and produces a **change
brief** for aligning the code with the ubiquitous language: outcomes,
invariants, ubiquitous language, out of scope, acceptance checks, plus one
change category.

Then it stops. It does not name a delivery skill, does not perform a rename, and
does not touch a source or test tree.

This is the narrowest brief in the family, and the one most easily under-scoped.
A term lives on many surfaces — types, properties, database columns, wire
contracts, message payloads, consumer copies — and each surface has a different
cost and a different blast radius. The brief exists to make that list explicit
before anyone starts renaming.

Read `assets/code-sync-protocol.md` before starting. It carries the counterpart
resolution ladder, the evidence rules, the five-way drift verdict, the status
rules, and the change-brief contract — none of which are repeated here.

## Inputs

- **Target chapter.** The `type: term` chapter, as a `<path>#<heading-slug>`
  reference or by its canonical name.
- **Target bounded context.** Derived from the chapter's path.
- **Repository root.** Default to the current working directory.

## Chapter status gate

Check `status` before doing anything else, per the protocol's status rules:

- `active` — proceed.
- `draft` or `proposed` — stop and confirm. State what the chapter claims and
  that it is not yet agreed, then ask whether to build it as written or settle
  the chapter through `orch-domain` first.
- `deprecated` — do not build. Report it and stop.

## Spec-to-code mapping

What each part of the chapter has to become, and where to look to see whether it
is already there:

| Chapter element | What building it requires | Where to check |
|---|---|---|
| Heading (canonical term) | The canonical name used on every surface the brief puts in scope | Every site each alias appears at |
| Definition | The concept named consistently, with no residual synonym in the same surface | Mixed usage within one project or layer |
| `aliases` | Aliases that remain legitimate surface names kept; aliases the registry dropped renamed | The alias list against actual usage |
| `related` modelling chapter | The modelled type carrying the canonical name | `domain.md` and its counterpart |
| Persisted and wire surfaces | A decision per surface: rename, or keep and map | Database columns, contracts, message payloads, consumer copies |

Separate the surfaces by blast radius, and say so in the brief:

- **Internal code names** — types, members, locals. Renameable freely.
- **Persisted names** — columns, table names, document fields. A rename is a
  migration.
- **Wire and contract names** — API fields, message payloads, published language
  entries. A rename is a breaking change for consumers this context does not
  own.
- **Consumer-side copies** — another context's local name for the same concept.
  Often legitimately different, and recorded as an alias rather than renamed.

A brief that says "rename X to Y" without this split will either stall on the
first migration or break a consumer. Renaming a wire name is a
published-language change and belongs with `dependencies.md`, not with an
internal tidy-up.

## Workflow

1. **Load governed context.** Read `assets/code-sync-protocol.md`,
   `knowledge-domain.instructions.md`, and
   `knowledge-chapter-metadata.instructions.md`. Read the target chapter, the
   `related` modelling chapter, the context's `dependencies.md` for
   published-language entries carrying the name, and `.domain/context-map.md`
   when consumers are in other contexts.

2. **Apply the status gate.** Above. Do not proceed past a `draft`, `proposed`,
   or `deprecated` chapter without the stated confirmation.

3. **Resolve the counterpart.** Work the protocol's resolution ladder to
   establish whether the counterpart exists in code at all, and if so in what
   form. Record which rung matched. This determines the change category: no
   counterpart is `new functionality`; a counterpart that works but does less is
   `change to existing behaviour`; a counterpart that is supposed to already
   satisfy an agreed chapter and does not is a `defect`.

4. **Read what already exists.** Find every site of every alias, and classify
   each by surface: internal code, persisted, wire or contract, or consumer-side
   copy. The brief must not ask for work that is already done. Apply the
   protocol's evidence rules: a passing test is evidence the rule holds; a
   disabled test or a TODO promising it is not.

5. **Reach a verdict.** Land on exactly one of the protocol's five verdicts.
   `spec-ahead` is the case this skill exists for. On `aligned`, stop and say
   so. On `code-ahead`, stop and hand the scope to `capture-term`; the chapter
   is stale, not unbuilt. On `conflict`, stop and ask — a conflict never becomes
   a `defect` brief on this skill's own authority.

6. **Extract the ubiquitous language.** State the canonical term and the aliases
   that stay legitimate, so the change does not delete a name that is correct on
   its own surface.

7. **Draw the out-of-scope boundary.** Name what this change does not do:
   surfaces deliberately left alone, consumer contexts not being touched, and
   any modelling change — a rename is not a remodelling. An unstated boundary is
   the one that gets crossed.

8. **Derive the acceptance checks.** Turn the alignment into statements a test
   or a check can assert — that no in-scope surface still uses the dropped name,
   that persisted and wire surfaces behave identically before and after, and
   that the aliases the registry keeps are still resolvable. State what the
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
- Every site grouped by surface: internal code, persisted, wire or contract,
  consumer-side copy.
- A per-surface decision: rename, or keep the name and record it as an alias.
- Migration work called out where a persisted name changes.
- Breaking-change impact called out where a wire or contract name changes,
  naming the consumers affected.
- The aliases that remain legitimate, so they are not swept up in the rename.
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
- Do not brief a flat rename across all surfaces. Split them by blast radius.
- Do not brief a wire or contract rename as an internal change. It is a
  published-language change affecting consumers this context does not own.
- Do not brief renaming a consumer context's local copy. That is that context's
  decision, and the alias exists to accommodate it.
- Do not turn a rename into a remodelling. Changing what the concept means is
  `orch-domain` work, not this brief.
- Do not omit the migration when a persisted name changes.
