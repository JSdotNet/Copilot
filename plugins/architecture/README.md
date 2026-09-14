# architecture

Architecture documentation: arc42 sections, ADRs, TDRs, and the diagram set that belongs
inside them. Fills the `architecture` role a flow consults, and is usable on its own.

Architecture blueprints left this plugin: the devbook convention has no blueprint chapter,
and an arc42 document already carries what a blueprint did.

## Includes

- Agents:
  - `agents/architect.agent.md`
- Skills:
  - `skills/architecture-arc42-generator/SKILL.md`
  - `skills/create-architectural-decision-record/SKILL.md`
  - `skills/create-technical-debt-record/SKILL.md`
  - `skills/c4-diagram-generator/SKILL.md`
  - `skills/sequence-diagram-generator/SKILL.md`
  - `skills/state-diagram-generator/SKILL.md`
  - `skills/deployment-diagram-generator/SKILL.md`
- Instructions:
  - `resources/adr-global.md`
  - `resources/tdr-global.md`
  - `resources/c4-global.md`
  - `resources/sequence-global.md`
  - `resources/state-global.md`
  - `resources/deployment-global.md`
  - `resources/arc42-global.md`
  - `resources/arc42-section-01.md` … `arc42-section-12-instructions.md`

## Install

```bash
copilot plugin install JSdotNet/ai-plugins:plugins/architecture
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/ai-plugins:plugins/architecture
```

## Uninstall

```bash
copilot plugin uninstall architecture
```

## Output

Writes to the repository's arc42 devbook folder when it has one — `.arc42/` at the root, or
`.devbook/arc42/` — as `NN-name.md` per section with `adr/` and `tdr/` for local records,
following that folder's own structure and metadata rules. Otherwise it asks for a path.

## Relationship To Other Plugins

- Self-contained: it declares no dependency and names no flow. Sequencing, approval, and
  delegation belong to whatever consults it.
- Hands off to `domain-design:domain-architect` for bounded contexts and ubiquitous
  language, `csharp-coding:coding` for implementation, and `ux-design:ux-designer` for
  design constraints that shape a section.
