# Fincent Jira Setup

Shared reference for all Fincent skills that interact with Jira.

## Deterministic Collection Scripts

The sprint review pipeline (`automation-sprint-review`, `sprint-report`, `release-report`)
does **not** query Jira directly. It reads fixed-schema datasets produced by:

- `plugins/fincent/scripts/Get-SprintData.ps1` — sprint scope, one team per dataset.
- `plugins/fincent/scripts/Get-ReleaseData.ps1` — release scope for one fixVersion.
- `plugins/fincent/scripts/FincentJira.psm1` — the shared module both scripts import.

Together they encode every rule on this page: project key, team filter, story point field,
completion statuses, fix version resolution, and epic ordering. Change a rule here and in the
module together.

Required environment variables: `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`.

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

The Fincent workflow has two tracks:

**Refinement track** (backlog preparation):

```
Just In → Analyze → Design → Pre-Refinement → Refinement → Approval
```

**Development track** (execution):

```
Open ↔ In Progress → Ready → Test → Acceptatie Klant → Done
```

Key transitions:
- `Open` ↔ `In Progress` (Start Issue / Stop Issue)
- `In Progress` → `Ready` (Issue Ready)
- `Ready` → `Test` (Ready To Test)
- `Test` → `Acceptatie Klant` (Test To Klant)
- `Test` → `Done` (Test To Done)
- `Acceptatie Klant` → `Done`

**Completed** (for reporting purposes) means the issue has reached **Test** or beyond:
Test, Acceptatie Klant, Done, Closed.

**Not completed** means the issue is at a status before Test:
Just In, Open, Analyze, Design, Pre-Refinement, Refinement, Approval, Ready, In Progress.

## Labels

- Issues may carry one or more Jira labels for cross-cutting classification.
- Include labels in report output when present — they provide context on themes,
  environments, or special categories that do not map to an epic.

## Ordering Convention

- When grouping by epic, always list the **No epic** group last.
