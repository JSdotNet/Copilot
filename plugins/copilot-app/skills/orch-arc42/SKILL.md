---
name: orch-arc42
description: 'Orchestrate arc42 architecture documentation with GitHub Copilot App canvas. Uses the architecture:architect agent for section drafting and `jsdotnet-project-guidelines-mcpserver` for guideline and ADR grounding before governed asset changes.'
---

# Orchestrate arc42 Documentation

Execute an arc42 documentation workflow in GitHub Copilot App canvas while keeping the architect agent independent and moving guideline retrieval into the orchestration layer.

## Workflow Stages

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

## Canvas Interface

This skill opens an **arc42 orchestration canvas** in GitHub Copilot App showing:

- **Section picker** for target arc42 sections
- **Guideline context panel** populated from MCP lookups
- **Draft tracker** with assumptions, risks, and cross-links
- **Review checklist** for consistency and traceability
- **Action buttons** to continue drafting or request review

## Integration Points

- **Architecture Plugin**: `architecture:architect` agent and `architecture-arc42-generator` skill
- **Review Plugin**: Consistency review and follow-up findings
- **GitHub Copilot App**: Canvas-based stage tracking and review flow
- **JSdotNet Guidelines MCP**: Guideline and ADR retrieval before governed asset work

## Reference

Source skill location: `plugins/copilot-app/skills/orch-arc42/SKILL.md`
