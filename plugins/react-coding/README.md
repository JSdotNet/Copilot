# react-coding

React and TypeScript implementation: components, hooks, routes, typed API clients bound to a
.NET API contract, and component tests. The `frontend` agent detects the repository's own
package manager, React stack, and build/typecheck/lint/test commands before its first edit and
proves every change with them. Fills the `implement` and `verify` services a flow runs its
frontend stages through, and is usable on its own.

The C# sibling is [`csharp-coding`](../csharp-coding/README.md). Both are pure expertise:
neither sequences stages, holds a gate, or delegates.

## Includes

- Agents:
  - `agents/frontend.agent.md`
- Skills:
  - `skills/frontend-stack-detect/SKILL.md` — detect the stack and the exact commands from the repository's own files
  - `skills/api-client-contract/SKILL.md` — bind the UI to the API contract as the single source of truth for types
  - `skills/react-component/SKILL.md` — write or change a component to match the patterns already in the repository
  - `skills/react-testing/SKILL.md` — component and hook tests that assert user-visible behavior

## Install

```bash
copilot plugin install JSdotNet/ai-plugins:plugins/react-coding
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/ai-plugins:plugins/react-coding
```

## Uninstall

```bash
copilot plugin uninstall react-coding
```

## Handoffs

The `frontend` agent names `csharp-coding:coding` for the API change a screen needs,
`ux-design:ux-designer` for a wireframe or guideline decision, and `qa:qa` for end-to-end
validation — and says why. Whether that needs approval is the calling flow's business.
