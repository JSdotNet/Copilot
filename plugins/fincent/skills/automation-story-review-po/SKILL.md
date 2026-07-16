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

## Required Plugins

- **`product-owner`** — provides `create-jira-ticket` and `update-jira-ticket` skills.
  All Jira interactions in this automation are delegated exclusively to those skills.
  Do not use Jira MCP tools directly; all Jira knowledge, field mapping, and API
  conventions are owned by the `product-owner` plugin.

## Inputs

- **Story identifier**: Jira story key (e.g., `FIN-123`) or pasted story content.
- **Auto-fix suggestions**: `true` (default) or `false` — whether to propose rewritten
  acceptance criteria or story text for ⚠️ and ❌ findings.
- **Update Jira**: `true` or `false` (default) — whether to write review findings back
  to Jira after review.

## Dependencies

| Dependency | Provided by | Purpose |
|-----------|-------------|---------|
| Jira story content | `product-owner` → `create-jira-ticket` | Primary review target |
| Linked epic | `product-owner` → `create-jira-ticket` | Validate story-to-epic alignment |
| Jira write-back | `product-owner` → `update-jira-ticket` | Post review findings to Jira |
| Definition of Ready | `resources/dor.md` | Review criteria baseline |
| Story review checklist | `resources/templates/story-review-checklist.md` | Checklist template |

## Workflow

### Phase 1 — Context Loading

1. Use the `create-jira-ticket` skill from the `product-owner` plugin to retrieve the full
   story content for the provided story key. Let that skill handle all Jira field mapping
   and API interaction.
2. Load `resources/dor.md`.
3. Load `resources/templates/story-review-checklist.md`.

### Phase 2 — Story Review

4. Use the `story-review-po` skill with the loaded context to:
   - Evaluate all Product Owner checklist criteria.
   - Classify each as ✅, ⚠️, or ❌.
   - Produce the overall readiness classification.

### Phase 3 — Auto-Fix Suggestions (Optional)

5. If `auto-fix suggestions` is enabled, for each ⚠️ or ❌ finding:
   - Propose a specific corrected version of the story text or acceptance criterion.
   - Mark each suggestion clearly as a proposed change, not a final update.

### Phase 4 — Jira Update (Optional)

6. If `update Jira` is enabled:
   - Write the review result (checklist, classification, and next steps) back to the story
     artifact file.
   - Use the `update-jira-ticket` skill from the `product-owner` plugin to sync the updated
     content to Jira. Let that skill own all field mapping, comment formatting, and API calls.

### Phase 5 — Summary

7. Output a completion summary:

   | Category | Items reviewed | Ready | Needs refinement | Not ready |
   |----------|---------------|-------|-----------------|-----------|
   | PO Review | 10 | — | — | — |

## Output

- Completed Product Owner story review with checklist and classification.
- Auto-fix suggestions for each gap (if enabled).
- Jira updated via `update-jira-ticket` (if enabled).
- Summary table.

## Notes

- This automation runs `story-review-po` only. For architecture and domain review, use the
  corresponding automation skills.
- If the story does not yet exist in Jira, paste the story content directly as input.
- Never reproduce Jira field names, project keys, custom field IDs, or API call details
  in this skill. All such knowledge lives in the `product-owner` plugin.
