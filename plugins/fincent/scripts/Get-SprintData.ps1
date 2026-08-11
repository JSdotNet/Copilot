<#
.SYNOPSIS
    Deterministic Jira data collection for the Fincent `sprint-report` skill.

.DESCRIPTION
    Collects exactly the data a sprint report needs, for one team, and emits a fixed-schema
    JSON dataset. Fetches nothing release-specific.

    Scope per sprint:
      - issues currently in the sprint (team-filtered)
      - issues that were in the sprint and were later removed (scope changes)
      - sprint metadata (dates, goal) when a board id is supplied

    Determinism guarantees:
      - Fixed JQL templates (no model-authored query text).
      - Exhaustive pagination; never a partial page.
      - Fixed completion classification status set.
      - Stable ordering (issues by numeric key, sprints chronologically, "No epic" last).
      - `datasetHash` excludes `generatedAtUtc`, so unchanged Jira data yields the same hash.

.PARAMETER Sprint
    Sprint name(s) to report on. Required unless -ActiveSprints or -Release is supplied.

.PARAMETER Team
    Value of the "Fincent Team" field. One dataset covers one team; run once per team.

.PARAMETER ActiveSprints
    Resolve sprint names from the active sprints of -BoardId instead of -Sprint.

.PARAMETER Release
    Resolve sprint names from the issues carrying this fixVersion. Use when the sprint names
    are not known up front.

.PARAMETER ExpectedSprintCount
    When supplied, the script fails if the resolved sprint count differs.

.EXAMPLE
    ./Get-SprintData.ps1 -Sprint 'Sprint A - Xanadu','Sprint B - Xanadu' -Team 'Team B'

.EXAMPLE
    ./Get-SprintData.ps1 -ActiveSprints -BoardId 42 -Team 'Team B' -OutputPath ./sprint-data-team-b.json
#>
[CmdletBinding()]
param(
    [Parameter()]
    [string[]]$Sprint = @(),

    [Parameter()]
    [string]$Team,

    [Parameter()]
    [switch]$ActiveSprints,

    [Parameter()]
    [int]$BoardId,

    [Parameter()]
    [string]$Release,

    [Parameter()]
    [int]$ExpectedSprintCount,

    [Parameter()]
    [string]$Project = 'FIN',

    [Parameter()]
    [string]$BaseUrl = $env:JIRA_BASE_URL,

    [Parameter()]
    [string]$OutputPath = 'sprint-data.json',

    [Parameter()]
    [string[]]$CompletedStatuses = @()
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Import-Module (Join-Path $PSScriptRoot 'FincentJira.psm1') -Force -DisableNameChecking

$resolvedBaseUrl = Connect-FincentJira -BaseUrl $BaseUrl -CompletedStatuses $CompletedStatuses

Write-Host 'Resolving Jira field ids...'
$fieldIds = Get-FincentFieldIds
$issueFields = Get-FincentIssueFields -FieldIds $fieldIds
$teamClause = Get-FincentTeamClause -Team $Team

# ---------------------------------------------------------------------------
# Sprint resolution
# ---------------------------------------------------------------------------

$explicitSprints = @($Sprint | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
$releaseSprints = @()
$boardSprintNames = @()
$boardSprintMeta = @()

if ($BoardId) {
    Write-Host "Querying board $BoardId sprints..."
    $boardSprintMeta = Get-FincentBoardSprints -BoardId $BoardId
    if ($ActiveSprints) {
        $boardSprintNames = @($boardSprintMeta | Where-Object { $_.state -eq 'active' } | ForEach-Object { $_.name } | Sort-Object -Unique -CaseSensitive)
    }
}
elseif ($ActiveSprints) {
    throw '-ActiveSprints requires -BoardId.'
}

if (-not [string]::IsNullOrWhiteSpace($Release)) {
    Write-Host "Resolving sprint names from release '$Release'..."
    $releaseScopeJql = 'project = {0} AND fixVersion = "{1}"{2} ORDER BY key ASC' -f $Project, (ConvertTo-FincentJqlValue $Release), $teamClause
    $releaseScopeIssues = Get-FincentNormalizedIssues -Jql $releaseScopeJql -FieldIds $fieldIds -Fields $issueFields
    $releaseSprints = @($releaseScopeIssues | ForEach-Object { $_.sprints } | Where-Object { $_ } | Sort-Object -Unique -CaseSensitive)
}

$resolvedSprintNames = @(
    ($explicitSprints + $releaseSprints + $boardSprintNames) |
    Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
    Sort-Object -Unique -CaseSensitive
)

if ($resolvedSprintNames.Count -eq 0) {
    throw 'No sprints resolved. Pass -Sprint, or -ActiveSprints -BoardId, or -Release.'
}

$sprintMetaByName = @{}
foreach ($meta in $boardSprintMeta) {
    if (-not $sprintMetaByName.ContainsKey($meta.name)) { $sprintMetaByName[$meta.name] = $meta }
}

# Chronological when board metadata is available, otherwise ordinal by name.
$resolvedSprintNames = @($resolvedSprintNames | Sort-Object -Property `
    @{ Expression = {
            if ($sprintMetaByName.ContainsKey($_) -and (Test-FincentProperty $sprintMetaByName[$_] 'startDate') -and $sprintMetaByName[$_].startDate) {
                [datetime]$sprintMetaByName[$_].startDate
            }
            else { [datetime]::MaxValue }
        }
    },
@{ Expression = { $_ } })

if ($ExpectedSprintCount -gt 0 -and $resolvedSprintNames.Count -ne $ExpectedSprintCount) {
    throw ('Resolved {0} sprint(s) but -ExpectedSprintCount is {1}: {2}' -f $resolvedSprintNames.Count, $ExpectedSprintCount, ($resolvedSprintNames -join ', '))
}

Write-Host ('Sprints ({0}): {1}' -f $resolvedSprintNames.Count, ($resolvedSprintNames -join ', '))

# ---------------------------------------------------------------------------
# Per-sprint collection
# ---------------------------------------------------------------------------

$sprintData = [System.Collections.Generic.List[object]]::new()

foreach ($name in $resolvedSprintNames) {
    $escaped = ConvertTo-FincentJqlValue $name
    Write-Host "Querying sprint '$name'..."

    $inSprintJql = 'project = {0} AND sprint = "{1}"{2} ORDER BY key ASC' -f $Project, $escaped, $teamClause
    $removedJql = 'project = {0} AND sprint was "{1}" AND sprint != "{1}"{2} ORDER BY key ASC' -f $Project, $escaped, $teamClause

    $issues = Get-FincentNormalizedIssues -Jql $inSprintJql -FieldIds $fieldIds -Fields $issueFields

    $removed = @()
    try {
        $removed = Get-FincentNormalizedIssues -Jql $removedJql -FieldIds $fieldIds -Fields $issueFields
    }
    catch {
        Write-Warning "Removed-from-sprint query failed for '$name': $($_.Exception.Message)"
    }

    $meta = $null
    if ($sprintMetaByName.ContainsKey($name)) {
        $m = $sprintMetaByName[$name]
        $meta = [ordered]@{
            id        = $m.id
            state     = [string]$m.state
            startDate = $(if (Test-FincentProperty $m 'startDate') { [string]$m.startDate } else { $null })
            endDate   = $(if (Test-FincentProperty $m 'endDate') { [string]$m.endDate } else { $null })
            goal      = $(if (Test-FincentProperty $m 'goal') { [string]$m.goal } else { $null })
        }
    }

    $sprintData.Add([ordered]@{
            name           = $name
            metadata       = $meta
            jql            = [ordered]@{ inSprint = $inSprintJql; removedFromSprint = $removedJql }
            totals         = Get-FincentTotals -Issues $issues
            statusBreakdown = Get-FincentCountsByProperty -Issues $issues -Property 'status'
            typeBreakdown  = Get-FincentCountsByProperty -Issues $issues -Property 'issueType'
            epicOrder      = Get-FincentEpicGroups -Issues $issues
            issues         = $issues
            removedIssues  = $removed
        })
}

# ---------------------------------------------------------------------------
# Emit dataset
# ---------------------------------------------------------------------------

$payload = [ordered]@{
    schemaVersion = Get-FincentSchemaVersion
    datasetType   = 'sprint'
    metadata      = [ordered]@{
        generatedAtUtc    = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
        baseUrl           = $resolvedBaseUrl
        project           = $Project
        team              = $(if ([string]::IsNullOrWhiteSpace($Team)) { $null } else { $Team })
        completedStatuses = Get-FincentCompletedStatuses
        noEpicLabel       = Get-FincentNoEpicLabel
        fieldIds          = [ordered]@{
            storyPoints = $fieldIds.StoryPoints
            sprint      = $fieldIds.Sprint
            epicLink    = $fieldIds.EpicLink
            team        = $fieldIds.Team
        }
        sprintResolution  = [ordered]@{
            explicit = @($explicitSprints)
            release  = @($releaseSprints)
            board    = @($boardSprintNames)
            resolved = @($resolvedSprintNames)
        }
    }
    sprints       = @($sprintData)
}

$result = Save-FincentDataset -Payload $payload -OutputPath $OutputPath

Write-Host ''
Write-Host "Dataset written: $($result.Path)"
Write-Host ('Team: {0}   Sprints: {1}' -f $(if ($Team) { $Team } else { 'all' }), $sprintData.Count)
Write-Host ('datasetHash: {0}' -f $result.DatasetHash)

exit 0
