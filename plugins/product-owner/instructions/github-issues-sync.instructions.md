---
description: GitHub Issues synchronization rules for approved Product Owner backlog artifacts.
applyTo: '.wip/work/*/{story-*.md,epic-*.md,bug-*.md}'
---

# GitHub Issues Sync Instructions

## Purpose

- Standardize how approved backlog artifacts are synchronized to GitHub issues.
- Keep sync behavior deterministic and avoid content rewriting during create/update.

## Rules

- Use source Markdown as the source of truth.
- Do not rewrite story, epic, or bug content during issue sync.
- Exclude `## GitHub Fields` from issue body.
- Include acceptance criteria and test instructions in the issue body unless project policy requires separate templates.
- For updates, require `Issue Number` in `## GitHub Fields`.
- If required repository or issue data is missing, ask only for missing fields.
