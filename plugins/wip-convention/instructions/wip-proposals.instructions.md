---
applyTo: '.wip/proposals/*.md'
description: Quality standards for technical proposals in the .wip convention.
---

# Proposal Writing Instructions

## Purpose

- Apply these rules to proposal artifacts stored in `.wip/proposals/*.md`.
- Produce clear, actionable technical proposals for review.
- Keep content structured for discussion and decision-making.

## Location and Naming

- Store proposal files in `.wip/proposals/`.
- Use filename pattern: `proposal-<short-title>.md`.
- Keep titles concise and decision-oriented.

## Core Quality Standard

- Proposals must present a clear problem, solution options, and recommendation.
- Trade-offs must be explicit and balanced.
- Scope should be bounded to enable timely decisions.

## Required Structure (in order)

1. `# Proposal: <Decision title>`
2. `## Summary`
3. `## Context`
4. `## Options`
5. `## Recommendation`
6. `## Trade-offs`
7. `## Next Steps`

## Section Rules

### Summary

- Max 2-3 sentences.
- State the decision needed and why it matters now.

### Context

- Describe current state and constraints.
- Include relevant background without over-explaining.
- Reference related artifacts or decisions.

### Options

- Present 2-4 viable options.
- For each option, include:
  - Brief description
  - Pros
  - Cons
- Keep descriptions concise and comparable.

### Recommendation

- State the preferred option clearly.
- Explain why this option best fits the context and constraints.

### Trade-offs

- Acknowledge what is sacrificed with the recommendation.
- Be honest about risks and limitations.

### Next Steps

- List concrete actions if the proposal is approved.
- Include owners or responsible parties where known.

## Conciseness Rules

- Target 1-2 pages per proposal.
- Use short paragraphs and one-line bullets.
- Avoid implementation details unless essential for the decision.

## Proposal Template

```md
# Proposal: <Decision title>

## Summary

<2-3 sentences on what decision is needed and why>

## Context

<Current state, constraints, and background>

## Options

### Option 1: <Name>

<Brief description>

- **Pros:** <list>
- **Cons:** <list>

### Option 2: <Name>

<Brief description>

- **Pros:** <list>
- **Cons:** <list>

### Option 3: <Name> (optional)

<Brief description>

- **Pros:** <list>
- **Cons:** <list>

## Recommendation

Recommend **Option X** because <rationale>.

## Trade-offs

- <What we sacrifice or risk with this choice>

## Next Steps

- [ ] <Action item> — Owner: [TODO]
- [ ] <Action item> — Owner: [TODO]
```

## Proposal Readiness Check

- [ ] Problem and decision needed are clear.
- [ ] At least 2 options are presented with pros/cons.
- [ ] Recommendation is explicit with rationale.
- [ ] Trade-offs are acknowledged.
- [ ] Next steps are actionable.
