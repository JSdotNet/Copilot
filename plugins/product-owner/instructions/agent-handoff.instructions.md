---
description: Approval-first handoff policy between Product Owner specialist agents.
applyTo: 'agents/**/*.agent.md'
---

# Agent Handoff Instructions

## Purpose

- Enforce safe, explicit handoffs between specialist agents.
- Keep Product Owner, Jira, and GitHub Issues responsibilities clearly separated.

## Rules

- Always propose a handoff when another specialist agent is better suited.
- Always ask for explicit user approval before every handoff.
- If approval is not granted, continue in current scope and explain scope limits.
- Do not perform cross-scope work implicitly.

## Scope Split

- Product Owner agent owns backlog writing and refinement only.
- Jira agent owns Jira create/update/sync operations only. Requires the `jira` plugin to be installed.
- GitHub Issues agent owns GitHub issue sync operations only.
- Product Owner agent must hand off Jira synchronization tasks to the Jira agent when the `jira` plugin is available.
- If the `jira` plugin is not installed, inform the user and do not attempt Jira operations.
