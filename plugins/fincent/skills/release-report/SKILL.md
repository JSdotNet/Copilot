---
name: release-report
description: >
  Generate a release report for a Fincent fixVersion: what was delivered, what was deferred,
  a breakdown by epic, bug fixes, and a draft of release notes suitable for stakeholders.
  Use after a release is shipped or to prepare the release sign-off.
---

# Release Report

Generate a structured release report for a `FIN` release (`fixVersion`). The report compares
the original release scope against what was actually delivered, groups stories by epic, surfaces
deferred items, and produces a stakeholder-ready release notes draft.

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
- Group by epic.
- Identify deferred items (in scope but not shipped with this release).
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
| Delivered | {N} stories / {N} points |
| Deferred | {N} stories / {N} points |
| Delivery rate | {%} |
| Bug fixes | {N} |

### 2. Delivered — by Epic

For each epic that had delivered (Done/Closed) stories in this release:

#### {Epic name}

| Key | Summary | Points | Type |
|-----|---------|--------|------|
| FIN-xxx | … | N | Feature/Bug/Support |

### 3. Deferred (not shipped)

Stories that were targeted for this release but were **not completed** (not Done/Closed):

| Key | Summary | Status | Points | Epic | Reason (if known) |
|-----|---------|--------|--------|------|-------------------|
| FIN-xxx | … | In Progress | N | … | … |

### 4. Scope Changes

Stories added to or removed from the release after the release was opened (if detectable):

| Key | Summary | Direction | Points | Reason |
|-----|---------|-----------|--------|--------|
| FIN-xxx | … | Added late | N | … |
| FIN-yyy | … | Removed | N | … |

### 5. Bug Fixes

All bug-type stories delivered in this release:

| Key | Summary | Points | Epic | Sprint |
|-----|---------|--------|------|--------|
| FIN-xxx | … | N | … | … |

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

- Delivered means status is Done or Closed; anything else is deferred.
- Delivery rate is calculated from the original scope only; late additions are noted in
  Scope Changes but excluded from the rate denominator.
- Group every section by epic — never mix stories from different epics in the same table.
- Point totals use the `story_points` / `customfield_10016` field; if empty, mark as `—`.
- After producing the report, present a one-paragraph executive summary suitable for
  pasting into a release email or stakeholder update.

## Tools used

- Discovered query-capable Jira skill — fetch release stories via JQL.
- Discovered retrieval-capable Jira skill — fetch individual story detail when needed.
