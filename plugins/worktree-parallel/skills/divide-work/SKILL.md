---
name: divide-work
description: >
  Divide a task into isolated work items and execute each in a separate git worktree.
  Use when: splitting a feature, parallelising agent tasks, distributing work across branches,
  running multiple worktrees, isolating changes, parallel Copilot agent sessions.
---

# Divide Work Skill

## Purpose

Use this skill to break a task into independently executable work items, create a
dedicated git worktree per item, and continue using the current agent in each
worktree.

## Inputs

- Task or feature description to divide.
- Base branch to branch from (default: current branch).
- Calling agent identifier (detected automatically from the active agent context).

## Workflow

### Phase 1 — Isolation Check

1. Decompose the overall task into candidate work items.
2. For each candidate, verify it can be executed in isolation:
   - No shared mutable state or file overlap with other items.
   - No sequential dependency that blocks parallel execution.
   - Self-contained enough to be merged independently.
3. Flag any item that fails the isolation check and ask the user how to resolve it
   before proceeding:
   - **Merge** — combine with a dependent item.
   - **Sequence** — mark as follow-up work, not parallelised.
   - **Redesign** — ask the user to clarify the boundary.

> Do not continue to Phase 2 until every planned work item passes the isolation check.

### Phase 2 — Worktree Setup

4. Determine the base branch:
   ```bash
   git branch --show-current
   ```
5. For each approved work item, create a feature branch and worktree:
   ```bash
   git worktree add ../worktrees/<item-slug> -b <branch-name>
   ```
   - Use kebab-case slugs derived from the work item title.
   - Branch names follow the pattern `worktree/<item-slug>`.

6. List all created worktrees to confirm:
   ```bash
   git worktree list
   ```

### Phase 3 — Agent Handoff per Worktree

7. Detect the active agent from the current conversation context
   (e.g. `developer.agent.md`, `architect.agent.md`, `spec-builder.agent.md`).
8. For each worktree, present a ready-to-use session start instruction:
   - Target directory: `../worktrees/<item-slug>`
   - Agent to reuse: the detected calling agent
   - Scope: only the files and changes relevant to that work item
9. Instruct the user to open each worktree folder in a new VS Code window or
   Copilot chat session and activate the same agent there.

> Each worktree session must operate independently. Do not share context, files,
> or intermediate outputs between sessions unless explicitly merged.

### Phase 4 — Summary

10. Output a work division table:

| # | Work Item | Branch | Worktree Path | Status |
|---|-----------|--------|---------------|--------|
| 1 | `<title>` | `worktree/<slug>` | `../worktrees/<slug>` | Ready |

11. Note any items that were excluded from parallelisation and why.

## Output

- Confirmed worktrees via `git worktree list`.
- Work division table with branch names, paths, and isolation status.
- Per-worktree session start instructions referencing the active agent.
