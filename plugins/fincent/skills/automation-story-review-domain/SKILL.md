---
name: automation: story review — domain architect
description: >
  Automated domain architect story review for Fincent. Queries all stories in a given Jira
  status, inspects the codebase domain layer, and runs the story-review-domain skill on
  each to validate ubiquitous language, bounded context ownership, aggregate alignment,
  and domain events.
---

# Automation: Story Review — Domain Architect

## Purpose

Run a batch domain review across all Fincent stories in a specified Jira status.
For each story, the automation inspects the codebase domain layer for existing aggregates
and events, then delegates to the `story-review-domain` skill to validate domain model
alignment and ubiquitous language usage.

## Jira Skill Discovery

Before executing any Jira operation, discover what Jira skills are available:

1. Check installed skills for skills whose name or description mentions "jira".
2. Identify a **query-capable** Jira skill — one that can search or list issues by status.
3. Identify a **retrieval-capable** Jira skill — one that can fetch a single existing issue.
4. Identify an **update-capable** Jira skill — one that can sync content back to an
   existing issue.
5. If no query or retrieval skill is found: ask the user to paste story content for a
   single-story fallback run.
6. If no update skill is found and `update Jira` is enabled: skip write-back and note
   it in the output.

All Jira field mapping, project keys, and API conventions are owned by the discovered
Jira skill. Never reproduce that knowledge in this skill.

## Inputs

- **Jira status**: the status to query (e.g., `Ready for Refinement`, `Backlog`, `To Do`).
  All stories currently in this status are included in the run.
- **Codebase path**: root path of the Fincent codebase (optional; scans domain layer only).
- **Ubiquitous language source**: path to glossary or domain documentation (optional).
- **Update Jira**: `true` or `false` (default) — whether to sync review findings back to
  each story in Jira via the discovered update skill.

## Dependencies

| Dependency | Provided by | Purpose |
|-----------|-------------|---------|
| Story list | Discovered Jira query skill | All stories in the target status |
| Story content | Discovered Jira retrieval skill | Per-story review target |
| Jira write-back | Discovered Jira update skill | Sync review findings per story |
| Codebase — domain layer | Codebase (`**/Domain/**`, `**/Aggregates/**`) | Verify existing aggregates and events |
| Ubiquitous language glossary | Domain documentation or codebase | Term validation |
| Bounded context map | Architecture documentation or domain-design plugin | Context ownership |
| Definition of Ready | `resources/dor.md` | Review criteria baseline |
| Story review checklist | `resources/templates/story-review-checklist.md` | Checklist template |

## Workflow

### Phase 1 — Story List and Shared Context

1. Run Jira Skill Discovery (see above).
2. Use the discovered query skill to retrieve all stories in the specified status.
   Let that skill own the query, filter, and pagination logic.
3. Scan the codebase domain layer once for the entire batch:
   - Existing aggregates, entities, and value objects.
   - Domain events (classes implementing `IDomainEvent` or equivalent).
   - Domain policies and business rules.
4. Load the ubiquitous language glossary and bounded context map if available.
5. Load `resources/dor.md` and `resources/templates/story-review-checklist.md`.
6. Present the story count to the user and confirm before proceeding.

### Phase 2 — Per-Story Review (repeat for each story)

7. Use the discovered retrieval skill to fetch the full story content.
8. Use the `story-review-domain` skill with the loaded context to:
   - Validate all business terms against the ubiquitous language.
   - Confirm bounded context ownership and aggregate alignment.
   - Identify domain events produced or consumed.
   - Detect domain invariant or policy violations.
   - Classify each criterion as ✅, ⚠️, or ❌.
9. For each ⚠️ or ❌ finding, propose corrected terms, names, or model adjustments.
10. If `update Jira` is enabled and an update skill was discovered: sync the review
    findings back to this story in Jira.

### Phase 3 — Consolidated Summary

11. Output a consolidated batch summary after all stories are processed:

    | Story | Title | Domain Ready | Needs Clarification | Misaligned | Jira Updated |
    |-------|-------|-------------|--------------------|-----------|----|
    | FIN-123 | — | ✅ | | | — |
    | FIN-124 | — | | ⚠️ | | — |
    | FIN-125 | — | | | ❌ | — |

12. List all ❌ stories first, then ⚠️, then ✅.

## Output

- Per-story domain review with checklist and domain readiness verdict.
- Corrected ubiquitous language terms and aggregate/event names per story.
- Jira updated per story via discovered update skill (if enabled and available).
- Consolidated batch summary table sorted by readiness.

## Notes

- The codebase scan is performed once for the batch and scoped to the domain layer
  (`**/Domain/**`, `**/Aggregates/**`, `**/Events/**`).
- If no codebase path is provided, the review relies solely on story content and flags
  unverifiable domain references explicitly.
