---
name: automation: story review — pre-refinement
description: >
  Run right before a pre-refinement or architecture review session: finds all FIN Jira
  tickets in a given status for a Fincent team, explores the codebase for each, and posts
  a structured architectural readiness comment on every ticket. Drafts and creates enabler
  stories when needed. Use when preparing an architecture pre-refinement session.
---

# Automation: Story Review — Pre-Refinement

**Meant to be run before a pre-refinement session.** Batch variant of
`story-review-pre-refinement`. It sweeps all tickets in a given Jira status, derives a
codebase-grounded architectural assessment for each, posts it as a comment, and optionally
creates enabler tickets — so the architect walks into the session with findings on every ticket.

## Finding the tickets

Query Jira via `mcp__claude_ai_Atlassian_Rovo__searchJiraIssuesUsingJql`:

- cloudId: `innovadis.atlassian.net`
- JQL: `project = FIN AND status = "{status}" AND "Fincent Team" = "Team B" ORDER BY updated DESC`
- Default team is **Team B**; substitute if the user names another.
- Fetch `fields: ["summary", "status", "description", "comment"]`.
- Paginate with `nextPageToken` if needed.

Report the list of found tickets (key + summary) before proceeding.

## Skip tickets already reviewed

Check existing comments:

- If a `## 🏗️ Architectuur Review` comment already exists and the description hasn't
  materially changed, skip the ticket and note this in the final report.
- If stale (>7 days old or description changed), post a fresh comment for today's date.

## Analyzing each ticket

For every remaining ticket, produce a self-derived architectural assessment exactly as
described in `story-review-pre-refinement`. Load `resources/dor.md` and architecture
documentation once for the batch. Don't invent decisions or attendees.

### Fan out with subagents

Analyze tickets **in parallel**: launch one `Explore` (or `general-purpose`) subagent
per ticket in a single message, each prompted with the ticket key, summary, full description,
and the instruction to:

1. Locate the relevant bounded context, aggregates, commands/queries, endpoints, and
   integration points in the codebase.
2. Return analysis sections (bounded context fit, technical assumptions, architecture risks,
   enabler check, security/compliance) as raw markdown with concrete code references
   (`path:line` or type/method names).

You (the main loop) review each result for plausibility, enrich if needed, then post.
**Subagents must not post to Jira themselves** — all posting stays in the main loop.

## Posting the comments

Post one comment per ticket via `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue`
with `contentFormat: "markdown"`. **Post directly — no approval step.** Write in Dutch.
Update in place via `commentId` rather than stacking near-duplicates.

```markdown
## 🏗️ Architectuur Review — {date}
_Automatische analyse op basis van ticket + codebase._

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

## Creating enabler stories

When a ticket needs an enabler and the user has confirmed creation:

- Create the enabler via `mcp__claude_ai_Atlassian_Rovo__createJiraIssue` with
  project `FIN`, type `Story`, and a clear title and description.
- Add a comment on the original ticket referencing the new enabler key.

## Working rules

- Architecture documentation and relevant ADRs are loaded once and shared across subagents.
- Financial domain compliance (PSD2, GDPR, AML) is always checked for every ticket.
- A too-vague ticket still gets a comment listing what is missing architecturally.
- One comment per ticket per run; re-runs update via `commentId`.
- After the sweep, report back with a table sorted ❌ first, then ⚠️, then ✅:

  | Ticket | Samenvatting | Uitkomst | Enabler aangemaakt | Commentaar id / reden voor overslaan |
  |--------|-------------|---------|-------------------|--------------------------------------|

## Tools used

- `mcp__claude_ai_Atlassian_Rovo__searchJiraIssuesUsingJql` — find the team's tickets.
- `Explore` / `general-purpose` subagents — one per ticket, locate code and draft analysis.
- `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue` — post (or update) each review comment.
- `mcp__claude_ai_Atlassian_Rovo__createJiraIssue` — create enabler stories (when applicable).
