<#
.SYNOPSIS
    Deterministic Jira data collection for the Fincent `release-report` skill.

.DESCRIPTION
    Collects exactly the data a release report needs for one fixVersion and emits a
    fixed-schema JSON dataset. Fetches nothing sprint-specific: sprint names appear only as
    the `sprintsCovered` summary derived from the release issues themselves.

    Scope:
      - issues carrying the release fixVersion (all teams by default)
      - issues that carried the fixVersion and later lost it (scope changes)
      - status and type breakdowns for the release summary tables

    Determinism guarantees:
      - Fixed JQL templates (no model-authored query text).
      - Exhaustive pagination; never a partial page.
      - Fixed completion classification status set.
      - Stable ordering (issues by numeric key, "No epic" last).
      - `datasetHash` excludes `generatedAtUtc`, so unchanged Jira data yields the same hash.

.PARAMETER Release
    Release (fixVersion) name. When omitted, the latest fixVersion is resolved automatically.

.PARAMETER Team
    Optional "Fincent Team" filter. Omit for an all-teams release report (the default).

.EXAMPLE
    ./Get-ReleaseData.ps1 -Release 'release/2026.32.0'

.EXAMPLE
    ./Get-ReleaseData.ps1 -OutputPath ./release-data.json
#>
[CmdletBinding()]
param(
    [Parameter()]
    [string]$Release,

    [Parameter()]
    [string]$Team,

    [Parameter()]
    [string]$Project = 'FIN',

    [Parameter()]
    [string]$BaseUrl = $env:JIRA_BASE_URL,

    [Parameter()]
    [string]$OutputPath = 'release-data.json',

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
# Release resolution
# ---------------------------------------------------------------------------

$resolvedAutomatically = $false
if ([string]::IsNullOrWhiteSpace($Release)) {
    Write-Host "Resolving latest fixVersion for project $Project..."
    $Release = Resolve-FincentLatestRelease -Project $Project
    $resolvedAutomatically = $true
}
Write-Host "Release: $Release"

$escapedRelease = ConvertTo-FincentJqlValue $Release

$versionDetail = $null
try {
    $versions = Invoke-FincentJira -Path "/rest/api/3/project/$Project/versions"
    $match = @($versions | Where-Object { $_.name -eq $Release })
    if ($match.Count -gt 0) {
        $v = $match[0]
        $versionDetail = [ordered]@{
            id          = [string]$v.id
            released    = $(if (Test-FincentProperty $v 'released') { [bool]$v.released } else { $false })
            startDate   = $(if (Test-FincentProperty $v 'startDate') { [string]$v.startDate } else { $null })
            releaseDate = $(if (Test-FincentProperty $v 'releaseDate') { [string]$v.releaseDate } else { $null })
            description = $(if (Test-FincentProperty $v 'description') { [string]$v.description } else { $null })
        }
    }
}
catch {
    Write-Warning "Version metadata lookup failed: $($_.Exception.Message)"
}

# ---------------------------------------------------------------------------
# Release collection
# ---------------------------------------------------------------------------

$inReleaseJql = 'project = {0} AND fixVersion = "{1}"{2} ORDER BY key ASC' -f $Project, $escapedRelease, $teamClause
$removedJql = 'project = {0} AND fixVersion was "{1}" AND fixVersion != "{1}"{2} ORDER BY key ASC' -f $Project, $escapedRelease, $teamClause

Write-Host 'Querying release issues...'
$issues = Get-FincentNormalizedIssues -Jql $inReleaseJql -FieldIds $fieldIds -Fields $issueFields

$removed = @()
try {
    $removed = Get-FincentNormalizedIssues -Jql $removedJql -FieldIds $fieldIds -Fields $issueFields
}
catch {
    Write-Warning "Removed-from-release query failed: $($_.Exception.Message)"
}

# ---------------------------------------------------------------------------
# Emit dataset
# ---------------------------------------------------------------------------

$payload = [ordered]@{
    schemaVersion = Get-FincentSchemaVersion
    datasetType   = 'release'
    metadata      = [ordered]@{
        generatedAtUtc        = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
        baseUrl               = $resolvedBaseUrl
        project               = $Project
        team                  = $(if ([string]::IsNullOrWhiteSpace($Team)) { $null } else { $Team })
        completedStatuses     = Get-FincentCompletedStatuses
        noEpicLabel           = Get-FincentNoEpicLabel
        releaseResolvedAutomatically = $resolvedAutomatically
        fieldIds              = [ordered]@{
            storyPoints = $fieldIds.StoryPoints
            sprint      = $fieldIds.Sprint
            epicLink    = $fieldIds.EpicLink
            team        = $fieldIds.Team
        }
    }
    release       = [ordered]@{
        name            = $Release
        version         = $versionDetail
        jql             = [ordered]@{ inRelease = $inReleaseJql; removedFromRelease = $removedJql }
        sprintsCovered  = @($issues | ForEach-Object { $_.sprints } | Where-Object { $_ } | Sort-Object -Unique -CaseSensitive)
        totals          = Get-FincentTotals -Issues $issues
        statusBreakdown = Get-FincentCountsByProperty -Issues $issues -Property 'status'
        typeBreakdown   = Get-FincentCountsByProperty -Issues $issues -Property 'issueType'
        epicOrder       = Get-FincentEpicGroups -Issues $issues
        issues          = $issues
        removedIssues   = $removed
    }
}

$result = Save-FincentDataset -Payload $payload -OutputPath $OutputPath

Write-Host ''
Write-Host "Dataset written: $($result.Path)"
Write-Host ('Release: {0}   Issues: {1}' -f $Release, @($issues).Count)
Write-Host ('datasetHash: {0}' -f $result.DatasetHash)

exit 0
