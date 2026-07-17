---
name: suggestion-review
description: Run a future-improvement review that proposes practical suggestions to improve, extend, or harden any artifact (code, stories, documentation, architecture, etc.).
---

# Suggestion Review Skill

## Purpose and Trigger Conditions

Use this skill when the user asks for future improvements, extension ideas, or practical suggestions beyond current scope for any artifact — including source code, user stories, documentation, architecture documents, configuration files, or any other review target.

The calling agent provides the domain knowledge about the review target; this skill drives the suggestion-focused review workflow.

## Input Expectations

- Review target location (file, folder, or document set) and its type (code, story, docs, architecture, etc.).
- Improvement objective (quality, maintainability, speed, usability, clarity, scalability, or completeness).
- Optional constraints (budget, timeline, complexity, or team capacity).

## Workflow

1. Establish the current state and review objective.
2. Identify improvement opportunities across:
   - Structure and organization
   - Quality and consistency
   - Coverage and completeness
   - Extensibility and maintainability
3. Propose suggestions with:
   - Expected benefit
   - Effort estimate (small, medium, large)
   - Risk level (low, medium, high)
4. Rank suggestions by value versus effort.
5. Return a phased recommendation plan:
   - Quick wins
   - Next iteration
   - Longer-term opportunities

## Output Expectations and Quality Checks

- Suggestions are concrete and relevant to the target.
- Value, effort, and risk are provided for each suggestion.
- Ranking is clear and justified.
- Plan includes at least one quick win and one longer-term idea.
