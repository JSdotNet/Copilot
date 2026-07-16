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

## Jira Skill Discovery

Before executing any Jira operation, discover what Jira skills are available:

1. Check installed skills for skills whose name or description mentions "jira".
2. Identify a **retrieval-capable** Jira skill — one that can fetch an existing issue.
3. Identify a **create-capable** Jira skill — one that can create a new issue (for enabler
   tickets).
4. Identify an **update-capable** Jira skill — one that can sync content back to an
   existing issue.
5. If no retrieval skill is found: ask the user to paste the story content directly and
   skip automated Jira fetch.
6. If no create/update skill is found and `update Jira` is enabled: skip write-back and
   note in the output that no Jira skill was available.

All Jira field mapping, project keys, and API conventions are owned by the discovered
Jira skill. Never reproduce that knowledge in this skill.

## Inputs

- **Story identifier**: Jira story key (e.g., `FIN-123`) or pasted story content.
- **Architecture context path**: path to architecture documentation folder (optional; defaults
  to the project architecture folder if known).
- **Draft enabler stories**: `true` (default) or `false` — whether to output a draft enabler
  story when the review identifies infrastructure or architecture prerequisites.
- **Update Jira**: `true` or `false` (default) — whether to sync review findings and create
  enabler tickets via the discovered Jira skills.

## Dependencies

| Dependency | Provided by | Purpose |
|-----------|-------------|---------|
| Jira story content | Discovered Jira retrieval skill | Primary review target |
| Jira write-back | Discovered Jira update skill | Sync review findings to story |
| Enabler ticket creation | Discovered Jira create skill | Create enabler stories in Jira |
| Architecture documentation | Codebase / architecture folder | Architectural fit and context |
| ADRs (Architecture Decision Records) | Codebase `.wip/` or architecture plugin | Confirm decisions are in place |
| Definition of Ready | `resources/dor.md` | Review criteria baseline |
| Story review checklist | `resources/templates/story-review-checklist.md` | Checklist template |

## Workflow

### Phase 1 — Context Loading

1. Run Jira Skill Discovery (see above).
2. Use the discovered retrieval skill to fetch the full story content. Let that skill
   handle all Jira field mapping and API interaction.
3. Load architecture documentation from the configured path or codebase architecture folder.
4. Load relevant ADRs that may affect the story's implementation.
5. Load `resources/dor.md` and `resources/templates/story-review-checklist.md`.

### Phase 2 — Pre-Refinement Review

6. Use the `story-review-pre-refinement` skill with the loaded context to:
   - Evaluate all Pre-Refinement checklist criteria (bounded context, assumptions, risks,
     enabler check, security, and compliance).
   - Classify each as ✅, ⚠️, or ❌.
   - Determine whether an enabler story is required.

### Phase 3 — Enabler Story Draft (Optional)

7. If an enabler is identified and `draft enabler stories` is enabled:
   - Draft the enabler story artifact with: title, type (Architecture / Infrastructure /
     Research Spike), description, and acceptance scope.
   - Save the draft as a `.wip/` artifact.

### Phase 4 — Jira Update (Optional)

8. If `update Jira` is enabled:
   - Use the discovered update skill to sync the review findings back to the original story.
   - If an enabler story was drafted, use the discovered create skill to create the enabler
     ticket in Jira. Let those skills own all field mapping and API calls.

### Phase 5 — Summary

9. Output a completion summary:

   | Category | Items reviewed | Ready | Conditional | Blocked |
   |----------|---------------|-------|-------------|---------|
   | Pre-Refinement | 8 | — | — | — |
   | Enabler stories drafted | — | — | — | — |

## Output

- Completed Pre-Refinement story review with checklist and architectural readiness verdict.
- Enabler story draft artifact saved to `.wip/` (if applicable).
- Jira story updated and enabler ticket created via discovered skills (if enabled and available).
- Summary table.

## Notes

- Financial domain compliance (PSD2, GDPR, AML) checks are always included in this review.
- If no architecture documentation is provided, the review uses best-effort reasoning from
  the story content alone and flags missing context explicitly.
