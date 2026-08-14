---
name: automation: weekly-cost-analysis
description: >
  Run /chronicle cost-tips to retrieve the weekly AI usage and cost summary, surface the top
  actionable cost-reduction tips, and produce a concise report.
  Use when: scheduled weekly cost review, investigating unexpected token spend,
  or optimising model and prompt usage.
---

# Automation: Weekly Cost Analysis

## Purpose

Pull the weekly Copilot usage and cost data via `/chronicle cost-tips`, analyse the top
spending patterns, and surface concrete, prioritised actions to reduce cost without
sacrificing quality.

## Inputs

- Time window: `last-7-days` (default) or a specific ISO date range `YYYY-MM-DD:YYYY-MM-DD`.
- Output format: `summary` (default — top tips only) or `full` (all tips with spend breakdown).
- Cost tip limit: top `5` tips (default, configurable).

## Skill Dependencies

This skill has no hard skill dependencies, but pairs well with:

- **`suggestion-review`** — can be invoked on high-cost skill or agent files to propose
  prompt-trimming opportunities that reduce token consumption.
- **`guidelines-cap-analysis`** (`automation: guidelines-cap-analysis`) — large instruction
  files inflate every request's context; running a cap analysis after a cost spike helps
  identify instruction bloat as a root cause.

## Workflow

### Phase 1 — Retrieve Cost Data

1. Run the Chronicle cost-tips command to retrieve usage data for the configured time window:

   ```
   /chronicle cost-tips
   ```

2. Parse the returned data into:
   - Total tokens consumed (input + output).
   - Total estimated cost.
   - Breakdown by model (e.g., GPT-5, Claude Sonnet, Claude Haiku).
   - Breakdown by session or agent type (if available).
   - List of cost-reduction tips returned by Chronicle.

### Phase 2 — Analyse Patterns

3. Identify the top spending drivers:
   - Which model accounts for the largest share of spend?
   - Which agent or session type is most expensive?
   - Are there unusually long context windows suggesting instruction bloat?
   - Are there repeated identical prompts that could be cached or batched?

4. Cross-reference tips from Chronicle with repository-specific context:
   - If instruction bloat is flagged: note that `automation: guidelines-cap-analysis` can help.
   - If a high-cost model is used for low-complexity tasks: suggest a cheaper model tier for
     those agent files.
   - If session count is high: suggest batching issues with `start-session-from-issue` to
     avoid redundant context loads.

### Phase 3 — Produce Report

5. Output the Weekly Cost Analysis report:

   ```
   ## Weekly Cost Analysis — <date range>

   ### Summary

   | Metric | Value |
   |--------|-------|
   | Total tokens | <n> |
   | Estimated cost | $<n> |
   | Most expensive model | <model> (<pct>% of spend) |
   | Most expensive agent type | <agent> (<pct>% of spend) |

   ### Top Cost-Reduction Tips

   1. **<Tip title>** — <description and expected saving>.
   2. **<Tip title>** — <description and expected saving>.
   …

   ### Repository-Specific Actions

   - [ ] <actionable recommendation derived from cross-reference in Phase 2>
   - [ ] <actionable recommendation>
   ```

6. If `output-format` is `full`, append:
   - Per-model token and cost breakdown table.
   - All tips returned by Chronicle (not just the top-N).
   - Session-level or agent-level breakdown table if available.

### Phase 4 — Follow-Up (Optional)

7. Ask the user whether to act on any of the repository-specific actions:
   - If instruction bloat is flagged: offer to invoke `automation: guidelines-cap-analysis`.
   - If prompt trimming is recommended for a specific skill: offer to invoke `suggestion-review`
     on that file.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension
(`plugins/copilot-app/extensions/orch-dashboard/`). If the extension is not
installed, skip the canvas calls below and continue through standard chat
interaction. Follow the shared **Dashboard Reporting Contract** in
`instructions/orch-shared-phases.instructions.md` to resolve the dashboard provider;
prefer `extensionId: "plugin:copilot-app:orch-dashboard"` when opening or inspecting the
canvas.

- Open the dashboard per the shared contract, then call `start_run` with
  `skillId: "automation-weekly-cost-analysis"` and these stages: Retrieve Cost
  Data, Analyse Patterns, Produce Report, Follow-Up.
- Before each phase, call `update_stage` with `status: "in_progress"`.
- After each phase, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary of that phase's result.
- Call `finish_run` with the final status and a summary once the cost report
  is produced.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full
canvas action contract.

## Output

- Structured weekly cost report with summary metrics and prioritised tips.
- Repository-specific action items with optional one-click follow-up.

## Notes

- `/chronicle cost-tips` must be available in the active Copilot session; this skill is a
  no-op if Chronicle is not installed or the command is unavailable.
- Run this automation every Monday to catch cost spikes before they accumulate.
- Cost data is read-only; this skill never modifies repository files unless the user approves
  a follow-up action in Phase 4.
