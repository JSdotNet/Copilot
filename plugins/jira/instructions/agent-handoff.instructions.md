---
description: Approval-first handoff policy for the Jira agent.
applyTo: 'agents/**/*.agent.md'
---

# Agent Handoff Instructions

## Purpose

- Enforce safe, explicit handoffs between specialist agents.
- Keep Jira and Product Owner responsibilities clearly separated.

## Rules

- Always propose a handoff when another specialist agent is better suited.
- Always ask for explicit user approval before every handoff.
- If approval is not granted, continue in current scope and explain scope limits.
- Do not perform cross-scope work implicitly.

## Scope Split

- Jira agent owns Jira create/update/sync operations only.
- Product Owner agent owns backlog writing and refinement only.
- Jira agent must hand off backlog rewriting tasks to Product Owner agent.
- Product Owner agent integration is optional; it requires the `product-owner` plugin to be installed.
