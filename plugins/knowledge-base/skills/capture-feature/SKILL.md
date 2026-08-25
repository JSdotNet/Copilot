---
name: capture-feature
description: 'Capture direction, feature kind: read a shipped capability and write or refresh its `type: feature` or `type: sub-feature` chapter in .domain/<context>/features.md, including feature-flag and depends-on. Use when: a capability ships but features.md does not list it, the feature breakdown is stale, a feature flag has no chapter, document the features we built. Reads source and tests as evidence and routes the write through orch-domain. DO NOT USE FOR: turning an agreed but unbuilt feature chapter into work (use build-feature), or for the aggregate, domain-service, term, or bounded-context chapters around it (use the matching capture-* skill).'
---

# Capture a feature from code

## Purpose

A capability is shipped and reachable by users, and
`.domain/<context>/features.md` does not describe it — or describes a
sub-feature breakdown the product has since outgrown. This skill reads the
implementation, states the capability in business language, and routes a
grounded chapter through `orch-domain`.

`features.md` is written in **business and ubiquitous language**, not
implementation terms. The evidence comes from code, but the chapter does not
describe endpoints, controllers, or components — it describes what the product
lets someone do and the value that delivers. A chapter that lists routes has
captured the wrong thing.

Feature chapters are the only `.domain` chapters that carry `depends-on` and
`feature-flag`, and both need care.

Read `assets/code-sync-protocol.md` before starting. It carries the counterpart
resolution ladder, the evidence rules, the five-way drift verdict, the status
rules, index regeneration, and the report table — none of which are repeated
here.

## Inputs

- **Target bounded context.** The `.domain/<context>/` folder whose
  `features.md` gains or updates the chapter.
- **Target capability.** Named as a feature heading, a flag key, or a described
  user-facing behaviour.
- **Repository root.** Default to the current working directory.

## Spec-to-code mapping

The feature chapter's parts and the code that evidences each one:

| Chapter element | Code and test evidence |
|---|---|
| Heading (the bare name) | The capability's name in business language, reconciled with `naming.md` — not the controller, component, or flag name |
| Capability description | What a user can now do, established from the reachable paths through the application: endpoints, screens, commands, jobs |
| Business value | Why the capability exists, as far as the code and tests support it. Where they do not, leave it as an open question rather than inventing a rationale |
| Sub-features | Distinguishable parts of the capability that a user would name separately, each becoming a `###` chapter with `type: sub-feature` |
| `feature-flag` | The flag key actually checked in code to gate this capability. One key, or several when several flags together deliver the chapter |
| `depends-on` | Other features in `features.md` that must be delivered before this one — established from a genuine ordering constraint, not from a code reference |
| `related` | The `domain.md` aggregates, events, and services the capability exercises |

The `feature-flag` link is an **identity** link only: it says this chapter and
that flag are the same capability. It is deliberately **not** a status mapping.
The chapter's `status` describes how settled the written model is; the flag's
own maturity describes whether the running behaviour can be relied on. Never
translate one into the other, in either direction — a flag at 100% rollout does
not make a chapter `active`, and a `draft` chapter does not mean the flag is
unsafe.

`depends-on` records delivery ordering between features, not code coupling. Two
features that share an aggregate are not dependent; a feature that cannot ship
until another one exists is. When the ordering is not evident, omit the field.

## Workflow

1. **Load governed context.** Read `assets/code-sync-protocol.md`,
   `knowledge-domain.instructions.md`, and
   `knowledge-chapter-metadata.instructions.md`. Read only the target context's
   `features.md` and `naming.md`, plus `domain.md` for the aggregates the
   capability exercises.

2. **Resolve the counterpart.** Work the resolution ladder from the protocol:
   `naming.md` aliases first, then `.arc42/05-building-block-view.md`, then the
   observed naming convention. Record which rung matched. Stop at `unresolved`
   if the ladder yields no single candidate or more than one.

3. **Read the implementation and its tests.** Trace the reachable user-facing
   paths — endpoints, screens, commands, scheduled jobs — and the flag checks
   that gate them, then read the tests that describe the behaviour in user
   terms. Acceptance and end-to-end test names are often the best available
   statement of a capability in business language. Apply the protocol's evidence
   rules without exception: code that executes and tests that pass are evidence;
   comments, TODOs, doc comments, and disabled tests are not.

   Then read the unit tests deliberately — they are where rules and the
   ubiquitous language are stated most precisely, and the part of a capture pass
   most easily skimped. Mine them for:

   - **Scope.** The set of scenarios covered maps closely onto the sub-features
     the chapter should list; a scenario nobody tests is worth noting as thinly
     covered.
   - **Flag behaviour.** A test that runs the same scenario with the flag on and
     off establishes what the flag actually gates — which is the identity link
     the chapter records, and never a statement about the chapter status.
   - **Outcomes, not routes.** Where a test names an endpoint rather than a
     capability, it is evidence of the path but not of the feature. Keep the
     chapter in business language.

   Two absences are informative and neither is evidence of behaviour: a rule
   with **no** test is recorded as thinly covered rather than with the
   confidence of a tested one, and a **disabled, skipped, or commented-out**
   test is not evidence at all — per the protocol it is a record of an
   intention, and a hint that the rule it asserts may not hold. Where a rule
   appears only in a disabled test, record it as an open question.

4. **Translate into business language.** Restate what the code does as what the
   product lets someone do, using the context's `naming.md` terms. Drop every
   implementation noun. If the capability cannot be stated without naming a
   technical artifact, the scope is probably an implementation detail rather
   than a feature — say so instead of writing a technical chapter.

5. **Reach a verdict.** Compare what the code establishes against what the
   chapter currently says, and land on exactly one of the protocol's five
   verdicts. `code-ahead` is the case this skill exists for. On `spec-ahead`,
   stop and hand the scope to `build-feature`. On `conflict`, stop and ask;
   never resolve it by overwriting the chapter.

6. **Draft the chapter.** Write to the template in
   `knowledge-domain.instructions.md`. The heading carries the bare name; the
   `meta` block carries `status` and `type: feature` — or `type: sub-feature`
   for a chapter grouped under a parent. A new chapter starts at
   `status: draft`; an existing chapter's `status` is left untouched. Include
   optional fields only where they have a value.

7. **Set `feature-flag` and `depends-on` deliberately.** Record `feature-flag`
   only from a flag key actually checked in code, and only as an identity link.
   Record `depends-on` only where a real delivery ordering exists between
   features. Omit either field when it has no value — an empty list is not
   written out.

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

- One `type: feature` chapter — with `type: sub-feature` `###` chapters where
  the capability has distinguishable parts — in `.domain/<context>/features.md`,
  written through `orch-domain`.
- The capability stated in business language, with no implementation nouns.
- `feature-flag` set only from a flag key actually checked in code, as an
  identity link.
- `depends-on` set only where a genuine delivery ordering exists between
  features.
- `related` pointing at the `domain.md` chapters the capability exercises.
- Business value grounded, or left as an open question rather than invented.
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
- Do not write endpoints, controllers, components, or table names into
  `features.md`. It is business language.
- Do not infer the chapter's `status` from the feature flag's maturity, or the
  flag's state from the chapter's `status`. The link is identity only.
- Do not set `depends-on` from a code reference or a shared aggregate. It
  records delivery ordering.
- Do not invent a business rationale the code and tests do not support.
- Do not write out an empty `feature-flag`, `depends-on`, or `related` field.
- Do not create a feature chapter for an implementation detail that cannot be
  stated as something a user can do.
- Do not hand-edit files under `_meta/`.
