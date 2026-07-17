---
name: story-review-po
description: >
  Review a Fincent user story from the Product Owner perspective: validate format,
  business value, acceptance criteria, scope, and backlog readiness. Fetches the ticket
  from Jira, evaluates it against the DOR, and posts a structured readiness comment directly.
---

# Story Review — Product Owner

Use this skill to evaluate a `FIN-XXXX` ticket from a business and backlog perspective —
story format, acceptance criteria, scope context, and sprint readiness. It fetches the
ticket, reviews it against the Fincent DOR, and posts the finding as a comment.

## Jira project

- Project key: `FIN`
- cloudId: `innovadis.atlassian.net`

## Goals

- Load the ticket via `mcp__claude_ai_Atlassian_Rovo__getJiraIssue` with
  `fields: ["summary", "status", "description", "comment", "issuetype"]`.
  Confirm you have the right `FIN-XXXX` key before proceeding.
- Determine the story type: **feature**, **bug**, or **support request**.
- Load `resources/dor.md` and `resources/templates/story-review-checklist.md`.
- Evaluate each applicable DOR criterion (see below).
- Post the result via `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue`.

## Review criteria

### Story Description (all types)
- Is the functionality independently testable?
- Written from the end-user perspective in As a / I want / So that format?
- Is the title a concise summary, distinct from the description body?
- Is the description in the story field itself (not in comments)?
- Is it original — not a copy of an email or customer message?
- Is it specific, with no vague or conditional wording?

### Scope and Context (all types)
- Linked to an epic (if part of larger functionality)?
- Linked to a version or release?
- For modifications to existing situations: are screenshots or links to the current state attached?

### Refinement (all types)
- Has the development team reviewed and refined the story?
- Is a team estimate present (story points or hours)?
- Does the story stay within the 12-hour limit? If larger, flag for splitting.

### Design (UI stories only)
- Is a Figma design available and linked?
- Are interactions and animations worked out in the design?

### Bug-specific criteria (bugs only)
- Clear description of what is going wrong and the desired result?
- Reproduction path or step list provided?
- Page link, screenshots, conditions, device, browser, and OS noted?

## Posting the comment

Use `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue` with
`contentFormat: "markdown"`. **Post directly — no approval step.** The user can request
edits afterwards; update in place via the returned `commentId` rather than posting a second comment.

- New review → omit `commentId`.
- Updating this session's review → pass the `commentId` returned earlier.

Only include sections that have content — omit empty headings.

```markdown
## 📋 PO Review — {date}

### Bevindingen
| Criterium | Beoordeling | Toelichting |
|-----------|-------------|-------------|
| Onafhankelijk testbaar | ✅/⚠️/❌ | … |
| User story format | ✅/⚠️/❌ | … |
| … | … | … |

### Uitkomst
**{✅ Ready / ⚠️ Needs refinement / ❌ Not ready}**: {rationale}

### Verbeterpunten
- {concrete improvement}
```

## Working rules

- Story type is identified first; inapplicable sections (Design for non-UI, Bug criteria
  for features) are skipped — not marked ❌.
- Every applicable criterion is assessed; never skipped.
- Each ⚠️ or ❌ has a concrete improvement suggestion.
- Do not overlap with architecture or domain concerns.
- After posting, report back with the ticket key, comment id, and overall readiness verdict.

## Tools used

- `mcp__claude_ai_Atlassian_Rovo__getJiraIssue` — load ticket.
- `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue` — post (or update) the review comment.
