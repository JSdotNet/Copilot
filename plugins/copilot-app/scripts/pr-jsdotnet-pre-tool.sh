#!/usr/bin/env bash

payload="$(cat)"

if [[ -z "${payload}" ]]; then
  exit 0
fi

if printf '%s' "${payload}" | grep -Eq '"toolName"[[:space:]]*:[[:space:]]*"create_pull_request"'; then
  printf '%s\n' '{"permissionDecision":"deny","permissionDecisionReason":"Use the pr-jsdotnet workflow with gh and JSDOTNET_GH_TOKEN. The built-in create_pull_request tool uses the active Copilot App account instead of JSdotNet."}'
  exit 0
fi

if printf '%s' "${payload}" | grep -Eq '"toolName"[[:space:]]*:[[:space:]]*"(powershell|bash)"' && printf '%s' "${payload}" | grep -Eqi 'gh[[:space:]]+pr[[:space:]]+create'; then
  if [[ -z "${JSDOTNET_GH_TOKEN:-}" ]]; then
    printf '%s\n' '{"permissionDecision":"deny","permissionDecisionReason":"JSDOTNET_GH_TOKEN is required before running gh pr create for the pr-jsdotnet workflow."}'
    exit 0
  fi
fi

exit 0
