---
name: automation: story review — product owner
description: >
  Automated Product Owner story review for Fincent. Loads the story from Jira, applies the
  Fincent DOR, and runs the story-review-po skill with full context. Use before backlog
  refinement to surface and fix story quality issues automatically.
---

# Automation: Story Review — Product Owner

## Purpose

Orchestrate a fully contextualised Product Owner story review for a Fincent user story.
This automation gathers all required dependencies — Jira story content, Definition of Ready,
and any linked epic — then delegates to the `story-review-po` skill and produces an
actionable review result.

## Jira Skill Discovery

Before executing any Jira operation, discover what Jira skills are available:

1. Check installed skills for skills whose name or description mentions "jira".
2. Identify a **retrieval-capable** Jira skill — one that can fetch an existing issue
   (e.g., descriptions include "retrieve", "read", or "upload an existing ticket").
3. Identify an **update-capable** Jira skill — one that can sync content back to an
   existing issue.
4. If no retrieval skill is found: ask the user to paste the story content directly and
   skip automated Jira fetch.
5. If no update skill is found and `update Jira` is enabled: skip write-back and note
   in the output that no Jira update skill was available.

All Jira field mapping, project keys, and API conventions are owned by the discovered
Jira skill. Never reproduce that knowledge in this skill.

## Inputs

- **Story identifier**: Jira story key (e.g., `FIN-123`) or pasted story content.
- **Auto-fix suggestions**: `true` (default) or `false` — whether to propose rewritten
  acceptance criteria or story text for ⚠️ and ❌ findings.
- **Update Jira**: `true` or `false` (default) — whether to write review findings back
  to Jira after review.

## Dependencies

| Dependency | Provided by | Purpose |
|-----------|-------------|---------|
| Jira story content | Discovered Jira retrieval skill | Primary review target |
| Linked epic | Discovered Jira retrieval skill | Validate story-to-epic alignment |
| Jira write-back | Discovered Jira update skill | Post review findings to Jira |
| Definition of Ready | `resources/dor.md` | Review criteria baseline |
| Story review checklist | `resources/templates/story-review-checklist.md` | Checklist template |

## Workflow

### Phase 1 — Context Loading

1. Run Jira Skill Discovery (see above).
2. Use the discovered retrieval skill to fetch the full story content. Let that skill
   handle all Jira field mapping and API interaction.
3. Load `resources/dor.md`.
4. Load `resources/templates/story-review-checklist.md`.

### Phase 2 — Story Review

5. Use the `story-review-po` skill with the loaded context to:
   - Evaluate all Product Owner checklist criteria.
   - Classify each as ✅, ⚠️, or ❌.
   - Produce the overall readiness classification.

### Phase 3 — Auto-Fix Suggestions (Optional)

6. If `auto-fix suggestions` is enabled, for each ⚠️ or ❌ finding:
   - Propose a specific corrected version of the story text or acceptance criterion.
   - Mark each suggestion clearly as a proposed change, not a final update.

### Phase 4 — Jira Update (Optional)

7. If `update Jira` is enabled and an update skill was discovered:
   - Write the review result (checklist, classification, and next steps) back to the story
     artifact file.
   - Use the discovered update skill to sync the content to Jira.

### Phase 5 — Summary

8. Output a completion summary:

   | Category | Items reviewed | Ready | Needs refinement | Not ready |
   |----------|---------------|-------|-----------------|-----------|
   | PO Review | 10 | — | — | — |

## Output

- Completed Product Owner story review with checklist and classification.
- Auto-fix suggestions for each gap (if enabled).
- Jira updated via discovered update skill (if enabled and available).
- Summary table.

## Notes

- This automation runs `story-review-po` only. For architecture and domain review, use the
  corresponding automation skills.
- If no Jira skill is installed, paste the story content directly as input.
