---
name: pr-remarks-review
description: Work through pull request review remarks systematically — triage, address, and close out each comment with evidence, a resolution decision, and a follow-up action when needed.
---

# PR Remarks Review Skill

## Purpose and Trigger Conditions

Use this skill when the user wants to process open pull request review comments or review threads. It drives a structured triage-and-response workflow so that no remark is missed or left ambiguous.

The calling agent supplies domain knowledge about the code, story, or documentation being reviewed; this skill drives the remark-by-remark processing workflow.

## Input Expectations

- Pull request URL, number, or a pasted list of review remarks.
- Optional filter (reviewer name, file, label, or severity).
- Optional target branch or file set for context.

## Workflow

1. Collect all open review remarks from the PR (or from the provided list).
2. Group remarks by file or topic area for efficient triage.
3. For each remark:
   - Summarise the concern in one sentence.
   - Classify the action required:
     - **Fix** — the remark identifies a clear defect or violation; a code/content change is required.
     - **Discuss** — the remark is a question or opinion; alignment with the reviewer is needed before acting.
     - **Decline** — the remark is out of scope or already handled; provide a clear rationale.
     - **Defer** — the remark is valid but belongs in a follow-up issue; log it explicitly.
   - Draft a response to the reviewer (inline comment reply text).
4. Produce a summary table: remark → classification → proposed resolution → status.
5. List any open questions that need reviewer or stakeholder input before the PR can be merged.

## Output Expectations and Quality Checks

- Every remark has a classification and a proposed resolution or reply.
- Fix items include the specific change required (file, section, or line reference where known).
- Discuss items include the question or trade-off to resolve with the reviewer.
- Decline and Defer items include a rationale that can be pasted directly as a reply.
- Summary table is actionable and scannable at a glance.
- No remark is left without a decision.
