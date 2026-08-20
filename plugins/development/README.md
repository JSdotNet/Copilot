# development

Installable GitHub Copilot CLI plugin for development planning and execution workflows
across a .NET backend and a React frontend.

## Includes

- Agents:
  - `agents/developer.agent.md`
- Skills:
  - `skills/api-client-contract/SKILL.md`
  - `skills/aspire/SKILL.md`
  - `skills/frontend-stack-detect/SKILL.md`
  - `skills/microsoft-code-reference/SKILL.md`
  - `skills/nuget-manager/SKILL.md`
  - `skills/react-component/SKILL.md`
  - `skills/react-testing/SKILL.md`
  - `skills/refactor/SKILL.md`
  - `skills/refactor-plan/SKILL.md`
- Hooks:
  - `hooks.json` (session-start implementation plan completeness guardrail prompt)
- Instructions:
  - `instructions/copilot-instructions.md`
  - `instructions/agent/agent-language-and-tone.instructions.md`
  - `instructions/agent/agent-model-recommendation.instructions.md`
  - `instructions/code/unit-test.instructions.md`

## Delivery Lanes

Execution covers two lanes, and each phase gate runs the lane's own commands.

| Lane | Implemented by | Gate |
| --- | --- | --- |
| Backend | `agents-internal/backend.agent.md` | `dotnet test` |
| Frontend | `agents-internal/frontend.agent.md` | typecheck, lint, test, production build |

`agents-internal/testing.agent.md` covers both lanes and reports each separately.

## Stack Detection Over Assumption

The plugin ships no hardcoded frontend stack. `skills/frontend-stack-detect/SKILL.md` reads
the package manager, React version, routing, state, data-fetching, styling, test runner, and
the exact build, typecheck, lint, and test commands out of the repository being worked on,
and every value it reports names the file that proved it.

Consequences the agents enforce:

- A command is only run if detection found it. A missing gate is reported, never assumed passed.
- The lockfile decides the package manager; no substituting an equivalent from another manager.
- UI types come from the API contract via `skills/api-client-contract/SKILL.md`, not from
  shapes guessed in a component.

## Architecture Split

- Architecture assets are now maintained in `plugins/architecture`.
- Install `plugins/architecture` when you need architecture-specific handoffs from
  `development-plan.agent.md`.

## Agent Visibility

- Only `developer` is publicly exposed by this plugin in Copilot.
- Specialist agents under `agents-internal/` are internal implementation assets. Copilot does
  not surface them directly; Claude Code reaches them through the generated
  `.claude-plugin/plugin.json`.

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
