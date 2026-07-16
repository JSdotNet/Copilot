---
name: automation: story review — pre-refinement
description: >
  Automated pre-refinement story review for Fincent. Loads the story from Jira, retrieves
  architecture documentation and ADRs, applies the DOR, and runs the
  story-review-pre-refinement skill. Identifies architectural gaps and drafts enabler
  stories when needed.
---

# Automation: Story Review — Pre-Refinement

## Purpose

Orchestrate a fully contextualised pre-refinement architecture review for a Fincent user story.
This automation gathers the Jira story, relevant architecture documentation, and ADRs, then
delegates to the `story-review-pre-refinement` skill to produce an architectural readiness
verdict and optional enabler story draft.

## Inputs

- **Story identifier**: Jira story key (e.g., `FIN-123`) or pasted story content.
- **Architecture context path**: path to architecture documentation folder (optional; defaults
  to the project architecture folder if known).
- **Draft enabler stories**: `true` (default) or `false` — whether to output a draft enabler
  story when the review identifies infrastructure or architecture prerequisites.
- **Update Jira**: `true` or `false` (default) — whether to post review findings back as a
  Jira comment and create enabler story tickets.

## Dependencies

This automation requires the following to be available:

| Dependency | Source | Purpose |
|-----------|--------|---------|
| Jira story content | Jira API | Primary review target |
| Architecture documentation | Codebase / architecture folder | Architectural fit and context |
| ADRs (Architecture Decision Records) | Codebase `.wip/` or architecture plugin | Confirm decisions are in place |
| Definition of Ready | `resources/dor.md` | Review criteria baseline |
| Story review checklist | `resources/templates/story-review-checklist.md` | Checklist template |

## Workflow

### Phase 1 — Context Loading

1. Retrieve the full story from Jira, including title, description, acceptance criteria, epic,
   and any linked technical notes or spikes.
2. Load architecture documentation from the configured path or codebase architecture folder.
3. Load relevant ADRs that may affect the story's implementation.
4. Load `resources/dor.md` and `resources/templates/story-review-checklist.md`.

### Phase 2 — Pre-Refinement Review

5. Use the `story-review-pre-refinement` skill with the loaded context to:
   - Evaluate all Pre-Refinement checklist criteria (bounded context, assumptions, risks,
     enabler check, security, and compliance).
   - Classify each as ✅, ⚠️, or ❌.
   - Determine whether an enabler story is required.

### Phase 3 — Enabler Story Draft (Optional)

6. If an enabler is identified and `draft enabler stories` is enabled:
   - Draft the enabler story with: title, type (Architecture / Infrastructure / Research Spike),
     description, and acceptance scope.
   - Link the enabler to the reviewed story.

### Phase 4 — Jira Update (Optional)

7. If `update Jira` is enabled:
   - Post the review result as a structured Jira comment on the original story.
   - If an enabler story was drafted, create it in Jira and add a link from the original story
     to the new enabler.

### Phase 5 — Summary

8. Output a completion summary:

   | Category | Items reviewed | Ready | Conditional | Blocked |
   |----------|---------------|-------|-------------|---------|
   | Pre-Refinement | 8 | — | — | — |
   | Enabler stories drafted | — | — | — | — |

## Output

- Completed Pre-Refinement story review with checklist and architectural readiness verdict.
- Enabler story draft (if applicable).
- Jira comment and enabler ticket created (if enabled).
- Summary table.

## Notes

- Financial domain compliance (PSD2, GDPR, AML) checks are always included in this review.
- If no architecture documentation is provided, the review uses best-effort reasoning from
  the story content alone and flags missing context explicitly.
