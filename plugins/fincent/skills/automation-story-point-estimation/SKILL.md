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

## Jira Skill Discovery

Before executing any Jira operation, discover what Jira skills are available:

1. Check installed skills for skills whose name or description mentions "jira".
2. Identify a **retrieval-capable** Jira skill — one that can fetch an existing issue.
3. Identify an **update-capable** Jira skill — one that can sync content back to an
   existing issue (including estimate fields).
4. If no retrieval skill is found: ask the user to paste the story content directly and
   skip automated Jira fetch and reference story retrieval.
5. If no update skill is found and `update Jira` is enabled: skip write-back and note
   in the output that no Jira update skill was available.

All Jira field mapping, project keys, and API conventions are owned by the discovered
Jira skill. Never reproduce that knowledge in this skill.

## Inputs

- **Story identifier**: Jira story key (e.g., `FIN-123`) or pasted story content.
- **Codebase path**: root path of the Fincent codebase (optional; scans affected modules).
- **Reference stories**: comma-separated list of Jira keys of previously estimated stories
  for calibration (optional).
- **Point scale**: `fibonacci` (default: 1, 2, 3, 5, 8, 13, 21) or `t-shirt` (XS, S, M, L, XL).
- **Update Jira**: `true` or `false` (default) — whether to write the estimate back to Jira
  via the discovered update skill.

## Dependencies

| Dependency | Provided by | Purpose |
|-----------|-------------|---------|
| Jira story content | Discovered Jira retrieval skill | Primary estimation target |
| Reference stories with estimates | Discovered Jira retrieval skill | Calibration against historical velocity |
| Jira write-back | Discovered Jira update skill | Sync estimate and reasoning to story |
| Codebase — affected modules | Codebase scan | Complexity and effort signals |
| Definition of Ready | `resources/dor.md` | Confirm story is ready before estimating |
| Story review checklist | `resources/templates/story-review-checklist.md` | Estimation section |

## Workflow

### Phase 1 — DOR Pre-Check

1. Run Jira Skill Discovery (see above).
2. Use the discovered retrieval skill to fetch the full story content. Let that skill
   handle all Jira field mapping and API interaction.
3. Run a quick DOR pre-check against `resources/dor.md`. If critical DOR criteria are missing,
   flag the story as **not estimable** and recommend completing the PO review first.

### Phase 2 — Context Loading

4. If the story passes the DOR pre-check:
   - Scan the codebase for modules, services, or components referenced in the story.
   - If reference stories were provided and a retrieval skill is available, use it to fetch
     those stories for calibration context.
5. Load `resources/templates/story-review-checklist.md` (estimation section).

### Phase 3 — Estimation

> **Gate**: Only proceed if the story passed the DOR pre-check in Phase 1.
> If the story was flagged as **not estimable**, stop here — output the DOR gap report
> and do not produce a story point estimate.

6. Use the `story-point-estimation` skill with the loaded context to:
   - Score Complexity, Effort, and Uncertainty (each 1–5) with explicit reasoning.
   - Map the factor sum to a Fibonacci point value.
   - Calibrate against reference stories if available.
   - Flag stories at 13 or 21 points for split discussion.

### Phase 4 — Jira Update (Optional)

7. If `update Jira` is enabled and an update skill was discovered:
   - Write the estimate and three-factor reasoning back to the story artifact file.
   - Use the discovered update skill to sync the content to Jira.
   - If a split is recommended, include split suggestions in the artifact before syncing.

### Phase 5 — Summary

8. Output a completion summary:

   | Story | Complexity | Effort | Uncertainty | Suggested Points | Split Needed |
   |-------|-----------|--------|-------------|-----------------|-------------|
   | FIN-123 | — | — | — | — | — |

## Output

- Three-factor score card with explicit reasoning for each factor.
- Suggested story point value on the configured scale.
- Split recommendation with proposed sub-story titles (if applicable).
- Calibration note referencing any used reference stories.
- Jira updated via discovered update skill (if enabled and available).

## Notes

- Estimation is only reliable on stories that meet the Fincent DOR. Stories failing the
  DOR pre-check are returned with an explanation instead of an estimate.
- Jira integrations, regulatory APIs, and cross-team dependencies are automatically
  treated as uncertainty boosters (minimum Uncertainty score: 3).
- This automation estimates a single story per run. For batch estimation, invoke it once
  per story or use the planning session workflow.
