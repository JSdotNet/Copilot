---
name: create-skill
description: Create or refine a focused SKILL.md with clear trigger conditions, workflow steps, and outputs.
---

# Create Skill Skill

## Purpose

Use this skill to create or refine reusable Copilot skills.

## Inputs

- Skill name and primary purpose.
- Trigger phrases and expected inputs.
- Required workflow steps and outputs.
- Whether anything else — an agent, a hook prompt, another skill — will invoke it by name.

## Workflow

1. Define one primary workflow for the skill.
2. Decide the invocation mode, before writing the description. Ask whether the model could
   usefully reach for this skill on its own, or whether another skill or agent must reach it.
   If neither, set `disable-model-invocation: true` and pay no context load. A user-invoked
   skill can be fired by nothing but the human, so never choose it for a skill something else
   invokes by name.
3. Draft frontmatter with a discoverable `name` and a `description` that matches the mode —
   explicit trigger language when model-invoked, one human-facing line with the trigger lists
   stripped when user-invoked.
4. Add sections for purpose, inputs, workflow, and output.
5. Remove unrelated tasks and ambiguity.
6. Verify that skill scope is narrow and reusable.

Follow `instructions/authoring/create-skill.instructions.md` for the full authoring rules,
including the dual-host frontmatter constraints.

## Output

- A complete `skills/<skill-name>/SKILL.md` file.
