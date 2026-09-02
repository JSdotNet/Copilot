---
applyTo: 'plugins/**/skills/**/SKILL.md'
description: Defines how skills in this repository choose their invocation mode and how bidirectional skill families are named.
---

# Skill Invocation Instructions

## Purpose

- Decide, for every skill in `plugins/*/skills/`, whether the model may invoke it or only the user may.
- Keep the always-loaded description budget spent on skills the model can actually use.
- Define the `to-spec-` / `from-spec-` naming convention for skills that convert between a specification and code.

## The Two Invocation Modes

Every skill is one of two things. The choice is a trade between two costs.

- **Model-invoked** — omit `disable-model-invocation`. The model may fire the skill on its own, and another skill or an agent may reach it. The `description` is model-facing and keeps its trigger phrasing (`Use when: ...`, `DO NOT USE FOR: ...`) so auto-invocation lands on the right skill. The price is permanent context load: the description sits in the window every turn whether or not the skill fires.
- **User-invoked** — set `disable-model-invocation: true`. Only the human typing the skill name can invoke it. The `description` becomes human-facing: one line, read by a person browsing slash commands, with trigger lists stripped. The price is cognitive load: the human has to remember the skill exists.

"The human typing the skill name" is literal. A scheduled routine is not a human: its session receives a prompt and must reach the skill through the Skill tool, which refuses a user-invoked one. So is a dispatched worker session — a `claude --bg` prompt naming a skill is the model invoking it, not a person. A skill whose documented lane is a routine or a dispatch **cannot** be user-invoked; the flag makes that lane unreachable while the body still promises it.

Apply this test: **could the model usefully reach for this skill on its own, or must another skill or agent reach it?** If neither, make it user-invoked. Reuse is a reason to extract a skill, not a reason to make it model-invoked.

A user-invoked skill can be fired by nothing but the human. No other skill can reach it, and neither can an agent. Never make a skill user-invoked when something else in the repository invokes it by name.

## Classification In This Repository

Model-invoked, and must stay so:

- `orch-*` — reached by the `claude-desktop:orchestrator` agent and by `orch-fallback` routing.
- `phase-*` — invoked by the orchestrator agent between delivery stages, never by hand.
- `to-spec-<kind>` in `knowledge-base` — reading code to write a chapter is work the model can usefully start on its own.
- `create-*` — dispatched by the `spec-builder`, `architecture:architect`, `documentation:profile`, and `product-owner` agents. `spec-builder.agent.md` says "Apply the changes using the matching `create-*` skill"; `architect.agent.md` says "Use skill `create-architectural-decision-record`". Marking these user-invoked breaks those agents.
- `write-*` in `product-owner` — listed under **Available Skills** in `product-owner.agent.md`, which is the agent's own core job.
- Every unprefixed discipline skill (`tdd`, `code-review`, `refactor`, `aspire`, and their siblings) — these exist to be pulled in mid-task.
- `workflow-issue-sweep` and `workflow-resolve-issue` in `claude-desktop` — a scheduled routine is the sweep's documented lane, and the sweep's own Phase 4 dispatch prompt names `workflow-resolve-issue` for each worker session. Neither invoker is a human who can type a name. Their descriptions carry `DO NOT USE FOR` clauses that forbid a self-started run, because the context cost is unavoidable but a sweep nobody asked for is not.

User-invoked, with `disable-model-invocation: true`:

- `automation-*` — human-started sweeps. Never fired mid-task. Their bodies still describe an unattended "scheduled routine" branch that the flag makes unreachable for the same reason as above; that is documentation debt awaiting a decision, not a supported lane.
- `workflow-morning-brief` — re-reads a past sweep on request. Nothing but a human ever asks for it; `workflow-issue-sweep` writes its own brief rather than invoking it.
- `from-spec-<kind>` in `knowledge-base` — turning an agreed chapter into a change brief is a deliberate act, and nothing else reaches it by name.

When adding a skill to one of these families, follow the family — except `workflow-*`, which is split by invoker rather than by prefix. When adding a skill outside them, apply the test above and say which way it went in the pull request description.

Before marking anything user-invoked, grep the agents, hook prompts, and dispatch prompts for its name, and check whether its own body documents a routine or unattended lane. A skill an agent dispatches to must stay model-invoked, however deliberate it looks — the invariant above is not negotiable, and a mention that only records provenance (the orchestrator naming `automation-bug-fix` as the skill that routed a run) does not count as a dispatch.

## Naming: `to-spec-` And `from-spec-`

A skill that converts between a written specification and the code implementing it takes its name from the direction it travels, with `spec` naming the artifact on one end:

- **`to-spec-<kind>`** produces the specification. `to-spec-aggregate` reads code and unit tests to write the aggregate chapter.
- **`from-spec-<kind>`** consumes the specification. `from-spec-aggregate` turns an agreed aggregate chapter into a change brief and stops.

The literal word `spec` is what makes the direction readable. A bare `to-<kind>` does not work, because `<kind>` names a domain concept that exists on *both* ends: an aggregate is a chapter and a class, so `to-aggregate` could mean either direction. `spec` is the endpoint; `<kind>` only says which one.

In `knowledge-base` the specification is a chapter, so `spec` and "chapter" mean the same thing there. Both halves of a pair must use the same `<kind>` noun so they read as counterparts.

This convention applies only to skills that cross the specification/code boundary in both directions. A skill that just authors an artifact is named for what it writes — `product-owner`'s `write-story`, `write-epic`, and `write-bug` have no counterpart reading stories back out of code, so they keep the verb.

## Host Behavior

`disable-model-invocation` is honored by Claude Code. GitHub Copilot ignores unknown frontmatter keys, so a user-invoked skill stays model-invocable there. This is a safe degradation rather than a break, and it is the reason the shortened description must still be accurate prose: it remains the model's only signal on the Copilot side.

This is the one sanctioned exception to the "stick to `name` and `description`" rule in `plugins/spec-builder/instructions/authoring/create-skill.instructions.md`.

## Validation Checklist

- [ ] Every `automation-*` and `knowledge-base:from-spec-*` skill sets `disable-model-invocation: true`.
- [ ] No `orch-*`, `phase-*`, `create-*`, `product-owner:write-*`, `knowledge-base:to-spec-*`, `workflow-issue-sweep`, or `workflow-resolve-issue` skill sets it.
- [ ] No skill that documents a scheduled-routine or dispatched-worker lane sets it.
- [ ] Every user-invoked description is one line with no `Use when:` or `DO NOT USE FOR:` clause.
- [ ] No skill referenced by name from an agent, a hook prompt, or another skill is user-invoked.
- [ ] Converter skills are named `to-<spec>` or `from-<spec>`, and paired halves share the `<spec>` noun.
