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

if ($toolName -eq "create_pull_request") {
    @{
        permissionDecision = "deny"
        permissionDecisionReason = "Use the pr-jsdotnet workflow with gh and JSDOTNET_GH_TOKEN. The built-in create_pull_request tool uses the active Copilot App account instead of JSdotNet. Switch to the default Copilot CLI agent first if you are in a specialized agent context, then follow the pr-jsdotnet Required Workflow."
    } | ConvertTo-Json -Compress
    exit 0
}

if (($toolName -eq "powershell" -or $toolName -eq "bash") -and $commandText -match "(?i)\bgh\s+pr\s+create\b") {
    if ([string]::IsNullOrWhiteSpace($env:JSDOTNET_GH_TOKEN)) {
        @{
            permissionDecision = "deny"
            permissionDecisionReason = "JSDOTNET_GH_TOKEN is not set. Set the environment variable to a valid JSdotNet PAT with repo and pull_request scopes, then retry the pr-jsdotnet workflow from the default Copilot CLI agent."
        } | ConvertTo-Json -Compress
        exit 0
    }
}

exit 0
