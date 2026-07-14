# Automations Plugin

## Purpose

Reusable automation prompts for the GitHub Copilot App.
Each skill is a self-contained workflow prompt that can be invoked directly in chat.

## Skills

| Skill | Trigger Intent | Requires |
|-------|---------------|----------|
| `azure-sre-to-github-issue` | Create GitHub issues from active Azure SRE alerts | Azure skill or MCP tool |
| `start-session-from-issue` | Start a Copilot session per GitHub issue in plan mode | GitHub access |
| `update-open-sessions` | Rebase or merge all open sessions onto the latest source branch | Git / GitHub access |
| `automation: package-update` | Update all outdated NuGet packages in a .NET solution (incl. Aspire integrations and CPM) and open a PR | `nuget-manager`, `check-plugin-updates`, `update-plugins`, `aspire` skills |
| `automation: performance-review` | Identify 10 perf improvements, implement the best one, open a PR | `code-optimization`, `code-review`, `delegate-to-coding`, `tdd`, `aspire-logging` skills |
| `automation: review` | Full automated review cycle: TODOs, suggestions, and code review; optionally creates GitHub issues | `todo-review`, `suggestion-review`, `code-review`, `create-github-issue` skills |
| `automation: bug-fix` | Pick up all open `bug`-labelled GitHub issues and start one `orch-bug` session per confirmed issue | `orch-bug` skill (`copilot-app` plugin) |
| `automation: weekly-cost-analysis` | Retrieve `/chronicle cost-tips` and produce weekly cost report | Chronicle (`/chronicle cost-tips`) |

## Install

```bash
copilot plugin install JSdotNet/Copilot:plugins/automations
```

## Usage

Invoke any skill by name in the GitHub Copilot App chat:

```
Use the azure-sre-to-github-issue skill.
Subscription: my-subscription
Repo: my-org/my-repo
Severity threshold: Sev1
```

```
Use the start-session-from-issue skill.
Repo: my-org/my-repo
Label: sprint-42
```

```
Use the update-open-sessions skill.
Source branch: main
Strategy: rebase
```

```
Use the automation: bug-fix skill.
Repo: my-org/my-repo
Max sessions: 3
```

## Extending

- Replace GitHub issue creation with a Jira ticket by swapping the GitHub step for
  a Jira skill call while keeping the same field mapping.
- Replace Azure Monitor with another alert source by adapting Phase 1 of the
  `azure-sre-to-github-issue` skill.
- Add new automation skills by creating a folder under `skills/` with a `SKILL.md`.
