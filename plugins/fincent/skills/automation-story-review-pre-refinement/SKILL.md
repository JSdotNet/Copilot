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

## Required Plugins

- **`product-owner`** — provides `create-jira-ticket` and `update-jira-ticket` skills.
  All Jira interactions in this automation are delegated exclusively to those skills.
  Do not use Jira MCP tools directly; all Jira knowledge, field mapping, and API
  conventions are owned by the `product-owner` plugin.

## Inputs

- **Story identifier**: Jira story key (e.g., `FIN-123`) or pasted story content.
- **Architecture context path**: path to architecture documentation folder (optional; defaults
  to the project architecture folder if known).
- **Draft enabler stories**: `true` (default) or `false` — whether to output a draft enabler
  story when the review identifies infrastructure or architecture prerequisites.
- **Update Jira**: `true` or `false` (default) — whether to sync review findings and create
  enabler tickets via the Jira skills.

## Dependencies

| Dependency | Provided by | Purpose |
|-----------|-------------|---------|
| Jira story content | `product-owner` → `create-jira-ticket` | Primary review target |
| Jira write-back | `product-owner` → `update-jira-ticket` | Sync review findings to story |
| Enabler ticket creation | `product-owner` → `create-jira-ticket` | Create enabler stories in Jira |
| Architecture documentation | Codebase / architecture folder | Architectural fit and context |
| ADRs (Architecture Decision Records) | Codebase `.wip/` or architecture plugin | Confirm decisions are in place |
| Definition of Ready | `resources/dor.md` | Review criteria baseline |
| Story review checklist | `resources/templates/story-review-checklist.md` | Checklist template |

## Workflow

### Phase 1 — Context Loading

1. Use the `create-jira-ticket` skill from the `product-owner` plugin to retrieve the full
   story content for the provided story key. Let that skill handle all Jira field mapping
   and API interaction.
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
   - Draft the enabler story artifact with: title, type (Architecture / Infrastructure /
     Research Spike), description, and acceptance scope.
   - Save the draft as a `.wip/` artifact following the `product-owner` plugin conventions.

### Phase 4 — Jira Update (Optional)

7. If `update Jira` is enabled:
   - Use the `update-jira-ticket` skill from the `product-owner` plugin to sync the review
     findings back to the original story. Let that skill own all field mapping and API calls.
   - If an enabler story was drafted, use the `create-jira-ticket` skill from the
     `product-owner` plugin to create the enabler ticket in Jira. Let that skill own all
     field mapping, linking, and API calls.

### Phase 5 — Summary

8. Output a completion summary:

   | Category | Items reviewed | Ready | Conditional | Blocked |
   |----------|---------------|-------|-------------|---------|
   | Pre-Refinement | 8 | — | — | — |
   | Enabler stories drafted | — | — | — | — |

## Output

- Completed Pre-Refinement story review with checklist and architectural readiness verdict.
- Enabler story draft artifact saved to `.wip/` (if applicable).
- Jira story updated and enabler ticket created via `product-owner` skills (if enabled).
- Summary table.

## Notes

- Financial domain compliance (PSD2, GDPR, AML) checks are always included in this review.
- If no architecture documentation is provided, the review uses best-effort reasoning from
  the story content alone and flags missing context explicitly.
- Never reproduce Jira field names, project keys, custom field IDs, or API call details
  in this skill. All such knowledge lives in the `product-owner` plugin.
