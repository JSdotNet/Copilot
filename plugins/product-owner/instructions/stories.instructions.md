---
description: Story writing standards for Product Owner backlog artifacts.
applyTo: '.wip/work/*/story-*.md'
---

# Story Writing Instructions

## Purpose

- Apply these rules to user stories stored in `.wip/work/*/story-*.md`.
- Produce concise, testable, user-centered stories that are ready for Scrum refinement.
- Keep content structured for easy upload or copy into Jira later.

## Location and Naming

- Store stories in module folders under `.wip/work/`.
- Use one module depth only: `.wip/work/<module>/story-<short-title>.md`.
- Do not use nested module folders.
- Keep story files in the same module folder as related epic and bug files.

## Core Quality Standard

- Every story should be clear, valuable, and small enough for one sprint.
- Prefer INVEST thinking:

  - Independent
  - Negotiable
  - Valuable
  - Estimable
  - Small
  - Testable

- Use the 3Cs mindset:

  - Card: concise written story
  - Conversation: open points and assumptions
  - Confirmation: explicit acceptance criteria

## Required Structure (in order)

1. `# Story: <Short outcome title>`
2. `## Description`
3. `## Acceptance Criteria`
4. `## Test Instructions` (optional)
5. `## Jira Fields`

## Section Rules

### Description

- Start with the user story line using format:
  `As a <persona>, I want <goal>, so that <benefit>.`
- Continue with concise development context that helps implementation.
- Mark every uncertainty directly where it appears using `⚠️` at the end of the line.
- If you use an uncertainty label or title, place `⚠️` at the end of that title.
- Open questions may be grouped, but this is optional; they may also appear inline in normal text or bullets.
- End this section with a short out-of-scope remark. This may reference related stories.
- Optional notes may be added after out-of-scope in the same section.
- Do not add a separate `Summary`, `User Story`, `Scope`, or `Notes` heading.

### Acceptance Criteria

- Use numbered criteria.
- Default to short, direct, testable statements.
- Prefer one line per criterion.
- Use Given/When/Then only for complex process logic with multiple conditions.
- Criteria must be observable and testable.

### Test Instructions

- Optional section.
- Keep it simple and short.
- Focus on quick validation steps for the core acceptance criteria.

Example:

- Good: `Status changes to Established after approval.`
- Too verbose: `Given a case manager has opened the record, when approval is submitted and validated, then the status is changed to Established and all dependent actions are unlocked.`

### Jira Fields

- Keep this section compact and predictable for transfer:

  - `Type: Story`
  - `Epic Link: [TODO]`

- Optional fields (only if your Jira project requires them):

  - `Labels: <value>`
  - `Priority: <value>`
  - `Component(s): <value>`
  - `Story Points: <value>`

## Conciseness Rules

- Aim for a one-screen story whenever possible.
- Keep paragraphs ≤2 sentences.
- Keep bullets one line when possible.
- Remove duplicate context across sections.
- Avoid solution design unless needed for clarity.

## Definition of Ready Check

- [ ] Story has a clear user and outcome.
- [ ] Value is understandable by non-engineers.
- [ ] Acceptance criteria are testable.
- [ ] Description contains out-of-scope boundaries.
- [ ] Every uncertainty is marked with `⚠️` at the end of the relevant line.
- [ ] Story appears small enough for one sprint.

## Story Template

```md
# Story: <Short outcome title>

## Description
As a <persona>, I want <goal>, so that <benefit>.

<Short implementation context for development>

**Open Questions ⚠️:**
- <Question> ⚠️

**Out of Scope:**
- <item>

**Notes (optional):**
- Assumptions: <if any>
- Dependencies: <if any>

## Acceptance Criteria
1. <Expected outcome or rule>.
2. <Expected outcome or rule>.

## Test Instructions
- <Simple validation step>

## Jira Fields
- Type: Story
- Epic Link: [TODO]
```

## Final Checklist

- [ ] Story follows required section order.
- [ ] Wording is concise and to the point.
- [ ] Acceptance criteria are clear and testable.
- [ ] Uncertainties are visible with `⚠️` at end of title and/or relevant line.
- [ ] Jira fields section includes at least Type and Epic Link.
- [ ] Markdown formatting passes repository baseline rules.
