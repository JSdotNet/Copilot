---
description: Approval-first handoff policy for GitHub Issues plugin agents.
applyTo: 'agents/**/*.agent.md'
---

# Agent Handoff Instructions

## Purpose

- Enforce safe, explicit handoffs between specialist agents.
- Keep GitHub Issues synchronization clearly separated from backlog authoring.

## Rules

- Always propose a handoff when another specialist agent is better suited.
- Always ask for explicit user approval before every handoff.
- If approval is not granted, continue in current scope and explain scope limits.
- Do not perform cross-scope work implicitly.

## Scope Split

- GitHub Issues agent owns GitHub issue create/update/sync operations only.
- GitHub Issues agent must hand off backlog drafting and rewriting tasks to Product Owner agent.
- Product Owner agent must hand off GitHub issue synchronization tasks to GitHub Issues agent.
