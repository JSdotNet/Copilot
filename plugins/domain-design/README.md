# domain-design

Domain-Driven Design: bounded contexts, ubiquitous language, domain models, and context maps. Fills the `domain` role a flow consults, and is usable on its own.

Writes to the repository's `.domain/` knowledge folder when it has one, following that folder's own structure and metadata rules; otherwise it follows `instructions/output/domain-documentation-structure-instructions.md`.

## Includes

- Agents:
  - `agents/domain-architect.agent.md`
- Skills:
  - `skills/domain-exploration/SKILL.md`
  - `skills/context-mapping/SKILL.md`
  - `skills/domain-interaction-model/SKILL.md`
  - `skills/domain-model-design/SKILL.md`
  - `skills/aggregate-diagram/SKILL.md`
  - `skills/domain-event-flow-diagram/SKILL.md`
  - `skills/domain-interaction-diagram/SKILL.md`
  - `skills/subdomain-landscape-diagram/SKILL.md`
- Instructions:
  - `instructions/ddd/ddd-global-instructions.md`
  - `instructions/ddd/strategic-design-instructions.md`
  - `instructions/ddd/tactical-design-instructions.md`
  - `instructions/diagrams/ddd-diagram-instructions.md`
  - `instructions/output/domain-documentation-structure-instructions.md`
- Resources:
  - `resources/ddd-checklist.md`
  - `resources/ddd-anti-patterns.md`

## Install

```bash
copilot plugin install JSdotNet/Copilot:plugins/domain-design
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/Copilot:plugins/domain-design
```

## Uninstall

```bash
copilot plugin uninstall domain-design
```

## Relationship To Architecture Plugin

- This plugin owns domain design and modelling workflows.
- The `architecture` plugin owns arc42, ADRs, and TDRs.
- Install both when you need end-to-end coverage from domain discovery through architecture documentation.
- The `domain-architect` agent names `architecture:architect` as the handoff for recording decisions as ADRs or mapping results into arc42 sections. Sequencing, approval, and delegation belong to whatever consults it.
