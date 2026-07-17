---
name: todo-review
description: Run a review based on TODO items and open checklist entries in any artifact (code, stories, documentation, architecture, etc.), then convert them into prioritized findings and next actions.
---

# TODO Review Skill

## Purpose and Trigger Conditions

Use this skill when the user asks to review TODO notes, backlog bullets, open checklist items, or unresolved placeholders in any artifact — including source code, user stories, documentation, architecture documents, configuration files, or any other review target.

The calling agent provides the domain knowledge about the review target; this skill drives the TODO-based review workflow.

## Input Expectations

- Review target location (file, folder, or document set) and its type (code, story, docs, architecture, etc.).
- TODO source content or path.
- Optional constraints (timebox, severity focus, or category focus).

## Workflow

1. Collect TODO entries from the target artifact.
2. Normalize TODO items into clear review statements.
3. For each TODO item, assess:
   - Why it exists
   - Risk if unresolved
   - Expected completion criteria
4. Classify each item:
   - High priority
   - Medium priority
   - Low priority
5. Produce a review report with findings, assumptions, and recommended next actions.

## Output Expectations and Quality Checks

- Every TODO item is either resolved, deferred with rationale, or escalated as a finding.
- Findings are explicit, actionable, and prioritized.
- Unknowns are listed as open questions.
- Recommendations include the smallest practical next step.
