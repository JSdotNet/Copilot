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
