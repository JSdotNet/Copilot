---
name: orch-arc42
description: 'Orchestrate arc42 architecture documentation with GitHub Copilot App canvas. Uses the architecture:architect agent for section drafting and `jsdotnet-project-guidelines-mcpserver` for guideline and ADR grounding before governed asset changes.'
---

# Orchestrate arc42 Documentation

Execute an arc42 documentation workflow in GitHub Copilot App canvas while keeping the architect agent independent and moving guideline retrieval into the orchestration layer.

## Input Expectations

- Target system or project name.
- arc42 sections to draft or refresh (e.g., 1, 3, 9).
- Documentation goal (e.g., refresh before restructuring).
- Whether governed asset constraints apply.

## Workflow Stages

> **Cross-plugin agents are recommended, not required.** When a referenced plugin is
> not installed, skip the stage or perform it manually and continue with remaining
> stages. All agent transitions require explicit user approval before switching.

### Stage 1: Context & Guideline Retrieval
- **Clarify target sections** and documentation goals
- **Query `jsdotnet-project-guidelines-mcpserver`** for relevant recommendations and ADRs
- **Collect repository-specific constraints** for governed plugin or guidance assets
- **Stop for MCP setup** if the required guideline tools are unavailable

**Agents:** `architecture:architect`
**MCP Server:** `jsdotnet-project-guidelines-mcpserver`

### Stage 2: Section Drafting
- **Load arc42 global instructions** and target section instructions
- **Draft or refresh target sections** with explicit assumptions
- **Link decisions and constraints** to the retrieved guidance context
- **Record open questions** that still need user input

**Agents:** `architecture:architect`
**Skills Used:** `architecture-arc42-generator`

### Stage 3: Cross-Section Review
- **Check consistency** across scope, constraints, quality goals, and risks
- **Highlight gaps** between current documentation and retrieved guidance
- **Prepare a review-ready update set** for the requested sections

**Agents:** `architecture:architect`, `review:reviewer`

## Usage Pattern

```text
Invoke: orch-arc42
- System: "Copilot plugin monorepo"
- Sections: 1, 3, and 9
- Goal: refresh architecture documentation before plugin restructuring
- Constraint: use project guideline MCP before governed asset edits
```

## Output Expectations

- Target arc42 sections drafted or refreshed with explicit assumptions.
- Decisions and constraints linked to retrieved guidance context.
- Open questions recorded for user input.
- Cross-section consistency verified.
- Review-ready update set prepared.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). If the extension is not
installed, skip the canvas calls below and continue through standard chat
interaction.

- Open canvas `orch-dashboard`, then call `start_run` with
  `skillId: "orch-arc42"` and these stages: Context & Guideline Retrieval,
  Section Drafting, Cross-Section Review.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. retrieved
  guidelines, drafted section content, or review findings.
- Call `finish_run` with the final status and a summary once the arc42
  sections are review-ready.
- During **Section Drafting**, also open/update `markdown-canvas` (`markdown-preview`)
  with the drafted arc42 section content, per
  `instructions/canvas-usage.instructions.md`. Optional; skip gracefully if not
  installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-arc42/SKILL.md`
