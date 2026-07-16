---
name: automation: story point estimation
description: >
  Automated story point estimation for Fincent. Loads the story from Jira, inspects the
  codebase for affected components, retrieves historical estimates for calibration, and
  runs the story-point-estimation skill to produce a structured Fibonacci estimate.
---

# Automation: Story Point Estimation

## Purpose

Orchestrate a fully contextualised story point estimation for a Fincent user story.
This automation loads the Jira story, inspects the codebase for affected modules and
complexity signals, retrieves historical reference stories for calibration, and delegates
to the `story-point-estimation` skill to produce a reasoned Fibonacci estimate.

## Inputs

- **Story identifier**: Jira story key (e.g., `FIN-123`) or pasted story content.
- **Codebase path**: root path of the Fincent codebase (optional; scans affected modules).
- **Reference stories**: comma-separated list of Jira keys of previously estimated stories
  for calibration (optional).
- **Point scale**: `fibonacci` (default: 1, 2, 3, 5, 8, 13, 21) or `t-shirt` (XS, S, M, L, XL).
- **Update Jira**: `true` or `false` (default) — whether to write the estimate back to the
  Jira story field and add a comment with the reasoning.

## Dependencies

This automation requires the following to be available:

| Dependency | Source | Purpose |
|-----------|--------|---------|
| Jira story content | Jira API | Primary estimation target |
| Reference stories with estimates | Jira API | Calibration against historical velocity |
| Codebase — affected modules | Codebase scan | Complexity and effort signals |
| Definition of Ready | `resources/dor.md` | Confirm story is ready before estimating |
| Story review checklist | `resources/templates/story-review-checklist.md` | Estimation section |

## Workflow

### Phase 1 — DOR Pre-Check

1. Retrieve the full story from Jira, including title, description, acceptance criteria, and
   current story point field.
2. Run a quick DOR pre-check against `resources/dor.md`. If critical DOR criteria are missing,
   flag the story as **not estimable** and recommend completing the PO review first.

### Phase 2 — Context Loading

3. If the story passes the DOR pre-check:
   - Scan the codebase for modules, services, or components referenced in the story.
   - Retrieve reference stories from Jira if provided, including their estimates and
     brief descriptions for calibration context.
4. Load `resources/templates/story-review-checklist.md` (estimation section).

### Phase 3 — Estimation

5. Use the `story-point-estimation` skill with the loaded context to:
   - Score Complexity, Effort, and Uncertainty (each 1–5) with explicit reasoning.
   - Map the factor sum to a Fibonacci point value.
   - Calibrate against reference stories if available.
   - Flag stories at 13 or 21 points for split discussion.

### Phase 4 — Jira Update (Optional)

6. If `update Jira` is enabled:
   - Write the suggested story point value to the Jira story estimate field.
   - Post a Jira comment containing the three factor scores, reasoning, and final estimate.
   - If a split is recommended, add a comment with split suggestions.

### Phase 5 — Summary

7. Output a completion summary:

   | Story | Complexity | Effort | Uncertainty | Suggested Points | Split Needed |
   |-------|-----------|--------|-------------|-----------------|-------------|
   | FIN-123 | — | — | — | — | — |

## Output

- Three-factor score card with explicit reasoning for each factor.
- Suggested story point value on the configured scale.
- Split recommendation with proposed sub-story titles (if applicable).
- Calibration note referencing any used reference stories.
- Jira estimate field updated and comment posted (if enabled).

## Notes

- Estimation is only reliable on stories that meet the Fincent DOR. Stories failing the
  DOR pre-check are returned with an explanation instead of an estimate.
- Jira integration (FIN payment rail), regulatory APIs, and cross-team dependencies are
  automatically treated as uncertainty boosters (minimum Uncertainty score: 3).
- This automation estimates a single story per run. For batch estimation, invoke it once
  per story or use the planning session workflow.
