---
name: story-review-pre-refinement
description: >
  Review a Fincent user story before sprint refinement: assess architectural readiness,
  identify hidden technical risks, determine if enabler stories are needed, and confirm
  the story is implementable as scoped.
---

# Story Review — Pre-Refinement (Architect)

## Agent Discovery

This skill targets an **Architect agent** — an agent focused on software architecture,
technical design, system boundaries, and feasibility assessment.

To locate one:

1. Check installed agents for an agent whose description includes terms such as
   "architect", "architecture", "technical design", "system design", or "feasibility".
2. If a matching agent is found, activate it before running this skill.
3. If no matching agent is found, continue with the default active agent.

The skill works independently of any specific agent name or plugin.

## Purpose and Trigger Conditions

Use this skill when an architect or tech lead needs to evaluate a story before it enters
sprint refinement. The focus is on technical feasibility, architectural fit, and identifying
infrastructure or enabler work that must precede delivery.

## Input Expectations

- The user story to review (Jira key, link, or pasted content).
- Optional: architecture documentation or ADR links.
- Optional: existing enabler stories or spikes.

## Workflow

1. Load the story content. If only a Jira key is provided and a Jira retrieval skill is
   available, use it to fetch the story. Otherwise ask the user to paste the story text.
2. Load `resources/dor.md` to apply the Fincent Definition of Ready (architecture section).
3. Load `resources/templates/story-review-checklist.md` (Pre-Refinement section).
4. Evaluate each Pre-Refinement criterion:

   ### Bounded Context Fit
   - Does the story belong to a single bounded context?
   - Are cross-context integrations explicitly defined with integration contracts?

   ### Technical Assumptions
   - Are there hidden assumptions about infrastructure, APIs, or external services?
   - Are non-functional requirements (performance, security, scalability) identified?

   ### Architecture Risk
   - Does the story require architectural decisions that are not yet made?
   - Are there risks that need a spike before delivery?

   ### Enabler Check
   - Does the story require infrastructure, platform, or foundational architecture work
     before it can be delivered by a feature team?
   - If yes: flag the need for an **Enabler Story** or **Enabler Feature** and describe
     the scope of the enabler.

   ### Security and Compliance
   - Are there security or regulatory implications (e.g., PSD2, GDPR, AML) that must
     be addressed before delivery?

5. Classify each criterion as ✅, ⚠️, or ❌.
6. Produce overall readiness classification:
   - ✅ **Architecturally ready** — no blockers; the story can enter refinement.
   - ⚠️ **Conditionally ready** — proceed with noted conditions or parallel enabler work.
   - ❌ **Not ready** — architectural gaps block delivery; list required actions before refinement.
7. If an enabler is needed, draft a brief enabler story description with title, type, and scope.

## Output Expectations

- Completed Pre-Refinement section of the story review checklist.
- Overall architectural readiness classification with rationale.
- Enabler story draft (if applicable) with: title, enabler type, and acceptance scope.
- Prioritised list of architectural actions if the story is not ready.

## Quality Checks

- The review focuses on architecture and feasibility — do not rewrite business acceptance criteria.
- Enabler identification is always explicit; never assume the team will discover the need later.
- Security and compliance implications are never skipped for Fincent stories.

## References

- `resources/dor.md` — Fincent Definition of Ready
- `resources/templates/story-review-checklist.md` — review checklist

   ### Bounded Context Fit
   - Does the story belong to a single bounded context?
   - Are cross-context integrations explicitly defined with integration contracts?

   ### Technical Assumptions
   - Are there hidden assumptions about infrastructure, APIs, or external services?
   - Are non-functional requirements (performance, security, scalability) identified?

   ### Architecture Risk
   - Does the story require architectural decisions that are not yet made?
   - Are there risks that need a spike before delivery?

   ### Enabler Check
   - Does the story require infrastructure, platform, or foundational architecture work
     before it can be delivered by a feature team?
   - If yes: flag the need for an **Enabler Story** or **Enabler Feature** and describe
     the scope of the enabler.

   ### Security and Compliance
   - Are there security or regulatory implications (e.g., PSD2, GDPR, AML) that must
     be addressed before delivery?

5. Classify each criterion as ✅, ⚠️, or ❌.
6. Produce overall readiness classification:
   - ✅ **Architecturally ready** — no blockers; the story can enter refinement.
   - ⚠️ **Conditionally ready** — proceed with noted conditions or parallel enabler work.
   - ❌ **Not ready** — architectural gaps block delivery; list required actions before refinement.
7. If an enabler is needed, draft a brief enabler story description with title, type, and scope.

## Output Expectations

- Completed Pre-Refinement section of the story review checklist.
- Overall architectural readiness classification with rationale.
- Enabler story draft (if applicable) with: title, enabler type, and acceptance scope.
- Prioritised list of architectural actions if the story is not ready.

## Quality Checks

- The review focuses on architecture and feasibility — do not rewrite business acceptance criteria.
- Enabler identification is always explicit; never assume the team will discover the need later.
- Security and compliance implications are never skipped for Fincent stories.

## References

- `resources/dor.md` — Fincent Definition of Ready
- `resources/templates/story-review-checklist.md` — review checklist
