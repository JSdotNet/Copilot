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
        permissionDecisionReason = "Use the pr-jsdotnet workflow with gh and JSDOTNET_GH_TOKEN. The built-in create_pull_request tool uses the active Copilot App account instead of JSdotNet."
    } | ConvertTo-Json -Compress
    exit 0
}

if (($toolName -eq "powershell" -or $toolName -eq "bash") -and $commandText -match "(?i)\bgh\s+pr\s+create\b") {
    if ([string]::IsNullOrWhiteSpace($env:JSDOTNET_GH_TOKEN)) {
        @{
            permissionDecision = "deny"
            permissionDecisionReason = "JSDOTNET_GH_TOKEN is required before running gh pr create for the pr-jsdotnet workflow."
        } | ConvertTo-Json -Compress
        exit 0
    }
}

exit 0
