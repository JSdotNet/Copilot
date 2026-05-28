---
description: Epic writing standards for Product Owner backlog artifacts.
applyTo: '.wip/work/*/epic-*.md'
---

# Epic Writing Instructions

## Purpose

- Apply these rules to epics stored in `.wip/work/*/epic-*.md`.
- Keep epics outcome-driven, concise, and easy to refine into sprint-sized stories.
- Keep structure compatible with later Jira use.

## Location and Naming

- Store epics in module folders under `.wip/work/`.
- Use one module depth only: `.wip/work/<module>/epic-<short-title>.md`.
- Do not use nested module folders.
- Keep epic files in the same module folder as related story and bug files.

## Core Quality Standard

- Epic describes a meaningful product outcome, not a technical task bucket.
- Epic has measurable value and clear boundaries.
- Epic is decomposable into independent stories.

## Required Structure (in order)

1. `# Epic: <Outcome title>`
2. `## Scope`
3. `## Risks and Dependencies`
4. `## Jira Fields`
5. `## Notes`

## Optional Sections

Include these only when the information is known and adds value:

- `## Users and Stakeholders` — add when target audience needs explicit framing.
- `## Problem Statement` — add when the pain point needs explicit framing.
- `## Business Value` — add when urgency or ROI needs justification.
- `## Success Metrics` — add when measurable outcomes are defined.
- `## Story Breakdown` — add later, during refinement; not part of the initial epic.

## Section Rules

### Problem Statement

- Describe current pain and impact if unresolved.
- Keep this section short and evidence-based.

### Users and Stakeholders

- List primary user groups and key stakeholders.

### Business Value

- Explain why now.
- Include expected impact with metrics where possible.

### Success Metrics

- Use measurable outcomes (leading and/or lagging indicators).
- Add `[TODO: metric]` where data is unknown.

### Scope

- Include:

  - `In scope`
  - `Out of scope`

- Keep boundaries explicit to prevent uncontrolled growth.

### Story Breakdown

- Add during refinement, not in the initial epic draft.
- List candidate stories as concise slices.
- Prefer user-value slices over component-based slices.
- Mark unknown slices with `[TODO: story]`.

### Risks and Dependencies

- Capture top delivery and adoption risks.
- Capture cross-team or external dependencies.

### Jira Fields

- Keep fields compact and stable:

  - `Type: Epic`
  - `Priority: [TODO]`
  - `Labels: [TODO]`
  - `Component(s): [TODO]`
  - `Owner: [TODO]`
  - `Target Release: [TODO]`

### Notes

- Add assumptions, open questions, and links to related stories.
- Keep bullets brief.

## Conciseness Rules

- Keep epic to roughly 1-2 screens.
- Use short paragraphs and one-line bullets when possible.
- Remove background that does not influence prioritization or delivery.

## Epic Readiness Check

- [ ] Outcome is clear and user-centered.
- [ ] Scope boundaries are explicit (in scope and out of scope).
- [ ] Risks and dependencies are visible.
- [ ] Optional sections are included only when the information is known.

## Epic Template

```md
# Epic: <Outcome title>

## Scope
- In scope:
  - <item>
- Out of scope:
  - <item>

## Risks and Dependencies
- Risks:
  - <item>
- Dependencies:
  - <item>

## Jira Fields
- Type: Epic
- Priority: [TODO]
- Labels: [TODO]
- Component(s): [TODO]
- Owner: [TODO]
- Target Release: [TODO]

## Notes
- Assumptions: <if any>
- Open questions: <if any>
- Related stories: <links or file names>
```

### Optional sections template

Add these blocks when relevant:

```md
## Users and Stakeholders
- Users: <group>
- Stakeholders: <group>

## Problem Statement
<Current problem and impact>

## Business Value
<Why now and expected value>

## Success Metrics
- <Metric 1>
- <Metric 2>

## Story Breakdown
- [ ] <Story 1>
- [ ] <Story 2>
- [ ] <Story 3>
```
