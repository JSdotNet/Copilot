---
name: update-jira-ticket
description: "Updates an existing Jira issue in project FIN from a Markdown backlog artifact. Use when: a ticket already exists in Jira (Issue Key present in Jira Fields) and the description or other editable fields need to be re-synced. Note: customfield_11193 (Acceptance Criteria) is only settable at create time and cannot be updated."
user-invocable: true
---

# Update Jira Ticket

## Purpose

Use this skill only to update a Jira issue that already exists.
The source Markdown file must contain an `Issue Key` in the `## Jira Fields` section.
Apply correct field mapping: do not repeat the title, do not include `## Jira Fields` or
`## Acceptance Criteria` or `## Test Instructions` in the description.

## Hard Constraints

- Do not create a new issue; use `create-jira-ticket` if no `Issue Key` is present.
- Do not rewrite, summarize, translate, or reorder ticket content.
- Do not include the title heading in the description.
- Do not include the `## Jira Fields` section in the description.
- Do not include the `## Acceptance Criteria` section in the description.
- Do not include the `## Test Instructions` section in the description.
- Do not add workflow steps unrelated to the update (no transitions, no branch/worktree setup).
- Do not change source wording; only apply Jira-side rendering for uncertainty emphasis.

## Supported Input

- A path to an existing Markdown artifact that contains an `Issue Key` in `## Jira Fields`.
- Typical sources:

  - `.wip/work/*/story-*.md`
  - `.wip/work/*/epic-*.md`
  - `.wip/work/*/bug-*.md`

## Required Source Data

Read these values from the source file:

- `Issue Key` from `## Jira Fields` — target issue to update.
- Title heading — for `summary` (strip `# Story:`, `# Epic:`, or `# Bug:` prefix).
- Optional `## Test Instructions` content — for the Jira test instructions custom field (Story and Bug only).
- All sections **except** the title, `## Acceptance Criteria`, `## Test Instructions`, and `## Jira Fields` — for `description`.

> **Known limitation:** `customfield_11193` (Acceptance Criteria) does not support update via the Jira edit API.
> It can only be set at creation time. If acceptance criteria must be corrected, delete and recreate the issue
> using `create-jira-ticket`, or update the field manually in the Jira UI.

Validation rules:

- `Issue Key` must be present in `## Jira Fields`; stop and ask if missing.
- For Story and Bug, `## Acceptance Criteria` must be present.
- If `⚠️` open questions are present in description, set the configured readiness custom field to `Red` when available.
- If a required value is missing, stop and ask only for the missing value.

Uncertainty rendering rules:

- For lines marked with `⚠️`, render those lines in red in Jira fields that support color.
- If a target field does not support red text rendering, keep `⚠️` and prefix the line with `[ONDUIDELIJK]`.

## Update Mapping

| Markdown Section | Jira Field | Updatable |
| --- | --- | --- |
| Title text (prefix stripped) | `summary` | Yes |
| All sections except title, `## Acceptance Criteria`, `## Test Instructions`, `## Jira Fields` | `description` | Yes |
| `## Acceptance Criteria` content | `customfield_11193` | **No — create only** |
| `## Test Instructions` content | test instructions custom field | Yes (when configured) |
| `⚠️` open questions present in description | readiness custom field (`Red`) | Yes (when configured) |

## Execution Steps

1. Read the source Markdown file.
2. Validate required fields for the artifact type.
3. Build the update payload with correct field mapping.
4. Call `mcp_atlassian_jira_update_issue` with `issue_key` and `fields`.
5. Return the issue key and browse URL: `https://innovadis.atlassian.net/browse/<KEY>`.

## Out Of Scope

- Creating new Jira issues (use `create-jira-ticket`).
- Improving wording or structure.
- Status transitions.
- Post-update metadata changes unless Jira rejects the update.

## Example Invocation

```text
/update-jira-ticket .wip/work/regeling-uitvoer/story-uitvoer-algemeen.md
```

## Success Response Format

```text
Updated FIN-1234
https://innovadis.atlassian.net/browse/FIN-1234
```
