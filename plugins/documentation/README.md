# Documentation Plugin

A GitHub Copilot CLI plugin for writing and maintaining documentation artifacts.
Covers five artifact types: **How-To guides**, **Explanations**, **Articles**, **Ideas**, and **Proposals**.

## What's included

| Asset | Path | Purpose |
|---|---|---|
| Agent | `agents/documentation.agent.md` | Orchestrates all five artifact types |
| Instruction | `instructions/documentation/howto.instructions.md` | How-To writing rules |
| Instruction | `instructions/documentation/explanations.instructions.md` | Explanation writing rules |
| Instruction | `instructions/documentation/articles.instructions.md` | Article writing rules |
| Instruction | `instructions/documentation/ideas.instructions.md` | Idea writing rules |
| Instruction | `instructions/documentation/proposals.instructions.md` | Proposal writing rules |
| Skill | `skills/create-howto` | Guided how-to creation workflow |
| Skill | `skills/create-explanation` | Guided explanation creation workflow |
| Skill | `skills/create-article` | Guided article creation workflow |
| Skill | `skills/create-idea` | Guided idea capture workflow |
| Skill | `skills/create-proposal` | Guided proposal creation workflow |

## Installation

Install from the local path using the Copilot CLI:

```bash
copilot plugin install ./plugins/documentation
```

Re-install after any changes to pick up updates:

```bash
copilot plugin install ./plugins/documentation
```

## Usage

### Using the agent

Activate the documentation agent for any writing session:

```
@documentation Write a how-to guide for setting up the local dev environment.
@documentation Create an explanation of why we use event sourcing.
@documentation Draft an article about our migration to .NET Aspire.
@documentation Capture an idea for offline-first sync.
@documentation Write a proposal for adopting a new branching strategy.
```

### Using skills directly

Invoke a specific skill to start a guided workflow:

```
/create-howto
/create-explanation
/create-article
/create-idea
/create-proposal
```

Each skill asks targeted clarifying questions and then drafts the document to your chosen location.

## Artifact types

| Artifact | Default output path | When to use |
|---|---|---|
| How-To | `**/howto/` | Step-by-step procedural guides for developers |
| Explanation | `**/explanations/` | Conceptual rationale and trade-off documentation |
| Article | `**/articles/` | Blog posts, stories, retrospectives, and deep dives |
| Idea | `**/ideas/` | Lightweight notes for capturing early-stage concepts |
| Proposal | `**/proposals/` | Structured recommendations for decisions or changes |

## Instruction file scope

All instruction files use generic `applyTo` globs so they work in any repository layout:

- `**/howto/*.md`
- `**/explanations/*.md`
- `**/articles/*.md`
- `**/ideas/*.md`
- `**/proposals/*.md`

## Updating

1. Edit the relevant agent, instruction, or skill file.
2. Re-install the plugin: `copilot plugin install ./plugins/documentation`
3. Test with a sample request to confirm the change takes effect.
