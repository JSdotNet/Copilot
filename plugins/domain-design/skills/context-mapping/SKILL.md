---
name: context-mapping
description: 'Define and validate bounded context boundaries and map relationships between contexts using DDD strategic design patterns.'
---

# Context Mapping

Use this skill to define bounded context boundaries and map their relationships.

## Trigger Conditions

Use when the user needs to finalize bounded context boundaries, map interactions between contexts, or validate existing context definitions.

## Inputs

- Domain exploration output (events, commands, subdomains, ubiquitous language).
- Existing bounded context definitions (if refining).
- Team structure and ownership information (optional).

## Workflow

1. Apply `resources/ddd-global.md` and `resources/strategic-design.md`.
2. Validate or define bounded context boundaries using the five heuristics:
   - Language boundary
   - Business capability boundary
   - Team boundary
   - Data consistency boundary
   - Change frequency boundary
3. For each bounded context:
   - Write a clear purpose statement.
   - Define the ubiquitous language within the context.
   - Verify the context can be developed and evolved independently.
   - Classify its deployment type as **Service** or **Module** (see `resources/strategic-design.md`).
4. Map relationships between contexts using DDD patterns:
   - Shared Kernel, Customer-Supplier, Conformist, Anti-Corruption Layer, Open Host Service, Published Language, Separate Ways, Partnership.
5. Produce a context map diagram in Mermaid showing all contexts and labelled relationships. Colour-code each bounded context node by deployment type (Service vs Module) per `resources/strategic-design.md`; do not colour edges/lines.
6. Run the boundary validation checklist from `resources/strategic-design.md`.
7. Update or create output files following `resources/domain-documentation-structure.md`.

## Output

- Updated `domain.md` with bounded context map and index.
- One file per bounded context with purpose, language glossary, and relationship summary.
- Context map diagram (Mermaid).
