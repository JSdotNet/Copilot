---
name: capture-bounded-context
description: 'Capture direction, bounded-context kind: read an implemented module or service boundary and scaffold or refresh a whole .domain/<context>/ folder — domain.md, features.md, model.md, flow.md, dependencies.md, naming.md — plus its context-map.md entry and order. Use when: a module exists with no bounded context folder, the context map is missing a context, dependencies between contexts are undocumented, document the bounded contexts we built. Reads source and tests as evidence and routes the write through orch-domain. DO NOT USE FOR: turning an agreed but unbuilt bounded-context chapter into work (use build-bounded-context), or for the aggregate, feature, or building-block chapters around it (use the matching capture-* skill).'
---

# Capture a bounded context from code

## Purpose

A module, service, or subsystem exists with its own model and its own language,
and `.domain/` does not have a folder for it — or has one whose
`dependencies.md`, `model.md`, or reading `order` no longer matches the code.
This skill reads the boundary, establishes what the context is, and routes the
whole folder through `orch-domain`.

This kind operates at **file level**. Its `type` values are the file-level ones
— `domain`, `features`, `model`, `flow`, `dependencies`, `naming`, and
`context-map` at the `.domain` root — because a bounded context is not a chapter
inside a file, it is the folder. The chapters inside it are the other kinds'
scope.

A context folder is created **whole**. Creating only `domain.md` leaves the
folder malformed: `domain.md` is the folder's root document and its `order`
lists the rest, so the rest has to exist.

Read `assets/code-sync-protocol.md` before starting. It carries the counterpart
resolution ladder, the evidence rules, the five-way drift verdict, the status
rules, index regeneration, and the report table — none of which are repeated
here.

## Inputs

- **Target boundary.** The module, project, service, or namespace root that is
  the candidate context, or the context name if it is already agreed.
- **Repository root.** Default to the current working directory.

If the repository has no `.domain/` folder, stop and run `knowledge-base-init`
first for the `.domain` adoption path — that is what creates `context-map.md` as
the root document.

## Spec-to-code mapping

The context folder's files and the code that evidences each one:

| Chapter element | Code and test evidence |
|---|---|
| The context itself | A boundary with its own language: a project or module root, an assembly, a database schema, a deployable unit, or a namespace root whose types do not leak. A folder is not a boundary — shared types crossing it freely mean there is one context, not two |
| `domain.md` | The aggregate roots, domain services, and domain events inside the boundary. This pass establishes the inventory; the chapters are the other kinds' passes |
| `features.md` | The user-facing capabilities the boundary delivers — endpoints, screens, commands, jobs reachable within it |
| `model.md` | The structural relationships between the boundary's types, as a Mermaid class diagram: ownership, cardinality, and which references are id-only |
| `flow.md` | State machines and process sequences the boundary actually has — status transitions, saga steps, scheduled progressions. Omit the file entirely when there is no flow |
| `dependencies.md` | Outbound and inbound cross-context relationships: project references, HTTP or gRPC clients, message subscriptions and publications, shared database access, and translator or adapter types that indicate an anti-corruption layer |
| `naming.md` | The boundary's vocabulary and the surface names each term wears — the registry every later counterpart resolution starts from |
| `context-map.md` | The context added to the subdomain landscape and the context map at the `.domain` root, with its `order` entry |

The DDD relationship semantics in `dependencies.md` are observable, and vague
integration prose is what this file exists to replace. A translator type that
maps another context's shape into this one is an **anti-corruption layer**. A
consumer that must accept whatever the producer publishes is
**Customer/Supplier**. A published contract with its own package or schema is
**OHS + Published Language**. Two contexts changing together with no translation
are a **Partnership**. Name the pattern and cite the mechanism.

A dependency that crosses the boundary with no anti-corruption layer or
published language is a finding worth flagging explicitly, per the folder rules.

## Workflow

1. **Load governed context.** Read `assets/code-sync-protocol.md`,
   `knowledge-domain.instructions.md`, and
   `knowledge-chapter-metadata.instructions.md`. Read `.domain/context-map.md`,
   the existing context folders' names, and any existing files in the target
   folder. Read `.arc42/05-building-block-view.md` when it exists — it usually
   names the boundary already.

2. **Resolve the counterpart.** Work the resolution ladder from the protocol:
   `naming.md` aliases first, then `.arc42/05-building-block-view.md`, then the
   observed naming convention. Record which rung matched. Stop at `unresolved`
   if the ladder yields no single candidate or more than one.

3. **Read the implementation and its tests.** Read the boundary's project
   structure, its project references and package dependencies, its persistence
   mappings and schema, its inbound and outbound integration points, and the
   tests that cross the boundary. Apply the protocol's evidence rules without
   exception: code that executes and tests that pass are evidence; comments,
   TODOs, doc comments, and disabled tests are not.

   Then read the unit tests deliberately — they are where rules and the
   ubiquitous language are stated most precisely, and the part of a capture pass
   most easily skimped. Mine them for:

   - **Architecture tests.** A reference or namespace-rule test is the strongest
     evidence of where the boundary is actually held, and its absence is worth
     recording — an undefended boundary erodes.
   - **Crossings.** Integration tests that span the candidate line enumerate the
     real crossings, which is what `dependencies.md` has to name a DDD pattern
     for.
   - **Language.** Test names on either side of the line show whether the two
     sides really speak different languages, which is what makes a boundary a
     bounded context rather than a folder.

   Two absences are informative and neither is evidence of behaviour: a rule
   with **no** test is recorded as thinly covered rather than with the
   confidence of a tested one, and a **disabled, skipped, or commented-out**
   test is not evidence at all — per the protocol it is a record of an
   intention, and a hint that the rule it asserts may not hold. Where a rule
   appears only in a disabled test, record it as an open question.

4. **Confirm the boundary is a boundary.** Establish that the candidate has its
   own language and its own model, not just its own folder. Types shared freely
   across the candidate line, a single shared persistence model, or the same
   term meaning the same thing on both sides all indicate one context rather
   than two. Report that rather than creating a folder for a boundary that is
   not one.

5. **Reach a verdict.** Compare what the code establishes against what the
   chapter currently says, and land on exactly one of the protocol's five
   verdicts. `code-ahead` is the case this skill exists for. On `spec-ahead`,
   stop and hand the scope to `build-bounded-context`. On `conflict`, stop and
   ask; never resolve it by overwriting the chapter.

6. **Draft the chapter.** Write to the template in
   `knowledge-domain.instructions.md`. The heading carries the bare name; the
   `meta` block carries the file-level values `domain`, `features`, `model`,
   `flow`, `dependencies`, and `naming`, plus `context-map` at the `.domain`
   root. A new chapter starts at `status: draft`; an existing chapter's `status`
   is left untouched. Include optional fields only where they have a value.

7. **Create the folder whole, and update the root.** Create `domain.md`,
   `features.md`, `model.md`, `dependencies.md`, and `naming.md` together, each
   with its file-level `meta` block and matching `type`. Add `flow.md` only when
   the context actually has a flow. Set `domain.md`'s `order` to list the rest,
   and add the context to `context-map.md`'s `order`. A missing `order` entry is
   a warning; a listed file that does not exist is an error.

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

- A complete `.domain/<context>/` folder written through `orch-domain`, with
  every file carrying its file-level `meta` block and matching `type`.
- `flow.md` present only when the context genuinely has a flow.
- `domain.md` as the folder's root document, with `order` listing the rest.
- `context-map.md` updated: the subdomain classification, the context map entry,
  and the root `order`.
- `dependencies.md` naming an explicit DDD pattern and integration mechanism per
  relationship, with contract references.
- Any boundary crossing without an anti-corruption layer or published language
  flagged.
- A chapter inventory for `domain.md` and `features.md`, with the follow-up
  capture pass named per chapter.
- `.domain/_meta/` regenerated and `--check` clean.
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
- Do not create a context folder for a boundary that is only a folder. A bounded
  context is a language boundary.
- Do not create `domain.md` alone. The folder is created whole, because
  `domain.md`'s `order` lists the rest.
- Do not create an empty `flow.md`. Omit the file when there is no flow.
- Do not put per-chapter `meta` blocks in `context-map.md`, `model.md`,
  `flow.md`, or `dependencies.md`. Their `##` sections carry none; the
  file-level block is the only metadata those files have.
- Do not write integration prose in place of a named DDD pattern.
- Do not forget `context-map.md`'s `order` — a listed file that does not exist
  is an error, and an unlisted one is a warning.
- Do not write the individual aggregate or feature chapter bodies here. Those
  have their own capture passes. `naming.md` term bodies have no dedicated pass:
  create the file with its file-level block, and leave the terms to be proposed
  by the capture passes that resolve a counterpart by inference, written through
  `orch-domain`.
- Do not hand-edit files under `_meta/`.
