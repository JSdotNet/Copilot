# development

Installable GitHub Copilot CLI plugin for development planning and execution workflows.

## Includes

- Agents:
  - `agents/development-plan.agent.md`
  - `agents/developer.agent.md`
  - `agents/backend.agent.md`
  - `agents/frontend.agent.md`
  - `agents/naming.agent.md`
  - `agents/security.agent.md`
  - `agents/testing.agent.md`
- Skills:
  - `skills/aspire/SKILL.md`
  - `skills/microsoft-code-reference/SKILL.md`
  - `skills/nuget-manager/SKILL.md`
  - `skills/refactor/SKILL.md`
  - `skills/refactor-plan/SKILL.md`
- Instructions:
  - `instructions/copilot-instructions.md`
  - `instructions/agent/agent-handoff.instructions.md`
  - `instructions/agent/agent-model-recommendation.instructions.md`
  - `instructions/agent/agent-plugin-composition.instructions.md`
  - `instructions/agent/agent-language-and-tone.instructions.md`
  - `instructions/agent/agent-naming.instructions.md`
  - `instructions/agent/meta-agent.instructions.md`
  - `instructions/markdown.instructions.md`
  - `instructions/code/unit-test.instructions.md`

## Architecture Split

- Architecture assets are now maintained in `plugins/architecture`.
- Install `plugins/architecture` when you need architecture-specific handoffs from `development-plan.agent.md`.

## Install

```bash
copilot plugin install JSdotNet/Copilot:plugins/development
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/Copilot:plugins/development
```

## Uninstall

```bash
copilot plugin uninstall development
```

## Migration Note

Original files in `.github/agents/`, `.github/skills/`, and `.github/instructions/` are intentionally retained for now and can be removed in a later cleanup step.
