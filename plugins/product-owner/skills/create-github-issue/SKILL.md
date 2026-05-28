---
name: create-github-issue
description: "Creates a GitHub issue from an already written Markdown backlog artifact without rewriting ticket content."
user-invocable: true
---

# Create GitHub Issue (Upload Only)

## Purpose

Use this skill only to create a GitHub issue from a ticket that is already fully written in a Markdown file.
Do not change source ticket wording during synchronization.

## Hard Constraints

- Do not write new ticket content.
- Do not rewrite, summarize, translate, reorder, or correct ticket content.
- Do not edit the source Markdown file unless writing back `Issue Number` and `Issue URL`.
- Never include the title heading in issue body.
- Never include the `## GitHub Fields` section in issue body.

## Supported Input

- A path to an existing Markdown artifact:
  - `.wip/work/*/story-*.md`
  - `.wip/work/*/epic-*.md`
  - `.wip/work/*/bug-*.md`

## Required Source Data

Read these values from the source file:

- Title heading for issue title (strip `# Story:`, `# Epic:`, or `# Bug:` prefix only).
- `## GitHub Fields` section:
  - `Repository` (required, format `owner/repo`)
  - Optional `Labels`
  - Optional `Assignees`
  - Optional `Milestone`
- All sections except title and `## GitHub Fields` for issue body.

Validation rules:

- `Repository` must be present.
- If required values are missing, ask only for missing fields.

## Upload Mapping

- `repository`: from `Repository`
- `title`: from title text
- `body`: all sections except title and `## GitHub Fields`
- `labels`: from `Labels` when present
- `assignees`: from `Assignees` when present
- `milestone`: from `Milestone` when present

## Execution Steps

1. Read source Markdown file.
2. Validate required source data.
3. Build create payload with mapped fields.
4. Create issue using configured GitHub issue tooling (MCP preferred, `gh issue create` fallback).
5. Write back `Issue Number` and `Issue URL` to `## GitHub Fields`.
6. Return issue number and URL.

## Out Of Scope

- Drafting new tickets from scratch.
- Improving wording or structure.
- Status transitions or project board management.

## Example Invocation

```text
/create-github-issue .wip/work/regeling-uitvoer/story-uitvoer-algemeen.md
```

## Success Response Format

```text
Created #1234
https://github.com/<owner>/<repo>/issues/1234
```
