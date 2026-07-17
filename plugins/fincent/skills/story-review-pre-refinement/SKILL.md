---
name: story-review-pre-refinement
description: >
  Review a Fincent user story before sprint refinement: assess architectural readiness,
  identify hidden technical risks, determine if enabler stories are needed, and confirm
  the story is implementable as scoped. Fetches the ticket, explores the codebase, and
  posts a structured architectural review comment directly.
---

# Story Review — Pre-Refinement (Architect)

Use this skill before a `FIN-XXXX` ticket enters sprint refinement. It fetches the ticket,
explores the codebase for technical context, evaluates architectural readiness, and posts
the finding as a comment.

## Jira project

- Project key: `FIN`
- cloudId: `innovadis.atlassian.net`

## Goals

- Load the ticket via `mcp__claude_ai_Atlassian_Rovo__getJiraIssue` with
  `fields: ["summary", "status", "description", "comment"]`.
  Confirm the right `FIN-XXXX` key before proceeding.
- **Explore the codebase** for the feature's bounded context, aggregates, commands/queries,
  endpoints, and integration points. Use an `Explore` or `general-purpose` subagent to
  locate the code fast; you only need conclusions — name concrete components and turn
  gaps into risks.
- Load `resources/dor.md` and `resources/templates/story-review-checklist.md`.
- Evaluate each Pre-Refinement criterion (see below).
- Post the result via `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue`.
- If an enabler is needed and the user requests it: create it via
  `mcp__claude_ai_Atlassian_Rovo__createJiraIssue`.

## Review criteria

### Bounded Context Fit
- Does the story belong to a single bounded context?
- Are cross-context integrations explicitly defined with integration contracts?

### Technical Assumptions
- Hidden assumptions about infrastructure, APIs, or external services?
- Non-functional requirements (performance, security, scalability) identified?

### Architecture Risk
- Does the story require architectural decisions that are not yet made?
- Risks that need a spike before delivery?

### Enabler Check
- Does the story require infrastructure, platform, or foundational architecture work
  before a feature team can deliver it?
- If yes: flag and draft the enabler scope (title, type, and acceptance boundary).

### Security and Compliance
- Security or regulatory implications (PSD2, GDPR, AML) that must be addressed before delivery?

## Posting the comment

Use `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue` with
`contentFormat: "markdown"`. **Post directly — no approval step.** The user can
request edits afterwards; update in place via `commentId`.

Only include sections that have content — omit empty headings.

```markdown
## 🏗️ Architectuur Review — {date}
_Analyse op basis van ticket + codebase._

### Bevindingen
| Criterium | Beoordeling | Toelichting |
|-----------|-------------|-------------|
| Bounded context fit | ✅/⚠️/❌ | … |
| Technische aannames | ✅/⚠️/❌ | … |
| Architectuurrisico | ✅/⚠️/❌ | … |
| Enabler vereist | ✅/⚠️/❌ | … |
| Beveiliging & compliance | ✅/⚠️/❌ | … |

### Uitkomst
**{✅ Architecturally ready / ⚠️ Conditionally ready / ❌ Not ready}**: {rationale}

### Enabler story (indien vereist)
- **Titel**: …
- **Type**: Enabler Story / Enabler Feature
- **Scope**: …

### Risico's & aannames
- …
```

## Working rules

- Explore the codebase before assessing — ground the review in what the code actually
  does today. Name specific aggregates, handlers, components, and endpoints.
- Security and compliance implications are never skipped for Fincent stories.
- Enabler identification is always explicit — never assume the team will discover the
  need during delivery.
- The review focuses on architecture and feasibility — do not rewrite business acceptance criteria.
- After posting, report back with ticket key, comment id, overall verdict, and whether
  an enabler was created.

## Tools used

- `mcp__claude_ai_Atlassian_Rovo__getJiraIssue` — load ticket.
- `Explore` / `general-purpose` subagent — locate the code the ticket touches.
- `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue` — post (or update) the review comment.
- `mcp__claude_ai_Atlassian_Rovo__createJiraIssue` — create enabler story (when applicable).
