---
applyTo: '.github/agents/**/*.md'
description: Defines mandatory approval flow and wording for cross-agent handoffs.
---

# Agent Handoff Approval Instructions

## Purpose

- Define one shared handoff policy for all agents.
- Ensure handoffs are proposed when needed and never executed without user approval.

## Mandatory Policy

- Always propose handoff when another specialist agent is better suited for the request.
- Always ask for explicit user approval before every handoff.
- Never switch agents without explicit user approval in the current conversation.
- If approval is not granted, continue in current scope and clearly state limitations.
- For recurring transitions, prefer agent frontmatter `handoffs` so the next step is explicit and easy to approve.
- A user selecting a handoff button counts as explicit approval, but the agent must still explain the target agent and expected benefit before the button is used.

## Required Handoff Flow

1. Explain why a handoff is recommended.
2. Name the target agent and expected benefit.
3. Ask the user for explicit approval to proceed.
4. If artifacts exist (plans, partial analyses, checklists), store them under `.wip/` and reference the file path in the handoff context.
5. Only after approval, perform the handoff.

## Handoff Artifact Completeness

- Handoffs should include enough actionable context to avoid rediscovery.
- For planning or implementation handoffs, include:
  - Current objective and status
  - Decisions made and assumptions
  - Remaining steps
  - Paths to related artifacts under `.wip/`
- Partial outputs (for example implementation plans) must be saved under `.wip/` rather than temporary or ad hoc locations.

## Required Wording Pattern

- Use clear approval-seeking language such as:
  - "I recommend handing this off to `<agent>` because `<reason>`. Do you approve this handoff?"

## Recommended Handoff Button Pattern

- When an agent has a common next step, define a `handoffs` entry in frontmatter.
- Use short, action-oriented labels such as `Start Implementation`, `Deep Dive Analysis`, or `Sync To Jira`.
- Keep prompts specific to the target agent's job so the next step starts with enough context.
- Prefer `send: false` unless the handoff is safe to run immediately without further user editing.

## Compliance Checklist

- [ ] Handoff was proposed only when needed.
- [ ] Explicit user approval was requested before switching.
- [ ] No handoff was executed without approval.
- [ ] Relevant partial artifacts were saved under `.wip/` and referenced in the handoff.
- [ ] If rejected, current agent continued with best in-scope support.
