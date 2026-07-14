#!/usr/bin/env bash

payload="$(cat)"

if [[ -z "${payload}" ]]; then
  exit 0
fi

context=""

append_context() {
  local message="$1"
  if [[ -n "${context}" ]]; then
    context="${context}\\n\\n${message}"
  else
    context="${message}"
  fi
}

if printf '%s' "${payload}" | grep -Eq '"toolName"[[:space:]]*:[[:space:]]*"create_pull_request"'; then
  append_context 'The built-in create_pull_request tool uses the active Copilot App account. For JSdotNet PRs, retry with the pr-jsdotnet workflow and gh using JSDOTNET_GH_TOKEN. Switch to the default Copilot CLI agent first if you are currently under a specialized agent.'
fi

if printf '%s' "${payload}" | grep -Eq '"toolName"[[:space:]]*:[[:space:]]*"(powershell|bash)"' && printf '%s' "${payload}" | grep -Eqi 'gh[[:space:]]+pr[[:space:]]+create'; then
  append_context 'The pr-jsdotnet workflow expects GH_TOKEN to be set from JSDOTNET_GH_TOKEN only for the gh command block, then removed immediately after.'

  if [[ -z "${JSDOTNET_GH_TOKEN:-}" ]]; then
    append_context 'JSDOTNET_GH_TOKEN is not set in the current shell. Set the token, verify with "gh auth status", then retry from the default Copilot CLI agent.'
  fi

  if printf '%s' "${payload}" | grep -Eqi 'saml|sso|authorize'; then
    append_context 'The JSdotNet token requires SSO/SAML authorization for the target organization. Authorize the token at https://github.com/settings/tokens and retry.'
  fi

  if printf '%s' "${payload}" | grep -Eqi 'auth|authentication|logged in|401|403|forbidden|bad credentials|token'; then
    append_context 'Verify that the token belongs to the JSdotNet account and has "repo" and "pull_request" scopes. Run "gh auth status" with GH_TOKEN set to confirm.'
  fi

  if printf '%s' "${payload}" | grep -Eqi 'no upstream|set-upstream|could not resolve|unknown revision|head sha|no commits between|not found'; then
    append_context 'Push the branch to origin first so gh pr create can find the head branch: run "git push --set-upstream origin HEAD".'
  fi

  if printf '%s' "${payload}" | grep -Eqi 'tool.*not.*available|permission.*denied|cannot.*use.*tool|not.*allowed'; then
    append_context 'The current agent does not have shell tool access. Switch to the default Copilot CLI agent and retry the pr-jsdotnet workflow from there.'
  fi
fi

if printf '%s' "${payload}" | grep -Eq '"toolName"[[:space:]]*:[[:space:]]*"(powershell|bash)"' && printf '%s' "${payload}" | grep -Eqi 'git[[:space:]]+push' && printf '%s' "${payload}" | grep -Eqi 'auth|authentication|logged in|401|403|forbidden|permission'; then
  append_context 'If the branch push must happen as JSdotNet, make sure the remote credentials for that push are authorized for the target repository before retrying.'
fi

if [[ -n "${context}" ]]; then
  printf '{"additionalContext":"%s"}\n' "${context}"
fi
