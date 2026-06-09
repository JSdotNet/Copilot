---
name: automation: guidelines-cap-analysis
description: >
  Analyse all instruction, agent, skill, and prompt files in the repository to detect files that
  are approaching or exceeding safe context-window size limits, contain duplicate guidance, or
  have low signal-to-noise ratio. Produces a prioritised remediation plan.
  Use when: auditing customization asset health, before adding new instructions,
  or after a large batch of asset changes.
---

# Automation: Guidelines Cap Analysis

## Purpose

Scan all Copilot customization assets (instructions, agents, skills, prompts) to identify
files that are too large, contain redundant content, or dilute instruction quality —
and produce a prioritised list of remediation actions to keep the asset set lean and effective.

## Inputs

- Scope: `all` (default) or a specific directory such as `.github/instructions/`.
- Size threshold for warnings: `3000` characters per file (default, configurable).
- Size threshold for blockers: `6000` characters per file (default, configurable).
- Include plugin assets: `true` (default) scans `plugins/**/SKILL.md` and sibling assets in addition
  to `.github/**`.

## Skill Dependencies

This skill orchestrates the following installed skills:

- **`suggestion-review`** — runs a future-improvement review on files flagged as high size or
  low signal, proposing concrete ways to trim or restructure them.
- **`todo-review`** — scans for open TODO items and unchecked checklist entries inside instruction
  files and converts them into tracked remediation tasks.

## Workflow

### Phase 1 — Inventory

1. List all customization asset files in scope:
   - `.github/instructions/**/*.instructions.md`
   - `.github/agents/**/*.agent.md`
   - `.github/skills/**/SKILL.md`
   - `.github/prompts/**/*.prompt.md`
   - `plugins/**/SKILL.md` (when include-plugin-assets is `true`)
   - `plugins/**/*.instructions.md`
   - `plugins/**/*.agent.md`

2. For each file, record:
   - File path.
   - Character count.
   - Line count.
   - Heading count (ATX `#` headings).
   - Presence of frontmatter (`---` block).

3. Classify each file:
   - ✅ **Healthy** — below warning threshold, well-structured.
   - ⚠️ **Warning** — between warning and blocker thresholds.
   - 🔴 **Blocker** — at or above blocker threshold.
   - ❓ **Missing frontmatter** — lacks required `applyTo` or `name`/`description` keys.

### Phase 2 — Duplication and Redundancy Scan

4. Check for duplicated guidance across files:
   - Same rules stated in both a plugin-local instruction and a repo-level instruction.
   - Identical or near-identical checklist items in multiple agent or skill files.
   - Restated constraints that already appear in a higher-priority instruction.

5. Assign a **Duplication flag** to each pair where overlap is detected. Record:
   - Source file and line range.
   - Target file and line range.
   - Overlap description (one sentence).

### Phase 3 — Signal-to-Noise Analysis

6. For each ⚠️ Warning or 🔴 Blocker file:
   - Use the `suggestion-review` skill to propose trimming opportunities:
     - Sections that restate other instructions.
     - Examples that could be shortened or moved to a `resources/` reference file.
     - Checklists with items already enforced by tooling (linters, formatters).
   - Use the `todo-review` skill to surface open TODOs or unchecked items
     embedded in the file that add size without delivering actionable value.

### Phase 4 — Remediation Plan

7. Produce a prioritised remediation table:

   | Priority | File | Size | Issue | Action |
   |----------|------|------|-------|--------|
   | 🔴 1 | `.github/instructions/meta-agent.instructions.md` | 7 200 chars | Exceeds blocker threshold | Split into two focused files |
   | ⚠️ 2 | `plugins/csharp-coding/skills/code-review/SKILL.md` | 4 100 chars | Duplicates repo-level checklist | Remove duplicated items |
   | ❓ 3 | `plugins/automations/skills/azure-sre-to-github-issue/SKILL.md` | 2 800 chars | Missing `applyTo` in frontmatter | Add `applyTo` key |

8. For each 🔴 Blocker file, propose a concrete split or trim plan:
   - Which sections to move to a `resources/` file.
   - Which sections to remove as duplicates.
   - Estimated size after remediation.

9. Ask the user to confirm which items to address in this session before making any changes.

### Phase 5 — Apply Approved Remediations

10. For each approved item (in priority order):
    - Trim or restructure the file as proposed.
    - Verify the file still passes the Markdown quality checklist:
      - One top-level `#` heading.
      - Required frontmatter keys present.
      - No trailing whitespace.
      - File ends with one newline.

11. Commit all changes on a branch named `chore/guidelines-cap-<YYYY-MM-DD>` with message:

    ```
    chore: trim and deduplicate customization assets <YYYY-MM-DD>

    - <n> files reduced below warning threshold
    - <n> duplicated rule sets removed
    - <n> frontmatter gaps fixed
    ```

### Phase 6 — Summary

12. Output a final report:

    | File | Before (chars) | After (chars) | Actions Taken |
    |------|---------------|--------------|---------------|
    | `meta-agent.instructions.md` | 7 200 | 3 100 | Split, moved examples to resources/ |
    | `code-review/SKILL.md` | 4 100 | 2 800 | Removed duplicated checklist |

## Output

- Full inventory table with size and health classification for every asset.
- Duplication report identifying overlapping guidance pairs.
- Prioritised remediation plan.
- Applied changes (if approved) committed on a dedicated branch.

## Notes

- No changes are made without explicit user approval in Phase 4.
- The size thresholds are heuristics; a large file that is not duplicated and has high
  signal is preferable to a small file that restates guidance from elsewhere.
- Run this automation periodically (for example, quarterly) or before large instruction
  authoring sessions to ensure the asset set remains focused and efficient.
