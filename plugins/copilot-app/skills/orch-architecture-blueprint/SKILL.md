---
name: orch-architecture-blueprint
description: 'Orchestrate architecture blueprint creation or refresh in GitHub Copilot App canvas. Uses the architecture:architect agent for blueprint work and `jsdotnet-project-guidelines-mcpserver` to ground governed asset changes in project guidance.'
---

# Orchestrate Architecture Blueprint

Execute a blueprint workflow in GitHub Copilot App canvas with MCP-guided context gathering up front and architecture drafting delegated to the architect agent.

## Workflow Stages

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
Invoke: orch-architecture-blueprint
- System: "Copilot App plugin ecosystem"
- Goal: refresh the architecture blueprint after plugin boundary changes
- Focus: dependencies, boundaries, traceability, and risks
```

## Canvas Interface

This skill opens an **architecture blueprint canvas** in GitHub Copilot App showing:

- **Scope definition panel** for audience, boundaries, and assumptions
- **Guideline context panel** populated from MCP lookups
- **Component map checklist** for structure and interactions
- **Traceability panel** for ADR and TDR follow-up
- **Review controls** for publishing a review-ready draft

## Integration Points

- **Architecture Plugin**: `architecture:architect` agent and `architecture-blueprint-generator` skill
- **Review Plugin**: Review-ready output checks
- **GitHub Copilot App**: Canvas-based blueprint tracking
- **JSdotNet Guidelines MCP**: Guideline and ADR retrieval before governed asset work

## Reference

Source skill location: `plugins/copilot-app/skills/orch-architecture-blueprint/SKILL.md`
