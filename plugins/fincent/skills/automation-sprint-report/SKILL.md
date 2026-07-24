---
name: automation-sprint-report
description: >
  Automation that generates sprint reports for one or more Fincent sprints in one run.
  For each sprint, it calls the sprint-report skill via a parallel subagent and then
  assembles a consolidated multi-sprint view. Ideal for end-of-quarter or release reviews.
---

# Automation: Sprint Report (Multi-Sprint)

Fetch and generate sprint reports for multiple `FIN` sprints in parallel, then produce a
consolidated summary comparing completion rates and trends across sprints.

Use this skill when you need reports for several sprints at once, for example at the end
of a release cycle or to prepare a quarterly retrospective.

## Input

Provide one or more sprint names or a release name:

- **By sprint names**: `sprint-report automation for "Sprint 42 - Xanthic", "Sprint 43 - Yellow"`
- **By release**: `sprint-report automation for release pre-2025.3`
- **By date range**: `sprint-report automation from 2025-06-01 to 2025-09-30`

If a release name is given, first resolve the sprints in that release:

```
JQL: project = FIN AND fixVersion = "{release}" AND "Fincent Team" = "Team B"
     → read unique sprint names from the results
```

If a date range is given, find closed sprints in that range via the sprint board API or
JQL `sprint in closedSprints() AND ... updated >= "{start}" AND updated <= "{end}"`.

## Execution plan

1. **Resolve sprint list** — determine the sprint names to report on.
2. **Fan-out** — launch one `Explore` subagent per sprint using the `sprint-report` skill.
   Each subagent produces a full sprint report independently.
3. **Collect results** — wait for all subagents, then aggregate.
4. **Produce consolidated output** — trend table + individual reports in order.

> **Rule**: subagents only read Jira and generate their report. They must not post to Jira.

## Consolidated output

### Trend Summary

| Sprint | Scope | Completed | Completed Points | Completion % | Not Tested |
|--------|-------|-----------|-----------------|--------------|------------|
| Sprint 42 - Xanthic | N | N | N | % | N |
| Sprint 43 - Yellow | … | … | … | … | … |

Include a short trend observation below the table focusing on the sprint's own progress, e.g.:
> Completion rate improved from 78 % → 91 % over the last three sprints.
> Untested stories decreased by 40 %.

### Individual Sprint Reports

Append each full sprint report (from the `sprint-report` skill) in chronological order
beneath the consolidated table, separated by `---`.

## Working rules

- Process up to 8 sprints in parallel; for more, run in batches of 8.
- If a sprint subagent fails, include a row in the trend table marked `⚠️ fetch failed`
  and continue with the others.
- Present the complete output as a single Markdown document.
- Ask the user if they want to export the consolidated report as a file (`.md`).

## Tools used

- Discovered query-capable Jira skill — resolve releases/sprints via JQL.
- Parallel subagents via `sprint-report` skill for individual sprint data.
