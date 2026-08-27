---
name: create-skill
description: Create or refine a focused SKILL.md with clear trigger conditions, workflow steps, and outputs. Use when authoring or reviewing a skill.
---

# Create Skill Skill

## Inputs

- Skill name and primary purpose.
- Trigger phrases and expected inputs.
- Required workflow steps and outputs.

## Workflow

1. Define one primary workflow for the skill.
2. Draft frontmatter with a `name` matching the folder and a `description` that names each
   distinct case the skill handles.
3. Draft the workflow steps, then add inputs, outputs, and quality checks only where the
   steps leave them unclear.
4. Describe actions rather than host-specific tool names, so both hosts read the skill alike.
5. Reference instruction and resource files by relative path.
6. Prune against
   [spec-conciseness.instructions.md](../../instructions/authoring/spec-conciseness.instructions.md):
   40-line budget, no rule stated twice.

## Output

- A `skills/<skill-name>/SKILL.md` file that passes
  [create-skill.instructions.md](../../instructions/authoring/create-skill.instructions.md).
