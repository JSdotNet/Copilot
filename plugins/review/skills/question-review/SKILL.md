---
name: question-review
description: Run a structured review driven by explicit user questions and provide direct answers with evidence and follow-up actions.
---

# Question Review Skill

## Purpose and Trigger Conditions

Use this skill when the user provides a set of review questions and wants direct, evidence-backed answers.

## Input Expectations

- Review target location (file, folder, or document set).
- One or more review questions.
- Optional response format preferences.

## Workflow

1. Confirm the complete list of questions to answer.
2. Inspect the target artifacts relevant to each question.
3. Answer each question with:
   - Direct answer
   - Supporting evidence from the reviewed artifact
   - Confidence level (high, medium, or low)
4. Identify gaps where the artifact cannot fully answer a question.
5. Add follow-up recommendations for unresolved or low-confidence areas.

## Output Expectations and Quality Checks

- Every input question is answered or explicitly marked unresolved.
- Evidence is cited from the reviewed artifact.
- Confidence levels are provided for each answer.
- Follow-up actions are clear and scoped.
