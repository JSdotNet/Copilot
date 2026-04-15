---
applyTo: 'agents/**/*.agent.md'
description: Standardizes model selection guidance for architecture agent frontmatter.
---

# Agent Model Recommendation Policy

## Purpose

- Standardize model selection for custom agents in this plugin.
- Ensure each agent frontmatter includes an explicit `model` value.

## Policy

When creating or updating files under `agents/**/*.agent.md`, always recommend and set a `model` value in frontmatter.

Valid options:

- `GPT-5.3-Codex`
- `GPT-5`
- `auto`

## Selection Guidance

1. Use `GPT-5.3-Codex` for tool-heavy or workflow orchestration agents.
2. Use `GPT-5` for prose-heavy strategy or documentation-first agents.
3. Use `auto` for mixed responsibilities or simpler maintenance.

## Default Rule For New Agents

- If there is no strong reason to pin a model, use `auto`.

## Review Requirement

- In responses that create a new agent, include a short rationale for the selected model.
