---
name: story-review-domain
description: >
  Review a Fincent user story from the Domain Architect perspective: validate ubiquitous
  language, bounded context ownership, aggregate alignment, domain events, and DDD correctness.
  Fetches the ticket, inspects the codebase domain layer, and posts a structured domain
  review comment directly.
---

# Story Review — Domain Architect

Use this skill to evaluate a `FIN-XXXX` ticket for domain model correctness —
ubiquitous language, bounded context ownership, aggregate alignment, and domain events.
It fetches the ticket, inspects the codebase domain layer, and posts the finding.

## Jira project

- Project key: `FIN`
- cloudId: `innovadis.atlassian.net`

## Goals

- Load the ticket via `mcp__claude_ai_Atlassian_Rovo__getJiraIssue` with
  `fields: ["summary", "status", "description", "comment"]`.
  Confirm the right `FIN-XXXX` key before proceeding.
- **Explore the codebase domain layer** (`**/Domain/**`, `**/Aggregates/**`,
  `**/Events/**`) for existing aggregates, entities, value objects, domain events, and
  domain policies. Use an `Explore` subagent — return conclusions and concrete code
  references, not file dumps.
- Load `resources/dor.md` and `resources/templates/story-review-checklist.md`.
- Evaluate each Domain Architect criterion (see below).
- Post the result via `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue`.

## Review criteria

### Ubiquitous Language
- Does the story use terms from the Fincent ubiquitous language?
- Non-standard or ambiguous terms that could cause translation issues?

### Bounded Context Ownership
- Which bounded context owns this story?
- Is ownership unambiguous, or does it straddle multiple contexts?
- Integration contract defined when applicable?

### Aggregate and Entity Alignment
- Which aggregate root is affected?
- Does the story respect aggregate boundaries and invariants?

### Domain Events
- Which domain events does this story produce or consume?
- Event names in past-tense ubiquitous language form (e.g., `PaymentInitiated`)?
- Event consumers identified?

### Domain Policies and Rules
- Does the story introduce or modify a domain policy or business rule?
- Is the rule modelled at the domain layer (not leaking into application or infrastructure)?

## Posting the comment

Use `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue` with
`contentFormat: "markdown"`. **Post directly — no approval step.** The user can
request edits afterwards; update in place via `commentId`.

Only include sections that have content — omit empty headings.

```markdown
## 🧩 Domein Review — {date}
_Analyse op basis van ticket + domeinlaag codebase._

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

- Every domain term in the story is verified against the ubiquitous language — never assume.
- Aggregate boundaries are confirmed or flagged — never assumed.
- Domain events are always in past tense; any deviation is flagged as ⚠️.
- Do not duplicate PO or architecture concerns — stay focused on domain correctness.
- After posting, report back with ticket key, comment id, and overall domain verdict.

## Tools used

- `mcp__claude_ai_Atlassian_Rovo__getJiraIssue` — load ticket.
- `Explore` subagent — inspect the codebase domain layer.
- `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue` — post (or update) the review comment.
