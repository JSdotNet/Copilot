---
name: orch-arc42
description: 'Orchestrate arc42 architecture documentation with GitHub Copilot App canvas. Uses the architecture:architect agent for section drafting and `jsdotnet-guidelines-mcpserver` for guideline and ADR grounding before governed asset changes.'
---

# Orchestrate arc42 Documentation

Execute an arc42 documentation workflow in GitHub Copilot App canvas while keeping the architect agent independent and moving guideline retrieval into the orchestration layer.

## Input Expectations

- Target system or project name.
- arc42 sections to draft or refresh (e.g., 1, 3, 9).
- Documentation goal (e.g., refresh before restructuring).
- Whether governed asset constraints apply.

## Workflow Stages

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and internal transitions continue without separate user approval until
> Personal Validation.
>
> Model choice per stage follows `instructions/orch-model-selection.instructions.md`
> (category defaults, overridable via personal global model selection or
> `.github/copilot-model-selection.md` in the consuming repo).

### Stage 1: Context & Guideline Retrieval
- **Clarify target sections** and documentation goals
- **Query `jsdotnet-guidelines-mcpserver`** for standards, relevant guidance, ADR context, and governed asset constraints
- **Collect repository-specific constraints** for governed plugin or guidance assets
- **Stop for MCP setup** if the required guideline tools are unavailable

**Agents:** `architecture:architect`
**MCP Servers:** `jsdotnet-guidelines-mcpserver`

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

**Agents:** `architecture:architect`

### Final Phases (Shared)

After Cross-Section Review, this skill runs the shared closing phases defined once in
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

This skill reports progress through the `orch-dashboard` canvas extension. Follow the
shared **Dashboard Reporting Contract** in
`instructions/orch-shared-phases.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence and the Personal Validation → Create Pull
Request gating. If the extension is not installed, skip the canvas calls and continue
through standard chat interaction.

- Call `start_run` with `skillId: "orch-arc42"` and these stages: Context & Guideline
  Retrieval, Section Drafting, Cross-Section Review, Personal Validation, Create Pull
  Request, GitHub Issue Update, Summary.
- During **Section Drafting**, also open/update `markdown-canvas` (`markdown-preview`) with
  the drafted arc42 section content, per `instructions/canvas-usage.instructions.md`.
  Optional; skip gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-arc42/SKILL.md`
