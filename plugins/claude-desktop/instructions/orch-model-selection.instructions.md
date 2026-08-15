---
applyTo: 'skills/orch-*/SKILL.md'
description: Defines the model-selection categories the orchestrator uses to pick a model for each orchestration step, the Claude alias to pick per category, and how personal and team configuration can override those defaults.
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
- Let an individual user override model choice outside the repository, and let a consuming
  repository define team-shared overrides without editing plugin files.
- Pick the **best-matching model per category** — never default to the cheapest model just
  because it is cheap, and never pin an exact version number that goes stale the moment a
  newer release ships.

## Use Aliases, Never Version-Pinned IDs

- Claude Code accepts the aliases `opus`, `sonnet`, `haiku`, and `fable` wherever a model is
  named — the `Agent` tool's `model` parameter and an agent's frontmatter `model`. Each
  alias resolves to the current release of that family, so this file names the alias and
  never needs an edit when a new version ships.
- Do not write an exact model ID (for example `claude-opus-5`) into this file's category
  table. An override file may pin one deliberately, accepting the maintenance cost.
- `inherit` is also valid in agent frontmatter and means "run under the session's model".
  Use it only where a category genuinely has no preference; the table below always names a
  family instead, so the choice stays deliberate and explainable.
- If a named alias is unavailable to the running session (an entitlement or configuration
  limit), fall back to the session default for that category and say so in the stage output,
  rather than silently substituting a weaker model.

## Model Families

| Alias | Use it for |
| --- | --- |
| `opus` | The strongest reasoning: architecture and design trade-offs, code review judgment, anything where a wrong call is expensive. |
| `sonnet` | Strong general-purpose work at lower cost: prose-heavy drafting, planning, most tool-heavy execution. |
| `haiku` | Genuinely low-complexity, high-volume formatting and writing tasks. |
| `fable` | Available in this session's model list; not assigned to a category by default. |

## Categories

Each stage in an `orch-*` skill delegates to one or more agents (its `**Agents:**` line).
Every agent used across the `orch-*` skills maps to exactly one category below. Add new
agents to this table when a new `orch-*` skill introduces one.

| Category | Typical Stages | Agents | Model | Rationale |
| --- | --- | --- | --- | --- |
| **Planning & Product Definition** | Feature/bug/package specification intake | `product-owner:product-owner` | `sonnet` | Prose-heavy drafting (stories, acceptance criteria, plans) needs solid general reasoning to keep scope and criteria coherent, but not the strongest tier. |
| **Architecture & Design** | Architecture & Design intake, ADR/TDR/arc42/Blueprint drafting | `architecture:architect`, `domain-design:domain-architect` | `opus` | Trade-off analysis and long-term design decisions warrant the strongest reasoning available. |
| **Implementation & Coding** | Implementation, Build & Test, module/service scaffolding | `csharp-coding:coding` | `opus` | Precise, tool-heavy code generation and TDD, where a subtle mistake costs a whole validation cycle. |
| **Testing, QA & Monitoring** | QA Validation, runtime monitoring | `qa:qa`, `qa:qa-monitor` | `sonnet` | Tool-heavy but procedural: driving Playwright and reading logs/traces rewards throughput over deep reasoning. |
| **Review** | Create Pull Request (PR description + final polish), Summary | *(default; no dedicated agent — the orchestrator performs these directly)* | `opus` | Highest-quality judgment for catching bugs and writing an accurate PR description; not on the hot path, so the strongest model is worth it. |
| **Documentation & Low-Complexity** | `orch-repo` documentation/README stages, Summary | `documentation:profile` | `haiku` | Genuinely low-complexity formatting/writing — the one category where the lightweight model is the right match, not a cost shortcut. |
| **Human-in-the-Loop** | Personal Validation | *(none)* | *(none)* | No agent and no model: this phase always hands control back to the user. |
| **Fallback / Unclassified** | Any stage whose agent is not yet listed above, and any `(default)` stage with no clear category match | *(any)* | *(session default)* | Let the session's own model run it until the agent is added to this table — safer than guessing a family for an uncategorized case. |

A stage may list agents from more than one category (for example a combined
"Specification & Architecture Intake" stage naming both `product-owner:product-owner` and
`architecture:architect`). Resolve the model per named agent, not once per stage, so each
agent still gets its own category's model.

## When to Leave the Model Unset

- Leave it unset for the **Fallback / Unclassified** category above (an agent not yet mapped
  to a category), so an uncategorized stage inherits the session model instead of getting a
  blind guess.
- A user or repo may also opt a specific category into `inherit` via the override files
  below, if it prefers every stage to follow whatever model the session is running.
- Do not leave it unset everywhere "because the session model is fine" — the point of this
  file is that the orchestrator makes a deliberate, explainable choice per category.

## Resolution Order

For every stage transition, the orchestrator resolves the model to use in this order,
stopping at the first match:

1. **Current run instruction** — if the user explicitly gives a model-selection instruction
   for this run, use it for the categories it covers.
2. **Personal global override** — if `CLAUDE_ORCH_MODEL_SELECTION_PATH` points to a readable
   file, read that file; otherwise check the default user-global file path (see below). If
   the file lists an entry for the stage's category, use that value.
3. **Team repo override** — if the consuming repository defines `.claude/model-selection.md`
   (see below) and it lists an entry for the stage's category, use that value.
4. **Category model** — otherwise use the alias named in the table above.
5. **Session default** — if the stage's agent is not yet categorized, leave the model unset
   and flag it for follow-up (add the agent to the table above).

None of the agents invoked by an orchestration pin their own `model`, so there is no
"agent's pinned model" tier to consider — the orchestrator's resolution above is the only
source of truth. Apply the resolved model explicitly wherever the orchestrator controls it:
the `model` parameter on every `Agent` call it makes for that stage, including background
sub-agents such as the parallel `qa:qa-monitor`.

## Personal Global Override File

- A user may define personal model preferences outside every repository. This keeps personal
  cost and speed preferences out of team-shared instructions and avoids accidental commits.
- Preferred explicit path: set `CLAUDE_ORCH_MODEL_SELECTION_PATH` to a Markdown file using
  the same table format as the team repo override below.
- Default path when the environment variable is unset:

| OS | Default path |
| --- | --- |
| Windows | `%USERPROFILE%\.claude\orchestration\model-selection.md` |
| macOS/Linux | `~/.claude/orchestration/model-selection.md` |

- The orchestrator reads at most one personal file: the environment-variable path when set,
  otherwise the default path. If the selected file is missing, unreadable, malformed, or a
  category is not listed, fall back to the next step in the Resolution Order.
- Do **not** support repo-local personal files such as `.claude/model-selection.local.md`.
  Personal overrides belong outside the repo; repository files are team-shared by default.

```markdown
# Orchestration Model Selection Overrides

| Category | Model |
| --- | --- |
| Implementation & Coding | sonnet |
| Review | inherit |
```

## Team Repo Override File

- A consuming repository may create `.claude/model-selection.md` at its repo root to
  override any category's default for the whole team.
- Format: a Markdown table with two columns, `Category` and `Model`, using the exact category
  names from the table above. The `Model` value is normally an alias (`opus`, `sonnet`,
  `haiku`, `fable`), `inherit`, or an exact model ID when the repo deliberately pins a
  version. Prefer aliases unless there is a clear reason to accept the maintenance cost of an
  exact pin. Only include the rows being overridden; omitted categories keep the plugin
  defaults unless a personal global override already supplied that category.

```markdown
# Orchestration Model Selection Overrides

| Category | Model |
| --- | --- |
| Testing, QA & Monitoring | opus |
| Documentation & Low-Complexity | sonnet |
```

- The orchestrator reads the personal and team files once per run (if present) before
  `start_run`, and reuses the resolved mapping for every stage in that run.
- If a file is missing, malformed, or a category is not listed, fall back to the next step in
  the Resolution Order.

## Quality Checks

- [ ] Every agent referenced by an `orch-*/SKILL.md` `**Agents:**` line has a category in the
      table above.
- [ ] No agent invoked by an orchestration (other than `orchestrator.agent.md` itself) pins
      its own `model` in frontmatter.
- [ ] The orchestrator resolves and applies a model before each stage transition, following
      the Resolution Order, and never hardcodes a version number while doing so.
- [ ] A personal global override, when present, takes precedence over a team repo override.
- [ ] A team repo override in `.claude/model-selection.md`, when present, takes precedence
      over the category default.
- [ ] Personal Validation never receives a model or agent assignment.
- [ ] This file names aliases, not exact version-pinned model IDs, so it does not need an
      edit every time a new model ships.
- [ ] An unset model is used deliberately (Fallback/Unclassified, or an explicit `inherit`
      override), not as the blanket default for every category.
- [ ] No repo-local personal override path such as `.claude/model-selection.local.md` is
      supported or treated as a readable config source.
