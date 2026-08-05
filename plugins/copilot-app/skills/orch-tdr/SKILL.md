---
name: orch-tdr
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
Invoke: orch-tdr
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

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). If the extension is not
installed, skip the canvas calls below and continue through standard chat
interaction.

- Open canvas `orch-dashboard`, then call `start_run` with
  `skillId: "orch-tdr"` and these stages: Debt Context Retrieval, TDR
  Drafting, Risk & Follow-Up Review, Personal Validation, Create Pull Request, Summary.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. retrieved
  guidelines, drafted TDR content, or follow-up risks.
- Keep **Personal Validation** and **Create Pull Request** as separate stages:
  gate **Create Pull Request** on explicit user approval recorded in **Personal
  Validation** (mark it `skipped` when there is no change set to submit), and
  record all PR-time changes under the **Create Pull Request** stage output —
  never create the pull request before personal validation.
- Mark the **Summary** stage `in_progress` then `done`, and call `finish_run`
  with the final status and summary once the pull request is created (or the run
  concludes without one).
- During **TDR Drafting**, also open/update `markdown-canvas` (`markdown-preview`)
  with the drafted TDR content, per `instructions/canvas-usage.instructions.md`.
  Optional; skip gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-tdr/SKILL.md`
