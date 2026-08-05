---
name: orch-adr
description: 'Orchestrate ADR creation in GitHub Copilot App canvas. Uses the architecture:architect agent for decision documentation and `jsdotnet-project-guidelines-mcpserver` to retrieve relevant project guidance and existing ADR context first.'
---

# Orchestrate Architectural Decision Record

Execute an ADR workflow in GitHub Copilot App canvas with upfront MCP-based guidance retrieval and architecture-agent drafting.

## Input Expectations

- Decision statement and affected scope.
- Goal for the ADR (e.g., capture trade-offs, downstream updates).
- Whether existing ADRs or recommendations should be referenced.

## Workflow Stages

> **Cross-plugin agents are recommended, not required.** When a referenced plugin is
> not installed, skip the stage or perform it manually and continue with remaining
> stages. All agent transitions require explicit user approval before switching.

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

### Stage 4: Personal Validation
- **Present the completed work** and its evidence to the user for review
- **Confirm the outcome** against the skill's goals and acceptance criteria
- **Wait for explicit user approval** before any pull request is created

**Agents:** `review:reviewer`

### Stage 5: Create Pull Request
- **Create the pull request only after explicit user approval** in Personal Validation — never before
- **Write the PR description** from the change set and validation evidence
- **Apply any PR-time improvements** (final polish, labels, changelog) as part of this stage
- **Skip this stage** (mark it `skipped`) when the run produces no change set to submit
- **Prefer the `JSdotNet` account** for GitHub CLI/API operations per repository policy

**Agents:** `review:reviewer`
**Skills Used:** `pr-jsdotnet`

### Stage 6: Summary
- **Summarize the delivered outcome** and the created pull request (if any)
- **Emit the run summary** once the pull request is created, or the run concludes without one

**Agents:** `review:reviewer`

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

This skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). If the extension is not
installed, skip the canvas calls below and continue through standard chat
interaction.

- Open canvas `orch-dashboard`, then call `start_run` with
  `skillId: "orch-adr"` and these stages: Decision Context Retrieval, ADR
  Drafting, Traceability Review, Personal Validation, Create Pull Request, Summary.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. retrieved
  guidelines, drafted ADR content, or traceability findings.
- Keep **Personal Validation** and **Create Pull Request** as separate stages:
  gate **Create Pull Request** on explicit user approval recorded in **Personal
  Validation** (mark it `skipped` when there is no change set to submit), and
  record all PR-time changes under the **Create Pull Request** stage output —
  never create the pull request before personal validation.
- Mark the **Summary** stage `in_progress` then `done`, and call `finish_run`
  with the final status and summary once the pull request is created (or the run
  concludes without one).
- During **ADR Drafting**, also open/update `markdown-canvas` (`markdown-preview`)
  with the drafted ADR content, per `instructions/canvas-usage.instructions.md`.
  Optional; skip gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-adr/SKILL.md`
