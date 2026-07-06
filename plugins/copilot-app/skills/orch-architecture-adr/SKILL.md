---
name: orch-architecture-adr
description: 'Orchestrate ADR creation in GitHub Copilot App canvas. Uses the architecture:architect agent for decision documentation and `jsdotnet-project-guidelines-mcpserver` to retrieve relevant project guidance and existing ADR context first.'
---

# Orchestrate Architectural Decision Record

Execute an ADR workflow in GitHub Copilot App canvas with upfront MCP-based guidance retrieval and architecture-agent drafting.

## Workflow Stages

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
Invoke: orch-architecture-adr
- Decision: "Should architecture orchestration own MCP guideline retrieval?"
- Scope: "Architecture and copilot-app plugins"
- Goal: capture decision, trade-offs, and downstream updates
```

## Canvas Interface

This skill opens an **ADR orchestration canvas** in GitHub Copilot App showing:

- **Decision statement panel** with drivers and constraints
- **Guideline context panel** populated from MCP lookups
- **Alternatives tracker** for selected and rejected options
- **Traceability checklist** for impacted architecture artifacts
- **Review controls** for publishing the ADR draft

## Integration Points

- **Architecture Plugin**: `architecture:architect` agent and `create-architectural-decision-record` skill
- **Review Plugin**: Traceability and consistency review
- **GitHub Copilot App**: Canvas-based ADR orchestration
- **JSdotNet Guidelines MCP**: Guidance and ADR retrieval before governed asset work

## Reference

Source skill location: `plugins/copilot-app/skills/orch-architecture-adr/SKILL.md`
