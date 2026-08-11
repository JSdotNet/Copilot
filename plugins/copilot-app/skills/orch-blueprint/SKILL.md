---
name: orch-blueprint
description: 'Orchestrate architecture blueprint creation or refresh in GitHub Copilot App canvas. Uses the architecture:architect agent for blueprint work and `jsdotnet-guidelines-mcpserver` to ground governed asset changes in project guidance.'
---

# Orchestrate Architecture Blueprint

Execute a blueprint workflow in GitHub Copilot App canvas with MCP-guided context gathering up front and architecture drafting delegated to the architect agent.

## Input Expectations

- Target system or project name.
- Blueprint goal (e.g., refresh after boundary changes).
- Focus areas (e.g., dependencies, boundaries, traceability, risks).
- Whether governed asset constraints apply.

## Workflow Stages

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and every transition needs explicit user approval.
>
> Model choice per stage follows `instructions/orch-model-selection.instructions.md`
> (category defaults, overridable via personal global model selection or
> `.github/copilot-model-selection.md` in the consuming repo).

### Stage 1: Scope & Guideline Retrieval
- **Define blueprint scope** and target audience
- **Query `jsdotnet-guidelines-mcpserver`** for standards, relevant guidance, ADR context, and governed asset constraints
- **Capture repository constraints** that affect governed plugin or guidance assets
- **Stop for MCP setup** if the required guideline tools are unavailable

**Agents:** `architecture:architect`
**MCP Servers:** `jsdotnet-guidelines-mcpserver`

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

**Agents:** `architecture:architect`

### Final Phases (Shared)

After Review & Traceability, this skill runs the shared closing phases defined once in
`instructions/orch-shared-phases.instructions.md` (documentation/config tier), in order:

1. **Personal Validation** — hand back to the user (no agent); present the drafted
   artifacts and any review for the user to approve.
2. **Create Pull Request** — only after explicit user approval (mark skipped when there is
   no change set).
3. **GitHub Issue Update** — when the session was started from a GitHub issue, add a
   comment to that issue with the captured result and QA report; otherwise skip.
4. **Summary** — emit the run summary.

See `instructions/orch-shared-phases.instructions.md` for the full phase definitions;
update that file to change these phases for every orchestration.

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

This skill reports progress through the `orch-dashboard` canvas extension. Follow the
shared **Dashboard Reporting Contract** in
`instructions/orch-shared-phases.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence and the Personal Validation → Create Pull
Request gating. If the extension is not installed, skip the canvas calls and continue
through standard chat interaction.

- Call `start_run` with `skillId: "orch-blueprint"` and these stages: Scope & Guideline
  Retrieval, Blueprint Drafting, Review & Traceability, Personal Validation, Create Pull
  Request, GitHub Issue Update, Summary.
- During **Blueprint Drafting**, also open/update `markdown-canvas` (`markdown-preview`)
  with the drafted blueprint content, per `instructions/canvas-usage.instructions.md`.
  Optional; skip gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-blueprint/SKILL.md`
