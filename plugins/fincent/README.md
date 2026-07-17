# fincent

Installable GitHub Copilot CLI plugin for Fincent project story review, pre-refinement,
domain alignment, PR review, and story point estimation workflows.

## Story Readiness Pipeline

Stories move through a sequential pipeline. Each step gates the next — a ❌ result
stops the pipeline and must be resolved before proceeding.

```mermaid
flowchart TD
    A([Story]) --> B[story-review-po\nPO Review]
    B -->|❌ Not ready| B_STOP([Stop — fix PO issues])
    B -->|✅/⚠️| C[story-review-domain\nDomain Review]
    C -->|❌ Misaligned| C_STOP([Stop — fix domain issues])
    C -->|✅/⚠️| D[story-review-pre-refinement\nArchitecture Review]
    D -->|❌ Not ready| D_STOP([Stop — fix architecture issues])
    D -->|✅/⚠️| E[story-point-estimation\nEstimation]
    E --> F([Ready for Sprint])

    style B_STOP fill:#f88,stroke:#c00
    style C_STOP fill:#f88,stroke:#c00
    style D_STOP fill:#f88,stroke:#c00
    style F fill:#8f8,stroke:#080
```

PR reviews run independently, parallel to the pipeline. `pr-vs-story` verifies delivery
against the story; `pr-review-domain` and `pr-review-architecture` verify code quality:

```mermaid
flowchart LR
    PR([Pull Request]) --> PD[pr-review-domain\nDomain Review]
    PR --> PA[pr-review-architecture\nArchitecture Review]
    PR --> PS[pr-vs-story\nStory Coverage]
    PD --> MERGE([Merge decision])
    PA --> MERGE
    PS --> MERGE
```

## Skills

### Core Skills (sequential pipeline)

| Skill | Gate | Purpose |
|-------|------|---------|
| `story-review-po` | — | Validate story format, DOR basics, title quality |
| `story-review-domain` | PO ✅/⚠️ | Ubiquitous language, aggregates, domain events |
| `story-review-pre-refinement` | PO ✅/⚠️ + Domain ✅/⚠️ | Architecture fit, risks, enabler check |
| `story-point-estimation` | All three ✅/⚠️ | Three-factor Fibonacci estimate |

### PR Review Skills (independent)

| Skill | Purpose |
|-------|---------|
| `pr-review-architecture` | Layer boundaries, ADR compliance, NFRs, security |
| `pr-review-domain` | Domain layer purity, event naming, aggregate design |
| `pr-vs-story` | Verify PR delivers all story acceptance criteria; flag out-of-scope changes |

### Automation Skills (batch-by-Jira-status)

| Skill | Purpose |
|-------|---------|
| `automation-story-review-po` | Batch PO review across all stories in a status |
| `automation-story-review-pre-refinement` | Batch architecture review with enabler drafting |
| `automation-story-review-domain` | Batch domain review with codebase inspection |
| `automation-story-point-estimation` | Batch estimation with drift reporting |

### Reporting & Presentation Skills

| Skill | Purpose |
|-------|---------|
| `sprint-report` | Sprint report: completed vs scope, untested, by epic |
| `automation-sprint-report` | Batch sprint reports for multiple sprints / a release |
| `demo-presentation` | Generate a Fincent Review demo presentation (PPTX structure) |

## Resources

- `resources/dor.md` — Fincent Definition of Ready (the shared readiness baseline)
- `resources/templates/story-review-checklist.md` — review and estimation checklist

## Dependencies

All Jira interactions are handled by a **discovered Jira skill**. The automation skills
scan installed skills at runtime for one that can retrieve, create, or update Jira issues.
No specific plugin name is required.

If no Jira skill is found, automations fall back gracefully: ask the user to paste story
content and skip Jira write-back steps.

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
