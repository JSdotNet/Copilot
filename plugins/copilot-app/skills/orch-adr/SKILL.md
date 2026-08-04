---
name: orch-adr
description: 'Orchestrate ADR creation in GitHub Copilot App canvas. Uses the architecture:architect agent for decision documentation and `jsdotnet-project-guidelines-mcpserver` to retrieve relevant project guidance and existing ADR context first.'
---

# Orchestrate Architectural Decision Record

Execute an ADR workflow in GitHub Copilot App canvas with upfront MCP-based guidance retrieval and architecture-agent drafting.

## Input Expectations

- Decision statement and affected scope.
- Goal for the ADR (e.g., capture trade-offs, downstream updates).
- Whether existing ADRs or recommendations should be referenced.

## Workflow Stages

> **Cross-plugin agents are recommended, not required.** When a referenced plugin is
> not installed, skip the stage or perform it manually and continue with remaining
> stages. All agent transitions require explicit user approval before switching.

### Stage 1: Decision Context Retrieval
- **Clarify the decision statement** and affected scope
- **Query `jsdotnet-project-guidelines-mcpserver`** for relevant recommendations and existing ADRs
- **Capture constraints and decision drivers** that govern the requested change
- **Stop for MCP setup** if the required guideline tools are unavailable

**Agents:** `architecture:architect`
**MCP Server:** `jsdotnet-project-guidelines-mcpserver`

### Stage 2: ADR Drafting
- **Document context** and competing alternatives
- **Record the selected option** with rationale and trade-offs
- **Capture consequences, risks, and rollback notes**
- **Link the draft** to the retrieved guideline and ADR context where relevant

**Agents:** `architecture:architect`
**Skills Used:** `create-architectural-decision-record`

### Stage 3: Traceability Review
- **Check naming and status consistency** with existing ADRs
- **Identify dependent blueprint, arc42, or TDR updates**
- **Prepare a review-ready ADR** with explicit follow-up actions

**Agents:** `architecture:architect`, `review:reviewer`

## Usage Pattern

```text
Invoke: orch-adr
- Decision: "Should architecture orchestration own MCP guideline retrieval?"
- Scope: "Architecture and copilot-app plugins"
- Goal: capture decision, trade-offs, and downstream updates
```

## Output Expectations

- ADR drafted with context, alternatives, and selected option.
- Rationale and trade-offs documented.
- Consequences, risks, and rollback notes captured.
- Naming and status consistency verified against existing ADRs.
- Follow-up actions identified (blueprint, arc42, or TDR updates).

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). If the extension is not
installed, skip the canvas calls below and continue through standard chat
interaction.

- Open canvas `orch-dashboard`, then call `start_run` with
  `skillId: "orch-adr"` and these stages: Decision Context Retrieval, ADR
  Drafting, Traceability Review.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. retrieved
  guidelines, drafted ADR content, or traceability findings.
- Call `finish_run` with the final status and a summary once the ADR is
  review-ready.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-adr/SKILL.md`
