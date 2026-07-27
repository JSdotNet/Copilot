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

Example invocations:

- `automation-sprint-review for "Sprint A - Xanadu", "Sprint B - Xanadu"`
- `automation-sprint-review for active sprints`

## Resolving the Latest Release

When no explicit release is given, resolve the latest fixVersion automatically:

1. Query Jira project versions: list all fixVersions for project `FIN`.
2. Sort by release date descending (or by version name if dates are absent).
3. Pick the most recent version — it does not need to be released/final.
   Unreleased versions are valid (e.g. `release/2026.32.0`).

Alternatively use JQL:
```
project = FIN AND fixVersion is not EMPTY ORDER BY fixVersion DESC
```
Then extract the highest fixVersion from the results.

## Execution Plan

Execute the three phases **sequentially** — each phase uses output from the previous:

### Phase 1 — Sprint Report

Run the `sprint-report` skill for each requested sprint and team.
Collect the full sprint report output (completed stories, bugs, scope changes).
Save the complete report as `sprint-report-{sprint-name}.md` in the working directory.

### Phase 2 — Release Report

Run the `release-report` skill for the resolved fixVersion.
Use the latest fixVersion (released or unreleased). Do not restrict to final releases.
Save the complete report as `release-report-{release-name}.md` in the working directory.

### Phase 3 — Demo Presentation (PowerPoint)

Run the `demo-presentation` skill using the sprint and release data collected in
phases 1 and 2.

**Output format: PowerPoint (`.pptx`)**, not Markdown.

Generate the presentation using the Fincent Review template file:
`plugins/fincent/resources/fincent-review-template.pptx`

Use `python-pptx` to clone or populate the template:

1. Install `python-pptx` if not available.
2. Open the template file as the base presentation.
3. Follow the template slide structure (layouts and ordering):

| Slide | Layout | Content |
|-------|--------|---------|
| 1 | `Logo foto` | Cover slide — no changes needed. |
| 2 | `Title and Content 2` | Title slide: sprint name, team, period. |
| 3 | `Onze cultuur` | Implementatie wensen & taken — general completed tasks. |
| 4 | `Onze cultuur` | Bugs — bug fixes delivered this sprint. |
| 5–N | `Onze cultuur` | **One slide per epic** — list completed stories for that epic. |
| N+1 | `Title and Content 2` | Demo divider slide — team name, date, release. |
| N+2 | `Title and Content 2` | Next sprint / release info. |
| N+3 | `Title and Content 2` | Release acceptance overview. |
| N+4 | `Onze cultuur` | Next sprint planning — preliminary epic breakdown. |
| N+5 | `Title and Content 2` | Informatie vanuit implementaties (implementation notes). |

4. **One slide per epic** — for each epic that has completed stories, create a
   separate slide using the `Onze cultuur` layout. The slide header contains the
   sprint name, team, and period. The epic name is the section title. List the
   completed stories as bullet points (summary + status).
5. Remove any template placeholder slides that are not needed (e.g. extra epic
   slides from the template that have no matching data).
6. Save the file as `demo-{sprint-name}.pptx` in the working directory.

If multiple sprints are requested, produce one combined `.pptx` covering all sprints.

## Output

The automation produces three file artifacts saved to the working directory:

1. **Sprint report** — Markdown file: `sprint-report-{sprint-name}.md`
2. **Release report** — Markdown file: `release-report-{release-name}.md`
3. **Demo presentation** — PowerPoint file: `demo-{sprint-name}.pptx`

After all phases complete, present a **summary** that includes:

- A brief status per phase (success or failure with error).
- A clickable link to each produced file using a relative path.

Example summary:

```
## Sprint Review Complete

| Phase | Status | Artifact |
|-------|--------|----------|
| Sprint Report | ✅ Done | [sprint-report-sprint-a-xanadu.md](./sprint-report-sprint-a-xanadu.md) |
| Release Report | ✅ Done | [release-report-release-2026.32.0.md](./release-report-release-2026.32.0.md) |
| Demo Presentation | ✅ Done | [demo-sprint-a-xanadu.pptx](./demo-sprint-a-xanadu.pptx) |
```

If multiple sprints are requested, produce one file per artifact type covering all sprints
(use the combined sprint names or first sprint name in the filename).

## Working Rules

- Run phases sequentially: sprint-report → release-report → demo-presentation.
- Save every phase result as a file — never only display in chat.
- Use the latest fixVersion even if it is unreleased; do not skip it.
- The demo presentation must be a `.pptx` file, not Markdown.
- Use Dutch language for slide content (the Fincent Review template is Dutch).
- After all phases finish, always present the summary table with links to all artifacts.
- If a phase fails, report the error in the summary table and continue with subsequent phases where possible.
- Do not post anything to Jira.

## Tools Used

- `sprint-report` skill — phase 1.
- `release-report` skill — phase 2.
- `demo-presentation` skill — phase 3 (adapted for PowerPoint output).
- `python-pptx` — PowerPoint file generation.
- Discovered query-capable Jira skill — resolve latest fixVersion.
