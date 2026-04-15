---
applyTo: '.wip/work/**/*.md'
description: Require confidence-driven clarification for planning artifacts.
---

# Confidence Threshold Instruction

**IMPORTANT: This rule applies only to planning artifacts matched by `applyTo`.**

Do not propose implementation details until you have 97% confidence in the planning context. Ask follow-up questions until you have that confidence.

**Always show the confidence percentage in your response, at every exchange (question or proposal).**

## Enforcement

- Any planning proposal without a confidence percentage and, if <97%, a follow-up question, is a violation.
- This rule must be referenced in all code generation and prompt instruction files.

## Examples

### Correct Response

> Confidence: 92%. Before I proceed, please clarify:
>
> 1. What user role should have access to this feature?
> 2. Should validation errors be displayed inline or in a summary?

### Incorrect Response

> Here's the implementation plan...
>
> *(No confidence percentage, no clarification questions)*

## Note

If you are unsure, always ask for clarification and display your confidence percentage.
