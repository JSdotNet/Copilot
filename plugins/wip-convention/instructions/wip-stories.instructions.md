---
applyTo: '.wip/work/*/story-*.md'
description: Quality standards for user stories in the .wip convention.
---

# Story Writing Instructions

## Purpose

- Apply these rules to user stories stored in `.wip/work/*/story-*.md`.
- Produce concise, testable, user-centered stories ready for Scrum refinement.
- Keep content structured for easy transfer to issue trackers.

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
5. `## Fields`

## Section Rules

### Description

- Start with the user story line using format:
  `As a <persona>, I want <goal>, so that <benefit>.`
- Continue with concise development context that helps implementation.
- Mark every uncertainty directly where it appears using `⚠️` at the end of the line.
- End this section with a short out-of-scope remark.
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

### Fields

- Keep this section compact and predictable for transfer:
  - `Type: Story`
  - `Epic Link: [TODO]`
- Optional fields as needed by your tracker.

## Conciseness Rules

- Aim for a one-screen story whenever possible.
- Keep paragraphs ≤2 sentences.
- Keep bullets one line when possible.
- Remove duplicate context across sections.

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

## Acceptance Criteria

1. <Expected outcome or rule>.
2. <Expected outcome or rule>.

## Test Instructions

- <Simple validation step>

## Fields

- Type: Story
- Epic Link: [TODO]
```

## Definition of Ready Check

- [ ] Story has a clear user and outcome.
- [ ] Value is understandable by non-engineers.
- [ ] Acceptance criteria are testable.
- [ ] Description contains out-of-scope boundaries.
- [ ] Every uncertainty is marked with `⚠️`.
- [ ] Story appears small enough for one sprint.
