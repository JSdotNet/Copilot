# review

Installable GitHub Copilot CLI plugin providing reusable review skills for any agent.

## Design

The review plugin ships **skills only** — no dedicated agent. Any agent (csharp-coding, documentation, product-owner, architecture, etc.) can invoke the review skills directly. The calling agent supplies domain knowledge about the review target; the skills drive the structured review workflow.

## Includes

- Skills:
  - `skills/todo-review/SKILL.md` — TODO-driven review for any artifact
  - `skills/question-review/SKILL.md` — question-driven review for any artifact
  - `skills/suggestion-review/SKILL.md` — improvement-suggestion review for any artifact
  - `skills/pr-remarks-review/SKILL.md` — triage and address open PR review remarks
- Hooks:
  - `hooks.json` (session-start finding quality guardrail prompt)

## Scope

These skills work with any review target:

- **Code** — source files, modules, pull requests
- **User stories** — acceptance criteria, scope, edge cases
- **Documentation** — how-tos, explanations, articles, READMEs
- **Architecture** — ADRs, blueprints, C4 diagrams
- **Configuration** — plugin manifests, CI/CD workflows
- Any other artifact

### Review modes

- **TODO-based review** — converts TODO notes into concrete findings and next actions.
- **Question-based review** — evaluates artifacts against explicit review questions with evidence.
- **Suggestion-based review** — identifies future improvements and extension opportunities.
- **PR remarks review** — triages open PR review comments into Fix / Discuss / Decline / Defer, drafts reviewer replies, and produces a resolution summary.

## Install

```bash
copilot plugin install JSdotNet/Copilot:plugins/review
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/Copilot:plugins/review
```

## Uninstall

```bash
copilot plugin uninstall review
```
