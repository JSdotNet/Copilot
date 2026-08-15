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

## Dual-Host Rules

The file itself is portable — both hosts read the Markdown unchanged — but **`applyTo` is
Copilot-only**. Claude Code has no glob-scoped instruction injection, so an instruction file
that relies purely on ambient glob matching silently does nothing there.

- Reference the instruction file **explicitly by path** from every skill or agent that
  depends on it. Explicit references work identically in both hosts and are the reason most
  instructions in this repository already port cleanly.
- Treat `applyTo` as an optimisation for Copilot, not as the delivery mechanism.
- When a rule genuinely must apply automatically with no explicit reference, promote it to
  the plugin's `hooks.json` `sessionStart` prompt, which both hosts honour.

See `docs/copilot/claude-code-compatibility.md`.

## Validation Checklist

- [ ] `applyTo` pattern matches intended files.
- [ ] `description` is specific and discoverable.
- [ ] Instructions are concise and non-contradictory.
- [ ] Scope boundaries are explicit.
- [ ] At least one skill or agent references the file by path, or the rule is promoted to a
      `sessionStart` hook.
