---
name: create-agent
description: Create or refine a GitHub Copilot agent file with correct frontmatter, scope, and behavior.
---

# Create Agent Skill

## Purpose

Use this skill to create or refine `*.agent.md` files for GitHub Copilot workflows.

## Inputs

- Agent role and intent.
- Scope boundaries.
- Required tools and handoff expectations.

## Workflow

1. Review existing related agent and instruction files.
2. Define role, priorities, constraints, and quality expectations.
3. Draft frontmatter with `description` and `model`.
4. Draft core sections: purpose, behavior, constraints, references.
5. Validate consistency and remove ambiguous or conflicting rules.

## Output

- A complete, valid `*.agent.md` file in Markdown.
