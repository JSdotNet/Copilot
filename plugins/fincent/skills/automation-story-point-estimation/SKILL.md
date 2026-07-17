---
name: automation: story point estimation
description: >
  Run before sprint planning: finds all FIN Jira tickets in a given status for a Fincent team,
  checks DOR readiness for each, explores the codebase for complexity signals, and posts a
  structured estimation comment. Only writes the story points field for tickets that have no
  estimate yet. Use when preparing sprint planning or sizing a backlog.
---

# Automation: Story Point Estimation

**Meant to be run before sprint planning.** Batch variant of `story-point-estimation`.
It sweeps all tickets in a given Jira status, checks DOR readiness, explores the codebase
for affected modules, estimates each story, and posts the reasoning as a comment. Only
writes the story points field when it is currently empty.

## Finding the tickets

Query Jira via `mcp__claude_ai_Atlassian_Rovo__searchJiraIssuesUsingJql`:

- cloudId: `innovadis.atlassian.net`
- JQL: `project = FIN AND status = "{status}" AND "Fincent Team" = "Team B" ORDER BY updated DESC`
- Default team is **Team B**; substitute if the user names another.
- Fetch `fields: ["summary", "status", "description", "comment", "story_points", "customfield_10016"]`.
- Paginate with `nextPageToken` if needed.

Report the list of found tickets (key + summary + current estimate) to the user before
proceeding, and confirm.

## Skip already-estimated tickets (default behaviour)

By default, skip stories that already have a story points value in Jira. Still compute the
new estimate for those stories to detect drift, but do not update the field — note the
divergence in the final report instead.

If the user wants to re-estimate everything (e.g. a story was significantly changed),
they can explicitly disable this for the run.

## Per-ticket workflow

For each ticket in the batch:

### 1. DOR pre-check
Evaluate against `resources/dor.md`. If critical DOR criteria are missing (no description,
no acceptance criteria, no epic link), flag as **not estimable**, record the gaps, and
skip to the next ticket. Do not produce an estimate.

### 2. Codebase exploration
Launch one `Explore` (or `general-purpose`) subagent per ticket **in parallel**:
- Locate the modules, services, aggregates, and endpoints the story touches.
- Assess code surface: new implementation, extension, or refactor?
- Surface any notable integration or cross-context dependencies.

Return findings as raw markdown; the main loop uses them for factor scoring. **Subagents
must not post to Jira themselves** — all posting stays in the main loop.

### 3. Estimation (only after DOR passes)
Apply the three-factor model from `story-point-estimation`:
- Complexity, Effort, Uncertainty each scored 1–5.
- Map factor sum to Fibonacci estimate.
- Calibrate against reference stories if provided by the user.
- Flag stories where effort exceeds 12 hours for mandatory split.

### 4. Write to Jira
Post the estimation reasoning via
`mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue` for every estimated story.

**Only if the story's story points field is currently empty:** update the field via
`mcp__claude_ai_Atlassian_Rovo__editJiraIssue`.

## Posting the comments

Use `contentFormat: "markdown"`. **Post directly — no approval step.** Write in Dutch.
Update in place via `commentId` on re-runs.

```markdown
## 📊 Schatting — {date}

| Factor | Score | Toelichting |
|--------|-------|-------------|
| Complexiteit | {1–5} | … |
| Inspanning | {1–5} | … |
| Onzekerheid | {1–5} | … |
| **Totaal** | **{sum}** | |

**Schatting**: {N} story points
**Huidig in Jira**: {current value or "—"}
**Δ**: {difference or "—"} {⚠️ if |Δ| > 2}
**Split vereist**: {Ja / Nee}
```

## Working rules

- DOR gate is hard: no estimate is produced for stories failing critical readiness criteria.
- Existing Jira estimate is never overwritten — only empty fields are updated.
- When `|Δ| > 2`, highlight the row in the final report table.
- Stories touching Fincent integrations (payment rails, regulatory APIs) score minimum
  Uncertainty 3 without explicit justification.
- One comment per ticket per run; re-runs on the same day update via `commentId`.
- After the sweep, report back with a table (not-estimable first, then split-needed, then ✅):

  | Ticket | Samenvatting | DOR | Huidig | Nieuw | Δ | Split | Bijgewerkt |
  |--------|-------------|-----|--------|-------|---|-------|-----------|

## Tools used

- `mcp__claude_ai_Atlassian_Rovo__searchJiraIssuesUsingJql` — find the team's tickets.
- `Explore` / `general-purpose` subagents — one per ticket, locate code and assess complexity.
- `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue` — post estimation reasoning.
- `mcp__claude_ai_Atlassian_Rovo__editJiraIssue` — update story points field (only when empty).
