---
name: spec-builder
description: Execute an approved customization plan to create or refine target Markdown assets with scoped edits.
---

# Spec Builder Skill

## Purpose

Use this skill to implement an approved customization plan into concrete asset changes.

## Inputs

- Approved plan content.
- Target file paths.
- Validation and quality criteria.

## Workflow

1. Load the approved plan and confirm scope.
2. Apply edits only to planned files.
3. Preserve naming, frontmatter, and structural conventions.
4. Validate links, references, and consistency.
5. Summarize changed files and unresolved items.
6. Prepare handoff context for `spec-review.agent.md`.

## Output

- Updated customization assets and a concise execution summary.
