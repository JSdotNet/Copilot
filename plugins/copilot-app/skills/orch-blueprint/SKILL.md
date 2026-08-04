---
name: orch-blueprint
description: 'Orchestrate architecture blueprint creation or refresh in GitHub Copilot App canvas. Uses the architecture:architect agent for blueprint work and `jsdotnet-project-guidelines-mcpserver` to ground governed asset changes in project guidance.'
---

# Orchestrate Architecture Blueprint

Execute a blueprint workflow in GitHub Copilot App canvas with MCP-guided context gathering up front and architecture drafting delegated to the architect agent.

## Input Expectations

- Target system or project name.
- Blueprint goal (e.g., refresh after boundary changes).
- Focus areas (e.g., dependencies, boundaries, traceability, risks).
- Whether governed asset constraints apply.

## Workflow Stages

> **Cross-plugin agents are recommended, not required.** When a referenced plugin is
> not installed, skip the stage or perform it manually and continue with remaining
> stages. All agent transitions require explicit user approval before switching.

### Stage 1: Scope & Guideline Retrieval
- **Define blueprint scope** and target audience
- **Query `jsdotnet-project-guidelines-mcpserver`** for relevant recommendations and ADRs
- **Capture repository constraints** that affect governed plugin or guidance assets
- **Stop for MCP setup** if the required guideline tools are unavailable

**Agents:** `architecture:architect`
**MCP Server:** `jsdotnet-project-guidelines-mcpserver`

### Stage 2: Blueprint Drafting
- **Identify system boundaries** and major components
- **Document architecture style** and integration relationships
- **Capture risks, assumptions, and quality goals**
- **Link blueprint statements** to the retrieved guidance context where relevant

**Agents:** `architecture:architect`
**Skills Used:** `architecture-blueprint-generator`

### Stage 3: Review & Traceability
- **Check internal consistency** across components, dependencies, and constraints
- **Highlight missing decisions** that should become ADRs or TDRs
- **Prepare a review-ready blueprint** with explicit follow-up items

**Agents:** `architecture:architect`, `review:reviewer`

## Usage Pattern

```text
Invoke: orch-blueprint
- System: "Copilot App plugin ecosystem"
- Goal: refresh the architecture blueprint after plugin boundary changes
- Focus: dependencies, boundaries, traceability, and risks
```

## Output Expectations

- System boundaries and major components identified.
- Architecture style and integration relationships documented.
- Risks, assumptions, and quality goals captured.
- Internal consistency verified across components and dependencies.
- Missing decisions flagged for ADR or TDR follow-up.
- Review-ready blueprint prepared with explicit follow-up items.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). If the extension is not
installed, skip the canvas calls below and continue through standard chat
interaction.

- Open canvas `orch-dashboard`, then call `start_run` with
  `skillId: "orch-blueprint"` and these stages: Scope & Guideline
  Retrieval, Blueprint Drafting, Review & Traceability.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. retrieved
  guidelines, drafted component map, or traceability findings.
- Call `finish_run` with the final status and a summary once the blueprint
  is review-ready.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-blueprint/SKILL.md`
