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

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). If the extension is not
installed, skip the canvas calls below and continue through standard chat
interaction.

- Open canvas `orch-dashboard`, then call `start_run` with
  `skillId: "orch-architecture"` and these stages: Goal & Guideline
  Retrieval, Architecture Investigation, Drafting & Review, Personal Validation, Create Pull Request, Summary.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. retrieved
  guidelines, findings, or review feedback.
- Keep **Personal Validation** and **Create Pull Request** as separate stages:
  gate **Create Pull Request** on explicit user approval recorded in **Personal
  Validation** (mark it `skipped` when there is no change set to submit), and
  record all PR-time changes under the **Create Pull Request** stage output —
  never create the pull request before personal validation.
- Mark the **Summary** stage `in_progress` then `done`, and call `finish_run`
  with the final status and summary once the pull request is created (or the run
  concludes without one).
- During **Drafting & Review**, also open/update `markdown-canvas` (`markdown-preview`)
  with the drafted Markdown result, and `diagram-canvas` (`mermaid-diagram`) if the
  result includes Mermaid diagrams, per `instructions/canvas-usage.instructions.md`.
  Optional; skip gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-architecture/SKILL.md`
