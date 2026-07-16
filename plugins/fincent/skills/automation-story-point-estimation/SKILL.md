---
name: automation: story point estimation
description: >
  Automated story point estimation for Fincent. Loads the story from Jira, inspects the
  codebase for affected components, retrieves historical estimates for calibration, and
  runs the story-point-estimation skill to produce a structured Fibonacci estimate.
---

# Automation: Story Point Estimation

## Purpose

Orchestrate a fully contextualised story point estimation for a Fincent user story.
This automation loads the Jira story, inspects the codebase for affected modules and
complexity signals, retrieves historical reference stories for calibration, and delegates
to the `story-point-estimation` skill to produce a reasoned Fibonacci estimate.

## Required Plugins

- **`product-owner`** — provides `create-jira-ticket` and `update-jira-ticket` skills.
  All Jira interactions in this automation are delegated exclusively to those skills.
  Do not use Jira MCP tools directly; all Jira knowledge, field mapping, and API
  conventions are owned by the `product-owner` plugin.

## Inputs

- **Story identifier**: Jira story key (e.g., `FIN-123`) or pasted story content.
- **Codebase path**: root path of the Fincent codebase (optional; scans affected modules).
- **Reference stories**: comma-separated list of Jira keys of previously estimated stories
  for calibration (optional).
- **Point scale**: `fibonacci` (default: 1, 2, 3, 5, 8, 13, 21) or `t-shirt` (XS, S, M, L, XL).
- **Update Jira**: `true` or `false` (default) — whether to write the estimate back to Jira
  via the `update-jira-ticket` skill.

## Dependencies

| Dependency | Provided by | Purpose |
|-----------|-------------|---------|
| Jira story content | `product-owner` → `create-jira-ticket` | Primary estimation target |
| Reference stories with estimates | `product-owner` → `create-jira-ticket` | Calibration against historical velocity |
| Jira write-back | `product-owner` → `update-jira-ticket` | Sync estimate and reasoning to story |
| Codebase — affected modules | Codebase scan | Complexity and effort signals |
| Definition of Ready | `resources/dor.md` | Confirm story is ready before estimating |
| Story review checklist | `resources/templates/story-review-checklist.md` | Estimation section |

## Workflow

### Phase 1 — DOR Pre-Check

1. Use the `create-jira-ticket` skill from the `product-owner` plugin to retrieve the full
   story content for the provided story key. Let that skill handle all Jira field mapping
   and API interaction.
2. Run a quick DOR pre-check against `resources/dor.md`. If critical DOR criteria are missing,
   flag the story as **not estimable** and recommend completing the PO review first.

### Phase 2 — Context Loading

3. If the story passes the DOR pre-check:
   - Scan the codebase for modules, services, or components referenced in the story.
   - Use the `create-jira-ticket` skill to retrieve reference stories from Jira if provided,
     including their content for calibration context. Let that skill handle all Jira interaction.
4. Load `resources/templates/story-review-checklist.md` (estimation section).

### Phase 3 — Estimation

5. Use the `story-point-estimation` skill with the loaded context to:
   - Score Complexity, Effort, and Uncertainty (each 1–5) with explicit reasoning.
   - Map the factor sum to a Fibonacci point value.
   - Calibrate against reference stories if available.
   - Flag stories at 13 or 21 points for split discussion.

### Phase 4 — Jira Update (Optional)

6. If `update Jira` is enabled:
   - Write the estimate and three-factor reasoning back to the story artifact file.
   - Use the `update-jira-ticket` skill from the `product-owner` plugin to sync the updated
     content to Jira. Let that skill own all field mapping, estimate field updates, and API calls.
   - If a split is recommended, add split suggestions to the artifact before syncing.

### Phase 5 — Summary

7. Output a completion summary:

   | Story | Complexity | Effort | Uncertainty | Suggested Points | Split Needed |
   |-------|-----------|--------|-------------|-----------------|-------------|
   | FIN-123 | — | — | — | — | — |

## Output

- Three-factor score card with explicit reasoning for each factor.
- Suggested story point value on the configured scale.
- Split recommendation with proposed sub-story titles (if applicable).
- Calibration note referencing any used reference stories.
- Jira updated via `update-jira-ticket` (if enabled).

## Notes

- Estimation is only reliable on stories that meet the Fincent DOR. Stories failing the
  DOR pre-check are returned with an explanation instead of an estimate.
- Jira integration (FIN payment rail), regulatory APIs, and cross-team dependencies are
  automatically treated as uncertainty boosters (minimum Uncertainty score: 3).
- This automation estimates a single story per run. For batch estimation, invoke it once
  per story or use the planning session workflow.
- Never reproduce Jira field names, project keys, custom field IDs, or API call details
  in this skill. All such knowledge lives in the `product-owner` plugin.
