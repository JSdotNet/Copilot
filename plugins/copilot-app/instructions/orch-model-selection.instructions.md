---
applyTo: 'skills/orch-*/SKILL.md'
description: Defines the model-selection categories the orchestrator uses to pick a model for each orchestration step, the family/tier to pick per category, and how a consuming repo can override those defaults.
---

# Orchestration Model Selection (Orchestration-Owned)

## Purpose

- Make the `orchestrator` agent (`agents/orchestrator.agent.md`) the **single** place that
  chooses a model for every step of an `orch-*` run. Every other agent used by an
  orchestration (`product-owner:product-owner`, `architecture:architect`,
  `csharp-coding:coding`, `qa:qa`, `qa:qa-monitor`, `documentation:profile`, etc.) has no
  `model` in its own frontmatter for this reason — pinning a model on the agent itself would
  create a second, conflicting source of truth. Only `orchestrator.agent.md` pins its own
  model, because it is the one agent that must run under a fixed, known model to reliably
  drive the rest of the process.
- Define the categories **once** so a maintainer edits this file instead of re-describing
  model choice in every `orch-*/SKILL.md`.
- Let a consuming repository override any category's default without editing plugin files.
- Pick the **best-matching model family per category** — never default to a cheap family
  just because it is cheap, and never pin an exact version number that goes stale the moment
  a newer release ships.

## No Hardcoded Version Numbers — Resolve to "Latest" at Run Time

- This file names a **model family and quality tier** per category (for example "Claude
  Opus, latest release"), not an exact versioned model ID (for example `claude-opus-5`).
  Exact IDs go stale as soon as a newer version ships and the previous one rolls into the
  model picker's "Legacy" tier — this file must not need an edit every time that happens.
- At the start of a run, the orchestrator resolves each category's family + tier to a
  concrete model ID by reading the model options currently exposed to it (the same list
  shown in the model picker / offered by its `create_session`/`task` tools) and picking the
  **highest-numbered release in the named family** that is not in the picker's "Legacy ·
  Previous versions" group.
- If the named family has no non-legacy release available (rare), fall back to `auto` for
  that category for the run and note it, rather than reaching into the Legacy tier.
- Never write a specific version number into this file's category table, an override file,
  or `orchestrator.agent.md` — the only version-pinned model in this whole flow is the
  orchestrator's own frontmatter `model`, because that one has to be fixed for the
  orchestrator to run at all.

## Model Families & Tiers

The model picker groups releases into tiers that shift as new models ship (checked against
the picker at the time of writing):

- **Recent (general-purpose, strong default):** Claude Sonnet, Claude Opus, GPT (flagship,
  non-Codex).
- **Powerful · Complex tasks (reasoning + tool-heavy work):** Gemini Pro, GPT Codex.
- **Lightweight · Fast responses (genuinely low-complexity only):** Claude Haiku, GPT mini,
  MAI-Code Flash.
- **Legacy · Previous versions (never pick from here for a new default):** older Claude
  Opus/Sonnet releases, older GPT mini releases, and any release the picker has moved out of
  Recent/Powerful/Lightweight.
- **`auto`** lets the runtime pick per call. It is a legitimate choice, not just a
  cost-saving fallback — but this file still names a concrete family per category so the
  orchestrator makes a deliberate, explainable choice. Use `auto` deliberately (see
  "When to Use `auto`" below), not as the universal default.

## Categories

Each stage in an `orch-*` skill delegates to one or more agents (its `**Agents:**` line).
Every agent used across the `orch-*` skills maps to exactly one category below. Add new
agents to this table when a new `orch-*` skill introduces one.

| Category | Typical Stages | Agents | Family (Tier) | Rationale |
| --- | --- | --- | --- | --- |
| **Planning & Product Definition** | Feature/bug/package specification intake | `product-owner:product-owner` | Claude Sonnet, latest (Recent) | Prose-heavy drafting (stories, acceptance criteria, plans) still benefits from strong general reasoning to keep scope and criteria coherent; not the cheapest lightweight tier. |
| **Architecture & Design** | Architecture & Design intake, ADR/TDR/arc42/Blueprint drafting | `architecture:architect`, `domain-design:domain-architect` | Claude Opus, latest (Recent) | Trade-off analysis and long-term design decisions warrant the strongest current general-reasoning family. |
| **Implementation & Coding** | Implementation, Build & Test, module/service scaffolding | `csharp-coding:coding` | GPT Codex, latest (Powerful) | Precise, tool-heavy code generation and TDD; the family purpose-built for coding. |
| **Testing, QA & Monitoring** | QA Validation, runtime monitoring | `qa:qa`, `qa:qa-monitor` | GPT Codex, latest (Powerful) | Tool-heavy (Playwright, log/trace inspection); needs the same reliability as coding tasks. |
| **Review** | Create Pull Request (PR description + final polish), Summary | *(default; no dedicated agent — the orchestrator performs these directly)* | Claude Opus, latest (Recent) | Highest-quality judgment for catching bugs and writing an accurate PR description; not on the hot path, so the strongest Recent-tier family is worth it. |
| **Documentation & Low-Complexity** | `orch-repo` documentation/README stages, Summary | `documentation:profile` | Claude Haiku, latest (Lightweight) | Genuinely low-complexity formatting/writing task — the one category where the Lightweight tier is the right match, not a cost shortcut. |
| **Human-in-the-Loop** | Personal Validation | *(none)* | *(none)*  | No agent and no model: this phase always hands control back to the user. |
| **Fallback / Unclassified** | Any stage whose agent is not yet listed above, and any `(default)` stage with no clear category match | *(any)* | `auto` | Let the runtime pick until the agent is added to this table — safer than guessing a family for an uncategorized case. |

A stage may list agents from more than one category (for example a combined
"Specification & Architecture Intake" stage naming both `product-owner:product-owner` and
`architecture:architect`). Resolve the model per named agent, not once per stage, so each
agent still gets its own category's model.

## When to Use `auto`

- Use it for the **Fallback / Unclassified** category above (an agent not yet mapped to a
  category), so an uncategorized stage never gets a blind guess.
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
   (see below) and it lists an entry for the stage's category, use that (family, or an exact
   model ID if the repo chose to pin one).
2. **Category family + tier** — otherwise resolve the category's family/tier from the table
   above to the current latest matching model ID, per "No Hardcoded Version Numbers" above.
3. **`auto`** — if the stage's agent is not yet categorized, use `auto` and flag it for
   follow-up (add the agent to the table above).

None of the agents invoked by an orchestration pin their own `model`, so there is no
"agent's pinned model" tier to consider — the orchestrator's resolution above is the only
source of truth. Apply the resolved model explicitly wherever the orchestrator controls it:
the `model` parameter on `create_session`/`task`/kickoff calls it makes for that stage, and
any background/child session it spawns (for example the parallel `qa:qa-monitor` session).

## Repo Override File

- A consuming repository may create `.github/copilot-model-selection.md` at its repo root to
  override any category's default.
- Format: a Markdown table with two columns, `Category` and `Model`, using the exact category
  names from the table above. The `Model` value may be a family name (for example "Gemini
  Pro") for the orchestrator to resolve to the latest release, or an exact model ID if the
  repo wants to pin a specific version deliberately. Only include the rows being overridden;
  omitted categories keep the plugin defaults.

```markdown
# Copilot Model Selection Overrides

| Category | Model |
| --- | --- |
| Implementation & Coding | Gemini Pro |
| Review | GPT flagship |
```

- The orchestrator reads this file once per run (if present) before `start_run`, and reuses
  the resolved mapping for every stage in that run.
- If the file is missing, malformed, or a category is not listed, fall back to the next step
  in the Resolution Order.

## Quality Checks

- [ ] Every agent referenced by an `orch-*/SKILL.md` `**Agents:**` line has a category in the
      table above.
- [ ] No agent invoked by an orchestration (other than `orchestrator.agent.md` itself) pins
      its own `model` in frontmatter.
- [ ] The orchestrator resolves and applies a model before each stage transition, following
      the Resolution Order, and never hardcodes a version number while doing so.
- [ ] A repo override in `.github/copilot-model-selection.md`, when present, takes precedence
      over the category default.
- [ ] Personal Validation never receives a model or agent assignment.
- [ ] This file names families and tiers, not exact version-pinned model IDs, so it does not
      need an edit every time a new model ships.
- [ ] `auto` is used deliberately (Fallback/Unclassified, or an explicit repo override), not
      set as the blanket default for every category.
