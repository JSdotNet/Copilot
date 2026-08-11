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

## Data source (deterministic)

This skill renders a report from the dataset produced by
`plugins/fincent/scripts/Get-ReleaseData.ps1`. That script owns release resolution, JQL,
pagination, delivery classification, epic ordering, and totals. It fetches release data
only — never per-sprint data.

```powershell
./plugins/fincent/scripts/Get-ReleaseData.ps1 -Release 'release/2026.32.0' -OutputPath ./release-data.json
```

Omit `-Release` to let the script resolve the latest fixVersion (released or unreleased).
Omit `-Team` for the default all-teams release report.

When invoked by `automation-sprint-review`, use the dataset path passed by the orchestrator
instead of running the script again.

The script requires `JIRA_BASE_URL`, `JIRA_EMAIL`, and `JIRA_API_TOKEN`. If it fails, stop
and report the error — never fall back to ad-hoc Jira queries or model-discovered Jira skills.

Determinism rules:

- Read every number from `release.totals`, `release.statusBreakdown`, and
  `release.typeBreakdown`; never recount or re-add story points.
- Use `release.epicOrder` verbatim for section grouping and epic order.
- Use `release.issues` in the given order for table rows; never re-sort or re-filter.
- Use `release.removedIssues` for scope changes and `release.sprintsCovered` for the
  sprint list.
- Treat `issue.isCompleted` as the delivery verdict; do not reinterpret status text.
- The same `metadata.datasetHash` must always yield an identical report.

## Goals

- Render the release summary from `release.totals`.
- Split issues into delivered and deferred using `isCompleted`.
- Group by epic using `release.epicOrder`.
- Output a structured report in the sections below.
- Produce a release notes draft suitable for stakeholders.

This skill owns the release-report rendering: section layout, table formatting, and
release-note drafting. It does not own data fetching or classification.

## Field mapping

| Report field | Dataset path |
|--------------|--------------|
| Release | `release.name` |
| Release date | `release.version.releaseDate` |
| Released flag | `release.version.released` |
| Sprints covered | `release.sprintsCovered` |
| Original scope | `release.totals.issueCount` / `totals.totalPoints` |
| Delivered | `release.totals.completedCount` / `totals.completedPoints` |
| Deferred | `release.totals.notCompletedCount` / `totals.notCompletedPoints` |
| Delivery rate | `release.totals.completionRatePercent` |
| Bug fixes | `release.totals.completedBugCount` |
| Status table | `release.statusBreakdown` |
| Type table | `release.typeBreakdown` |
| Epic sections | `release.epicOrder` |
| Issue rows | `release.issues` |
| Scope changes | `release.removedIssues` |

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

### 1a. Supporting Metrics

Add two compact tables directly after the release summary:

| Status | Count |
|--------|-------|
| Acceptatie klant | N |
| Test | N |
| Done | N |

| Type | Count |
|------|-------|
| Bug | N |
| Story | N |

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

## Required output fidelity

- Every issue listing in sections 2 through 5 must be rendered as a **Markdown table**.
- Do **not** replace grouped issue tables with bullet lists.
- Always include the `Points` column and the `Labels` column where defined in the section.
- Use `?` when story points are missing.
- Use `-` when labels are absent.
- Preserve the exact Jira status text in `State` / `Status`.
- When sprint information is available, include all covered sprint names in the release summary.

## Working rules

- Render only from the dataset; never query Jira and never estimate a missing value.
- **Delivered** means `isCompleted` is `true` in the dataset. These items appear in section 2
  with their actual `status` so readers can distinguish fully done from still-in-testing items.
- **Deferred** means `isCompleted` is `false`.
- Delivery rate comes from `release.totals.completionRatePercent`; do not recompute it.
- Group every section by epic using `release.epicOrder` — never mix stories from different
  epics in the same table and never reorder the groups.
- The **No epic** group is already last in `epicOrder`; keep that position.
- Include labels in every issue row when present; use `-` when the list is empty.
- Use `storyPoints` as-is; render `?` when it is `null`.
- After producing the report, present a one-paragraph executive summary suitable for
  pasting into a release email or stakeholder update.
- Quote `metadata.datasetHash` at the end of the report for reproducibility.

## Tools used

- `plugins/fincent/scripts/Get-ReleaseData.ps1` — deterministic release data collection.
