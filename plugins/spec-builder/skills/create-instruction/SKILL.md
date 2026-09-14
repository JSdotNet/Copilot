---
name: create-instruction
description: Create or refine a rule — a repository rule with one wrapper per host, or a plugin contract in resources/. Use when authoring or reviewing an instruction, rule, or contract file.
---

# Create Instruction Skill

## Inputs

- Whether the rule serves this repository (path-scoped) or ships inside a plugin (read by path).
- Desired behavior rules and quality checks.
- Existing conventions that must be preserved.

## Workflow

1. Decide the home: a repository rule goes to `.agents/rules/<topic>.md` with a `paths` list
   and a wrapper per host; a plugin contract goes to `resources/<name>.md` with `name` and
   `description` only. [create-instruction.md](../../resources/create-instruction.md) has both
   shapes.
2. Draft the rules, then add purpose, examples, and a validation checklist where they change
   how the rules are applied.
3. Check existing rules and contracts for the same rule, and point at the owner instead of
   restating it.
4. For a repository rule, write both wrappers with the same globs. For a plugin contract, add
   an explicit path reference from every skill or agent that depends on it.
5. Prune against [spec-conciseness.md](../../resources/spec-conciseness.md): 60-line budget,
   no rule stated twice.

## Output

- A rule or contract that passes
  [create-instruction.md](../../resources/create-instruction.md), with its wrappers or its
  references in the same change.
