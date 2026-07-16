---
name: story-review-po
description: >
  Review a Fincent user story from the Product Owner perspective: validate format,
  business value, acceptance criteria, scope, and backlog readiness.
---

# Story Review — Product Owner

## Agent Discovery

This skill targets a **Product Owner agent** — an agent focused on backlog authoring,
user stories, epics, and acceptance criteria.

To locate one:

1. Check installed agents for an agent whose description includes terms such as
   "product owner", "backlog", "story", "epics", or "acceptance criteria".
2. If a matching agent is found, activate it before running this skill.
3. If no matching agent is found, continue with the default active agent.

The skill works independently of any specific agent name or plugin.

## Purpose and Trigger Conditions

Use this skill when a product owner or team member wants to validate whether a Fincent user story
is well-formed, clear, and ready for team refinement from a business and backlog perspective.

## Input Expectations

- The user story to review (Jira key, link, or pasted content).
- Optional: target sprint or release context.
- Optional: linked epic or initiative.

## Workflow

1. Load the story content. If only a Jira key is provided and a Jira retrieval skill is
   available, use it to fetch the story. Otherwise ask the user to paste the story text.
2. Determine the story type: **feature**, **bug**, or **support request**.
3. Load `resources/dor.md` to apply the Fincent Definition of Ready.
4. Load `resources/templates/story-review-checklist.md` (Product Owner section).
5. Evaluate the story against each applicable DOR criterion:

   ### Story Description (all types)
   - Is the functionality independently testable?
   - Is it written from the end-user perspective in As a / I want / So that format?
   - Is the title a concise summary, distinct from the description?
   - Is the description in the story field itself (not in comments)?
   - Is the description original — not a copy of an email or customer message?
   - Is the description specific, with no vague or conditional wording?

   ### Scope and Context (all types)
   - Is the story linked to an epic (if part of larger functionality)?
   - Is the story linked to a version or release?
   - For modifications to existing situations: are screenshots or links to the current state
     attached?

   ### Refinement (all types)
   - Has the development team reviewed and refined the story?
   - Is a team estimate present (story points or hours)?
   - Does the story stay within the 12-hour limit? If larger, flag for splitting.

   ### Design (UI stories only)
   - Is a Figma design available and linked in the story?
   - Are interactions and animations worked out in the design?

   ### Bug-specific criteria (bugs only)
   - Is there a clear description of what is going wrong?
   - Is the desired result stated?
   - Is a reproduction path or step list provided?
   - Are the page link, screenshots, conditions, device, browser, and OS noted?

6. Produce a structured review result using the checklist table format.
7. Classify the overall result as one of:
   - ✅ **Ready** — story meets all applicable criteria.
   - ⚠️ **Needs refinement** — minor gaps; list specific improvements needed.
   - ❌ **Not ready** — critical gaps; story must be reworked before it can enter a sprint.
8. Provide a short actionable summary with concrete next steps.

## Output Expectations

- Completed Product Owner section of the story review checklist (story description, scope,
  refinement, design if UI, bug criteria if bug).
- Overall readiness classification with rationale.
- Prioritised list of improvements if the story is not ready.
- Tone: constructive, specific, and focused on sprint readiness.

## Quality Checks

- Story type is identified first; inapplicable sections (e.g., Design for non-UI, Bug criteria
  for features) are skipped, not marked ❌.
- Every applicable checklist item is assessed, not skipped.
- Each ⚠️ or ❌ has a concrete improvement suggestion.
- The review does not overlap with architecture or domain concerns (keep those separate).

## References

- `resources/dor.md` — Fincent Definition of Ready
- `resources/templates/story-review-checklist.md` — review checklist
