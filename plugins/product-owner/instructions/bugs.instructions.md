---
description: Bug writing standards for Product Owner backlog artifacts.
applyTo: '.wip/work/*/bug-*.md'
---

# Bug Writing Instructions

## Purpose

- Apply these rules to bug artifacts stored in `.wip/work/*/bug-*.md`.
- Produce clear, reproducible bug descriptions that are ready for Scrum refinement.
- Keep content structured for easy upload or copy into Jira later.

## Location and Naming

- Store bugs in module folders under `.wip/work/`.
- Use one module depth only: `.wip/work/<module>/bug-<short-title>.md`.
- Do not use nested module folders.
- Keep bug files in the same module folder as related epic and story files.

## Core Quality Standard

- Every bug must describe observable behavior, expected behavior, and impact.
- Reproduction steps must be deterministic where possible.
- Scope should isolate one problem per bug item.

## Required Structure (in order)

1. `# Bug: <Short problem title>`
2. `## Summary`
3. `## Problem`
4. `## Steps to Reproduce`
5. `## Expected Result`
6. `## Actual Result`
7. `## Scope`
8. `## Acceptance Criteria`
9. `## Jira Fields`
10. `## Notes`

## Section Rules

### Summary

- One short paragraph (max 2 sentences).
- State user or business impact first.

### Problem

- Describe what fails and where.
- Mention frequency if known (`Always`, `Intermittent`, `[TODO]`).

### Steps to Reproduce

- Use numbered steps.
- Keep each step atomic and unambiguous.

### Expected Result

- Describe correct behavior in one short paragraph or bullets.

### Actual Result

- Describe observed behavior, errors, or broken outcomes.

### Scope

- Include:

  - `In scope` (short bullets)
  - `Out of scope` (short bullets)

- Keep boundaries explicit to avoid broad technical rewrites.

### Acceptance Criteria

- Use numbered criteria.
- Prefer `Given / When / Then` format.
- Criteria must be observable and testable.

### Jira Fields

- Keep this section compact and predictable for transfer:

  - `Type: Bug`
  - `Priority: [TODO]`
  - `Labels: [TODO]`
  - `Component(s): [TODO]`
  - `Epic Link: [TODO]`
  - `Severity: [TODO]`

### Notes

- Add only necessary context such as assumptions, environment, dependencies, and open questions.
- Keep bullets short.

## Conciseness Rules

- Keep bug descriptions to roughly one screen when possible.
- Keep paragraphs ≤2 sentences.
- Keep bullets one line when possible.
- Remove duplicate context across sections.

## Bug Readiness Check

- [ ] Problem and impact are clear.
- [ ] Reproduction steps are explicit.
- [ ] Expected vs actual behavior is unambiguous.
- [ ] Acceptance criteria are testable.
- [ ] Scope is bounded with explicit out-of-scope items.
- [ ] Jira fields section is present.

## Bug Template

```md
# Bug: <Short problem title>

## Summary
<1-2 sentence impact summary>

## Problem
<What fails and where>

## Steps to Reproduce
1. <Step 1>
2. <Step 2>
3. <Step 3>

## Expected Result
<Expected behavior>

## Actual Result
<Observed behavior>

## Scope
- In scope:
  - <item>
- Out of scope:
  - <item>

## Acceptance Criteria
1. Given <context>, when <action>, then <expected result>.
2. Given <context>, when <action>, then <expected result>.

## Jira Fields
- Type: Bug
- Priority: [TODO]
- Labels: [TODO]
- Component(s): [TODO]
- Epic Link: [TODO]
- Severity: [TODO]

## Notes
- Environment: <if any>
- Assumptions: <if any>
- Open questions: <if any>
```

## Final Checklist

- [ ] Bug follows required section order.
- [ ] Reproduction and behavior sections are clear.
- [ ] Acceptance criteria are testable.
- [ ] Jira fields section is complete enough for later import.
- [ ] Markdown formatting passes repository baseline rules.
