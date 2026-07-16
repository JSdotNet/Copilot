---
name: story-review-po
description: >
  Review a Fincent user story from the Product Owner perspective: validate format,
  business value, acceptance criteria, scope, and backlog readiness.
---

# Story Review — Product Owner

## Purpose and Trigger Conditions

Use this skill when a product owner or team member wants to validate whether a Fincent user story
is well-formed, clear, and ready for team refinement from a business and backlog perspective.

## Input Expectations

- The user story to review (Jira link, ID, or pasted content).
- Optional: target sprint or release context.
- Optional: linked epic or initiative.

## Workflow

1. Load the story content. If only a Jira ID is provided, ask the user to paste the story text
   or retrieve it via the `create-jira-ticket` context.
2. Load `resources/dor.md` to apply the Fincent Definition of Ready.
3. Load `resources/templates/story-review-checklist.md` (Product Owner section).
4. Evaluate the story against each Product Owner criterion:
   - Story format: As a / I want / So that.
   - Specificity of role, goal, and benefit.
   - Business value and epic linkage.
   - Acceptance criteria count and testability.
   - Out-of-scope definition and dependency identification.
5. Produce a structured review result using the checklist table format.
6. Classify the overall result as one of:
   - ✅ **Ready** — story meets all criteria.
   - ⚠️ **Needs refinement** — minor gaps; list specific improvements needed.
   - ❌ **Not ready** — critical gaps; story must be rewritten or clarified before refinement.
7. Provide a short actionable summary with concrete next steps.

## Output Expectations

- Completed Product Owner section of the story review checklist.
- Overall readiness classification with rationale.
- Prioritised list of improvements if the story is not ready.
- Tone: constructive, specific, and focused on backlog quality.

## Quality Checks

- Every checklist item is assessed, not skipped.
- Each ⚠️ or ❌ has a concrete improvement suggestion.
- The review does not overlap with architecture or domain concerns (keep those separate).

## References

- `resources/dor.md` — Fincent Definition of Ready
- `resources/templates/story-review-checklist.md` — review checklist
