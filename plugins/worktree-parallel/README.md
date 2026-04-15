# worktree-parallel

Installable GitHub Copilot plugin for dividing work across isolated git worktrees
with per-worktree agent continuity.

## Includes

- Agent:
  - `agents/worktree.agent.md`
- Skills:
  - `skills/divide-work/SKILL.md`

## Scope

- This plugin orchestrates task decomposition, isolation validation, and git worktree
  provisioning.
- It carries the calling agent identity forward into each worktree session.
- It does not implement work items — that is the responsibility of the agent running
  inside each worktree.

## Workflow Summary

1. Decompose the task into candidate work items.
2. Validate each item can run in isolation (no file overlap, no sequential dependency).
3. Resolve any items that fail the isolation check before proceeding.
4. Create a git worktree and feature branch per approved item.
5. Output per-worktree session start instructions that reference the calling agent.

## Local Install

```bash
copilot plugin install ./plugins/worktree-parallel
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install ./plugins/worktree-parallel
```

## Uninstall

```bash
copilot plugin uninstall worktree-parallel
```

## Resources

- [Git Worktree Docs](https://git-scm.com/docs/git-worktree) — official reference for
  `git worktree` commands.
- [GitHub Copilot Customization Docs](https://docs.github.com/en/copilot/customizing-copilot)
  — reference for agents, instructions, and skills.
