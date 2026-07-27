---
name: release-report
description: >
  Generate a release report for a Fincent fixVersion: what was delivered (including items
  in test or beyond), what was deferred, a breakdown by epic, bug fixes, and a draft of
  release notes suitable for stakeholders. Use after a release is shipped or to prepare
  the release sign-off.
---

# Release Report

Generate a structured release report for a `FIN` release (`fixVersion`). The report compares
the original release scope against what was actually delivered, groups stories by epic, surfaces
deferred items, and produces a stakeholder-ready release notes draft.

## Jira Setup Reference

Refer to `plugins/fincent/resources/jira-setup.md` for the Fincent Jira project
configuration including the status flow, custom fields, fix version naming, labels,
and epic ordering conventions.

## Jira Skill Discovery

Before executing any Jira operation, discover what Jira skills are available:

1. Check installed skills for skills whose name or description mentions "jira".
2. Identify a **query-capable** skill — can search or list issues by filter/JQL.
3. Identify a **retrieval-capable** skill — can fetch a single existing issue.
4. If no query skill is found: ask the user to paste story content manually.

All Jira field mapping, project keys, status values, and API conventions are owned by
the discovered Jira skill. Never reproduce that knowledge in this skill.

## Goals

- Load all stories targeted for the release using the discovered Jira skill.
- Classify each story by its final delivery status.
- Any story with status **Test, Acceptatie klant, Done, Closed**, or any status at or
  beyond Test in the workflow is considered **delivered** for this report.
- Group by epic.
- Identify deferred items (in scope but status earlier than Test).
- Output a structured report in the sections below.
- Produce a release notes draft suitable for stakeholders.

## Finding the release stories

Use the discovered query-capable Jira skill with the following JQL:

- JQL: `project = FIN AND fixVersion = "{release name}" ORDER BY issuetype ASC, epic ASC, status ASC`
- Fields: summary, status, issuetype, epic, story points, labels, assignee, fixVersions, sprints.
- Paginate if needed.

Also query stories that were **removed from the release** (had this fixVersion then lost it):

- JQL: `project = FIN AND fixVersion was "{release name}" AND fixVersion != "{release name}"`

## Report structure

### 1. Release Summary

| Field | Value |
|-------|-------|
| Release | {release name} |
| Teams | All teams |
| Release date | {date} |
| Preproduction release date | {date or "TBD"} |
| Sprints covered | {sprint names} |
| Original scope | {N} stories / {N} points |
| Delivered | {N} stories / {N} points (includes items in Test or beyond) |
| Deferred | {N} stories / {N} points |
| Delivery rate | {%} |
| Bug fixes | {N} |

### 2. Delivered — by Epic

Stories that are **delivered** (status is Test, Acceptatie klant, Done, or beyond).
Include the actual status in the State column so it is clear which items are still
awaiting testing vs fully done.

For each epic that had delivered stories in this release, create an epic sub-section.
Always place the **No epic** group last, after all named epics.

#### {Epic name}

| Key | Summary | Points | Type | Labels | State |
|-----|---------|--------|------|--------|-------|
| FIN-xxx | … | N | Feature/Bug/Support | label1, label2 | Done / Test / Acceptatie klant |

### 3. Deferred (not shipped)

Stories that were targeted for this release but are **not yet delivered** (status is
earlier than Test — e.g. Open, Just in, Ready, In Progress, Analyze).
Always place the **No epic** group last.

| Key | Summary | Status | Points | Epic | Labels | Reason (if known) |
|-----|---------|--------|--------|------|--------|-------------------|
| FIN-xxx | … | In Progress | N | … | … | … |

### 4. Scope Changes

Stories added to or removed from the release after the release was opened (if detectable):

| Key | Summary | Direction | Points | Labels | Reason |
|-----|---------|-----------|--------|--------|--------|
| FIN-xxx | … | Added late | N | … | … |
| FIN-yyy | … | Removed | N | … | … |

### 5. Bug Fixes

All bug-type stories delivered in this release.
Always place the **No epic** group last.

| Key | Summary | Points | Epic | Labels | Sprint |
|-----|---------|--------|------|--------|--------|
| FIN-xxx | … | N | … | … | … |

### 6. Release Notes Draft

Produce a stakeholder-facing "What's New" section based on the delivered epics and stories.
Write in plain business language — no Jira keys or technical jargon. Group by epic or theme.

Example format:

> **{Epic / Theme name}**
> We delivered {short description of value}. Users can now {benefit}.
>
> **Bug Fixes**
> Resolved {N} issues, including {one notable fix if present}.

## Working rules

- **Delivered** means status is Test, Acceptatie klant, Done, Closed, or any status at
  or beyond Test in the team's workflow. These items are shown in section 2 with their
  actual State so readers can distinguish fully done from still-in-testing items.
- **Deferred** means status is earlier than Test (e.g. Open, Just in, Ready, In Progress,
  Analyze).
- Delivery rate is calculated from the original scope only; late additions are noted in
  Scope Changes but excluded from the rate denominator.
- Group every section by epic — never mix stories from different epics in the same table.
- Always render the **No epic** group as the last epic sub-section in every grouped section.
- Include labels in every issue row when present; omit the cell content when the issue
  has no labels.
- Point totals use the `story_points` / `customfield_10016` field; if empty, mark as `?`.
- After producing the report, present a one-paragraph executive summary suitable for
  pasting into a release email or stakeholder update.

## Tools used

- Discovered query-capable Jira skill — fetch release stories via JQL.
- Discovered retrieval-capable Jira skill — fetch individual story detail when needed.
