---
name: wip-align
description: 'Align with the .wip folder convention for storing work-in-progress artifacts. Use when: creating stories, epics, bugs, ideas, proposals, or any planning artifact. Triggers on: ".wip", "wip convention", "work in progress", "store artifact", "planning artifact", "where to store", "artifact placement".'
---

# WIP Alignment Skill

## Purpose

Direct agents to use the `.wip` folder convention correctly when storing work-in-progress artifacts.

## Folder Structure

```
.wip/
├── ideas/                  # Lightweight idea capture
│   └── idea-<short-title>.md
├── implementation-plans/   # Execution blueprints
│   └── plan-<feature>.md
├── proposals/              # Technical proposals
│   └── proposal-<short-title>.md
└── work/                   # Backlog artifacts by module
    └── <module>/
        ├── epic-<short-title>.md
        ├── story-<short-title>.md
        └── bug-<short-title>.md
```

## Artifact Placement Rules

| Artifact Type | Location | Naming Pattern |
|---------------|----------|----------------|
| User Story | `.wip/work/<module>/` | `story-<short-title>.md` |
| Epic | `.wip/work/<module>/` | `epic-<short-title>.md` |
| Bug | `.wip/work/<module>/` | `bug-<short-title>.md` |
| Idea | `.wip/ideas/` | `idea-<short-title>.md` |
| Proposal | `.wip/proposals/` | `proposal-<short-title>.md` |
| Implementation Plan | `.wip/implementation-plans/` | `plan-<feature>.md` |

## Naming Conventions

- Use lowercase with hyphens for `<short-title>` (e.g., `story-user-login.md`)
- Use one module depth only in `.wip/work/` (no nested modules)
- Keep related epic, story, and bug files in the same module folder

## When to Use Each Folder

### `.wip/ideas/`

- Lightweight problem/value-hypothesis notes
- Early-stage concepts not yet refined into epics or stories
- Quick capture before deeper analysis

### `.wip/proposals/`

- Technical proposals requiring review
- Architecture or design decisions under discussion
- RFCs or ADR drafts before finalization

### `.wip/work/<module>/`

- Backlog items ready for refinement
- Epics describing product outcomes
- Stories sized for one sprint
- Bugs with reproducible steps

### `.wip/implementation-plans/`

- Detailed execution blueprints
- Step-by-step implementation guidance
- Handoff artifacts from planning to development

## Handoff Artifacts

When handing off work between agents, always:

1. Store partial artifacts under `.wip/`
2. Reference the file path in the handoff context
3. Use the appropriate subfolder based on artifact type

## Quick Reference

```
# Creating a new story
.wip/work/ordering/story-cart-checkout.md

# Creating a new epic
.wip/work/ordering/epic-payment-integration.md

# Creating a new bug
.wip/work/ordering/bug-price-rounding.md

# Creating a new idea
.wip/ideas/idea-ai-recommendations.md

# Creating a proposal
.wip/proposals/proposal-event-sourcing.md

# Creating an implementation plan
.wip/implementation-plans/plan-payment-integration.md
```

## Integration with Instructions

When you create or edit files in `.wip/`, the corresponding instruction files auto-apply:

- `.wip/work/*/story-*.md` → Story writing instructions
- `.wip/work/*/epic-*.md` → Epic writing instructions
- `.wip/work/*/bug-*.md` → Bug writing instructions
- `.wip/ideas/*.md` → Idea writing instructions
- `.wip/proposals/*.md` → Proposal writing instructions
- `.wip/work/**/*.md` → Confidence threshold (97%) for planning artifacts
