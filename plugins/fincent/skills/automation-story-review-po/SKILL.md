---
name: automation: story review — product owner
description: >
  Run right before backlog refinement: finds all FIN Jira tickets in a given status for a
  Fincent team, evaluates each against the DOR from a Product Owner perspective, and posts a
  structured readiness comment on every ticket. Use when preparing a refinement session or
  when asked to batch-review story quality.
---

# Automation: Story Review — Product Owner

**Meant to be run before a refinement session or backlog grooming.** Batch variant of
`story-review-po`. Instead of one ticket, it sweeps all tickets in a given Jira status,
evaluates each against the Fincent DOR from a PO perspective, and posts a readiness
comment — so the team walks into the session with findings already on every ticket.

## Finding the tickets

Query Jira via `mcp__claude_ai_Atlassian_Rovo__searchJiraIssuesUsingJql`:

- cloudId: `innovadis.atlassian.net`
- JQL: `project = FIN AND status = "{status}" AND "Fincent Team" = "Team B" ORDER BY updated DESC`
- Default team is **Team B**; if the user names another team, substitute it in the JQL.
- Fetch `fields: ["summary", "status", "description", "comment", "issuetype"]`.
- Paginate with `nextPageToken` if there are more results.

Report the list of found tickets (key + summary + type) to the user before proceeding.

## Skip tickets already reviewed

Before reviewing a ticket, check its existing comments:

- If a `## 📋 PO Review` comment already exists and the ticket description hasn't
  materially changed since, skip the ticket and note this in the final report.
- If the earlier review is stale (description changed, or comment is more than 7 days old),
  post a fresh comment for today's date.

## Reviewing each ticket

For each remaining ticket, apply all applicable DOR criteria from `resources/dor.md` and
`resources/templates/story-review-checklist.md` (Product Owner section):

- Determine story type: feature, bug, or support request.
- Apply all applicable Story Description, Scope & Context, Refinement, Design (UI only),
  and Bug criteria.
- Classify each criterion as ✅, ⚠️, or ❌.
- Derive overall readiness and concrete improvement suggestions for ⚠️ and ❌.

PO review does not require codebase exploration — all assessment is based on the ticket
content and DOR.

## Posting the comments

Post one comment per ticket via `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue`
with `contentFormat: "markdown"`. **Post directly — no approval step.** Write in Dutch.
Update in place via `commentId` rather than stacking near-duplicates.

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

- Inapplicable sections (Design for non-UI, Bug criteria for features) are skipped — not ❌.
- Each ⚠️ or ❌ always has a concrete improvement suggestion.
- One comment per ticket per run; re-runs on the same day update via `commentId`.
- After the sweep, report back with a table sorted ❌ first, then ⚠️, then ✅:

  | Ticket | Samenvatting | Type | Uitkomst | Commentaar id / reden voor overslaan |
  |--------|-------------|------|---------|--------------------------------------|

## Tools used

- `mcp__claude_ai_Atlassian_Rovo__searchJiraIssuesUsingJql` — find the team's tickets.
- `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue` — post (or update) each review comment.
