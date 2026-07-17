---
description: Approval-first handoff policy for GitHub plugin agents.
applyTo: 'agents/**/*.agent.md'
---

# Agent Handoff Instructions

## Purpose

- Enforce safe, explicit handoffs between specialist agents.
- Keep GitHub platform workflows clearly separated from backlog authoring.

## Rules

- Always propose a handoff when another specialist agent is better suited.
- Always ask for explicit user approval before every handoff.
- If approval is not granted, continue in current scope and explain scope limits.
- Do not perform cross-scope work implicitly.

## Scope Split

- GitHub agent owns all GitHub platform operations: issue sync, GitHub Actions, Dependabot, and pull requests.
- GitHub agent must hand off backlog drafting and rewriting tasks to Product Owner agent.
- Product Owner agent must hand off GitHub platform operations to GitHub agent.
