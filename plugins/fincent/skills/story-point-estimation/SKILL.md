---
name: story-point-estimation
description: >
  Estimate story points for a Fincent user story using a structured three-factor model
  (complexity, effort, uncertainty). Fetches the ticket, confirms DOR readiness, explores
  the codebase for affected modules, and posts the estimation reasoning as a comment.
  Only writes the story points field when it is currently empty.
---

# Story Point Estimation

Use this skill to produce a structured story point estimate for a `FIN-XXXX` ticket.
It fetches the ticket, confirms DOR readiness, runs the three-factor model, and posts the
reasoning as a comment. If the story points field is empty, it also updates it directly.

## Jira project

- Project key: `FIN`
- cloudId: `innovadis.atlassian.net`

## Goals

- Load the ticket via `mcp__claude_ai_Atlassian_Rovo__getJiraIssue` with
  `fields: ["summary", "status", "description", "comment", "story_points", "customfield_10016"]`.
  Read the current story points value — if one exists, do not overwrite it; report divergence
  in the comment instead.
- Confirm DOR readiness from `resources/dor.md`. If the story fails critical criteria
  (no description, no acceptance criteria, no epic link), stop and post a
  "not estimable" comment listing the gaps.
- **Explore the codebase** for the modules, services, aggregates, and endpoints the story
  touches. Use an `Explore` or `general-purpose` subagent to ground the effort and
  complexity scoring in what the code actually looks like.
- Apply the three-factor model (see below).
- Post reasoning via `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue`.
- If no current estimate exists: update the field via
  `mcp__claude_ai_Atlassian_Rovo__editJiraIssue`.

## Estimation model

### Factor 1 — Complexity (1–5)
How complex is the logic, domain, or integration?
- 1: Trivial, no logic, minimal code impact.
- 2: Simple logic, single component, well-understood domain.
- 3: Moderate logic, touches multiple components or a domain rule.
- 4: Complex logic, cross-context integration, or new domain concept.
- 5: Highly complex, novel domain territory, or significant algorithm work.

### Factor 2 — Effort (1–5)
How much work is required regardless of complexity?
- 1: < 2 hours.
- 2: ~4 hours (half a day).
- 3: ~8 hours (one day) — approaching DOR limit.
- 4: Up to 12 hours — at the DOR limit; consider splitting.
- 5: Exceeds 12 hours — **must be split** before the story can enter a sprint.

### Factor 3 — Uncertainty / Risk (1–5)
How much is unknown or risky?
- 1: Fully understood; no unknowns.
- 2: Minor unknowns; team has handled similar before.
- 3: Some unknowns; spike may be needed.
- 4: Significant unknowns; dependency on external parties or unclear requirements.
- 5: High uncertainty; story may need to be split after discovery.

### Factor sum → Fibonacci estimate

| Sum  | Points |
|------|--------|
| 3–5  | 1–2    |
| 6–8  | 3      |
| 9–10 | 5      |
| 11–12 | 8     |
| 13–14 | 13    |
| 15   | 21 (split) |

## Posting the comment

Use `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue` with
`contentFormat: "markdown"`. **Post directly — no approval step.**

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

- **Never estimate without reading the full story description and acceptance criteria.**
- DOR gate is hard: no estimate is produced for stories failing critical readiness criteria.
- Existing Jira estimate is never overwritten — only empty fields are updated.
- When the new estimate diverges from the existing value by more than 2 points, highlight
  with ⚠️ in the comment.
- Uncertainty is never scored 1 unless the team has an identical delivered story as reference.
- Stories touching Fincent integrations (payment rails, regulatory APIs) score minimum
  Uncertainty 3 without explicit justification.
- Stories exceeding 12 hours always get a split recommendation — never omit it.
- After posting, report back with ticket key, comment id, estimate, and whether the field
  was updated.

## Tools used

- `mcp__claude_ai_Atlassian_Rovo__getJiraIssue` — load ticket and current estimate.
- `Explore` / `general-purpose` subagent — locate the code the story touches.
- `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue` — post the estimation comment.
- `mcp__claude_ai_Atlassian_Rovo__editJiraIssue` — update the story points field (only
  when currently empty).
