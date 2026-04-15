---
applyTo: '.wip/ideas/*.md'
description: Quality standards for idea artifacts in the .wip convention.
---

# Idea Writing Instructions

## Purpose

- Apply these rules to idea artifacts stored in `.wip/ideas/*.md`.
- Keep idea notes lightweight, clear, and refinement-friendly.
- Prepare ideas for a smooth transition into epic or story workflows when applicable.

## Location and Naming

- Store idea files in `.wip/ideas/`.
- Use filename pattern: `idea-<short-title>.md`.
- Keep titles concise and outcome-oriented.

## Core Quality Standard

- Describe the user or business problem clearly.
- Explain expected value with a simple hypothesis.
- Define initial boundaries without over-specifying implementation.

## Required Structure (in order)

1. `# Idea: <Working title>`
2. `## Summary`
3. `## Problem and Audience`
4. `## Value Hypothesis`
5. `## Initial Scope`
6. `## Assumptions and Open Questions`
7. `## Next Step`

## Section Rules

### Summary

- Max 2-3 sentences.
- State what the idea is and why it matters now.

### Problem and Audience

- Identify the main pain point.
- Name primary audience or stakeholder group.

### Value Hypothesis

- Use a testable statement where possible.
- Prefer concise outcomes over implementation detail.

### Initial Scope

- Include:
  - `In scope`
  - `Out of scope`
- Keep this section lightweight and explicit.

### Assumptions and Open Questions

- List unknowns transparently.
- Use `[TODO: clarify]` for unresolved items.

### Next Step

- Choose one clear path:
  - Continue lightweight refinement
  - Prepare epic draft
  - Request analyst deep dive
  - Stop without creating work items

## Conciseness Rules

- Target one page per idea.
- Use short paragraphs and one-line bullets.
- Avoid architecture and implementation deep dives unless explicitly requested.

## Idea Template

```md
# Idea: <Working title>

## Summary

<2-3 sentences on what this is and why it matters>

## Problem and Audience

- **Problem:** <main pain point>
- **Audience:** <primary user group or stakeholder>

## Value Hypothesis

If we <do X>, then <audience> will <achieve Y>, resulting in <measurable outcome>.

## Initial Scope

- In scope:
  - <item>
- Out of scope:
  - <item>

## Assumptions and Open Questions

- <Assumption or question> [TODO: clarify]

## Next Step

- [ ] Continue lightweight refinement
- [ ] Prepare epic draft
- [ ] Request analyst deep dive
- [ ] Stop without creating work items
```

## Idea Readiness Check

- [ ] Problem and audience are clear.
- [ ] Value hypothesis is stated.
- [ ] Scope boundaries are visible.
- [ ] Key assumptions/questions are explicit.
- [ ] Next step is unambiguous.
