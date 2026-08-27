---
name: automation: story review — dev
description: 'Automated dev story review for Fincent. Queries all stories in a given Jira status, retrieves architecture documentation and ADRs, and runs the story-review-dev skill on each. Identifies architectural gaps and drafts enabler stories when needed.'
disable-model-invocation: true
---

# Automation: Story Review — Dev

## Purpose

Run a batch dev architecture review across all Fincent stories in a specified
Jira status. For each story, the automation loads the content and architecture context,
delegates to the `story-review-dev` skill, and produces a consolidated
architectural readiness report with any required enabler story drafts.

## Jira Skill Discovery

Before executing any Jira operation, discover what Jira skills are available:

1. Check installed skills for skills whose name or description mentions "jira".
2. Identify a **query-capable** Jira skill — one that can search or list issues by status.
3. Identify a **retrieval-capable** Jira skill — one that can fetch a single existing issue.
4. Identify a **create-capable** Jira skill — one that can create a new issue (for enabler
   tickets).
5. Identify an **update-capable** Jira skill — one that can sync content back to an
   existing issue.
6. If no query or retrieval skill is found: ask the user to paste story content for a
   single-story fallback run.
7. If no create/update skill is found and `update Jira` is enabled: skip write-back and
   note it in the output.

All Jira field mapping, project keys, and API conventions are owned by the discovered
Jira skill. Never reproduce that knowledge in this skill.

## Inputs

- **Jira status**: the status to query (e.g., `Ready for Refinement`, `Backlog`, `To Do`).
  All stories currently in this status are included in the run.
- **Architecture context path**: path to architecture documentation folder (optional).
- **Draft enabler stories**: `true` (default) or `false` — whether to draft enabler stories
  when the review identifies infrastructure or architecture prerequisites.
- **Update Jira**: `true` or `false` (default) — whether to sync review findings and create
  enabler tickets in Jira via the discovered skills.

## Dependencies

| Dependency | Provided by | Purpose |
|-----------|-------------|---------|
| Story list | Discovered Jira query skill | All stories in the target status |
| Story content | Discovered Jira retrieval skill | Per-story review target |
| Jira write-back | Discovered Jira update skill | Sync review findings per story |
| Enabler ticket creation | Discovered Jira create skill | Create enabler stories in Jira |
| Architecture documentation | Codebase / architecture folder | Architectural fit and context |
| ADRs (Architecture Decision Records) | Codebase `.wip/` or architecture plugin | Confirm decisions are in place |
| Definition of Ready | `resources/dor.md` | Review criteria baseline |
| Story review checklist | `resources/templates/story-review-checklist.md` | Checklist template |

## Workflow

### Phase 1 — Story List and Shared Context

1. Run Jira Skill Discovery (see above).
2. Use the discovered query skill to retrieve all stories in the specified status.
   Let that skill own the query, filter, and pagination logic.
3. Load architecture documentation and relevant ADRs once for the entire batch.
4. Load `resources/dor.md` and `resources/templates/story-review-checklist.md`.
5. Present the story count to the user and confirm before proceeding.

### Phase 2 — Per-Story Review (repeat for each story)

6. Use the discovered retrieval skill to fetch the full story content.
7. Use the `story-review-dev` skill with the loaded context to:
   - Evaluate all Pre-Refinement checklist criteria (bounded context, assumptions, risks,
     enabler check, security, and compliance).
   - Classify each as ✅, ⚠️, or ❌.
   - Determine whether an enabler story is required.
8. If an enabler is identified and `draft enabler stories` is enabled:
   - Draft the enabler story artifact (title, type, description, acceptance scope).
   - Save the draft as a `.wip/` artifact.
9. If `update Jira` is enabled:
   - Use the discovered update skill to sync findings back to this story.
   - Use the discovered create skill to create the enabler ticket (if drafted).

### Phase 3 — Consolidated Summary

10. Output a consolidated batch summary after all stories are processed:

    | Story | Title | Arch Ready | Conditional | Blocked | Enabler Drafted | Jira Updated |
    |-------|-------|-----------|------------|---------|----------------|-------------|
    | FIN-123 | — | ✅ | | | No | — |
    | FIN-124 | — | | ⚠️ | | No | — |
    | FIN-125 | — | | | ❌ | Yes | — |

11. List all ❌ stories first, then ⚠️, then ✅.

## Output

- Per-story Pre-Refinement review with checklist and architectural readiness verdict.
- Enabler story draft artifacts saved to `.wip/` (if applicable).
- Jira stories updated and enabler tickets created via discovered skills (if enabled).
- Consolidated batch summary table sorted by readiness.

## Notes

- Financial domain compliance (PSD2, GDPR, AML) checks are always included.
- Architecture documentation is loaded once and shared across all stories in the batch.
- If no architecture documentation is provided, the review uses best-effort reasoning and
  flags missing context explicitly per story.
