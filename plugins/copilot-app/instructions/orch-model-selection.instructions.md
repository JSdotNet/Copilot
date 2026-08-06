---
applyTo: 'skills/orch-*/SKILL.md'
description: Defines the model-selection categories the orchestrator uses to pick a model for each orchestration step, the default model per category, and how a consuming repo can override those defaults.
---

# Orchestration Model Selection (Orchestration-Owned)

## Purpose

- Make the `orchestrator` agent (`agents/orchestrator.agent.md`) responsible for choosing a
  model for every step of an `orch-*` run, instead of running every stage under whatever
  model the orchestrator itself happens to use.
- Define the categories **once** so a maintainer edits this file instead of re-describing
  model choice in every `orch-*/SKILL.md`.
- Let a consuming repository override any category's default without editing plugin files.
- Pick the **best-matching current-generation model per category** — never default to a
  cheap model just because it is cheap, and never leave a category pinned to a model that
  has rolled into the "Legacy" tier in the model picker.

## Model Tiers (Re-check Periodically)

The model picker groups models into tiers that change as new models ship. Only pick
defaults from **Recent** or **Powerful · Complex tasks**; only use **Lightweight · Fast
responses** for genuinely low-complexity, low-risk work; never default a category to a
**Legacy · Previous versions** model — those exist for compatibility, not for new defaults.
When a new model tier ships, re-evaluate the table below instead of leaving stale pins.

- **Recent (general-purpose, strong default):** `claude-sonnet-5`, `claude-opus-5`, `gpt-5.4`.
- **Powerful · Complex tasks (reasoning + tool-heavy work):** `gemini-3.1-pro-preview`,
  `gpt-5.3-codex`.
- **Lightweight · Fast responses (genuinely low-complexity only):** `claude-haiku-4.5`,
  `gpt-5.4-mini`, `mai-code-1-flash-picker`.
- **Legacy · Previous versions (do not use as a new default):** `claude-opus-4.5` through
  `claude-opus-4.8`, `claude-sonnet-4.5`, `claude-sonnet-4.6`, `gpt-5-mini`, etc.
- **`auto`** lets the runtime pick per call. It is a legitimate choice, not just a
  cost-saving fallback — but this file still names a concrete default per category so the
  orchestrator makes a deliberate, explainable choice. Use `auto` deliberately (see
  "When to Use `auto`" below), not as the universal default.

## Categories

Each stage in an `orch-*` skill delegates to one or more agents (its `**Agents:**` line).
Every agent used across the `orch-*` skills maps to exactly one category below. Add new
agents to this table when a new `orch-*` skill introduces one.

| Category | Typical Stages | Agents | Default Model | Rationale |
| --- | --- | --- | --- | --- |
| **Planning & Product Definition** | Feature Specification, Bug Triage, Package/Update Planning | `product-owner:product-owner`, `development:development-plan` | `claude-sonnet-5` | Prose-heavy drafting (stories, acceptance criteria, plans) still benefits from strong general reasoning to keep scope and criteria coherent; Recent tier, not the cheapest lightweight tier. |
| **Architecture & Design** | Architecture & Design, ADR/TDR/arc42/Blueprint drafting | `architecture:architect`, `domain-design:domain-architect` | `claude-opus-5` | Trade-off analysis and long-term design decisions warrant the strongest current general-reasoning model (Recent tier). |
| **Implementation & Coding** | Implementation, Build & Test, module/service scaffolding | `csharp-coding:coding`, `development:developer` | `gpt-5.3-codex` | Precise, tool-heavy code generation and TDD; current Powerful/Complex-tasks tier model purpose-built for coding. |
| **Testing, QA & Monitoring** | QA Validation, runtime monitoring | `qa:qa`, `qa:qa-monitor`, `development:testing` | `gpt-5.3-codex` | Tool-heavy (Playwright, log/trace inspection); needs the same reliability as coding tasks. |
| **Security & Compliance** | Security scan/hardening steps | `development:security` | `gpt-5.3-codex` | Careful, tool-heavy analysis where mistakes are costly. |
| **Review** | Create Pull Request (PR description + final polish), code review passes | `review:reviewer` | `claude-opus-5` | Highest-quality judgment for catching bugs and writing an accurate PR description; not on the hot path, so the strongest Recent-tier model is worth it. |
| **Documentation & Low-Complexity** | Summary, profile/README updates, straightforward lookups | `documentation:profile`, `documentation:documentation` | `claude-haiku-4.5` | Genuinely low-complexity formatting/writing task — the one category where the Lightweight tier is the right match, not a cost shortcut. |
| **Human-in-the-Loop** | Personal Validation | *(none)* | *(none)*  | No agent and no model: this phase always hands control back to the user. |
| **Fallback / Unclassified** | Any stage whose agent is not yet listed above | *(any)* | `auto` | Let the runtime pick until the agent is added to this table — safer than guessing a fixed model for an uncategorized case. |

## When to Use `auto`

- Use it for the **Fallback / Unclassified** category above (an agent not yet mapped to a
  category), so an uncategorized stage never gets a blind fixed-model guess.
- A repo may also opt any specific category into `auto` via the override file below, if it
  prefers the runtime to pick dynamically for that category (for example, a repo with highly
  variable planning tasks).
- Do not treat `auto` as a universal default "because it's price efficient" — the whole point
  of this file is that the orchestrator makes a deliberate, explainable choice per category
  instead of delegating that judgment away by default.

## Resolution Order

For every stage transition, the orchestrator resolves the model to use in this order,
stopping at the first match:

1. **Repo override** — if the consuming repository defines `.github/copilot-model-selection.md`
   (see below) and it lists an entry for the stage's category, use that model.
2. **Pinned agent model** — if the stage's target is a custom agent with its own `model` in
   frontmatter (for example `csharp-coding:coding` pins `GPT-5.3-Codex`), use that pinned
   model. A dedicated agent's pin reflects a deliberate, tested choice and should not be
   silently overridden by the category default.
3. **Category default** — otherwise use the category default from the table above.
4. **`auto`** — if the stage's agent is not yet categorized, use `auto` and flag it for
   follow-up (add the agent to the table above).

Apply the resolved model explicitly wherever the orchestrator controls it: the `model`
parameter on `create_session`/`task`/kickoff calls it makes for that stage, and any
background/child session it spawns (for example the parallel `qa:qa-monitor` session). When
the orchestrator hands off in-session to a custom agent that already carries its own pinned
model, no explicit override is needed unless step 1 (repo override) applies.

## Repo Override File

- A consuming repository may create `.github/copilot-model-selection.md` at its repo root to
  override any category's default model.
- Format: a Markdown table with two columns, `Category` and `Model`, using the exact category
  names from the table above. Only include the rows being overridden; omitted categories keep
  the plugin defaults.

```markdown
# Copilot Model Selection Overrides

| Category | Model |
| --- | --- |
| Implementation & Coding | gemini-3.1-pro-preview |
| Review | gpt-5.4 |
```

- The orchestrator reads this file once per run (if present) before `start_run`, and reuses
  the resolved mapping for every stage in that run.
- If the file is missing, malformed, or a category is not listed, fall back to the next step
  in the Resolution Order.

## Quality Checks

- [ ] Every agent referenced by an `orch-*/SKILL.md` `**Agents:**` line has a category in the
      table above.
- [ ] The orchestrator resolves and applies a model before each stage transition, following
      the Resolution Order.
- [ ] A repo override in `.github/copilot-model-selection.md`, when present, takes precedence
      over both the category default and the target agent's pinned model.
- [ ] Personal Validation never receives a model or agent assignment.
- [ ] No category default sits in the model picker's "Legacy" tier; re-check the Model Tiers
      section when new models ship and update stale pins.
- [ ] `auto` is used deliberately (Fallback/Unclassified, or an explicit repo override), not
      set as the blanket default for every category.
