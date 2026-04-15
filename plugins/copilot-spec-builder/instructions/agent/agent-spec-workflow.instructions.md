---
applyTo: 'agents/spec-*.agent.md'
description: Defines the required three-agent sequence for spec planning, execution, and review.
---

# Spec Workflow Instructions

## Purpose

- Enforce one predictable workflow for spec authoring.
- Keep role boundaries clear across planning, execution, and review.

## Required Sequence

1. `spec-plan.agent.md`
2. `spec-builder.agent.md`
3. `spec-review.agent.md`

## Role Boundaries

- `spec-plan.agent.md` is planning-only.
- `spec-builder.agent.md` is execution-only and must use an approved plan.
- `spec-review.agent.md` is review-only.

## Tool Policy

- `spec-plan.agent.md` must not include edit tools.
- `spec-builder.agent.md` may include edit tools needed to execute approved plans.
- `spec-review.agent.md` must not include edit tools.

## Handoff Policy

- Every handoff requires explicit user approval.
- Use approval wording:
  - "I recommend handing this off to `<agent>` because `<reason>`. Do you approve this handoff?"
- Include handoff context:
  - Current status
  - Decisions and assumptions
  - Remaining steps
  - Paths to `.wip/` artifacts when present

## Validation Checklist

- [ ] Agent names follow `spec-plan`, `spec-builder`, and `spec-review`.
- [ ] Handoffs follow the required sequence.
- [ ] Planning and review agents exclude edit tools.
- [ ] Execution agent references approved plan context.
- [ ] Approval-gated wording is present for handoffs.
