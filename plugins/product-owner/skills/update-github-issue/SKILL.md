---
name: update-github-issue
description: "Updates an existing GitHub issue from a Markdown backlog artifact when an Issue Number is already known."
user-invocable: true
---

# Update GitHub Issue

## Purpose

Use this skill only to update a GitHub issue that already exists.
The source Markdown file must contain an `Issue Number` in the `## GitHub Fields` section.

## Hard Constraints

- Do not create a new issue; use `create-github-issue` if no `Issue Number` is present.
- Do not rewrite, summarize, translate, or reorder ticket content.
- Do not include the title heading in issue body.
- Do not include the `## GitHub Fields` section in issue body.

## Supported Input

- A path to an existing Markdown artifact that contains `Issue Number` and `Repository` in `## GitHub Fields`.
- Typical sources:
  - `.wip/work/*/story-*.md`
  - `.wip/work/*/epic-*.md`
  - `.wip/work/*/bug-*.md`

## Required Source Data

Read these values from the source file:

- `Repository` from `## GitHub Fields` (required, format `owner/repo`).
- `Issue Number` from `## GitHub Fields` (required).
- Title heading for issue title.
- Optional `Labels`, `Assignees`, and `Milestone` from `## GitHub Fields`.
- All sections except title and `## GitHub Fields` for issue body.

Validation rules:

- `Repository` and `Issue Number` must be present.
- If required values are missing, ask only for missing fields.

## Update Mapping

| Markdown Section | GitHub Field | Updatable |
| --- | --- | --- |
| Title text (prefix stripped) | `title` | Yes |
| All sections except title and `## GitHub Fields` | `body` | Yes |
| `Labels` from `## GitHub Fields` | `labels` | Yes |
| `Assignees` from `## GitHub Fields` | `assignees` | Yes |
| `Milestone` from `## GitHub Fields` | `milestone` | Yes (when configured) |

## Execution Steps

1. Read source Markdown file.
2. Validate required source data.
3. Build update payload with mapped fields.
4. Update issue using configured GitHub issue tooling (MCP preferred, `gh issue edit` fallback).
5. Return issue number and URL.

## Out Of Scope

- Creating new issues (use `create-github-issue`).
- Improving wording or structure.
- Status transitions or project board management.

## Example Invocation

```text
/update-github-issue .wip/work/regeling-uitvoer/story-uitvoer-algemeen.md
```

## Success Response Format

```text
Updated #1234
https://github.com/<owner>/<repo>/issues/1234
```
