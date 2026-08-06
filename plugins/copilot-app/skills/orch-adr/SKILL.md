---
name: orch-adr
description: 'Orchestrate ADR creation in GitHub Copilot App canvas. Uses the architecture:architect agent for decision documentation plus `jsdotnet-guidelines-mcpserver` to retrieve relevant project guidance and existing ADR context first.'
---

# Orchestrate Architectural Decision Record

Execute an ADR workflow in GitHub Copilot App canvas with upfront MCP-based guidance retrieval and architecture-agent drafting.

## Input Expectations

- Decision statement and affected scope.
- Goal for the ADR (e.g., capture trade-offs, downstream updates).
- Whether existing ADRs or recommendations should be referenced.

## Workflow Stages

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and every transition needs explicit user approval.
>
> Model choice per stage follows `instructions/orch-model-selection.instructions.md`
> (category defaults, overridable via `.github/copilot-model-selection.md` in the
> consuming repo).

### Stage 1: Decision Context Retrieval
- **Clarify the decision statement** and affected scope
- **Query `jsdotnet-guidelines-mcpserver`** for standards, relevant guidance, governed asset constraints, and existing decision context
- **Capture constraints and decision drivers** that govern the requested change
- **Stop for MCP setup** if the required guideline tools are unavailable

**Agents:** `architecture:architect`
**MCP Servers:** `jsdotnet-guidelines-mcpserver`

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

**Agents:** `architecture:architect`

### Final Phases (Shared)

After Traceability Review, this skill runs the shared closing phases defined once in
`instructions/orch-shared-phases.instructions.md` (documentation/config tier), in order:

1. **Personal Validation** — hand back to the user (no agent); present the drafted
   artifacts and any review for the user to approve.
2. **Create Pull Request** — only after explicit user approval (mark skipped when there is
   no change set).
3. **Summary** — emit the run summary.

See `instructions/orch-shared-phases.instructions.md` for the full phase definitions;
update that file to change these phases for every orchestration.

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

This skill reports progress through the `orch-dashboard` canvas extension. Follow the
shared **Dashboard Reporting Contract** in
`instructions/orch-shared-phases.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence and the Personal Validation → Create Pull
Request gating. If the extension is not installed, skip the canvas calls and continue
through standard chat interaction.

- Call `start_run` with `skillId: "orch-adr"` and these stages: Decision Context Retrieval,
  ADR Drafting, Traceability Review, Personal Validation, Create Pull Request, Summary.
- During **ADR Drafting**, also open/update `markdown-canvas` (`markdown-preview`) with the
  drafted ADR content, per `instructions/canvas-usage.instructions.md`. Optional; skip
  gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-adr/SKILL.md`
