---
name: automation-sprint-review
description: >
  End-to-end sprint review automation: collects deterministic Jira datasets with
  Get-ReleaseData.ps1 and Get-SprintData.ps1, then generates the sprint report(s) per team,
  the release report for the resolved fixVersion, and a demo presentation as PowerPoint.
  Orchestrates sprint-report, release-report, and demo-presentation sequentially over those
  datasets so repeated runs on unchanged Jira data produce identical output.
---

# Automation: Sprint Review (Full Pipeline)

Run the complete sprint review pipeline in one go: sprint report → release report →
demo presentation (PowerPoint). Each step feeds context into the next.

This skill is optimized for sprint reviews that cover one or more sprints. The final result
must keep the detailed reporting signal from the underlying reports instead of collapsing it
to a minimal status note.

This is an **orchestration skill**. It owns the end-to-end flow, cross-step context, and
artifact handoff. It must not duplicate the detailed reporting logic that already belongs
inside `sprint-report`, `release-report`, or `demo-presentation`, and it must not query Jira
itself — all Jira data comes from the collection script described below.

## Jira Setup Reference

Refer to `plugins/fincent/resources/jira-setup.md` for the Fincent Jira project
configuration including the status flow, custom fields, fix version naming, labels,
and epic ordering conventions.

## Determinism Contract (mandatory)

All Jira data for this pipeline comes from two deterministic collection scripts:

- `plugins/fincent/scripts/Get-ReleaseData.ps1` — release scope for `release-report`.
- `plugins/fincent/scripts/Get-SprintData.ps1` — sprint scope for `sprint-report`, one
  dataset per team.

Both share `plugins/fincent/scripts/FincentJira.psm1`, so completion classification, epic
ordering, issue ordering, and totals cannot drift between the two reports.

Rules:

- Run the scripts **first** (phase 0) and use their JSON datasets as the **only** data source
  for phases 1 to 3.
- Never issue ad-hoc Jira queries, and never recompute counts, points, completion rates,
  or epic ordering by hand — read them from the datasets.
- Never re-sort, re-group, or re-filter dataset content; the dataset order is the report order.
- Do not paraphrase status values, sprint names, epic names, or labels.
- The same `datasetHash` must yield an identical report. If a rerun on the same dataset would
  change a number, table row, or ordering, that is a defect in the skill, not a judgement call.
- If a dataset is missing or a script fails, stop and report the error. Do not fall back
  to model-driven Jira exploration.

## Input

Provide:

- **Sprint name(s)**: one or more sprint names (e.g. `"Sprint A - Xanadu"`). Optional when
  the sprints should be derived from the release.
- **Team(s)**: the teams to report on. One sprint dataset and one sprint report set is
  produced per team. Omit for a single all-teams sprint dataset.
- **Release**: optional. If omitted, `Get-ReleaseData.ps1` resolves the latest fixVersion.
- **Expected sprint count**: optional but recommended when the user states a number; it is
  passed to `Get-SprintData.ps1` as `-ExpectedSprintCount` so the run fails loudly on a
  mismatch.

Translate the request into script parameters — do not resolve scope yourself. If the user
asks for active sprints, pass `-ActiveSprints -BoardId {board id}`; ask for the board id when
it is unknown. If the user does not name the teams, ask which teams are in scope rather than
guessing.

## Orchestration responsibilities

This skill is responsible for:

- Running `Get-ReleaseData.ps1` once and `Get-SprintData.ps1` once per team.
- Passing each dataset path forward to the phase that consumes it.
- Calling `sprint-report` per team and `release-report` for the resolved version.
- Persisting each generated report as an artifact.
- Passing the generated sprint and release reports forward into `demo-presentation`.
- Producing the final artifact summary for the user, including every `datasetHash`.

This skill is **not** responsible for:

- Resolving sprints or releases itself — the scripts own that.
- Reimplementing the internal report logic of `sprint-report`.
- Reimplementing release classification logic from `release-report`.
- Re-fetching story detail for the demo once the needed report artifacts already exist.

## Jira access

Jira access runs through the collection scripts using the environment variables
`JIRA_BASE_URL`, `JIRA_EMAIL`, and `JIRA_API_TOKEN`.

Do not discover, select, or call a Jira skill or Jira MCP tool in this pipeline. If a
script cannot authenticate, stop and ask the user to configure the environment variables.

Example invocations:

- `automation-sprint-review for "Sprint A - Xanadu", "Sprint B - Xanadu" for Team A and Team B`
- `automation-sprint-review for active sprints`

## Resolving release and sprints

Both are resolved by the scripts, not by this skill:

- Release: when `-Release` is omitted, `Get-ReleaseData.ps1` picks the latest fixVersion for
  project `FIN`, sorted by release date descending then name descending. Unreleased versions
  are valid (e.g. `release/2026.32.0`).
- Sprints: `Get-SprintData.ps1` unions explicit `-Sprint` names, sprint names found on the
  issues of `-Release`, and active board sprints (with `-ActiveSprints -BoardId`),
  de-duplicates them, and orders them chronologically.

Use `-ExpectedSprintCount` whenever the user states how many sprints are in scope. The script
fails the run on a mismatch instead of silently dropping sprints.

Read `metadata.sprintResolution.resolved` from each sprint dataset for the authoritative
sprint list, and `release.name` from the release dataset for the authoritative release name.
Never re-derive either.

## Execution Plan

Execute phase 0 first, then the three reporting phases **sequentially**.

### Phase 0a — Release data collection (mandatory)

Run the release collection script from the repository root:

```powershell
./plugins/fincent/scripts/Get-ReleaseData.ps1 `
  -Release 'release/2026.32.0' `
  -OutputPath ./release-data.json
```

Omit `-Release` to let the script resolve the latest fixVersion.

After it completes:

1. Record `metadata.datasetHash` as the release dataset hash.
2. Read `release.name` as the authoritative release name.
3. Read `release.sprintsCovered` as the authoritative sprint list when the user did not
   name the sprints explicitly.
4. If the script exits non-zero, stop the pipeline and report the error.

### Phase 0b — Sprint data collection, once per team (mandatory)

Run the sprint collection script **once per team in scope**. Each run produces its own
dataset and its own hash:

```powershell
./plugins/fincent/scripts/Get-SprintData.ps1 `
  -Sprint 'Sprint A - Xanadu','Sprint B - Xanadu' `
  -Team 'Team B' `
  -ExpectedSprintCount 2 `
  -OutputPath ./sprint-data-team-b.json
```

Variants:

- Active sprints: replace `-Sprint` with `-ActiveSprints -BoardId {board id}`.
- Sprints derived from the release: replace `-Sprint` with `-Release '{release name}'`.
- All teams in a single dataset: omit `-Team` and run the script once.

Record each dataset path, its `metadata.team`, its `metadata.datasetHash`, and its
`metadata.sprintResolution.resolved` sprint list.

### Phase 1 — Sprint Report (per team, per sprint)

Run the `sprint-report` skill for each team dataset, once per sprint in that dataset's
`metadata.sprintResolution.resolved`. Pass in:

- the sprint name
- the team
- the sprint dataset path for that team
- the matching `sprints[]` entry

Render strictly from that entry: `totals` for summary numbers, `epicOrder` for section
grouping and order, `issues` for rows, `removedIssues` for scope changes.

Save **one file per team per sprint** as `sprint-report-{team}-{sprint-name}.md`. When only
one team is in scope, `sprint-report-{sprint-name}.md` is acceptable.

If more than one sprint is included for a team, also produce a consolidated comparison file
named `sprint-report-overview-{first-sprint-name}.md` that contains:

- A trend table with one row per sprint.
- The full per-sprint reports appended in chronological order.
- A short cross-sprint observation paragraph.

### Phase 2 — Release Report

Run the `release-report` skill for `release.name` from the phase 0a dataset. Pass in:

- the release dataset path
- the `release` object

Render from `release.totals`, `release.statusBreakdown`, `release.typeBreakdown`,
`release.epicOrder`, `release.issues`, and `release.removedIssues`.
Save the complete report as `release-report-{release-name}.md`.

### Phase 3 — Demo Presentation (PowerPoint)

Run the `demo-presentation` skill using the sprint and release report data collected in
phases 1 and 2.

Pass in:

- the generated sprint report artifact(s) or their full content
- the generated release report artifact or its full content
- the resolved sprint list
- the resolved release name
- the team(s)

The preferred data source for `demo-presentation` is the generated report content from phases
1 and 2. Do **not** ask `demo-presentation` to fetch sprint or release data from Jira.
If a detail needed for the demo is missing, enrich the sprint or release report inputs first
and then call `demo-presentation` with the updated artifacts.

Ask `demo-presentation` to do its own job end-to-end:

- interpret the passed report content
- decide the slide content and ordering
- apply the Fincent review template
- return or generate the final presentation content needed for `demo-{sprint-name}.pptx`

If multiple sprints are requested, produce one combined `.pptx` covering all sprints.

## Output

The automation produces file artifacts saved to the working directory:

1. **Datasets** — deterministic Jira snapshots: `release-data.json` and one
   `sprint-data-{team}.json` per team
2. **Sprint report(s)** — one Markdown file per team per sprint: `sprint-report-{team}-{sprint-name}.md`
3. **Sprint overview** — when multiple sprints are included: `sprint-report-overview-{first-sprint-name}.md`
4. **Release report** — Markdown file: `release-report-{release-name}.md`
5. **Demo presentation** — PowerPoint file: `demo-{sprint-name}.pptx`

After all phases complete, present a **summary** that includes:

- Every `datasetHash` from phase 0 (release plus one per team), so the run is reproducible.
- A brief status per artifact (success or failure with error).
- A **file URI link** for each produced file, plus the plain absolute path.
- A sprint snapshot table with one row per sprint so the final answer still contains the
  most important delivery detail without opening the files.
- A release snapshot table with the core release numbers.

### Link format rule

Use **absolute `file:///` links**, not relative links like `./report.md` and not bare
filenames. Relative Markdown links are not reliable in the chat UI for local workspace
artifacts.

Example summary:

```
## Sprint Review Complete

| Artifact | Scope | Status | Open | Path |
|----------|-------|--------|------|------|
| Sprint Report | Sprint A - Xanadu | ✅ Done | [Open](file:///D:/workspace/sprint-report-sprint-a-xanadu.md) | `D:\workspace\sprint-report-sprint-a-xanadu.md` |
| Sprint Report | Sprint B - Xanadu | ✅ Done | [Open](file:///D:/workspace/sprint-report-sprint-b-xanadu.md) | `D:\workspace\sprint-report-sprint-b-xanadu.md` |
| Sprint Overview | Sprint A - Xanadu + Sprint B - Xanadu | ✅ Done | [Open](file:///D:/workspace/sprint-report-overview-sprint-a-xanadu.md) | `D:\workspace\sprint-report-overview-sprint-a-xanadu.md` |
| Release Report | 2026.32.0 | ✅ Done | [Open](file:///D:/workspace/release-report-2026.32.0.md) | `D:\workspace\release-report-2026.32.0.md` |
| Demo Presentation | Sprint A - Xanadu + Sprint B - Xanadu | ✅ Done | [Open](file:///D:/workspace/demo-sprint-a-xanadu.pptx) | `D:\workspace\demo-sprint-a-xanadu.pptx` |

### Sprint Snapshot

| Sprint | Scope | Completed | Completed Points | Carry-over | Bugs Done | Key labels / themes |
|--------|-------|-----------|------------------|------------|-----------|---------------------|
| Sprint A - Xanadu | 50 | 46 | 102 | 4 | 18 | `jira_escalated`, `frontend`, `technical-debt` |
| Sprint B - Xanadu | 42 | 39 | 88 | 3 | 12 | `production`, `e2e`, `pve` |

### Release Snapshot

| Release | Sprints covered | Original Scope | Delivered | Delivered Points | Deferred | Bug Fixes |
|---------|-----------------|----------------|-----------|------------------|----------|-----------|
| 2026.32.0 | Sprint A - Xanadu, Sprint B - Xanadu | 91 issues / 190 pts | 85 issues / 177 pts | 177 | 6 issues / 13 pts | 34 |
```

If multiple sprints are requested or resolved, the final summary must mention **every**
included sprint explicitly. Never collapse a multi-sprint run into only the first sprint's
name or only a single sprint-report row.

## Working Rules

- Always run phase 0 first; never start a reporting phase without the required dataset file.
- Run phases sequentially: collect release → collect sprints per team → sprint-report →
  release-report → demo-presentation.
- Treat the datasets as the single source of truth; do not query Jira directly at any point.
- Take counts, points, completion rates, epic order, and sprint order verbatim from the datasets.
- Never read sprint numbers from the release dataset or release numbers from a sprint dataset.
- Treat this skill as orchestration only: it coordinates, passes context, and saves artifacts.
- Save every phase result as a file — never only display in chat.
- Save one sprint-report file per team per sprint; do not merge multiple sprint reports into a
  single per-sprint artifact.
- Use the latest fixVersion even if it is unreleased; do not skip it.
- The demo presentation must be a `.pptx` file, not Markdown.
- Pass report artifacts forward to `demo-presentation`; do not force it to rebuild those
  inputs from Jira.
- Use Dutch language for slide content (the Fincent Review template is Dutch).
- After all phases finish, always present the artifact table plus sprint/release snapshot
  tables with links to all artifacts, and include every `datasetHash`.
- Preserve the detailed reporting signal from the generated reports: include labels,
  story points, carry-over, and sprint-by-sprint totals in the final chat summary.
- If a phase fails, report the error in the summary table and continue with subsequent phases where possible.
- Do not post anything to Jira.

## Tools Used

- `plugins/fincent/scripts/Get-ReleaseData.ps1` — deterministic release collection (phase 0a).
- `plugins/fincent/scripts/Get-SprintData.ps1` — deterministic sprint collection per team (phase 0b).
- `plugins/fincent/scripts/FincentJira.psm1` — shared classification, ordering, and hashing rules.
- `sprint-report` skill — phase 1 rendering logic over each sprint dataset.
- `release-report` skill — phase 2 rendering logic over the release dataset.
- `demo-presentation` skill — phase 3 slide logic, using the generated reports as primary input.
