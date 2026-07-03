$payloadText = [Console]::In.ReadToEnd()

if ([string]::IsNullOrWhiteSpace($payloadText)) {
    exit 0
}

try {
    $payload = $payloadText | ConvertFrom-Json -AsHashtable
} catch {
    exit 0
}

$toolName = [string]$payload.toolName
$commandText = [string]$payload.toolArgs.command
$errorText = [string]$payload.error
$messages = [System.Collections.Generic.List[string]]::new()

if ($toolName -eq "create_pull_request") {
    $messages.Add("The built-in create_pull_request tool uses the active Copilot App account. For JSdotNet PRs, retry with the pr-jsdotnet workflow and gh using JSDOTNET_GH_TOKEN.")
}

if (($toolName -eq "powershell" -or $toolName -eq "bash") -and $commandText -match "(?i)\bgh\s+pr\s+create\b") {
    $messages.Add("The pr-jsdotnet workflow expects GH_TOKEN to be set from JSDOTNET_GH_TOKEN only for the gh command session.")

    if ([string]::IsNullOrWhiteSpace($env:JSDOTNET_GH_TOKEN)) {
        $messages.Add("The current shell does not have JSDOTNET_GH_TOKEN available.")
    }

    if ($errorText -match "(?i)saml|sso|authorize") {
        $messages.Add("Authorize the JSdotNet token for the target organization before retrying the PR command.")
    }

    if ($errorText -match "(?i)auth|authentication|logged in|401|403|forbidden|bad credentials|token") {
        $messages.Add("Verify that the token belongs to the JSdotNet account and has repository and pull request permissions.")
    }

    if ($errorText -match "(?i)no upstream|set-upstream|could not resolve|unknown revision|head sha|no commits between|not found") {
        $messages.Add("Push the branch to origin first so gh pr create can use the correct head branch.")
    }
}

if (($toolName -eq "powershell" -or $toolName -eq "bash") -and $commandText -match "(?i)\bgit\s+push\b" -and $errorText -match "(?i)auth|authentication|logged in|401|403|forbidden|permission") {
    $messages.Add("If the branch push must happen as JSdotNet, make sure the remote credentials for that push are authorized for the target repository before retrying.")
}

if ($messages.Count -gt 0) {
    @{
        additionalContext = ($messages -join "`n`n")
    } | ConvertTo-Json -Compress
}
