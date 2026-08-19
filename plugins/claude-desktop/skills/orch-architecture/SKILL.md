---
name: orch-architecture
description: 'Orchestrate general architecture work with the Claude Code orchestration dashboard. Uses the architecture:architect agent directly plus `jsdotnet-guidelines-mcpserver` for governed asset guidance before edits.'
---

# Orchestrate Architecture Work

Execute a general architecture workflow with the Claude Code orchestration dashboard for requests that need the architect agent but do not fit a single specialized arc42, blueprint, ADR, or TDR flow.

## Input Expectations

- Architecture objective and expected output type (guidance, proposal, comparison, decision framing, or documentation update).
- Scope of affected systems or plugins.
- Whether governed asset constraints apply.

## Workflow Stages

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and internal transitions continue without separate user approval until
> Personal Validation.
>
> Model choice per stage follows `instructions/orch-model-selection.instructions.md`
> (category defaults, overridable via personal global model selection or
> `.claude/model-selection.md` in the consuming repo).

### Stage 1: Goal & Guideline Retrieval
- **Clarify the architecture objective** and expected output
- **Query `jsdotnet-guidelines-mcpserver`** for standards, relevant guidance, and governed asset constraints
- **Capture repository constraints** that affect governed plugin or guidance assets
- **Stop for MCP setup** if the required guideline tools are unavailable

**Agents:** `architecture:architect`
**MCP Servers:** `jsdotnet-guidelines-mcpserver`

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

**Agents:** `architecture:architect`

### Final Phases (Shared)

After Drafting & Review, this skill runs the shared closing phases defined once in
`instructions/orch-delivery-phases.instructions.md` (documentation/config tier), in order:

1. **Personal Validation** — hand back to the user (no agent); present the drafted
   artifacts and any review for the user to approve.
2. **Create Pull Request** — only after explicit user approval (mark skipped when there is
   no change set).
3. **GitHub Issue Update** — when the session was started from a GitHub issue, add a
   comment to that issue with the captured result and QA report; otherwise skip.
4. **Summary** — emit the run summary.

See `instructions/orch-delivery-phases.instructions.md` for the full phase definitions;
update that file to change these phases for every orchestration.

## Usage Pattern

```text
Invoke: orch-architecture
- Goal: evaluate and document the architecture impact of a plugin boundary change
- Scope: "architecture and claude-desktop plugins"
- Output: proposal with risks, trade-offs, and recommended follow-up artifacts
- Use `jsdotnet-guidelines-mcpserver` before governed asset edits
```

## Output Expectations

- Architecture outcome drafted in Markdown.
- Assumptions, risks, and open questions called out.
- Recommendations aligned with retrieved guidance context.
- Internal consistency verified across scope, constraints, and traceability.
- Review-ready result prepared with explicit follow-up actions.

## Dashboard Interface

This skill reports progress through the `orch-dashboard` MCP server
(`plugins/claude-desktop/mcp/orch-dashboard/`). Follow the shared **Dashboard Reporting
Contract** in `instructions/orch-dashboard-contract.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence and the Personal Validation → Create
Pull Request gating. If the server is not configured, skip the dashboard calls and
continue through standard chat interaction.

- Call `start_run` with `skillId: "orch-architecture"` and these stages: Goal & Guideline
  Retrieval, Architecture Investigation, Drafting & Review, Personal Validation, Create
  Pull Request, GitHub Issue Update, Summary.
- During **Drafting & Review**, also open/update the `render_markdown` dashboard tool with
  the drafted Markdown result, and the `render_diagram` dashboard tool if the result
  includes Mermaid diagrams, per `instructions/dashboard-usage.instructions.md`. Optional;
  skip gracefully if not installed.

See `plugins/claude-desktop/mcp/orch-dashboard/README.md` for the full dashboard tool
contract.

## Reference

Source skill location: `plugins/claude-desktop/skills/orch-architecture/SKILL.md`
