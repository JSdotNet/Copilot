# spec-builder

Installable plugin for creating customization assets that load in both GitHub Copilot and
Claude Code from a single copy of every file.

## Includes

- Agent:
  - `agents/spec-builder.agent.md`
- Skills:
  - `skills/create-agent/SKILL.md`
  - `skills/create-instruction/SKILL.md`
  - `skills/create-plugin/SKILL.md`
  - `skills/create-skill/SKILL.md`
  - `skills/create-workflow/SKILL.md`
- Instructions:
  - `instructions/agent/agent-naming.instructions.md`
  - `instructions/agent/agent-spec-workflow.instructions.md`
  - `instructions/authoring/create-agent.instructions.md`
  - `instructions/authoring/create-instruction.instructions.md`
  - `instructions/authoring/create-plugin.instructions.md`
  - `instructions/authoring/create-skill.instructions.md`
  - `instructions/authoring/create-canvas.instructions.md`
  - `instructions/authoring/create-workflow.instructions.md`
- Resources:
  - `resources/quick-reference.md`
- Hooks:
  - `hooks.json` (session-start authoring quality guardrail prompt)

## Scope

- This plugin focuses on creating and refining GitHub customization assets: agents, instructions, plugins, skills, canvas extensions, and GitHub Actions workflow files.
- A single `spec-builder` agent owns the full flow: scope, plan, build, verify, and report.
- Asset-specific rules live in the `create-*` skills and matching authoring instructions.
- It does not provide runtime application code implementation.
- It is self-contained and does not require assets from an external source repository.

## Dual-Host Authoring

Every asset this plugin produces is authored once and read by both GitHub Copilot and Claude
Code. The `create-*` skills and their authoring instructions enforce the rules; the short
version:

| Rule | Why |
|---|---|
| Never pin `model` in an agent | Claude refuses to load an agent whose model id it does not recognise |
| Author `tools` as Copilot ids only | `Sync-ClaudePlugins.ps1` appends the Claude equivalents |
| Give every agent a `name` | Required by Claude, honoured by Copilot |
| Document handoff targets in the body | Claude ignores the `handoffs` key |
| Reference instruction files by path | Claude does not auto-apply `applyTo` |
| Hooks may only use `type: "prompt"` | The only hook type with a cross-host translation |

Edit `.github/plugin/plugin.json` and `hooks.json`; the `.claude-plugin/` and `hooks/`
counterparts are generated. Run the sync script before committing — CI fails on drift:

```bash
pwsh ./scripts/Sync-ClaudePlugins.ps1
```

Canvas extensions are the one Copilot-only asset type; they have no Claude counterpart.

Full rules: [Claude Code Compatibility](../../docs/copilot/claude-code-compatibility.md).

## Install

```bash
copilot plugin install JSdotNet/Copilot:plugins/spec-builder
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/Copilot:plugins/spec-builder
```

## Uninstall

```bash
copilot plugin uninstall spec-builder
```

## Resources

- [GitHub Copilot Customization Docs](https://docs.github.com/en/copilot/customizing-copilot) — official reference for agents, instructions, prompts, and skills.
- [VS Code Copilot Chat Extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat) — host environment for `.agent.md`, `.instructions.md`, and `SKILL.md` files.
- [GitHub Copilot for Azure](https://docs.github.com/en/copilot/github-copilot-enterprise) — enterprise context and deployment considerations.
- [YAML Frontmatter Reference](https://jekyllrb.com/docs/front-matter/) — general frontmatter syntax used in Copilot customization assets.

## Future Upgrades

- **Review create naming**
- **Prompt authoring skill** — add a `create-prompt` skill and matching `instructions/authoring/create-prompt.instructions.md` to cover `.prompt.md` assets.
- **Multi-action canvas templates** — add reusable canvas renderer templates (static-file server, Vite dev server wiring) to `resources/` referenced by the `create-canvas` instructions.
- **Spec authoring skill** — add a `create-spec` skill for structured specification documents that drive multi-step agent workflows.
- **`plugin.json` schema validation** — add a `validate-plugin` skill that checks manifest completeness and path integrity before install.
- **Hooks and MCP authoring** — add skills for `hooks.json` and `.mcp.json` to support lifecycle automation and MCP server wiring.
- **Resource templates folder** — add a `resources/` folder with reusable checklists, frontmatter templates, and example assets for bootstrapping new customization work.
- **Marketplace publishing workflow** — extend `create-plugin` to include `marketplace.json` composition and publishing readiness checks.
