---
name: orch-tdr
description: 'Orchestrate technical debt record creation with the Claude Code orchestration dashboard. Uses the architecture:architect agent for debt documentation plus `jsdotnet-guidelines-mcpserver` to ground the record in project guidance and related decisions.'
---

# Orchestrate Technical Debt Record

Execute a TDR workflow with the Claude Code orchestration dashboard with MCP-guided context retrieval first and the architect agent handling the documentation work.

## Input Expectations

- Debt item description and affected scope.
- Goal for the TDR (e.g., capture impact, remediation path).
- Whether related ADRs or recommendations should be referenced.

## Workflow Stages

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and internal transitions continue without separate user approval until
> Personal Validation.
>
> Model choice per stage follows `instructions/orch-model-selection.instructions.md`
> (category defaults, overridable via personal global model selection or
> `.claude/model-selection.md` in the consuming repo).

### Stage 1: Debt Context Retrieval
- **Clarify the debt item** and affected scope
- **Query `jsdotnet-guidelines-mcpserver`** for standards, relevant guidance, ADR context,
  and governed asset constraints
- **Capture remediation boundaries** for governed plugin or guidance assets
- **Stop for MCP setup** if the required guideline tools are unavailable

**Agents:** `architecture:architect`
**MCP Servers:** `jsdotnet-guidelines-mcpserver`

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

**Agents:** `architecture:architect`

### Final Phases (Shared)

After Risk & Follow-Up Review, this skill runs the shared closing phases defined once in
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
Invoke: orch-tdr
- Debt: "Architecture guidance retrieval is inconsistent across plugin workflows"
- Scope: "claude-desktop orchestration skills"
- Goal: capture impact, remediation path, and related decisions
```

## Output Expectations

- Debt origin and current impact described.
- Severity, ownership, and remediation window captured.
- Record linked to retrieved guidance and related architecture artifacts.
- Follow-up work documented to reduce or retire the debt.
- Impact statements verified across delivery, quality, and operations.
- Review-ready TDR prepared with actionable remediation path.

## Dashboard Interface

This skill reports progress through the `orch-dashboard` MCP server
(`plugins/claude-desktop/mcp/orch-dashboard/`). Follow the shared **Dashboard Reporting
Contract** in `instructions/orch-shared-phases.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence and the Personal Validation → Create
Pull Request gating. If the server is not configured, skip the dashboard calls and
continue through standard chat interaction.

- Call `start_run` with `skillId: "orch-tdr"` and these stages: Debt Context Retrieval, TDR
  Drafting, Risk & Follow-Up Review, Personal Validation, Create Pull Request, GitHub Issue Update, Summary.
- During **TDR Drafting**, also open/update the `render_markdown` dashboard tool with the
  drafted TDR content, per `instructions/dashboard-usage.instructions.md`. Optional; skip
  gracefully if not installed.

See `plugins/claude-desktop/mcp/orch-dashboard/README.md` for the full dashboard tool
contract.

## Reference

Source skill location: `plugins/claude-desktop/skills/orch-tdr/SKILL.md`
