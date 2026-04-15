---
applyTo: '.github/agents/**/*.md'
description: Recommends and standardizes model selection for agent frontmatter.
---

# Agent Model Recommendation Policy

## Purpose

- Standardize model selection for custom agents.
- Ensure each agent frontmatter includes an explicit `model` value.

## Policy

When creating or updating files under `.github/agents/**/*.md`, always recommend and set a `model` value in frontmatter.

Valid options:

- `GPT-5.3-Codex`
- `GPT-5`
- `auto`

## Selection Guidance

1. Use `GPT-5.3-Codex` for tool-heavy, implementation-oriented, or workflow-orchestration agents.
2. Use `GPT-5` for prose-heavy strategy or documentation-first agents when writing quality is the primary goal.
3. Use `auto` when the agent has mixed responsibilities, when model routing may improve over time, or when the team prefers simpler maintenance.

## Default Rule For New Agents

- If there is no strong reason to pin a model, use `auto`.

## Review Requirement

- In responses that create a new agent, include a short rationale for the selected model.
