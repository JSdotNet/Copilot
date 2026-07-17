---
name: sprint-report
description: >
  Generate a sprint report for a Fincent sprint: what was completed vs the original sprint
  scope, what was not completed, what has not been tested yet, and a breakdown by epic.
  Use after a sprint ends or during the sprint review.
---

# Sprint Report

Generate a structured sprint report for a `FIN` sprint. The report compares the original
sprint scope (stories committed at sprint start) against the final state, groups stories
by epic, and surfaces untested items.

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
| Completed | {N} stories / {N} points |
| Not completed | {N} stories / {N} points |
| Completion rate | {%} |
| Untested | {N} stories |

### 2. Completed — by Epic

For each epic that had completed stories in this sprint:

#### {Epic name}

| Key | Summary | Points | Type |
|-----|---------|--------|------|
| FIN-xxx | … | N | Feature/Bug/Support |

### 3. Not Completed (original scope)

Stories that were in the sprint at start but were **not completed** (not Done):

| Key | Summary | Status | Points | Epic | Reason (if known) |
|-----|---------|--------|--------|------|-------------------|
| FIN-xxx | … | In Progress | N | … | … |

### 4. Not Tested Yet

Stories that are Done in development but have no test evidence, are marked as "In Testing",
or have a label/status indicating testing is pending:

| Key | Summary | Points | Epic | Tester |
|-----|---------|--------|------|--------|
| FIN-xxx | … | N | … | … |

### 5. Scope Changes

Stories added to or removed from the sprint after it started (if detectable):

| Key | Summary | Direction | Points | Reason |
|-----|---------|-----------|--------|--------|
| FIN-xxx | … | Added mid-sprint | N | … |
| FIN-yyy | … | Removed | N | … |

### 6. Bugs

All bug-type stories in the sprint, completed or not:

| Key | Summary | Status | Points | Epic |
|-----|---------|--------|--------|------|

## Working rules

- Original scope is determined from stories in the sprint at start; mid-sprint additions
  are flagged in Scope Changes, not counted in the original completion rate.
- "Untested" means: status is Done/Closed but no linked test execution, or status is
  "In Testing" / "Awaiting Verification", or a `needs-testing` label is present.
- Group every section by epic — never mix stories from different epics in the same table.
- Point totals use the `story_points` / `customfield_10016` field; if empty, mark as `—`.
- After producing the report, present a one-paragraph narrative summary suitable for
  pasting into a sprint retrospective or stakeholder email.

## Tools used

- Discovered query-capable Jira skill — fetch sprint stories via JQL.
- Discovered retrieval-capable Jira skill — fetch individual story detail when needed.
