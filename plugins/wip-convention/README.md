# WIP Convention Plugin

Encapsulates the `.wip` folder convention for storing work-in-progress artifacts. Provides skills and instructions to align agents with the `.wip` workflow.

## Installation

```bash
copilot plugin install JSdotNet/Copilot:plugins/wip-convention
```

After installation, re-install if you make changes to the plugin:

```bash
copilot plugin install JSdotNet/Copilot:plugins/wip-convention
```

## Features

### Skill: `wip-align`

Directs agents to use the `.wip` folder convention correctly.

**Trigger keywords:** `.wip`, `wip convention`, `work in progress`, `store artifact`, `planning artifact`, `where to store`, `artifact placement`

**What it provides:**

- Folder structure explanation
- Artifact placement rules
- Naming conventions
- Quick reference examples

### Quality contracts (`resources/`)

Read by path from the `wip-align` skill. Neither host auto-applies a file from inside a
plugin, so the skill names the contract for the artifact type it is placing; a repository that
wants them applied on every matching read copies them into `.agents/rules/` with a wrapper
per host.

| File | Governs | Purpose |
|------|---------|---------|
| `wip-stories.md` | `.wip/work/*/story-*.md` | Story quality standards |
| `wip-epics.md` | `.wip/work/*/epic-*.md` | Epic quality standards |
| `wip-bugs.md` | `.wip/work/*/bug-*.md` | Bug quality standards |
| `wip-ideas.md` | `.wip/ideas/*.md` | Idea quality standards |
| `wip-proposals.md` | `.wip/proposals/*.md` | Proposal quality standards |
| `wip-confidence.md` | `.wip/work/**/*.md` | 97% confidence threshold |

### Hook configuration

- `hooks.json` adds a session-start guardrail prompt to keep artifact placement aligned with the `.wip` convention.

## Folder Structure

After using this convention, your repository will have:

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

## Usage

### Invoke the Skill

When you need guidance on where to store an artifact:

> "I need to store a planning artifact using the wip convention"

Or simply mention `.wip` in your request:

> "Create a new story in .wip for user authentication"

### Create Artifacts

The `wip-align` skill loads the matching contract when you create or edit files at these paths:

```bash
# Stories
.wip/work/auth/story-user-login.md

# Epics
.wip/work/payments/epic-checkout-flow.md

# Bugs
.wip/work/cart/bug-quantity-overflow.md

# Ideas
.wip/ideas/idea-ai-recommendations.md

# Proposals
.wip/proposals/proposal-event-sourcing.md
```

## Confidence Threshold

When working on planning artifacts in `.wip/work/**/*.md`, agents must:

1. Show their confidence percentage at every exchange
2. Ask clarifying questions until reaching 97% confidence
3. Only then propose implementation details

## License

MIT
