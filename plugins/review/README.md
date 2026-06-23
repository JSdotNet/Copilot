# review

Installable GitHub Copilot CLI plugin for structured review workflows.

## Includes

- Agent:
  - `agents/reviewer.agent.md`
- Skills:
  - `skills/todo-review/SKILL.md`
  - `skills/question-review/SKILL.md`
  - `skills/suggestion-review/SKILL.md`
- Hooks:
  - `hooks.json` (session-start finding quality guardrail prompt)

## Scope

- TODO-based review to convert TODO notes into concrete review findings.
- Question-based review to evaluate artifacts against explicit review questions.
- Suggestion-based review to identify future improvements and extension opportunities.

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
