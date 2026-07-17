---
name: pr-review-domain
description: >
  Review a pull request from the Domain Architect perspective: validate that code changes
  respect ubiquitous language, bounded context boundaries, aggregate invariants, domain event
  naming, and domain layer purity. Use when reviewing a PR that touches domain model, aggregates,
  events, or business logic in the Fincent codebase.
---

# PR Review — Domain Architect

## Purpose and Trigger Conditions

Use this skill when a pull request touches the Fincent domain layer — aggregates, entities,
value objects, domain events, domain policies, or bounded context boundaries. The focus is
purely on domain model correctness; infrastructure, API, and UI concerns are out of scope.

## Input Expectations

- PR number, branch name, or diff to review.
- Optional: linked Jira story key for context.
- Optional: domain model documentation or bounded context map.
- Optional: ubiquitous language glossary.

## Workflow

1. Load the PR diff. Focus on files in the domain layer:
   `**/Domain/**`, `**/Aggregates/**`, `**/Events/**`, `**/Policies/**`, `**/ValueObjects/**`.
   If no Jira retrieval skill is available and a story key was provided, ask the user to
   paste the story description for context.
2. For each changed file in the domain layer, evaluate the criteria below.
3. Produce a structured finding per criterion.
4. Provide an overall domain readiness verdict with prioritised list of required changes.

## Review Criteria

### Ubiquitous Language
- Are all class names, method names, property names, and event names using terms from the
  Fincent ubiquitous language?
- Are any abbreviations, technical synonyms, or generic terms used where domain terms exist?
- Flag any term that would not be understood the same way by a domain expert and a developer.

### Bounded Context Ownership
- Do the changed files belong to a single bounded context?
- Is there any direct dependency on types from another bounded context (instead of integration
  events or anti-corruption layer)?
- Are cross-context interactions mediated by published language / integration events only?

### Aggregate and Entity Design
- Are aggregate roots correctly identified — no direct references to internal entities from
  outside the aggregate?
- Do command handlers modify state only through the aggregate root?
- Are aggregate invariants enforced inside the aggregate (not in the application layer)?
- Are value objects used where identity is irrelevant (e.g., Money, Address, DateRange)?

### Domain Events
- Are all domain events named in past tense using ubiquitous language terms
  (e.g., `PaymentInitiated`, `InvoiceApproved`)?
- Do events carry only the data needed by consumers — no internal aggregate state leaked?
- Are events raised inside the aggregate, not in the application or infrastructure layer?

### Domain Layer Purity
- Does the domain layer contain any infrastructure concerns (EF annotations on domain entities,
  HTTP clients, loggers, repository implementations)?
- Are domain services free of application orchestration or persistence logic?
- Are domain policies and business rules modelled explicitly, not scattered as conditionals in
  application services?

## Output Expectations

- Per-file or per-change finding for each violated criterion.
- Verdict per criterion: ✅ (compliant), ⚠️ (minor issue), ❌ (violation that must be fixed).
- Overall domain verdict:
  - ✅ **Domain ready** — PR can be merged from a domain perspective.
  - ⚠️ **Minor issues** — suggestions that do not block merge but should be addressed soon.
  - ❌ **Domain violation** — changes contradict the domain model; must be reworked before merge.
- Concrete correction per ⚠️ or ❌: exact rename, refactor move, or pattern to apply.

## Quality Checks

- Only comment on domain layer files — do not review infrastructure, API, or UI code here.
- Every domain term is verified; never assume a name is correct without checking the glossary
  or existing codebase conventions.
- Do not overlap with architecture or PO concerns — stay focused on domain model correctness.

## References

- `resources/dor.md` — Fincent Definition of Ready (domain section)
