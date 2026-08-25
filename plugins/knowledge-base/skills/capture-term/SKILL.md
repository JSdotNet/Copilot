---
name: capture-term
description: 'Capture direction, term kind: read the surface names a concept wears in code and write or refresh its `type: term` chapter in .domain/<context>/naming.md, with every discovered synonym as an alias. Use when: code uses several names for one concept, a term has no naming entry, aliases are stale after a rename, build the ubiquitous language registry from code. Reads source and tests as evidence and routes the write through orch-domain. DO NOT USE FOR: turning an agreed but unbuilt term chapter into work (use build-term), or for the aggregate, feature, bounded-context, or building-block chapters around it (use the matching capture-* skill).'
---

# Capture a term from code

## Purpose

A domain concept appears in code under several names — a class name, an id
field, a DTO property, a consumer context's local copy — and
`.domain/<context>/naming.md` has no chapter reconciling them, or has one whose
`aliases` went stale after a rename. This skill reads the surface names, settles
the canonical term, and routes a grounded chapter through `orch-domain`.

This kind is the backbone of every other pass in this family. Counterpart
resolution starts at `naming.md` aliases, so a well-populated naming registry is
what lets every other capture and build skill pair a chapter to code on the
first rung instead of inferring from convention. Running this kind first, over a
context, pays for itself.

The canonical term is the **business** name, not the most frequent code name. A
synonym that appears in two hundred files is still a synonym.

Read `assets/code-sync-protocol.md` before starting. It carries the counterpart
resolution ladder, the evidence rules, the five-way drift verdict, the status
rules, index regeneration, and the report table — none of which are repeated
here.

## Inputs

- **Target bounded context.** The `.domain/<context>/` folder whose `naming.md`
  gains or updates the chapter.
- **Target concept or concepts.** One term, or a sweep over the context's
  vocabulary.
- **Repository root.** Default to the current working directory.

A sweep over a whole context is the most useful scope here, because a term's
value comes from having every synonym in one place.

## Spec-to-code mapping

The term chapter's parts and the code that evidences each one:

| Chapter element | Code and test evidence |
|---|---|
| Heading (the canonical term) | The business name for the concept, taken from `domain.md`, `features.md`, or the language the tests and product copy use — not the most common code identifier |
| Definition | What the concept means, established from the type it names and the operations on it |
| `aliases` | Every surface name found for the same concept: class and interface names, property names, snake_case or camelCase id fields, database column and table names, DTO and contract field names, message payload fields, and a consuming context's local copy name |
| `related` | The chapter where the concept is modelled — usually a `domain.md` aggregate, entity, value object, or event |
| Alias context | Where each alias appears, so a reader knows which surface they are looking at: code identifier, persisted column, wire contract, consumer copy |

Two names are aliases of one term only when they denote the **same concept**. A
`CustomerId` on an order and a `CustomerId` in a billing context may be the same
concept or two different ones, and only the model says which. Recording an
unrelated name that happens to collide is worse than recording nothing: every
later counterpart resolution starts from `aliases` and will follow the bad
entry.

Aliases are plain strings, not `<path>#<heading-slug>` references. The link to
the modelling chapter is carried by `related` instead.

## Workflow

1. **Load governed context.** Read `assets/code-sync-protocol.md`,
   `knowledge-domain.instructions.md`, and
   `knowledge-chapter-metadata.instructions.md`. Read only the target context's
   `naming.md`, `domain.md`, and `features.md`, plus `.domain/context-map.md`
   and `dependencies.md` when the term crosses a context boundary.

2. **Resolve the counterpart.** Work the resolution ladder from the protocol:
   `naming.md` aliases first, then `.arc42/05-building-block-view.md`, then the
   observed naming convention. Record which rung matched. Stop at `unresolved`
   if the ladder yields no single candidate or more than one.

3. **Read the implementation and its tests.** Search for each candidate name
   across source, tests, persistence mappings, contracts, and message payloads.
   Read enough of each site to confirm it denotes the same concept and is not a
   collision. Apply the protocol's evidence rules without exception: code that
   executes and tests that pass are evidence; comments, TODOs, doc comments, and
   disabled tests are not.

   Then read the unit tests deliberately — they are where rules and the
   ubiquitous language are stated most precisely, and the part of a capture pass
   most easily skimped. Mine them for:

   - **The business name.** Test and scenario names are written by people
     describing behaviour rather than naming types, so they carry the business
     term more often than production code does. This is frequently the best
     evidence for which name is canonical.
   - **Aliases.** Test fixtures and builders name the same concept again, and
     often differently from the type under test — a further surface worth
     recording.
   - **Collisions.** A test that uses one name for two different concepts is
     direct evidence of a collision, which is reported rather than folded in as
     an alias.

   Two absences are informative and neither is evidence of behaviour: a rule
   with **no** test is recorded as thinly covered rather than with the
   confidence of a tested one, and a **disabled, skipped, or commented-out**
   test is not evidence at all — per the protocol it is a record of an
   intention, and a hint that the rule it asserts may not hold. Where a rule
   appears only in a disabled test, record it as an open question.

4. **Settle the canonical term.** Choose the business name, from `domain.md`,
   `features.md`, product-facing copy, or the language acceptance tests use.
   Frequency in code is not a criterion. Where the business name is genuinely
   unclear, record the candidates as an open question rather than promoting a
   code identifier by default.

5. **Reach a verdict.** Compare what the code establishes against what the
   chapter currently says, and land on exactly one of the protocol's five
   verdicts. `code-ahead` is the case this skill exists for. On `spec-ahead`,
   stop and hand the scope to `build-term`. On `conflict`, stop and ask; never
   resolve it by overwriting the chapter.

6. **Draft the chapter.** Write to the template in
   `knowledge-domain.instructions.md`. The heading carries the bare name; the
   `meta` block carries `status` and `type: term`, plus `aliases` and a
   `related` reference to where the term is modelled. A new chapter starts at
   `status: draft`; an existing chapter's `status` is left untouched. Include
   optional fields only where they have a value.

7. **Verify each alias denotes the same concept.** For every alias, confirm from
   its usage that it is the same concept and not a name collision. Drop the ones
   that are not, and note the collision — a name meaning two things in one
   context is worth knowing.

8. **Route the write through `orch-domain`.** Hand over the drafted content and
   the evidence behind each claim. `orch-domain` owns template conformance, the
   metadata blocks, and the consistency review. Do not write `.domain/` files
   directly.

9. **Regenerate and validate.** After the write lands, per the protocol:

   ```bash
   node .github/tools/knowledge-meta/build.mjs --scope .domain
   node .github/tools/knowledge-meta/build.mjs --scope .domain --check
   ```

10. **Report.** Close with the protocol's report table, one row per chapter
    touched or checked, including the `aligned` ones.

## Output expectations

- One `type: term` chapter per concept in `.domain/<context>/naming.md`, written
  through `orch-domain`.
- The canonical term chosen as the business name, not the most frequent
  identifier.
- `aliases` listing every verified surface name, as plain strings.
- `related` pointing at the chapter where the concept is modelled.
- Name collisions reported rather than folded in as aliases.
- A note of which surface each alias belongs to, where that is not obvious.
- The protocol's report table, with the `aligned` rows included.

## Do not

- Do not edit source or test code. This direction only reads it.
- Do not write `.domain/` files directly — the write routes through
  `orch-domain`.
- Do not treat a comment, a TODO, a doc comment, or a disabled test as evidence
  of behaviour.
- Do not set `status: active` because the implementation exists. Code existing
  is not agreement that the code is the intended model.
- Do not resolve a `conflict` verdict by rewriting the chapter to match the
  code. Stop and put the decision to the user.
- Do not promote a code identifier to canonical because it is the most common.
  The canonical term is the business name.
- Do not add an alias for a name that merely collides. Every later counterpart
  resolution will follow it.
- Do not write `aliases` entries as `<path>#<heading-slug>` references. They are
  plain strings; `related` carries the link.
- Do not omit `related`. A term with no modelling chapter cannot be resolved
  back to the model.
- Do not add `feature-flag` or `depends-on` to a `naming.md` chapter. Neither
  applies to a term.
- Do not hand-edit files under `_meta/`.
