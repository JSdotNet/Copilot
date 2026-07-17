---
name: automation: story review — domain architect
description: >
  Run right before a domain review session: finds all FIN Jira tickets in a given status
  for a Fincent team, inspects the codebase domain layer for each, and posts a structured
  domain readiness comment on every ticket. Use when preparing a domain architect review session.
---

# Automation: Story Review — Domain Architect

**Meant to be run before a domain review session.** Batch variant of `story-review-domain`.
It sweeps all tickets in a given Jira status, derives a codebase-grounded domain assessment
for each, and posts it as a comment — so the domain architect walks into the session with
findings already on every ticket.

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

- If a `## 🧩 Domein Review` comment already exists and the description hasn't materially
  changed, skip the ticket and note this in the final report.
- If stale (>7 days old or description changed), post a fresh comment for today's date.

## Analyzing each ticket

For every remaining ticket, produce a domain review as described in `story-review-domain` —
evaluate ubiquitous language, bounded context ownership, aggregate alignment, domain events,
and domain policies by inspecting the codebase domain layer. Don't invent decisions.

### Fan out with subagents

Analyze tickets **in parallel**: launch one `Explore` subagent per ticket in a single
message, each prompted with the ticket key, summary, full description, and the instruction to:

1. Locate the relevant bounded context, aggregate roots, value objects, domain events, and
   policies in `**/Domain/**`, `**/Aggregates/**`, `**/Events/**`.
2. Return analysis sections (ubiquitous language, bounded context ownership, aggregate
   alignment, domain events, domain policies) as raw markdown with concrete code references.

You (the main loop) review each result for plausibility, then post.
**Subagents must not post to Jira themselves** — all posting stays in the main loop.

## Posting the comments

Post one comment per ticket via `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue`
with `contentFormat: "markdown"`. **Post directly — no approval step.** Write in Dutch.
Update in place via `commentId` rather than stacking near-duplicates.

```markdown
## 🧩 Domein Review — {date}
_Automatische analyse op basis van ticket + domeinlaag codebase._

### Bevindingen
| Criterium | Beoordeling | Toelichting |
|-----------|-------------|-------------|
| Ubiquitous language | ✅/⚠️/❌ | … |
| Bounded context eigenaarschap | ✅/⚠️/❌ | … |
| Aggregate alignment | ✅/⚠️/❌ | … |
| Domain events | ✅/⚠️/❌ | … |
| Domain policies | ✅/⚠️/❌ | … |

### Uitkomst
**{✅ Domain ready / ⚠️ Needs clarification / ❌ Domain misalignment}**: {rationale}

### Correcties
- **{term}** → **{correct term}**: {toelichting}
```

## Working rules

- The domain layer scan (`**/Domain/**`, `**/Aggregates/**`, `**/Events/**`) context is
  shared across all subagents for the batch.
- Every domain term in the story is verified against the ubiquitous language — never assume.
- Aggregate boundaries are confirmed or flagged — never assumed.
- Domain events are always in past tense; any deviation is flagged as ⚠️.
- One comment per ticket per run; re-runs update via `commentId`.
- After the sweep, report back with a table sorted ❌ first, then ⚠️, then ✅:

  | Ticket | Samenvatting | Uitkomst | Commentaar id / reden voor overslaan |
  |--------|-------------|---------|--------------------------------------|

## Tools used

- `mcp__claude_ai_Atlassian_Rovo__searchJiraIssuesUsingJql` — find the team's tickets.
- `Explore` subagents — one per ticket, inspect domain layer and draft analysis.
- `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue` — post (or update) each domain review comment.
