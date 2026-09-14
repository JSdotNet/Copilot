---
name: knowledge-base-moved
description: "The knowledge-base plugin is retired; its convention and skills ship as devbook in the jsdotnet marketplace. Use when: a task names a knowledge folder (.arc42, .domain, .tech, .design, .backlog, .ai) or a former knowledge-base skill (knowledge-base-init, knowledge-base-validate, knowledge-tech-update, orch-arc42-content, orch-domain, orch-tech, orch-design, orch-backlog, orch-ai, to-spec-<kind>, from-spec-<kind>) and no devbook skill is loaded."
---

# knowledge-base moved

This plugin ships nothing but this notice. `knowledge-base@jsdotnet-copilot` 0.17.0 is its
final release; the convention, the generator, the canvas, and every skill continue as
`devbook@jsdotnet`, published from <https://github.com/JSdotNet/ai-agent-stack>.

## Workflow

1. Tell the user the skill they asked for now lives in `devbook`, and name its successor from
   the table below.
2. If `devbook` is not enabled, give them the two steps: add the marketplace with
   `claude plugin marketplace add JSdotNet/ai-agent-stack`, then enable `devbook`. This
   plugin's manifest declares `devbook@jsdotnet` as a dependency, so a host that resolves
   dependencies enables it on its own.
3. Stop. Do not attempt the original task with this plugin: nothing is left to run it with.

## Where each skill went

| Former skill | Successor |
| --- | --- |
| `knowledge-base-init`, `knowledge-base-validate` | `devbook:install`, `devbook:devbook-check` |
| `knowledge-tech-update` | `devbook:devbook-tech-update` |
| `orch-arc42-content`, `orch-domain`, `orch-tech`, `orch-design`, `orch-ai` | `delivery:flow-arc42`, `flow-domain`, `flow-tech`, `flow-design`, `flow-ai` |
| `orch-backlog` | none — `.backlog` is not a devbook folder; work items live in the tracker the repository binds |
| `to-spec-<kind>`, `from-spec-<kind>` | same names in `devbook` |

Folder layout is unchanged: the root dot-folders still work, and devbook also accepts them
nested under one `.devbook/` parent.
