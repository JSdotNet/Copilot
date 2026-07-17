---
name: story-point-estimation
description: >
  Estimate story points for a Fincent user story using a structured three-factor model
  (complexity, effort, uncertainty) calibrated against team velocity and reference stories.
  Requires PO review, pre-refinement review, and domain review to have passed first.
---

# Story Point Estimation

## Pipeline Gate

> **Prerequisite**: The story must have passed all three preceding reviews:
> `story-review-po` (✅ or ⚠️), `story-review-pre-refinement` (✅ or ⚠️), and
> `story-review-domain` (✅ or ⚠️).
> If any result is ❌, return **Not estimable** immediately — list the blocking issues
> and do not produce an estimate until they are resolved.

## Purpose and Trigger Conditions

Use this skill after a story has cleared all three reviews. Run before sprint planning
to produce a reasoned, calibrated Fibonacci estimate.

## Input Expectations

- The user story to estimate (Jira link, ID, or pasted content).
- Optional: reference stories with known point values for calibration.
- Optional: codebase context (affected modules, services, or components).
- Optional: team velocity or point scale (Fibonacci by default: 1, 2, 3, 5, 8, 13, 21).

## Estimation Model

Use the three-factor model from `resources/templates/story-review-checklist.md`:

### Factor 1 — Complexity (1–5)

How complex is the logic, domain, or integration involved?

- 1: Trivial change, no logic, minimal code impact.
- 2: Simple logic, single component, well-understood domain.
- 3: Moderate logic, touches multiple components or a domain rule.
- 4: Complex logic, cross-context integration, or new domain concept.
- 5: Highly complex, novel domain territory, or significant algorithm work.

### Factor 2 — Effort (1–5)

How much work is required regardless of complexity?

- 1: < 2 hours of implementation.
- 2: Half a day (~4 hours).
- 3: One day (~8 hours) — approaching the DOR size limit.
- 4: Up to 12 hours — at the DOR size limit; consider splitting.
- 5: Exceeds 12 hours — **must be split** before the story can enter a sprint.

### Factor 3 — Uncertainty / Risk (1–5)

How much is unknown or risky about delivery?

- 1: Fully understood; no unknowns.
- 2: Minor unknowns; team has handled similar before.
- 3: Some unknowns; spike may be needed.
- 4: Significant unknowns; dependency on external parties or unclear requirements.
- 5: High uncertainty; story may need to be split after discovery.

## Workflow

1. Load the story content.
2. **Gate check**: Confirm all three review results (PO, pre-refinement, domain) are ✅ or ⚠️.
   If any is ❌, stop and output:
   > ❌ **Not estimable** — the following issues must be resolved first: {list blockers}.
3. If available, load reference stories for calibration.
4. Score each factor (1–5) with explicit reasoning for each score.
5. Map the factor scores to a Fibonacci story point value:

   | Factor Sum | Suggested Points |
   |-----------|-----------------|
   | 3–5       | 1–2             |
   | 6–8       | 3               |
   | 9–10      | 5               |
   | 11–12     | 8               |
   | 13–14     | 13              |
   | 15        | 21 (consider splitting) |

6. Compare against reference stories if provided; adjust if the calibration differs.
7. Flag stories where the estimate exceeds **12 hours** (or the equivalent story points) for
   mandatory split discussion — this is a hard DOR constraint.
8. Summarise the estimate with the reasoning behind each factor score.

## Output Expectations

- Factor scores with explicit rationale for each.
- Suggested story point or hour estimate.
- Split recommendation if the estimate exceeds 12 hours or equivalent.
- Calibration note if reference stories were used.

## Quality Checks

- Never estimate without reading the story description and any acceptance criteria.
- Uncertainty is never scored 1 unless the team has an identical delivered story as reference.
- Stories touching external Fincent integrations (payment rails, regulatory APIs) are never
  scored below 3 for uncertainty without explicit justification.
- Stories exceeding 12 hours are always flagged — do not produce a final estimate for them
  without a split recommendation.

## References

- `resources/templates/story-review-checklist.md` — estimation section
- `resources/dor.md` — story readiness criteria (a story must meet DOR before estimation is reliable)
