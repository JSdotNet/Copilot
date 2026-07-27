# Fincent Jira Setup

Shared reference for all Fincent skills that interact with Jira.

## Project

- Project key: `FIN`

## Custom Fields

| Field | Purpose |
|-------|---------|
| Fincent Team | Team assignment — used to filter sprints and work per team (e.g. `"Fincent Team" = "Team A"`) |
| Story Points (`customfield_10016`) | Estimation in story points |

## Fix Versions (Releases)

- Fix versions that represent a release follow the naming pattern containing `release`
  (e.g. `release/2026.32.0`, `pre-2026.3`).
- Use JQL `fixVersion` to query issues targeted for a specific release.

## Status Flow

The Fincent workflow progresses through the following statuses in order:

```
Just in → Open → Analyze → Ready → In Progress → Test → Acceptatie klant → Done → Closed
```

**Completed** (for reporting purposes) means the issue has reached **Test** or beyond:
Test, Acceptatie klant, Done, Closed.

**Not completed** means the issue is at a status before Test:
Just in, Open, Analyze, Ready, In Progress.

## Labels

- Issues may carry one or more Jira labels for cross-cutting classification.
- Include labels in report output when present — they provide context on themes,
  environments, or special categories that do not map to an epic.

## Ordering Convention

- When grouping by epic, always list the **No epic** group last.
