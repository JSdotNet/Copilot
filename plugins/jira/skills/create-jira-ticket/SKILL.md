---
name: create-jira-ticket
description: "Uploads an already written Jira ticket from a Markdown file to Jira in project FIN. Use when: ticket content already exists and must be created in Jira without rewriting, summarizing, translating, or changing any ticket text."
user-invocable: true
---

# Create Jira Ticket (Upload Only)

## Prerequisites

Requires the **Atlassian MCP server** (`mcp_atlassian`) to be connected. The following MCP tool is called:

- `mcp_atlassian_jira_create_issue`

## Purpose

Use this skill only to upload a ticket that is already fully written in a Markdown file.
Create the Jira issue in project FIN without changing ticket content.

## Hard Constraints

- Do not write new ticket content.
- Do not rewrite, summarize, translate, reorder, or correct ticket content.
- Do not infer missing acceptance criteria.
- Do not add workflow steps unrelated to creation (no transitions, no board routing, no branch/worktree setup).
- Do not edit the source Markdown file unless the user explicitly asks to write back the Jira key and URL.
- Never include the title heading in the description.
- Never include the `## Jira Fields` section in the description.
- Never include the `## Acceptance Criteria` section in the description.
- Never include the `## Test Instructions` section in the description.
- Do not change source wording; only apply Jira-side rendering for uncertainty emphasis.

## Supported Input

- A path to an existing Markdown artifact that already contains a ticket.
- Typical sources:

  - `.wip/work/*/story-*.md`
  - `.wip/work/*/epic-*.md`
  - `.wip/work/*/bug-*.md`

## Required Source Data

Read these values from the source file:

- Title heading — for `summary` (strip `# Story:`, `# Epic:`, or `# Bug:` prefix only).
- `## Jira Fields` section:

  - `Type`
  - `Epic Link` (required for Story and Bug)

- `## Acceptance Criteria` content — for `customfield_11193` (Story and Bug only).
- Optional `## Test Instructions` content — for the Jira test instructions custom field (Story and Bug only).
- All sections **except** the title, `## Acceptance Criteria`, `## Test Instructions`, and `## Jira Fields` — for `description`.

Validation rules:

- For Story and Bug, `Acceptance Criteria` must be present in the source.
- For Story and Bug, `Epic Link` must be present in Jira fields.
- If `⚠️` open questions are present in description, set the configured readiness custom field to `Red` when available.
- If a required value is missing, stop and ask only for the missing value.

Uncertainty rendering rules:

- For lines marked with `⚠️`, render those lines in red in Jira fields that support color.
- If a target field does not support red text rendering, keep `⚠️` and prefix the line with `[ONDUIDELIJK]`.

## Upload Mapping

- `project_key`: `FIN`
- `issue_type`: from `Type` (default `Story` only when omitted)
- `summary`: from title text
- `description`: all sections except title heading, `## Acceptance Criteria`, `## Test Instructions`, and `## Jira Fields`
- `customfield_11193`: content of `## Acceptance Criteria` (Story and Bug only)
- `test instructions custom field`: content of `## Test Instructions` when present (Story and Bug only)
- `additional_fields`:

  - Include epic link only for Story and Bug using `{"epicKey":"<Epic Link>"}`
  - Include labels only when present in source Jira fields
  - Include readiness custom field with value `Red` when `⚠️` open questions are present and the field is configured

## Execution Steps

1. Read the source Markdown file.
2. Validate required fields for the artifact type.
3. Build the create payload with correct field mapping.
4. Call `mcp_atlassian_jira_create_issue`.
5. Write back the `Issue Key` to the `## Jira Fields` section of the source file.
6. Return both:

  - Jira issue key
  - Browse URL in format `https://innovadis.atlassian.net/browse/<KEY>`

## Out Of Scope

- Drafting new tickets from scratch.
- Improving wording or structure.
- Status transitions.
- Post-creation metadata updates unless Jira rejects create and reports a required field.
- Local git branch or worktree setup.

## Example Invocation

```text
/create-jira-ticket .wip/work/regeling-uitvoer/story-uitvoer-algemeen.md
```

## Success Response Format

```text
Created FIN-1234
https://innovadis.atlassian.net/browse/FIN-1234
```
 

