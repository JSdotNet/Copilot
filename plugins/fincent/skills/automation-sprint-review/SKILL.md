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

### Phase 2 — Release Report

Run the `release-report` skill for the resolved fixVersion.
Use the latest fixVersion (released or unreleased). Do not restrict to final releases.

### Phase 3 — Demo Presentation (PowerPoint)

Run the `demo-presentation` skill using the sprint and release data collected in
phases 1 and 2.

**Output format: PowerPoint (`.pptx`)**, not Markdown.

Generate the presentation as a `.pptx` file using the `python-pptx` library:

1. Install `python-pptx` if not available.
2. Create slides following the Fincent Review PPTX template structure
   (see `demo-presentation` skill for the slide order).
3. Apply a clean slide layout:
   - Title slide with sprint name, team, dates, and release.
   - Content slides with bullet lists grouped by epic.
   - Bug slide as a table.
   - Demo divider slide.
   - Next sprint and release slides.
4. Save the file as `demo-{sprint-name}.pptx` in the working directory.

If multiple sprints are requested, produce one combined `.pptx` covering all sprints.

## Output

The automation produces three artifacts:

1. **Sprint report** — full Markdown report per sprint (displayed in chat).
2. **Release report** — full Markdown release report (displayed in chat).
3. **Demo presentation** — `.pptx` file saved to disk.

## Working Rules

- Run phases sequentially: sprint-report → release-report → demo-presentation.
- Use the latest fixVersion even if it is unreleased; do not skip it.
- The demo presentation must be a `.pptx` file, not Markdown.
- Use Dutch language for slide content (the Fincent Review template is Dutch).
- If a phase fails, report the error and continue with subsequent phases where possible.
- Do not post anything to Jira.

## Tools Used

- `sprint-report` skill — phase 1.
- `release-report` skill — phase 2.
- `demo-presentation` skill — phase 3 (adapted for PowerPoint output).
- `python-pptx` — PowerPoint file generation.
- Discovered query-capable Jira skill — resolve latest fixVersion.
