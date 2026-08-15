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
3. Draft frontmatter with `name` (matching the file name) and `description`.
   Author `tools` as Copilot tool ids only. Do not pin `model` — see
   [Dual-host rules](#dual-host-rules).
4. Draft core sections: purpose, behavior, constraints, references.
5. Document every handoff target in the body, not only in `handoffs` frontmatter.
6. Validate consistency and remove ambiguous or conflicting rules.
7. Run `pwsh ./scripts/Sync-ClaudePlugins.ps1` to add the Claude tool equivalents, then
   `-Check` to confirm the agent is valid for both hosts.

## Dual-host rules

Agent files in this repository load in both Copilot and Claude Code from a single copy.

- **No `model` pin.** Neither host accepts the other's model ids, and Claude refuses to load
  an agent whose model it does not recognise. Record the preference in a `## Model` section
  in the body instead.
- **`tools` is generated.** Author Copilot tool ids; the sync script appends the Claude
  equivalents. Hand-added Claude entries are reverted on the next run.
- **`name` is required.** Claude requires it; Copilot honours it over the file name.
- **`handoffs` is Copilot-only.** Claude ignores the key and delegates from the prose, so
  every target must also be described in the body.

See [Claude Code Compatibility](../../../../docs/copilot/claude-code-compatibility.md).

## Output

- A complete, valid `*.agent.md` file in Markdown that loads in both hosts.
