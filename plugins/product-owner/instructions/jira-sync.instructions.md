---
description: Jira synchronization rules for approved Product Owner backlog artifacts.
applyTo: '.wip/work/*/{story-*.md,epic-*.md,bug-*.md}'
---

# Jira Sync Instructions

## Purpose

- Standardize how approved backlog artifacts are synchronized to Jira.
- Keep sync behavior deterministic and avoid content rewriting during upload.

## Rules

- Use source Markdown as the source of truth.
- Do not rewrite story, epic, or bug content during create/update sync.
- Exclude `## Jira Fields`, `## Acceptance Criteria`, and `## Test Instructions` from Jira description.
- Map `## Acceptance Criteria` to its dedicated Jira custom field when supported.
- Map `## Test Instructions` to its dedicated Jira custom field when configured.
- For updates, require `Issue Key` in `## Jira Fields`.
- If required Jira data is missing, ask only for missing fields.
