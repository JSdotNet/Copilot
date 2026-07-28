---
name: automation-sprint-review
description: >
  End-to-end sprint review automation: generates the sprint report, then the release
  report for the latest fixVersion, and finally a demo presentation as PowerPoint.
  Orchestrates sprint-report, release-report, and demo-presentation skills sequentially.
---

# Automation: Sprint Review (Full Pipeline)

Run the complete sprint review pipeline in one go: sprint report → release report →
demo presentation (PowerPoint). Each step feeds context into the next.

This skill is optimized for sprint reviews that cover one or more sprints. The final result
must keep the detailed reporting signal from the underlying reports instead of collapsing it
to a minimal status note.

This is an **orchestration skill**. It owns the end-to-end flow, cross-step context, artifact
handoff, and Jira skill discovery. It must not duplicate the detailed reporting logic that
already belongs inside `sprint-report`, `release-report`, or `demo-presentation`.

## Jira Setup Reference

Refer to `plugins/fincent/resources/jira-setup.md` for the Fincent Jira project
configuration including the status flow, custom fields, fix version naming, labels,
and epic ordering conventions.

## Input

Provide:

- **Sprint name(s)**: one or more sprint names (e.g. `"Sprint A - Xanadu"`)
- **Team**: defaults to all teams; specify if single-team report is needed
- **Release**: optional. If omitted, automatically resolved to the latest fixVersion
  (see "Resolving the latest release" below).

If the user asks for active sprints, a release, or a date range, resolve **all matching
sprints** first and keep that full resolved list for the rest of the run.
Never continue with only the first match when more than one sprint is found.

## Orchestration responsibilities

This skill is responsible for:

- Discovering the Jira skill or Jira tool capability **once** for the whole pipeline.
- Resolving sprint names, team, and release scope.
- Calling `sprint-report` and `release-report` in the right order.
- Persisting each generated report as an artifact.
- Passing the generated sprint and release reports forward into `demo-presentation`.
- Producing the final artifact summary for the user.

This skill is **not** responsible for:

- Reimplementing the internal report logic of `sprint-report`.
- Reimplementing release classification logic from `release-report`.
- Re-fetching story detail for the demo once the needed report artifacts already exist.

## Jira skill discovery

Before running any phase, discover what Jira skills are available:

1. Check installed skills for skills whose name or description mentions "jira".
2. Identify a **query-capable** Jira skill — can search or list issues by JQL, sprint, or release.
3. Identify a **retrieval-capable** Jira skill — can fetch one existing issue when detail lookup is needed.
4. Reuse that discovered Jira capability across all phases in this run.
5. If no query-capable Jira skill is found, stop and ask the user for manual source data.

Pass the discovered Jira capability context into `sprint-report` and `release-report` so the
pipeline uses one consistent Jira integration instead of rediscovering it at every step.

Example invocations:

- `automation-sprint-review for "Sprint A - Xanadu", "Sprint B - Xanadu"`
- `automation-sprint-review for active sprints`

## Resolving the latest release

When no explicit release is given, resolve the latest fixVersion automatically:

1. Use the discovered Jira capability to query Jira project versions for project `FIN`.
2. Sort by release date descending (or by version name if dates are absent).
3. Pick the most recent version — it does not need to be released/final.
   Unreleased versions are valid (e.g. `release/2026.32.0`).

Alternatively use JQL:
```
project = FIN AND fixVersion is not EMPTY ORDER BY fixVersion DESC
```
Then extract the highest fixVersion from the results.

## Resolving all sprints (mandatory completeness check)

When sprint scope is not a single explicit sprint name, resolve sprints with an exhaustive
union strategy before phase 1:

1. Resolve direct sprint matches from user input (single or multiple named sprints).
2. When scope is inferred (active sprint(s), release, or date range), query sprint lists
   across all relevant states (`active`, `closed`, and `future` when applicable) and paginate.
3. Cross-check with release issues by extracting all sprint names from matching issues
   (for example from `project = FIN AND fixVersion = "{release name}"` with team filter when used).
4. Union and de-duplicate sprint names from all sources, then sort chronologically.
5. If the user stated an expected sprint count (for example "2 sprints"), verify the resolved
   list count matches that expectation before generating artifacts.
6. If there is a mismatch or ambiguity, stop and ask for confirmation instead of silently
   dropping unresolved sprints.

Before phase 2 starts, assert that phase 1 produced one sprint report artifact per resolved
sprint. If not, rerun phase 1 for missing sprints and only continue when the set is complete.

## Execution Plan

Execute the three phases **sequentially**. Each phase must receive the outputs and context
from the previous phase instead of independently starting over.

### Phase 1 — Sprint Report

Run the `sprint-report` skill **once per resolved sprint** for the requested team.
Pass in:

- the resolved sprint name
- the selected team
- the discovered Jira capability context

Collect the full sprint report output (completed stories, bugs, scope changes, labels,
story points, and sprint-goal evaluation).
Save **one file per sprint** as `sprint-report-{sprint-name}.md` in the working directory.
If the resolved sprint list contains `N` sprints, phase 1 must output exactly `N`
per-sprint files.

If more than one sprint is included, also produce a consolidated comparison file named
`sprint-report-overview-{first-sprint-name}.md` that contains:

- A trend table with one row per sprint.
- The full per-sprint reports appended in chronological order.
- A short cross-sprint observation paragraph.

### Phase 2 — Release Report

Run the `release-report` skill for the resolved fixVersion.
Pass in:

- the resolved release name
- the discovered Jira capability context
- the resolved sprint list from phase 1 when it helps identify covered sprints

Use the latest fixVersion (released or unreleased). Do not restrict to final releases.
Save the complete report as `release-report-{release-name}.md` in the working directory.

### Phase 3 — Demo Presentation (PowerPoint)

Run the `demo-presentation` skill using the sprint and release report data collected in
phases 1 and 2.

Pass in:

- the generated sprint report artifact(s) or their full content
- the generated release report artifact or its full content
- the resolved sprint list
- the resolved release name
- the team

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

1. **Sprint report(s)** — one Markdown file per sprint: `sprint-report-{sprint-name}.md`
2. **Sprint overview** — when multiple sprints are included: `sprint-report-overview-{first-sprint-name}.md`
3. **Release report** — Markdown file: `release-report-{release-name}.md`
4. **Demo presentation** — PowerPoint file: `demo-{sprint-name}.pptx`

After all phases complete, present a **summary** that includes:

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

- Run phases sequentially: sprint-report → release-report → demo-presentation.
- Treat this skill as orchestration only: it coordinates, passes context, and saves artifacts.
- Save every phase result as a file — never only display in chat.
- Save one sprint-report file per sprint; do not merge multiple sprint reports into a
  single per-sprint artifact.
- Discover Jira capability once and reuse it across the full flow.
- Use the latest fixVersion even if it is unreleased; do not skip it.
- The demo presentation must be a `.pptx` file, not Markdown.
- Pass report artifacts forward to `demo-presentation`; do not force it to rebuild those
  inputs from Jira.
- Use Dutch language for slide content (the Fincent Review template is Dutch).
- After all phases finish, always present the artifact table plus sprint/release snapshot
  tables with links to all artifacts.
- Preserve the detailed reporting signal from the generated reports: include labels,
  story points, carry-over, and sprint-by-sprint totals in the final chat summary.
- If a phase fails, report the error in the summary table and continue with subsequent phases where possible.
- Do not post anything to Jira.

## Tools Used

- Discovered Jira skill — shared Jira capability for the full orchestration run.
- `sprint-report` skill — phase 1 reporting logic.
- `release-report` skill — phase 2 reporting logic.
- `demo-presentation` skill — phase 3 slide logic, using the generated reports as primary input.
