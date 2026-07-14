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
    $messages.Add("The built-in create_pull_request tool uses the active Copilot App account. For JSdotNet PRs, retry with the pr-jsdotnet workflow and gh using JSDOTNET_GH_TOKEN. Switch to the default Copilot CLI agent first if you are currently under a specialized agent.")
}

if (($toolName -eq "powershell" -or $toolName -eq "bash") -and $commandText -match "(?i)\bgh\s+pr\s+create\b") {
    $messages.Add("The pr-jsdotnet workflow expects GH_TOKEN to be set from JSDOTNET_GH_TOKEN only for the gh command block, then removed immediately after.")

    if ([string]::IsNullOrWhiteSpace($env:JSDOTNET_GH_TOKEN)) {
        $messages.Add("JSDOTNET_GH_TOKEN is not set in the current shell. Set the token, verify with 'gh auth status', then retry from the default Copilot CLI agent.")
    }

    if ($errorText -match "(?i)saml|sso|authorize") {
        $messages.Add("The JSdotNet token requires SSO/SAML authorization for the target organization. Authorize the token at https://github.com/settings/tokens and retry.")
    }

    if ($errorText -match "(?i)auth|authentication|logged in|401|403|forbidden|bad credentials|token") {
        $messages.Add("Verify that the token belongs to the JSdotNet account and has 'repo' and 'pull_request' scopes. Run 'gh auth status' with GH_TOKEN set to confirm.")
    }

    if ($errorText -match "(?i)no upstream|set-upstream|could not resolve|unknown revision|head sha|no commits between|not found") {
        $messages.Add("Push the branch to origin first so gh pr create can find the head branch: run 'git push --set-upstream origin HEAD'.")
    }

    if ($errorText -match "(?i)tool.*not.*available|permission.*denied|cannot.*use.*tool|not.*allowed") {
        $messages.Add("The current agent does not have shell tool access. Switch to the default Copilot CLI agent and retry the pr-jsdotnet workflow from there.")
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
