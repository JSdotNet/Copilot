---
name: automation-story-review-po
description: >
  Automated Product Owner story review for Fincent. Queries all stories in a given Jira
  status, applies the Fincent DOR to each, and produces a consolidated readiness report.
  Use before backlog refinement to surface and fix story quality issues automatically.
---

# Automation: Story Review — Product Owner

## Purpose

Run a batch Product Owner review across all Fincent stories in a specified Jira status.
For each story, the automation loads the content, applies the DOR, delegates to the
`story-review-po` skill, and produces a consolidated readiness report for the full set.

## Jira Skill Discovery

Before executing any Jira operation, discover what Jira skills are available:

1. Check installed skills for skills whose name or description mentions "jira".
2. Identify a **query-capable** Jira skill — one that can search or list issues by status
   or filter (e.g., descriptions include "search", "query", "list", or "filter").
3. Identify a **retrieval-capable** Jira skill — one that can fetch a single existing issue.
4. Identify an **update-capable** Jira skill — one that can sync content back to an
   existing issue.
5. If no query or retrieval skill is found: ask the user to paste story content for a
   single-story fallback run.
6. If no update skill is found and `update Jira` is enabled: skip write-back per story
   and note it in the output.

All Jira field mapping, project keys, status values, and API conventions are owned by
the discovered Jira skill. Never reproduce that knowledge in this skill.

## Inputs

- **Jira status**: the status to query (e.g., `Ready for Refinement`, `Backlog`, `To Do`).
  All stories currently in this status are included in the run.
- **Story type filter**: `all` (default), `feature`, `bug`, or `support` — limit the batch
  to a specific story type.
- **Auto-fix suggestions**: `true` (default) or `false` — whether to propose corrections
  for ⚠️ and ❌ findings per story.
- **Update Jira**: `true` or `false` (default) — whether to write review findings back
  to each story in Jira after review.

## Dependencies

| Dependency | Provided by | Purpose |
|-----------|-------------|---------|
| Story list | Discovered Jira query skill | All stories in the target status |
| Story content | Discovered Jira retrieval skill | Per-story review target |
| Jira write-back | Discovered Jira update skill | Post review findings per story |
| Definition of Ready | `resources/dor.md` | Review criteria baseline |
| Story review checklist | `resources/templates/story-review-checklist.md` | Checklist template |

## Workflow

### Phase 1 — Story List

1. Run Jira Skill Discovery (see above).
2. Use the discovered query skill to retrieve all stories in the specified status.
   Let that skill own the query, filter, and pagination logic.
3. Load `resources/dor.md` and `resources/templates/story-review-checklist.md` once
   for the entire batch.
4. Present the story count to the user and confirm before proceeding.

### Phase 2 — Per-Story Review (repeat for each story)

5. Use the discovered retrieval skill to fetch the full story content.
6. Use the `story-review-po` skill with the loaded context to:
   - Determine story type (feature / bug / support request).
   - Evaluate all applicable DOR criteria.
   - Classify each as ✅, ⚠️, or ❌.
   - Produce the readiness classification for this story.
7. If `auto-fix suggestions` is enabled, propose corrections for each ⚠️ or ❌ finding.
8. If `update Jira` is enabled and an update skill was discovered: sync the review
   findings back to this story in Jira.

### Phase 3 — Consolidated Summary

9. Output a consolidated batch summary after all stories are processed:

   | Story | Title | Type | Ready | Needs Refinement | Not Ready | Jira Updated |
   |-------|-------|------|-------|-----------------|-----------|-------------|
   | FIN-123 | — | — | ✅ | | | — |
   | FIN-124 | — | — | | ⚠️ | | — |
   | FIN-125 | — | — | | | ❌ | — |

10. List all ❌ stories first, then ⚠️, then ✅, so the team can prioritise fixes.

## Output

- Per-story DOR review with checklist classification.
- Auto-fix suggestions for each gap (if enabled).
- Jira updated per story via discovered update skill (if enabled and available).
- Consolidated batch summary table sorted by readiness.

## Notes

- Run this automation before a refinement session to get the full batch into shape.
- For architecture and domain review, use the corresponding automation skills.
- If no Jira query skill is installed, fall back to a single-story run by pasting
  story content directly.
