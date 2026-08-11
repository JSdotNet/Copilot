<#
.SYNOPSIS
    Shared deterministic Jira access primitives for the Fincent reporting scripts.

.DESCRIPTION
    Owns the rules that must be identical across every Fincent report: authentication,
    field-id discovery, JQL escaping, exhaustive pagination, issue normalization,
    completion classification, epic ordering, totals, and dataset hashing.

    `Get-SprintData.ps1` and `Get-ReleaseData.ps1` decide *which* issues to fetch.
    This module decides *how* they are fetched, classified, ordered, and counted, so the
    two reports can never disagree on the same issue.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:SchemaVersion = '1.0.0'
$script:NoEpicLabel = 'No epic'
$script:DefaultCompletedStatuses = @('Test', 'Acceptatie klant', 'Done', 'Closed')

$script:BaseUrl = $null
$script:Headers = $null
$script:CompletedStatuses = $script:DefaultCompletedStatuses

function Get-FincentSchemaVersion {
    return $script:SchemaVersion
}

function Get-FincentNoEpicLabel {
    return $script:NoEpicLabel
}

function Get-FincentCompletedStatuses {
    return @($script:CompletedStatuses)
}

function Connect-FincentJira {
    <#
    .SYNOPSIS
        Configures the Jira endpoint and credentials for this session.
    #>
    [CmdletBinding()]
    param(
        [string]$BaseUrl,
        [string[]]$CompletedStatuses
    )

    if ([string]::IsNullOrWhiteSpace($BaseUrl)) { $BaseUrl = $env:JIRA_BASE_URL }
    if ([string]::IsNullOrWhiteSpace($BaseUrl)) { $BaseUrl = 'https://innovadis.atlassian.net' }
    $script:BaseUrl = $BaseUrl.TrimEnd('/')

    if ([string]::IsNullOrWhiteSpace($env:JIRA_EMAIL) -or [string]::IsNullOrWhiteSpace($env:JIRA_API_TOKEN)) {
        throw 'Missing Jira credentials. Set JIRA_EMAIL and JIRA_API_TOKEN (and optionally JIRA_BASE_URL) before running this script.'
    }

    $pair = '{0}:{1}' -f $env:JIRA_EMAIL, $env:JIRA_API_TOKEN
    $basic = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($pair))
    $script:Headers = @{
        Authorization = "Basic $basic"
        Accept        = 'application/json'
    }

    if ($CompletedStatuses -and $CompletedStatuses.Count -gt 0) {
        $script:CompletedStatuses = @($CompletedStatuses)
    }
    else {
        $script:CompletedStatuses = $script:DefaultCompletedStatuses
    }

    return $script:BaseUrl
}

function Invoke-FincentJira {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Path,
        [string]$Method = 'GET',
        [object]$Body
    )

    if (-not $script:Headers) { throw 'Call Connect-FincentJira before issuing requests.' }

    $requestArgs = @{
        Uri     = "$($script:BaseUrl)$Path"
        Method  = $Method
        Headers = $script:Headers
    }
    if ($null -ne $Body) {
        $requestArgs.Body = ($Body | ConvertTo-Json -Depth 10 -Compress)
        $requestArgs.ContentType = 'application/json'
    }

    return Invoke-RestMethod @requestArgs
}

function Test-FincentProperty {
    param([object]$Object, [string]$Name)
    if ($null -eq $Object) { return $false }
    return ($Object.PSObject.Properties.Name -contains $Name)
}

function Get-FincentFieldIds {
    <#
    .SYNOPSIS
        Resolves the custom field ids both reports depend on.
    #>
    [CmdletBinding()]
    param()

    $fields = Invoke-FincentJira -Path '/rest/api/3/field'
    $map = @{}
    foreach ($field in $fields) {
        if (-not $map.ContainsKey($field.name)) { $map[$field.name] = $field.id }
    }

    $resolve = {
        param($name, $fallback)
        if ($map.ContainsKey($name)) { return $map[$name] }
        return $fallback
    }

    return @{
        StoryPoints = (& $resolve 'Story Points' 'customfield_10016')
        Sprint      = (& $resolve 'Sprint' $null)
        EpicLink    = (& $resolve 'Epic Link' $null)
        Team        = (& $resolve 'Fincent Team' $null)
    }
}

function Get-FincentIssueFields {
    <#
    .SYNOPSIS
        Returns the fixed field list requested for every issue query.
    #>
    [CmdletBinding()]
    param([Parameter(Mandatory)][hashtable]$FieldIds)

    $fields = @('summary', 'status', 'issuetype', 'labels', 'assignee', 'fixVersions', 'parent', 'resolutiondate')
    foreach ($id in @($FieldIds.StoryPoints, $FieldIds.Sprint, $FieldIds.EpicLink)) {
        if ($id -and $fields -notcontains $id) { $fields += $id }
    }
    return $fields
}

function ConvertTo-FincentJqlValue {
    param([string]$Value)
    return ($Value -replace '\\', '\\\\' -replace '"', '\"')
}

function Get-FincentTeamClause {
    param([string]$Team)
    if ([string]::IsNullOrWhiteSpace($Team)) { return '' }
    return ' AND "Fincent Team" = "{0}"' -f (ConvertTo-FincentJqlValue $Team)
}

function Get-FincentIssues {
    <#
    .SYNOPSIS
        Runs one fixed JQL query and returns every matching issue.
    .DESCRIPTION
        Pagination is exhaustive so a run never silently truncates at the first page.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Jql,
        [Parameter(Mandatory)][string[]]$Fields
    )

    $collected = [System.Collections.Generic.List[object]]::new()
    $nextPageToken = $null

    do {
        $body = @{
            jql        = $Jql
            fields     = $Fields
            maxResults = 100
        }
        if ($nextPageToken) { $body.nextPageToken = $nextPageToken }

        $page = Invoke-FincentJira -Path '/rest/api/3/search/jql' -Method 'POST' -Body $body

        if ((Test-FincentProperty $page 'issues') -and $page.issues) {
            foreach ($issue in $page.issues) { $collected.Add($issue) }
        }

        $nextPageToken = $null
        if (Test-FincentProperty $page 'nextPageToken') { $nextPageToken = $page.nextPageToken }
    } while ($nextPageToken)

    return $collected
}

function Get-FincentIssueKeyNumber {
    param([string]$Key)
    if ($Key -match '-(\d+)$') { return [int]$matches[1] }
    return [int]::MaxValue
}

function ConvertTo-FincentIssue {
    <#
    .SYNOPSIS
        Normalizes a raw Jira issue into the shared report shape.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][object]$Issue,
        [Parameter(Mandatory)][hashtable]$FieldIds
    )

    $f = $Issue.fields

    $points = $null
    $pointsId = $FieldIds.StoryPoints
    if ($pointsId -and (Test-FincentProperty $f $pointsId) -and $null -ne $f.$pointsId) {
        $points = [double]$f.$pointsId
    }

    $epicKey = $null
    $epicName = $script:NoEpicLabel
    if ((Test-FincentProperty $f 'parent') -and $f.parent) {
        $epicKey = [string]$f.parent.key
        $epicName = [string]$f.parent.fields.summary
    }
    elseif ($FieldIds.EpicLink -and (Test-FincentProperty $f $FieldIds.EpicLink) -and $f.($FieldIds.EpicLink)) {
        $epicKey = [string]$f.($FieldIds.EpicLink)
        $epicName = $epicKey
    }

    $labels = @()
    if ((Test-FincentProperty $f 'labels') -and $f.labels) {
        $labels = @($f.labels | Sort-Object -CaseSensitive)
    }

    $fixVersions = @()
    if ((Test-FincentProperty $f 'fixVersions') -and $f.fixVersions) {
        $fixVersions = @($f.fixVersions | ForEach-Object { $_.name } | Sort-Object -CaseSensitive)
    }

    $sprintNames = @()
    $sprintId = $FieldIds.Sprint
    if ($sprintId -and (Test-FincentProperty $f $sprintId) -and $f.$sprintId) {
        $sprintNames = @($f.$sprintId | ForEach-Object { $_.name } | Sort-Object -CaseSensitive)
    }

    $status = [string]$f.status.name

    return [ordered]@{
        key            = [string]$Issue.key
        summary        = [string]$f.summary
        issueType      = [string]$f.issuetype.name
        status         = $status
        statusCategory = [string]$f.status.statusCategory.name
        isCompleted    = ($script:CompletedStatuses -contains $status)
        storyPoints    = $points
        epicKey        = $epicKey
        epicName       = $epicName
        labels         = $labels
        assignee       = $(if ((Test-FincentProperty $f 'assignee') -and $f.assignee) { [string]$f.assignee.displayName } else { $null })
        fixVersions    = $fixVersions
        sprints        = $sprintNames
        resolutionDate = $(if (Test-FincentProperty $f 'resolutiondate') { [string]$f.resolutiondate } else { $null })
    }
}

function Get-FincentNormalizedIssues {
    <#
    .SYNOPSIS
        Runs a JQL query and returns normalized issues in stable key order.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Jql,
        [Parameter(Mandatory)][hashtable]$FieldIds,
        [Parameter(Mandatory)][string[]]$Fields
    )

    $raw = Get-FincentIssues -Jql $Jql -Fields $Fields
    $normalized = @($raw | ForEach-Object { ConvertTo-FincentIssue -Issue $_ -FieldIds $FieldIds })
    return Sort-FincentIssues -Issues $normalized
}

function Sort-FincentIssues {
    param([object[]]$Issues)
    return @(@($Issues) | Sort-Object -Property @{ Expression = { Get-FincentIssueKeyNumber $_.key } })
}

function Get-FincentPointSum {
    param([object[]]$Issues)
    $total = 0.0
    foreach ($issue in @($Issues)) {
        if ($null -ne $issue.storyPoints) { $total += $issue.storyPoints }
    }
    return [math]::Round($total, 2)
}

function Get-FincentTotals {
    <#
    .SYNOPSIS
        Computes the shared totals block used by both reports.
    #>
    [CmdletBinding()]
    param([object[]]$Issues)

    $all = @($Issues)
    $completed = @($all | Where-Object { $_.isCompleted })
    $open = @($all | Where-Object { -not $_.isCompleted })

    $rate = 0.0
    if ($all.Count -gt 0) {
        $rate = [math]::Round(($completed.Count / $all.Count) * 100, 1)
    }

    return [ordered]@{
        issueCount            = $all.Count
        completedCount        = $completed.Count
        notCompletedCount     = $open.Count
        totalPoints           = Get-FincentPointSum -Issues $all
        completedPoints       = Get-FincentPointSum -Issues $completed
        notCompletedPoints    = Get-FincentPointSum -Issues $open
        completionRatePercent = $rate
        missingPointsCount    = @($all | Where-Object { $null -eq $_.storyPoints }).Count
        bugCount              = @($all | Where-Object { $_.issueType -eq 'Bug' }).Count
        completedBugCount     = @($completed | Where-Object { $_.issueType -eq 'Bug' }).Count
    }
}

function Get-FincentEpicGroups {
    <#
    .SYNOPSIS
        Groups issues by epic in report order, with the "No epic" group last.
    #>
    [CmdletBinding()]
    param([object[]]$Issues)

    # Issues are ordered dictionaries, which Group-Object -Property cannot read; group by hand.
    $byEpic = [ordered]@{}
    foreach ($issue in @($Issues)) {
        $name = [string]$issue.epicName
        if (-not $byEpic.Contains($name)) {
            $byEpic[$name] = [System.Collections.Generic.List[object]]::new()
        }
        $byEpic[$name].Add($issue)
    }

    $named = @($byEpic.Keys | Where-Object { $_ -ne $script:NoEpicLabel } | Sort-Object -CaseSensitive)
    $noEpic = @($byEpic.Keys | Where-Object { $_ -eq $script:NoEpicLabel })

    $ordered = [System.Collections.Generic.List[object]]::new()
    foreach ($name in ($named + $noEpic)) {
        $members = Sort-FincentIssues -Issues $byEpic[$name]
        $ordered.Add([ordered]@{
                epicName  = $name
                epicKey   = @($members)[0].epicKey
                issueKeys = @($members | ForEach-Object { $_.key })
            })
    }
    return $ordered
}

function Get-FincentCountsByProperty {
    <#
    .SYNOPSIS
        Builds a deterministic count breakdown keyed by an issue property.
    #>
    [CmdletBinding()]
    param(
        [object[]]$Issues,
        [Parameter(Mandatory)][string]$Property
    )

    $counts = @{}
    foreach ($issue in @($Issues)) {
        $key = [string]$issue.$Property
        if ($counts.ContainsKey($key)) { $counts[$key]++ } else { $counts[$key] = 1 }
    }

    $breakdown = [ordered]@{}
    foreach ($key in (@($counts.Keys) | Sort-Object -CaseSensitive)) {
        $breakdown[$key] = $counts[$key]
    }
    return $breakdown
}

function Get-FincentDatasetHash {
    <#
    .SYNOPSIS
        Hashes a payload excluding metadata.generatedAtUtc.
    .DESCRIPTION
        Two runs against unchanged Jira data therefore produce the same hash.
    #>
    [CmdletBinding()]
    param([Parameter(Mandatory)][object]$Payload)

    $clone = $Payload | ConvertTo-Json -Depth 30 | ConvertFrom-Json
    $clone.metadata.PSObject.Properties.Remove('generatedAtUtc')
    $canonical = $clone | ConvertTo-Json -Depth 30 -Compress
    $bytes = [Text.Encoding]::UTF8.GetBytes($canonical)
    $sha = [Security.Cryptography.SHA256]::Create()
    try {
        return ([BitConverter]::ToString($sha.ComputeHash($bytes)) -replace '-', '').ToLowerInvariant()
    }
    finally {
        $sha.Dispose()
    }
}

function Save-FincentDataset {
    <#
    .SYNOPSIS
        Stamps the dataset hash onto the payload and writes it as JSON.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][object]$Payload,
        [Parameter(Mandatory)][string]$OutputPath
    )

    $Payload.metadata.datasetHash = Get-FincentDatasetHash -Payload $Payload

    $resolved = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputPath))
    Set-Content -Path $resolved -Value ($Payload | ConvertTo-Json -Depth 30) -Encoding UTF8

    return [PSCustomObject]@{
        Path        = $resolved
        DatasetHash = $Payload.metadata.datasetHash
    }
}

function Resolve-FincentLatestRelease {
    <#
    .SYNOPSIS
        Returns the latest fixVersion name for a project, released or not.
    #>
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$Project)

    $versions = Invoke-FincentJira -Path "/rest/api/3/project/$Project/versions"
    if (-not $versions) { throw "No fixVersions found for project $Project." }

    $sorted = $versions | Sort-Object -Property `
    @{ Expression = { if ((Test-FincentProperty $_ 'releaseDate') -and $_.releaseDate) { [datetime]$_.releaseDate } else { [datetime]::MinValue } }; Descending = $true },
    @{ Expression = { $_.name }; Descending = $true }

    return [string](@($sorted)[0].name)
}

function Get-FincentBoardSprints {
    <#
    .SYNOPSIS
        Returns every sprint on a board across all states, fully paginated.
    #>
    [CmdletBinding()]
    param([Parameter(Mandatory)][int]$BoardId)

    $collected = [System.Collections.Generic.List[object]]::new()
    foreach ($state in @('active', 'closed', 'future')) {
        $startAt = 0
        do {
            $page = Invoke-FincentJira -Path "/rest/agile/1.0/board/$BoardId/sprint?state=$state&startAt=$startAt&maxResults=50"
            foreach ($sprint in $page.values) { $collected.Add($sprint) }
            $startAt += 50
        } while (-not $page.isLast)
    }
    return @($collected)
}

Export-ModuleMember -Function `
    Get-FincentSchemaVersion, Get-FincentNoEpicLabel, Get-FincentCompletedStatuses, `
    Connect-FincentJira, Invoke-FincentJira, Test-FincentProperty, `
    Get-FincentFieldIds, Get-FincentIssueFields, ConvertTo-FincentJqlValue, Get-FincentTeamClause, `
    Get-FincentIssues, Get-FincentNormalizedIssues, ConvertTo-FincentIssue, Sort-FincentIssues, `
    Get-FincentTotals, Get-FincentPointSum, Get-FincentEpicGroups, Get-FincentCountsByProperty, `
    Get-FincentDatasetHash, Save-FincentDataset, `
    Resolve-FincentLatestRelease, Get-FincentBoardSprints
