---
applyTo: '.github/agents/**'
description: Defines baseline structure and quality expectations for custom agent files.
---

# Agent Instructions

## Purpose

Define the standard for creating, structuring, and using agent files in the project. An agent configures the behavior of an AI agent (e.g., Copilot) for a specific context or workflow (e.g., architect, reviewer, tester).

## General Rules

- An agent file must only be created if the user explicitly requests a specific dialogue/configuration mode for the AI (e.g., "Create an architect agent", "Add a reviewer agent") or the approved plugin scope clearly requires a dedicated agent.
- Agents are passive: they modify the AI's behavior in the background for all relevant requests.
- If the user asks for a plugin-like capability bundle, define the package scope first, then determine whether new agents, instructions, skills, prompts, and resource files are needed.
- Each agent must be documented in English and clearly describe:
  - The expected role of the AI (e.g., "Act as an experienced software architect")
  - The priorities, tone, constraints, and objectives of the mode
  - The specific instructions to apply (e.g., "Always propose an architecture before generating code")
- The file name must follow the format: `{role}.agent.md` (e.g., `architect.agent.md`, `reviewer.agent.md`).
- The front matter must include:
  - `model` (required): selected from approved options.
  - `tools` (optional): List of tools required by the agent.
  - `description` (optional): summary of the agent.

## Model Selection Policy

When creating or updating files under `.github/agents/**/*.md`, always set an explicit `model` value in frontmatter.

Valid options:

- `GPT-5.3-Codex`
- `GPT-5`
- `auto`

Selection guidance:

1. Use `GPT-5.3-Codex` for tool-heavy or workflow-orchestration agents.
2. Use `GPT-5` for documentation-first agents where prose quality is primary.
3. Use `auto` for mixed responsibilities or when simpler maintenance is preferred.

Default rule for new agents:

- If there is no strong reason to pin a model, use `auto`.

Review requirement:

- In responses that create a new agent, include a short rationale for the selected model.

## Agent File Structure

1. Front matter YAML (mandatory)
2. Main title (`#`)
3. Agent purpose
4. Expected behavior
5. Constraints and priorities
6. Example usage
7. References (other related instructions or prompts)

## Examples

```markdown
---
model: auto
description: "Architect: Configure Copilot to act as a software architect."
---

# Architect Agent

## Purpose
Configure the AI to act as an experienced software architect, focusing on planning, documentation, and high-level design before any code generation.

## Expected Behavior
- Always propose an architecture or design before generating code.
- Use only Markdown for outputs (no code unless explicitly requested).
- Ask clarifying questions if requirements are ambiguous.

## Priorities
- Clarity, maintainability, and scalability of proposed solutions.
- Alignment with project instructions and standards.

## Example Usage
- "Design a microservice architecture for a file upload system."
- "What are the trade-offs between REST and gRPC for this use case?"

## References
- domain-driven-design.instructions.md
- object_calisthenics.instructions.md
```

## Validation Checklist

- [ ] The file name follows the `{role}.agent.md` format.
- [ ] Agent frontmatter includes an explicit `model` value.
- [ ] The role and behavior are clearly defined.
- [ ] The file is in English and follows the recommended structure.
- [ ] References to other instructions are present if relevant.
- [ ] If the request is plugin-oriented, linked skills and required resources are explicitly referenced.

## Plugin Composition Expectations

- Treat plugin creation as composition of Markdown assets, not a single file.
- Prefer this structure when applicable:
  - `.github/agents/*.agent.md`
  - `.github/instructions/**/*.instructions.md`
  - `.github/skills/<skill-name>/SKILL.md`
  - `.github/skills/<skill-name>/resources/**/*.md`
  - `.github/prompts/*.prompt.md`
- Resources should contain reusable content such as templates, checklists, examples, and decision matrices.
- Skills and agents should reference shared resources by relative path instead of copying content.