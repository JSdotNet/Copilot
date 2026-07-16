# fincent

Installable GitHub Copilot CLI plugin for Fincent project story review, pre-refinement,
domain alignment, and story point estimation workflows.

## Includes

- Skills:
  - `skills/story-review-po/SKILL.md`
  - `skills/story-review-pre-refinement/SKILL.md`
  - `skills/story-review-domain/SKILL.md`
  - `skills/story-point-estimation/SKILL.md`
  - `skills/automation-story-review-po/SKILL.md`
  - `skills/automation-story-review-pre-refinement/SKILL.md`
  - `skills/automation-story-review-domain/SKILL.md`
  - `skills/automation-story-point-estimation/SKILL.md`
- Resources:
  - `resources/dor.md` — Fincent Definition of Ready
  - `resources/templates/story-review-checklist.md` — review and estimation checklist

## Scope

This plugin groups Fincent-specific story quality workflows into four independent skills
and a matching automation skill for each.

### Core Skills (run independently)

| Skill | Agent | Purpose |
|-------|-------|---------|
| `story-review-po` | Product Owner | Validate story format, business value, and acceptance criteria |
| `story-review-pre-refinement` | Architect | Check architectural readiness and identify enabler stories |
| `story-review-domain` | Domain Architect | Validate ubiquitous language, aggregates, and domain events |
| `story-point-estimation` | — | Estimate story points using a three-factor model |

### Automation Skills (orchestrated, with full dependency loading)

| Skill | Dependencies | Purpose |
|-------|-------------|---------|
| `automation-story-review-po` | Jira, DOR | Full PO review with auto-fix suggestions and Jira update |
| `automation-story-review-pre-refinement` | Jira, Architecture docs, ADRs, DOR | Architecture review with enabler story drafting and Jira update |
| `automation-story-review-domain` | Jira, Codebase (domain layer), Ubiquitous language, DOR | Domain review with term corrections and Jira update |
| `automation-story-point-estimation` | Jira, Codebase, Reference stories, DOR | Three-factor estimation with Jira field update |

## Dependencies

Each automation skill documents its required integrations:

- **Jira**: story retrieval, comment posting, and estimate field update.
- **Codebase**: domain layer inspection for aggregate and event discovery.
- **Architecture documentation**: ADRs and architectural context for pre-refinement.
- **Definition of Ready**: `resources/dor.md` is the shared readiness baseline for all reviews.

## Install

```bash
copilot plugin install JSdotNet/Copilot:plugins/fincent
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/Copilot:plugins/fincent
```

## Uninstall

```bash
copilot plugin uninstall fincent
```
