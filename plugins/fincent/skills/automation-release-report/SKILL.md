---
name: automation-release-report
description: >
  Automation that generates release reports for one or more Fincent fixVersions in one run.
  For each release, it calls the release-report skill via a parallel subagent and then
  assembles a consolidated multi-release summary. Ideal for comparing consecutive releases
  or preparing a quarterly delivery overview.
---

# Automation: Release Report (Multi-Release)

Fetch and generate release reports for multiple `FIN` fixVersions in parallel, then produce a
consolidated summary comparing delivery rates and trends across releases.

## Jira Setup Reference

Refer to `plugins/fincent/resources/jira-setup.md` for the Fincent Jira project
configuration including the status flow, custom fields, fix version naming, labels,
and epic ordering conventions.

Use this skill when you need reports for several releases at once, for example to prepare a
quarterly overview or a year-end retrospective.

## Input

Provide one or more release names or a date range:

- **By release names**: `release-report automation for "pre-2025.1", "pre-2025.2", "pre-2025.3"`
- **By date range**: `release-report automation from 2025-01-01 to 2025-09-30`

If a date range is given, resolve the releases in that range using the discovered Jira query skill:

```
JQL: project = FIN AND fixVersion in releasedVersions()
     → filter versions by releaseDate within the given range
```

## Execution plan

1. **Resolve release list** — determine the fixVersion names to report on.
2. **Fan-out** — launch one `Explore` subagent per release using the `release-report` skill.
   Each subagent produces a full release report independently.
3. **Collect results** — wait for all subagents, then aggregate.
4. **Produce consolidated output** — trend table + individual reports in chronological order.

> **Rule**: subagents only read Jira and generate their report. They must not post to Jira.

## Consolidated output

### Trend Summary

| Release | Original Scope | Delivered | Delivered Points | Delivery Rate | Deferred |
|---------|---------------|-----------|-----------------|---------------|----------|
| pre-2025.1 | N | N | N pts | % | N |
| pre-2025.2 | … | … | … | … | … |

Include a short trend observation below the table, for example:

> Delivery rate improved from 74 % → 92 % over the last three releases.
> Deferred stories decreased by 30 % between pre-2025.1 and pre-2025.3.

### Individual Release Reports

Append each full release report (from the `release-report` skill) in chronological order
beneath the consolidated table, separated by `---`.

## Working rules

- Process up to 6 releases in parallel; for more, run in batches of 6.
- If a release subagent fails, include a row in the trend table marked `⚠️ fetch failed`
  and continue with the others.
- Present the complete output as a single Markdown document.
- Ask the user if they want to export the consolidated report as a file (`.md`).

## Tools used

- Discovered query-capable Jira skill — resolve releases and fixVersions via JQL.
- Parallel subagents via `release-report` skill for individual release data.
