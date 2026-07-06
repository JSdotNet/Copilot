---
name: orch-architecture
description: 'Orchestrate general architecture work in GitHub Copilot App canvas. Uses the architecture:architect agent directly and `jsdotnet-project-guidelines-mcpserver` for guideline and ADR retrieval before governed asset changes.'
---

# Orchestrate Architecture Work

Execute a general architecture workflow in GitHub Copilot App canvas for requests that need the architect agent but do not fit a single specialized arc42, blueprint, ADR, or TDR flow.

## Input Expectations

- Architecture objective and expected output type (guidance, proposal, comparison, decision framing, or documentation update).
- Scope of affected systems or plugins.
- Whether governed asset constraints apply.

## Workflow Stages

> **Cross-plugin agents are recommended, not required.** When a referenced plugin is
> not installed, skip the stage or perform it manually and continue with remaining
> stages. All agent transitions require explicit user approval before switching.

### Stage 1: Goal & Guideline Retrieval
- **Clarify the architecture objective** and expected output
- **Query `jsdotnet-project-guidelines-mcpserver`** for relevant recommendations and ADRs
- **Capture repository constraints** that affect governed plugin or guidance assets
- **Stop for MCP setup** if the required guideline tools are unavailable

**Agents:** `architecture:architect`
**MCP Server:** `jsdotnet-project-guidelines-mcpserver`

### Stage 2: Architecture Investigation
- **Inspect the current repository context** and affected architecture surfaces
- **Identify suitable output shape** such as guidance, proposal, comparison, decision framing, or documentation update
- **Call out assumptions, risks, and open questions**
- **Align recommendations** with the retrieved guidance context

**Agents:** `architecture:architect`

### Stage 3: Drafting & Review
- **Draft the requested architecture outcome** in Markdown
- **Check internal consistency** across scope, constraints, risks, and traceability
- **Prepare a review-ready result** with explicit follow-up actions when needed

**Agents:** `architecture:architect`, `review:reviewer`

## Usage Pattern

```text
Invoke: orch-architecture
- Goal: evaluate and document the architecture impact of a plugin boundary change
- Scope: "architecture and copilot-app plugins"
- Output: proposal with risks, trade-offs, and recommended follow-up artifacts
- Use `jsdotnet-project-guidelines-mcpserver` before governed asset edits
```

## Output Expectations

- Architecture outcome drafted in Markdown.
- Assumptions, risks, and open questions called out.
- Recommendations aligned with retrieved guidance context.
- Internal consistency verified across scope, constraints, and traceability.
- Review-ready result prepared with explicit follow-up actions.

## Canvas Interface (Planned)

> Canvas panels described below represent the target experience. No canvas extensions
> are implemented yet. The skill currently operates through standard chat interaction.

- Goal panel for scope, output type, and success criteria
- Guideline context panel populated from MCP lookups
- Architecture investigation tracker for assumptions, risks, and open questions
- Draft and review panel for publishing a review-ready result
- Action buttons to continue investigation, refine the draft, or request review

## Reference

Source skill location: `plugins/copilot-app/skills/orch-architecture/SKILL.md`
