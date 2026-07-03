# aikido

Installable GitHub Copilot CLI plugin for Aikido Security — scan code for vulnerabilities
and secrets, triage findings, fix security issues, and sync to GitHub Issues.

## Includes

- Agents:
  - `agents/aikido.agent.md`
- Skills:
  - `skills/scan-code/SKILL.md`
  - `skills/fix-security-issue/SKILL.md`
  - `skills/review-security-posture/SKILL.md`
  - `skills/aikido-issues-to-github/SKILL.md`
  - `skills/aikido-scan-pr/SKILL.md`

## MCP Server (required)

This plugin requires the Aikido MCP server (`@aikidosec/mcp`).
All skills and the agent will stop and prompt for setup if the server is not available.

### IDE Setup (VS Code)

1. Go to <https://app.aikido.dev/settings/integrations/ide/mcp> and create a Personal Access Token.
2. Add to your `mcp.json`:

```json
{
  "servers": {
    "aikido": {
      "command": "npx",
      "args": ["-y", "@aikidosec/mcp"],
      "env": {
        "AIKIDO_API_KEY": "your-aikido-personal-access-token"
      }
    }
  }
}
```

### Copilot Cloud Agent Setup

1. Go to <https://app.aikido.dev/settings/integrations/ide/mcp> and create a Personal Access Token.
2. In GitHub repository Settings → Copilot → Coding agent, paste:

```json
{
  "mcpServers": {
    "aikido": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@aikidosec/mcp"],
      "tools": ["aikido_full_scan", "aikido_sast_scan", "aikido_secrets_scan", "aikido_issues_list"],
      "env": {
        "AIKIDO_API_KEY": "COPILOT_MCP_AIKIDO_API_KEY"
      }
    }
  }
}
```

3. Create a repository secret `COPILOT_MCP_AIKIDO_API_KEY` with your Aikido token.

### Copilot Instructions

Add to your `AGENTS.md` or `.github/copilot-instructions.md` to enforce scans in every session:

```
Scan any new or modified code with `aikido_full_scan` before finalizing changes.
This security check is required.
```

## Available MCP Tools

| Tool | Purpose |
|---|---|
| `aikido_full_scan` | SAST + secrets scan on local files |
| `aikido_sast_scan` | SAST-only scan |
| `aikido_secrets_scan` | Secrets/credential scan only |
| `aikido_issues_list` | Fetch open issues from Aikido feed with filters |

## What the Aikido Agent Can Do

- **Scan code** — run SAST, secrets, or full scans on files, directories, or the full workspace.
- **Fix security issues** — apply targeted fixes for SAST vulnerabilities, hardcoded secrets,
  and IaC misconfigurations; verify with a re-scan.
- **Triage non-code issues** — explain cloud, container, dependency, and license issues
  with actionable next steps.
- **Review security posture** — get a prioritized dashboard of all open findings with
  severity grouping and a recommended remediation plan.
- **Sync to GitHub Issues** — create one tracked GitHub issue per Aikido finding with
  severity labels and deduplication.
- **Scan a PR** — run a full scan on the workspace, filter findings to PR-changed files,
  and optionally add inline review comments.

## Skills Reference

| Skill | Trigger Intent |
|---|---|
| `scan-code` | Scan files or workspace with Aikido |
| `fix-security-issue` | Fix or triage a specific Aikido finding |
| `review-security-posture` | Get a full security posture overview |
| `aikido-issues-to-github` | Sync Aikido findings to GitHub Issues |
| `aikido-scan-pr` | Scan PR changes and surface security findings |

## Automation Skills

The following skills are automation workflows — invoke them in chat to run multi-step
security workflows:

| Skill | Use case |
|---|---|
| `aikido-issues-to-github` | Periodic security backlog sync: pull all open Aikido findings and create tracked GitHub issues |
| `aikido-scan-pr` | PR security gate: scan changed files before merging, surface blocking findings |

## Install

```bash
copilot plugin install JSdotNet/Copilot:plugins/aikido
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/Copilot:plugins/aikido
```

## Uninstall

```bash
copilot plugin uninstall aikido
```

## References

- [Aikido MCP documentation](https://help.aikido.dev/ai-and-dev-tools/aikido-mcp/github-copilot)
- [Aikido API documentation](https://apidocs.aikido.dev)
- [Aikido dashboard](https://app.aikido.dev)
