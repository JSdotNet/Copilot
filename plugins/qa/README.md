# qa

Installable GitHub Copilot CLI plugin for runtime QA validation.

Runs a project through **.NET Aspire**, validates features end-to-end with the
**Playwright MCP server** (recording screenshots or video as evidence), and
continuously monitors **Aspire MCP** logs/traces/metrics for the whole test session —
so runtime errors are never missed just because the UI looked correct.

## Includes

- Agents:
  - `agents/qa.agent.md`
- Skills:
  - `skills/aspire-run/SKILL.md` — start and confirm health of the app under test via Aspire
  - `skills/playwright-validation/SKILL.md` — drive browser validation via Playwright MCP with recorded evidence
  - `skills/aspire-log-monitor/SKILL.md` — continuously monitor Aspire logs/traces/metrics during testing
- Hooks:
  - `hooks.json` (session-start reminder to always run, monitor, and record evidence)

## MCP Servers (required for full capability)

| MCP Server | Purpose |
|---|---|
| Aspire MCP (`aspire mcp start`) | Run the distributed app; query resource state, logs, traces, and metrics |
| Playwright MCP (`@playwright/mcp`) | Drive a real browser: navigate, interact, snapshot, screenshot, record video |

If either server is unavailable, the agent stops and asks the user to configure it —
see the [Setup](./agents/qa.agent.md#setup) section in the agent file.

## What the QA Agent Can Do

- **Run the app under test** — start an Aspire-orchestrated solution and confirm every resource is healthy before testing begins.
- **Validate features end-to-end** — use Playwright MCP to navigate, interact, and assert against the real running UI, not just source code.
- **Record evidence** — capture screenshots per checkpoint/failure, or video/trace recordings for multi-step flows.
- **Monitor logs continuously** — keep Aspire log/trace/metric monitoring active for the entire session, catching backend errors a passing UI might hide.
- **Report findings** — structured Pass/Fail/Flaky results with severity, evidence paths, and correlated Aspire log/trace findings.

## Scope

- **In scope**: runtime/E2E feature validation, exploratory and regression testing through a real browser, evidence-backed QA reporting.
- **Out of scope**: writing unit/integration test code (see the `development` plugin's testing agent), architecture/security review, and implementing code fixes (the agent reports and offers a handoff instead).

## Install

```bash
copilot plugin install JSdotNet/Copilot:plugins/qa
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/Copilot:plugins/qa
```

## Uninstall

```bash
copilot plugin uninstall qa
```
