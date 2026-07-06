---
name: orch-architecture-tdr
description: 'Orchestrate technical debt record creation in GitHub Copilot App canvas. Uses the architecture:architect agent for debt documentation and `jsdotnet-project-guidelines-mcpserver` to ground the record in project guidance and related decisions.'
---

# Orchestrate Technical Debt Record

Execute a TDR workflow in GitHub Copilot App canvas with MCP-guided context retrieval first and the architect agent handling the documentation work.

## Input Expectations

- Debt item description and affected scope.
- Goal for the TDR (e.g., capture impact, remediation path).
- Whether related ADRs or recommendations should be referenced.

## Workflow Stages

> **Cross-plugin agents are recommended, not required.** When a referenced plugin is
> not installed, skip the stage or perform it manually and continue with remaining
> stages. All agent transitions require explicit user approval before switching.

### Stage 1: Debt Context Retrieval
- **Clarify the debt item** and affected scope
- **Query `jsdotnet-project-guidelines-mcpserver`** for relevant recommendations, ADRs, and constraints
- **Capture remediation boundaries** for governed plugin or guidance assets
- **Stop for MCP setup** if the required guideline tools are unavailable

**Agents:** `architecture:architect`
**MCP Server:** `jsdotnet-project-guidelines-mcpserver`

### Stage 2: TDR Drafting
- **Describe the debt origin** and current impact
- **Capture severity, ownership, and remediation window**
- **Link the record** to retrieved guidance and related architecture artifacts
- **Document follow-up work** needed to reduce or retire the debt

**Agents:** `architecture:architect`
**Skills Used:** `create-technical-debt-record`

### Stage 3: Risk & Follow-Up Review
- **Check impact statements** across delivery, quality, and operations
- **Identify related ADR, blueprint, or arc42 follow-up**
- **Prepare a review-ready TDR** with an actionable remediation path

**Agents:** `architecture:architect`, `review:reviewer`

## Usage Pattern

```text
Invoke: orch-architecture-tdr
- Debt: "Architecture guidance retrieval is inconsistent across plugin workflows"
- Scope: "copilot-app orchestration skills"
- Goal: capture impact, remediation path, and related decisions
```

## Output Expectations

- Debt origin and current impact described.
- Severity, ownership, and remediation window captured.
- Record linked to retrieved guidance and related architecture artifacts.
- Follow-up work documented to reduce or retire the debt.
- Impact statements verified across delivery, quality, and operations.
- Review-ready TDR prepared with actionable remediation path.

## Canvas Interface (Planned)

> Canvas panels described below represent the target experience. No canvas extensions
> are implemented yet. The skill currently operates through standard chat interaction.

- Debt summary panel with scope and impact
- Guideline context panel populated from MCP lookups
- Remediation tracker for owner, severity, and timing
- Traceability checklist for linked architecture artifacts
- Review controls for publishing the TDR draft

## Reference

Source skill location: `plugins/copilot-app/skills/orch-architecture-tdr/SKILL.md`
