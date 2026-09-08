---
name: playwright-validation
description: 'Validate a feature or run extensive end-to-end testing against a running app using the Playwright MCP server, capturing screenshots as evidence. Use after the app under test is running (see the aspire-run skill).'
compatibility: Requires the Playwright MCP server (`@playwright/mcp`).
---

# Playwright Validation — Evidence-Backed Feature Testing

Drive real browser interactions against the running application through the Playwright
MCP server, and capture concrete evidence for every check. Do not rely on static code
reading to claim a feature works — prove it by running it.

## Prerequisites

- The app under test is already running and healthy (see the `aspire-run` skill).
- Aspire log/trace monitoring is already active (see the `aspire-log-monitor` skill) —
  start it before this skill, not after.
- The Playwright MCP server is configured before QA starts, for example:

  ```json
  {
    "servers": {
      "playwright": {
        "command": "npx",
        "args": ["-y", "@playwright/mcp@latest"]
      }
    }
  }
  ```

- The session/runtime has been restarted or MCP tools have been reloaded after
  configuration, so the `browser_*` tools are visible in the validation session.
- The prefix is resolved from the tool list you actually have. The Playwright server ships
  with this plugin, so its tools normally surface as `mcp__plugin_qa_playwright__<tool>`; the
  same server registered directly in a repository's own MCP configuration surfaces as
  `mcp__playwright__<tool>`. This skill names tools bare (`browser_navigate`) — prepend
  whichever prefix your tool list shows rather than assuming one.

## Available Playwright MCP Tools (typical set)

| Tool | Description |
|---|---|
| `browser_navigate` | Navigate to a URL |
| `browser_snapshot` | Get an accessibility-tree snapshot of the current page (preferred for locating elements) |
| `browser_click` / `browser_type` / `browser_select_option` | Interact with elements |
| `browser_take_screenshot` | Capture a screenshot of the current page or element |
| `browser_find` | Find elements by description without a full snapshot |
| `browser_evaluate` | Read computed state (e.g. a CSS value) the snapshot does not expose |
| `browser_console_messages` | Read browser console output (client-side errors) |
| `browser_network_requests` | Inspect network requests/responses made by the page |
| `browser_wait_for` | Wait for text, element state, or a time interval |

Exact tool names depend on the installed Playwright MCP version — use `browser_snapshot`
first on an unfamiliar page to confirm available element references before interacting.

**Resolve the recordable form from the tool list you actually have.** `@playwright/mcp`
0.0.79 — the version this plugin installs via `@playwright/mcp@latest` — exposes **no**
tracing or video tools (`browser_start_tracing` / `browser_stop_tracing` do not exist) and
**no** `--save-trace` or `--save-video` server option; only `--save-session` (a log of tool
calls under `--output-dir`) and screenshots. Continuous evidence is therefore a numbered
screenshot sequence unless your tool list shows tracing tools. Name the form used in the
report, and never call a screenshot sequence a video or a trace.

## Workflow

### 0. Preflight Capture

Before scenario validation, prove capture works in this session:

1. `browser_navigate` to the target page or a lightweight health/render page.
2. `browser_take_screenshot` and save the smoke screenshot under the scenario evidence
   folder.

If navigation or screenshot capture fails, capture is unavailable in this session. Stop or
mark the limitation according to the caller's validation policy, and do not claim
Playwright evidence was captured.

### 1. Define the Scenario

- Restate the feature or acceptance criteria being validated in concrete steps.
- For "more extensive testing", enumerate a scenario list (happy path, edge cases,
  invalid input, empty states, permission boundaries) before starting.

### 2. Navigate and Snapshot

1. `browser_navigate` to the feature's entry URL (from `aspire-run`).
2. `browser_snapshot` to confirm the page loaded and to find element references for
   the next interaction — avoid guessing selectors from source code alone.

### 3. Execute the Scenario

- Perform each interaction (`browser_click`, `browser_type`, etc.) in order.
- Stabilize before every capture: `browser_wait_for` on the specific element or text you
  expect, never a fixed sleep. A frame taken mid-transition is misleading evidence.
- Capture per scenario, and keep each file: a single screenshot for a single-state
  checkpoint (scoped to an element reference when only that component matters), or one
  screenshot per state-changing step — zero-padded so the sequence reads in execution
  order — when the sequence itself is what is being proved.
- On failure, capture the frame **before** attempting any recovery.
- Check `browser_console_messages` after each step for client-side JS errors.
- Check `browser_network_requests` when validating API-backed features — confirm status
  codes and payload shape match expectations.

### 4. Assert the Outcome

- Compare the final `browser_snapshot` (or screenshot) against the expected outcome.
- Cross-reference the Aspire log/trace stream (from `aspire-log-monitor`) for the same
  time window — a visually correct page can still hide a swallowed server-side error.
- Record Pass / Fail / Flaky with the evidence path(s) and any console/network findings.

### 5. Repeat for Each Scenario

- Use a fresh `browser_navigate` (or a full page reload) between independent scenarios
  to avoid state leakage skewing results.
- Keep all evidence files for the whole session — do not overwrite prior scenario
  evidence.

## Evidence Requirements

- Every scenario must have at least one screenshot; multi-step flows should have a
  screenshot per step, or a recording where the tool list exposes one.
- Every failure must have a screenshot taken at the point of failure and before any
  recovery, plus the `browser_console_messages` and `browser_network_requests` output at
  that moment.
- Evidence file paths must be included in the final QA report — do not describe a
  screenshot without a path the user can open.
- Browser-canvas snapshots and smoke output can be cited only as browser-canvas fallback
  evidence; they are not Playwright MCP screenshots, videos, or traces.

## Common Pitfalls

- Don't guess CSS/XPath selectors from source code when `browser_snapshot` can give an
  accurate accessible reference for the live DOM.
- Don't skip the console/network check just because the visual result looks correct.
- Don't stop Aspire log monitoring before finishing all scenarios.
- Don't reuse a stale snapshot reference after the page has re-rendered — re-snapshot.

## Reference

- Playwright MCP server: `https://github.com/microsoft/playwright-mcp`
- Playwright docs: `https://playwright.dev`
