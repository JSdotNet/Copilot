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

## Required Plugins

- **`product-owner`** — provides `create-jira-ticket` and `update-jira-ticket` skills.
  All Jira interactions in this automation are delegated exclusively to those skills.
  Do not use Jira MCP tools directly; all Jira knowledge, field mapping, and API
  conventions are owned by the `product-owner` plugin.

## Inputs

- **Story identifier**: Jira story key (e.g., `FIN-123`) or pasted story content.
- **Codebase path**: root path of the Fincent codebase (optional; scans domain layer only).
- **Ubiquitous language source**: path to glossary or domain documentation (optional).
- **Update Jira**: `true` or `false` (default) — whether to sync review findings back to
  Jira via the `update-jira-ticket` skill.

## Dependencies

| Dependency | Provided by | Purpose |
|-----------|-------------|---------|
| Jira story content | `product-owner` → `create-jira-ticket` | Primary review target |
| Jira write-back | `product-owner` → `update-jira-ticket` | Sync review findings to story |
| Codebase — domain layer | Codebase (`**/Domain/**`, `**/Aggregates/**`) | Verify existing aggregates and events |
| Ubiquitous language glossary | Domain documentation or codebase | Term validation |
| Bounded context map | Architecture documentation or domain-design plugin | Context ownership |
| Definition of Ready | `resources/dor.md` | Review criteria baseline |
| Story review checklist | `resources/templates/story-review-checklist.md` | Checklist template |

## Workflow

### Phase 1 — Context Loading

1. Use the `create-jira-ticket` skill from the `product-owner` plugin to retrieve the full
   story content for the provided story key. Let that skill handle all Jira field mapping
   and API interaction.
2. Scan the codebase domain layer for:
   - Existing aggregates, entities, and value objects related to the story scope.
   - Domain events (classes implementing `IDomainEvent` or equivalent).
   - Domain policies and business rules.
3. Load the ubiquitous language glossary if available.
4. Load the bounded context map if available.
5. Load `resources/dor.md` and `resources/templates/story-review-checklist.md`.

### Phase 2 — Domain Review

6. Use the `story-review-domain` skill with the loaded context to:
   - Evaluate all Domain Architect checklist criteria.
   - Validate all business terms in the story against the ubiquitous language.
   - Confirm bounded context ownership and aggregate alignment.
   - Identify domain events produced or consumed.
   - Detect domain invariant or policy violations.
   - Classify each criterion as ✅, ⚠️, or ❌.

### Phase 3 — Correction Proposals

7. For each ⚠️ or ❌ finding, propose:
   - Corrected ubiquitous language terms.
   - Corrected aggregate, entity, or event names.
   - Suggested domain model additions or adjustments.

### Phase 4 — Jira Update (Optional)

8. If `update Jira` is enabled:
   - Write the review findings (domain checklist, readiness classification, and correction
     proposals) back to the story artifact file.
   - Use the `update-jira-ticket` skill from the `product-owner` plugin to sync the updated
     content to Jira. Let that skill own all field mapping, comment formatting, and API calls.

### Phase 5 — Summary

9. Output a completion summary:

   | Category | Items reviewed | Ready | Needs clarification | Misaligned |
   |----------|---------------|-------|---------------------|-----------|
   | Domain Review | 6 | — | — | — |

## Output

- Completed Domain Architect story review with checklist and domain readiness verdict.
- Corrected ubiquitous language terms and aggregate/event names.
- Jira updated via `update-jira-ticket` (if enabled).
- Summary table.

## Notes

- The codebase scan is limited to the domain layer (`**/Domain/**`, `**/Aggregates/**`,
  `**/Events/**`). Do not scan infrastructure or application layers for domain concepts.
- If no codebase path is provided, the review relies solely on the story content and
  flags any domain references that cannot be verified.
- Never reproduce Jira field names, project keys, custom field IDs, or API call details
  in this skill. All such knowledge lives in the `product-owner` plugin.
