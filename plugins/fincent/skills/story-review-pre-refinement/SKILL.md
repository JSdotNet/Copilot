---
name: story-review-pre-refinement
description: >
  Review a Fincent user story before sprint refinement: assess architectural readiness,
  identify hidden technical risks, determine if enabler stories are needed, and confirm
  the story is implementable as scoped. Requires PO review to have passed first.
---

# Story Review — Pre-Refinement (Architect)

## Pipeline Gate

> **Prerequisite**: The story must have passed both `story-review-po` (✅ or ⚠️) and
> `story-review-domain` (✅ or ⚠️) first.
> If either result is ❌, return **Not ready for pre-refinement** immediately — list the
> unresolved issues and do not proceed with this review.

## Purpose and Trigger Conditions

Use this skill after a story has passed both PO review and domain review. The focus is on
technical feasibility, architectural fit, and identifying infrastructure or enabler work
that must precede delivery.

## Input Expectations

- The user story to review (Jira key, link, or pasted content).
- PO review result (✅ or ⚠️) and domain review result (✅ or ⚠️) required to proceed.
- Optional: architecture documentation or ADR links.
- Optional: existing enabler stories or spikes.

## Workflow

1. Load the story content. If only a Jira key is provided and a Jira retrieval skill is
   available, use it to fetch the story. Otherwise ask the user to paste the story text.
2. **Gate check**: Confirm PO review result (✅ or ⚠️) and domain review result (✅ or ⚠️).
   If either is ❌, stop and output:
   > ❌ **Not ready for pre-refinement** — resolve the following issues first: {list blockers}.
3. Evaluate each Pre-Refinement criterion:

   ### Bounded Context Fit
   - Does the story belong to a single bounded context?
   - Are cross-context integrations explicitly defined with integration contracts?

   ### Technical Assumptions
   - Are there hidden assumptions about infrastructure, APIs, or external services?
   - Are non-functional requirements (performance, security, scalability) identified?

   ### Architecture Risk
   - Does the story require architectural decisions that are not yet made?
   - Are there risks that need a spike before delivery?

   ### Enabler Check
   - Does the story require infrastructure, platform, or foundational architecture work
     before it can be delivered by a feature team?
   - If yes: flag the need for an **Enabler Story** or **Enabler Feature** and describe
     the scope of the enabler.

   ### Security and Compliance
   - Are there security or regulatory implications (e.g., PSD2, GDPR, AML) that must
     be addressed before delivery?

4. Classify each criterion as ✅, ⚠️, or ❌.
5. Produce overall readiness classification:
   - ✅ **Architecturally ready** — no blockers; the story can proceed to domain review.
   - ⚠️ **Conditionally ready** — proceed with noted conditions or parallel enabler work.
   - ❌ **Not ready** — architectural gaps block delivery; resolve before domain review.
6. If an enabler is needed, draft a brief enabler story description with title, type, and scope.

## Output Expectations

- Overall architectural readiness classification with rationale.
- Enabler story draft (if applicable) with: title, enabler type, and acceptance scope.
- Prioritised list of architectural actions if the story is not ready.
- Clear next step: proceed to `story-point-estimation` or resolve blockers first.

## Quality Checks

- The review focuses on architecture and feasibility — do not rewrite business acceptance criteria.
- Enabler identification is always explicit; never assume the team will discover the need later.
- Security and compliance implications are never skipped for Fincent stories.
- If PO review result is ❌, the output is a gate failure — not an architectural review.

## References

- `resources/dor.md` — Fincent Definition of Ready
