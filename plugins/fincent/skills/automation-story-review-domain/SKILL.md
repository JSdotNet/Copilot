---
name: automation: story review — domain architect
description: >
  Automated domain architect story review for Fincent. Loads the story from Jira, inspects
  the codebase domain layer, and runs the story-review-domain skill to validate ubiquitous
  language, bounded context ownership, aggregate alignment, and domain events.
---

# Automation: Story Review — Domain Architect

## Purpose

Orchestrate a fully contextualised domain review for a Fincent user story. This automation
loads the Jira story, inspects the codebase domain layer for existing aggregates and events,
and delegates to the `story-review-domain` skill to validate domain model alignment and
ubiquitous language usage.

## Jira Skill Discovery

Before executing any Jira operation, discover what Jira skills are available:

1. Check installed skills for skills whose name or description mentions "jira".
2. Identify a **retrieval-capable** Jira skill — one that can fetch an existing issue.
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
- **Codebase path**: root path of the Fincent codebase (optional; scans domain layer only).
- **Ubiquitous language source**: path to glossary or domain documentation (optional).
- **Update Jira**: `true` or `false` (default) — whether to sync review findings back to
  Jira via the discovered update skill.

## Dependencies

| Dependency | Provided by | Purpose |
|-----------|-------------|---------|
| Jira story content | Discovered Jira retrieval skill | Primary review target |
| Jira write-back | Discovered Jira update skill | Sync review findings to story |
| Codebase — domain layer | Codebase (`**/Domain/**`, `**/Aggregates/**`) | Verify existing aggregates and events |
| Ubiquitous language glossary | Domain documentation or codebase | Term validation |
| Bounded context map | Architecture documentation or domain-design plugin | Context ownership |
| Definition of Ready | `resources/dor.md` | Review criteria baseline |
| Story review checklist | `resources/templates/story-review-checklist.md` | Checklist template |

## Workflow

### Phase 1 — Context Loading

1. Run Jira Skill Discovery (see above).
2. Use the discovered retrieval skill to fetch the full story content. Let that skill
   handle all Jira field mapping and API interaction.
3. Scan the codebase domain layer for:
   - Existing aggregates, entities, and value objects related to the story scope.
   - Domain events (classes implementing `IDomainEvent` or equivalent).
   - Domain policies and business rules.
4. Load the ubiquitous language glossary if available.
5. Load the bounded context map if available.
6. Load `resources/dor.md` and `resources/templates/story-review-checklist.md`.

### Phase 2 — Domain Review

7. Use the `story-review-domain` skill with the loaded context to:
   - Evaluate all Domain Architect checklist criteria.
   - Validate all business terms in the story against the ubiquitous language.
   - Confirm bounded context ownership and aggregate alignment.
   - Identify domain events produced or consumed.
   - Detect domain invariant or policy violations.
   - Classify each criterion as ✅, ⚠️, or ❌.

### Phase 3 — Correction Proposals

8. For each ⚠️ or ❌ finding, propose:
   - Corrected ubiquitous language terms.
   - Corrected aggregate, entity, or event names.
   - Suggested domain model additions or adjustments.

### Phase 4 — Jira Update (Optional)

9. If `update Jira` is enabled and an update skill was discovered:
   - Write the review findings (domain checklist, readiness classification, and correction
     proposals) back to the story artifact file.
   - Use the discovered update skill to sync the content to Jira.

### Phase 5 — Summary

10. Output a completion summary:

    | Category | Items reviewed | Ready | Needs clarification | Misaligned |
    |----------|---------------|-------|---------------------|-----------|
    | Domain Review | 6 | — | — | — |

## Output

- Completed Domain Architect story review with checklist and domain readiness verdict.
- Corrected ubiquitous language terms and aggregate/event names.
- Jira updated via discovered update skill (if enabled and available).
- Summary table.

## Notes

- The codebase scan is limited to the domain layer (`**/Domain/**`, `**/Aggregates/**`,
  `**/Events/**`). Do not scan infrastructure or application layers for domain concepts.
- If no codebase path is provided, the review relies solely on the story content and
  flags any domain references that cannot be verified.
