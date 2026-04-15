---
applyTo: 'instructions/**/*.instructions.md'
description: Dedicated rules for creating and refining instruction files.
---

# Create Instruction Instructions

## Purpose

- Define clear standards for `.instructions.md` assets.
- Keep instruction files scoped, reusable, and low-noise.

## Required Structure

1. YAML frontmatter with `applyTo` and `description`.
2. Title and purpose section.
3. Rules section.
4. Optional examples.
5. Validation checklist.

## Rules

- Use narrow `applyTo` patterns whenever possible.
- Write behavior rules as actionable statements.
- Separate mandatory rules from recommendations.
- Avoid duplicating content that belongs in another instruction file.
- Keep instructions in English.

## Validation Checklist

- [ ] `applyTo` pattern matches intended files.
- [ ] `description` is specific and discoverable.
- [ ] Instructions are concise and non-contradictory.
- [ ] Scope boundaries are explicit.
