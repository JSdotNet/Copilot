---
name: sprint-report
description: >
  Generate a sprint report for a Fincent sprint: what was completed (including items in
  test or beyond) vs the original sprint scope, what was not completed, and a breakdown
  by epic. Use after a sprint ends or during the sprint review.
---

# Sprint Report

Generate a structured sprint report for a `FIN` sprint. The report compares the original
sprint scope (stories committed at sprint start) against the final state, groups stories
by epic, and includes untested items inside the completed section.

## Jira Setup Reference

Refer to `plugins/fincent/resources/jira-setup.md` for the Fincent Jira project
configuration including the status flow, custom fields, fix version naming, labels,
and epic ordering conventions.

## Jira Skill Discovery

When this skill is run directly, discover what Jira skills are available:

1. Check installed skills for skills whose name or description mentions "jira".
2. Identify a **query-capable** skill — can search or list issues by sprint/filter.
3. Identify a **retrieval-capable** skill — can fetch a single existing issue.
4. If no query skill is found: ask the user to paste story content manually.

If this skill is invoked by an orchestration skill such as `automation-sprint-review`,
prefer the caller-provided Jira capability context instead of rediscovering Jira skills.

All Jira field mapping, project keys, status values, and API conventions are owned by
the selected Jira skill. Never reproduce that knowledge in this skill.

## Goals

- Load all stories that were in the sprint at its start using the discovered Jira skill.
- Determine the original scope (stories added before or at sprint start).
- Classify each story by its final status.
- Any story with status **Test, Acceptatie klant, Done, Closed**, or any status at or
  beyond Test in the workflow is considered **completed** for this report.
- Group by epic.
- Output a structured report in the sections below.

This skill owns the sprint-report logic: data fetching, scope interpretation, completion
classification, grouping, and report rendering.

## Finding the sprint stories

Use the discovered query-capable Jira skill with the following JQL:

- JQL: `project = FIN AND sprint = "{sprint name}" AND "Fincent Team" = "Team B" ORDER BY epic ASC, status ASC`
- Fields: summary, status, issuetype, epic, story points, labels, assignee, fixVersions.
- Paginate if needed.
- If the user names a different team, substitute in the JQL.

Also retrieve sprint metadata when available:

- sprint start date
- sprint end date
- sprint goal

Also query stories that were **removed from the sprint** (added then removed) if accessible:
- JQL: `project = FIN AND sprint was "{sprint name}" AND sprint != "{sprint name}" AND "Fincent Team" = "Team B"`

## Report structure

### 1. Sprint Summary

| Field | Value |
|-------|-------|
| Sprint | {sprint name} |
| Team | Team B (or named team) |
| Period | {start date} – {end date} |
| Original scope | {N} stories / {N} points |
| Completed | {N} stories / {N} points (includes items in Test or beyond) |
| Not completed | {N} stories / {N} points |
| Completion rate | {%} |

### 2. Completed — by Epic

Stories that are **completed** (status is Test, Acceptatie klant, Done, or beyond).
Include the actual status in the State column so it is clear which items are still
awaiting testing vs fully done.

For each epic that had completed stories in this sprint, create an epic sub-section.
Always place the **No epic** group last, after all named epics.

#### {Epic name}

| Key | Summary | Points | Type | Labels | State |
|-----|---------|--------|------|--------|-------|
| FIN-xxx | … | N | Feature/Bug/Support | label1, label2 | Done / Test / Acceptatie klant |

### 3. Not Completed (original scope)

Stories that were in the sprint at start but are **not yet completed** (status is earlier
than Test — e.g. Open, Just in, Ready, In Progress, Analyze).
Always place the **No epic** group last.

| Key | Summary | Status | Points | Epic | Labels | Reason (if known) |
|-----|---------|--------|--------|------|--------|-------------------|
| FIN-xxx | … | In Progress | N | … | … | … |

### 4. Scope Changes

Stories added to or removed from the sprint after it started (if detectable):

| Key | Summary | Direction | Points | Labels | Reason |
|-----|---------|-----------|--------|--------|--------|
| FIN-xxx | … | Added mid-sprint | N | … | … |
| FIN-yyy | … | Removed | N | … | … |

### 5. Bugs (sprint-only, not in Completed)

Bug-type stories in the sprint that are **not yet completed** (status before Test).
Bugs that are already completed appear in section 2 — do not duplicate them here.
Always place the **No epic** group last.

| Key | Summary | Status | Points | Epic | Labels |
|-----|---------|--------|--------|------|--------|

### 6. Sprint Goal Evaluation

If the sprint goal is available, add a compact table that shows whether each goal theme was
met and which issues support that conclusion.

| Goal item | Status | Evidence |
|-----------|--------|----------|
| Acties voor termijnen af | Met / Partially met / Not met | FIN-5894, FIN-5889, FIN-7097 |

### 7. Narrative Summary

End with one short narrative paragraph suitable for a sprint retrospective or stakeholder email.

## Required output fidelity

- Every issue listing in sections 2 through 5 must be rendered as a **Markdown table**.
- Do **not** replace issue tables with bullet lists, even when a section or epic contains only one item.
- Always include the `Points` column and the `Labels` column in the issue tables.
- Use `?` when story points are missing.
- Use `-` when labels are absent.
- Preserve the exact Jira status text in `State` / `Status`.
- Keep the **No epic** group last in every grouped section.

## Working rules

- Original scope is determined from stories in the sprint at start; mid-sprint additions
  are flagged in Scope Changes, not counted in the original completion rate.
- **Completed** means status is Test, Acceptatie klant, Done, Closed, or any status at
  or beyond Test in the team's workflow. These items are shown in section 2 with their
  actual State so readers can distinguish fully done from still-in-testing items.
- **Not Completed** means status is earlier than Test (e.g. Open, Just in, Ready,
  In Progress, Analyze).
- Group every section by epic — never mix stories from different epics in the same table.
- Always render the **No epic** group as the last epic sub-section in every grouped section.
- Include labels in every issue row when present; omit the cell content when the issue
  has no labels.
- Point totals use the `story_points` / `customfield_10016` field; if empty, mark as `?`.
- Do not duplicate bugs: completed bugs appear only in section 2; section 5 lists only
  bugs that are not yet completed.
- If sprint-goal data is available, include section 6 instead of dropping that context.
- After producing the report, present section 7 as the final narrative summary.

## Tools used

- Discovered query-capable Jira skill — fetch sprint stories via JQL.
- Discovered retrieval-capable Jira skill — fetch individual story detail when needed.
