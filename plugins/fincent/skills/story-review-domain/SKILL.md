---
name: story-review-domain
description: >
  Review a Fincent user story from the Domain Architect perspective: validate ubiquitous
  language, bounded context ownership, aggregate alignment, domain events, and DDD correctness.
---

# Story Review — Domain Architect

## Purpose and Trigger Conditions

Use this skill when a domain architect or domain expert needs to evaluate whether a story is
correctly modelled against the Fincent domain, uses correct ubiquitous language, and respects
bounded context boundaries and invariants.

## Input Expectations

- The user story to review (Jira link, ID, or pasted content).
- Optional: domain model documentation or bounded context map.
- Optional: ubiquitous language glossary.
- Optional: codebase location for domain layer inspection.

## Workflow

1. Load the story content. If only a Jira ID is provided, ask the user to paste the story.
2. Load `resources/dor.md` to apply the Fincent Definition of Ready (domain section).
3. Load `resources/templates/story-review-checklist.md` (Domain Architect section).
4. Evaluate each Domain Architect criterion:

   ### Ubiquitous Language
   - Does the story use terms from the Fincent ubiquitous language glossary?
   - Are any non-standard or ambiguous terms used that could cause translation issues between
     business and engineering?

   ### Bounded Context Ownership
   - Which bounded context owns this story?
   - Is ownership unambiguous, or does the story straddle multiple contexts?
   - Is the integration contract between contexts defined if applicable?

   ### Aggregate and Entity Alignment
   - Which aggregate root is affected?
   - Does the story respect aggregate boundaries and invariants?
   - Are referenced entities within the aggregate's responsibility?

   ### Domain Events
   - Which domain events does this story produce or consume?
   - Are event names in past-tense ubiquitous language form (e.g., `PaymentInitiated`)?
   - Are event consumers identified?

   ### Domain Policies and Rules
   - Does the story introduce or modify a domain policy or business rule?
   - Is the rule modelled at the domain layer (not leaking into application or infrastructure)?

5. Classify each criterion as ✅, ⚠️, or ❌.
6. Produce overall domain readiness classification:
   - ✅ **Domain ready** — story is correctly modelled and can proceed.
   - ⚠️ **Needs clarification** — domain alignment issues require discussion before refinement.
   - ❌ **Domain misalignment** — the story contradicts domain model; must be reworked.
7. Provide concrete corrections for each ⚠️ or ❌ finding.

## Output Expectations

- Completed Domain Architect section of the story review checklist.
- Overall domain readiness classification with rationale.
- Corrected ubiquitous language terms and aggregate/event names where applicable.
- Prioritised list of domain corrections if the story is not ready.

## Quality Checks

- Every domain term in the story is verified against the ubiquitous language.
- Aggregate boundaries are never assumed — they are confirmed or flagged.
- Domain events are always in past tense and named in business language.
- Do not duplicate PO or architecture concerns — stay focused on domain correctness.

## References

- `resources/dor.md` — Fincent Definition of Ready
- `resources/templates/story-review-checklist.md` — review checklist
