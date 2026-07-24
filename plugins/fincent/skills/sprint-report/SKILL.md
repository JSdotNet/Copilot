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

## Jira Skill Discovery

Before executing any Jira operation, discover what Jira skills are available:

1. Check installed skills for skills whose name or description mentions "jira".
2. Identify a **query-capable** skill — can search or list issues by sprint/filter.
3. Identify a **retrieval-capable** skill — can fetch a single existing issue.
4. If no query skill is found: ask the user to paste story content manually.

All Jira field mapping, project keys, status values, and API conventions are owned by
the discovered Jira skill. Never reproduce that knowledge in this skill.

## Goals

- Load all stories that were in the sprint at its start using the discovered Jira skill.
- Determine the original scope (stories added before or at sprint start).
- Classify each story by its final status.
- Any story with status **Test, Acceptatie klant, Done, Closed**, or any status at or
  beyond Test in the workflow is considered **completed** for this report.
- Group by epic.
- Output a structured report in the sections below.

## Finding the sprint stories

Use the discovered query-capable Jira skill with the following JQL:

- JQL: `project = FIN AND sprint = "{sprint name}" AND "Fincent Team" = "Team B" ORDER BY epic ASC, status ASC`
- Fields: summary, status, issuetype, epic, story points, labels, assignee, fixVersions.
- Paginate if needed.
- If the user names a different team, substitute in the JQL.

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

For each epic that had completed stories in this sprint:

#### {Epic name}

| Key | Summary | Points | Type | State |
|-----|---------|--------|------|-------|
| FIN-xxx | … | N | Feature/Bug/Support | Done / Test / Acceptatie klant |

### 3. Not Completed (original scope)

Stories that were in the sprint at start but are **not yet completed** (status is earlier
than Test — e.g. Open, Just in, Ready, In Progress, Analyze):

| Key | Summary | Status | Points | Epic | Reason (if known) |
|-----|---------|--------|--------|------|-------------------|
| FIN-xxx | … | In Progress | N | … | … |

### 4. Scope Changes

Stories added to or removed from the sprint after it started (if detectable):

| Key | Summary | Direction | Points | Reason |
|-----|---------|-----------|--------|--------|
| FIN-xxx | … | Added mid-sprint | N | … |
| FIN-yyy | … | Removed | N | … |

### 5. Bugs

All bug-type stories in the sprint, completed or not:

| Key | Summary | Status | Points | Epic |
|-----|---------|--------|--------|------|

## Working rules

- Original scope is determined from stories in the sprint at start; mid-sprint additions
  are flagged in Scope Changes, not counted in the original completion rate.
- **Completed** means status is Test, Acceptatie klant, Done, Closed, or any status at
  or beyond Test in the team's workflow. These items are shown in section 2 with their
  actual State so readers can distinguish fully done from still-in-testing items.
- **Not Completed** means status is earlier than Test (e.g. Open, Just in, Ready,
  In Progress, Analyze).
- Group every section by epic — never mix stories from different epics in the same table.
- Point totals use the `story_points` / `customfield_10016` field; if empty, mark as `—`.
- After producing the report, present a one-paragraph narrative summary suitable for
  pasting into a sprint retrospective or stakeholder email.

## Tools used

- Discovered query-capable Jira skill — fetch sprint stories via JQL.
- Discovered retrieval-capable Jira skill — fetch individual story detail when needed.
