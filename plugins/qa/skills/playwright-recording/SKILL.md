---
name: playwright-recording
description: 'Record video or trace of a multi-step Playwright MCP flow as continuous evidence. Use for scenarios where the sequence of interactions matters, not just the end state — e.g. multi-page checkout, wizard flows, drag-and-drop.'
compatibility: Requires the Playwright MCP server (`@playwright/mcp`) with tracing/recording support.
---

# Playwright Recording — Continuous Flow Evidence

Record a continuous video or trace of a multi-step interaction sequence, so the QA
report can show *how* a flow behaved, not just its final state. Use this alongside
`playwright-screenshot` — recordings capture the sequence, screenshots pin specific
checkpoints for quick review.

## When to Use

- Multi-page flows (checkout, onboarding wizards, multi-step forms).
- Interactions with animation, drag-and-drop, or timing-sensitive behavior that a still
  screenshot can't represent.
- Flaky or intermittent bugs — a recording lets the QA agent (or a human reviewer)
  replay exactly what happened instead of relying on memory or a single screenshot.
- Regression scenarios that should be replayable as reference evidence for future runs.

## Steps

### 1. Start Recording Before the First Action

```
Tool: browser_start_tracing
```

(Tool name depends on the installed Playwright MCP version — some versions expose
video recording via a `browser_navigate`/session option instead of a dedicated
start/stop tool pair; check the `browser_snapshot` tool listing if `browser_start_tracing`
is not available.)

- Start tracing immediately after the app is confirmed healthy (see `aspire-run`) and
  before the first `browser_navigate` of the scenario, so the recording covers the
  entire flow from entry point to outcome.

### 2. Execute the Full Scenario

- Perform every step of the scenario (`browser_navigate`, `browser_click`,
  `browser_type`, etc.) without stopping the recording mid-sequence.
- It is fine to also take individual screenshots at key checkpoints during a recorded
  run (see `playwright-screenshot`) — the two evidence types are complementary, not
  exclusive.

### 3. Stop and Save

```
Tool: browser_stop_tracing
```

Save the output under:

```
.wip/qa/<feature-name>/video/<scenario-name>.webm
```

(or `.zip`/`.trace` if the MCP server produces a Playwright trace file instead of a
video — note the actual format returned by the tool in the QA report).

- `<scenario-name>` — kebab-case, matching the scenario name used in the QA report
  (e.g. `checkout-happy-path`, `signup-wizard-back-navigation`).

### 4. Reference in the Report

- Cite the recording path wherever the report describes a multi-step behavior.
- If the recording captured a failure, note the approximate timestamp within the
  recording where the failure occurred, in addition to the file path.

## Common Pitfalls

- Starting the recording after the first interaction, missing the initial page state.
- Stopping the recording before an async effect (toast, redirect, background save)
  has finished — wait for the expected end state before stopping.
- Recording an entire long session as a single file when several independent scenarios
  are being tested — split recordings per scenario so evidence stays reviewable and a
  failure in one scenario doesn't force re-watching unrelated ones.

## Reference

- Playwright MCP server: `https://github.com/microsoft/playwright-mcp`
- Playwright tracing docs: `https://playwright.dev/docs/trace-viewer`
