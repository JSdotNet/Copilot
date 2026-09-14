# Knowledge Base Plugin — moved to `devbook`

`knowledge-base` is retired. Version `0.17.0` is its final release, and it ships nothing but a
`knowledge-base-moved` notice skill. The `.arc42` / `.domain` / `.tech` / `.design` / `.ai`
convention, the `meta` blocks, the generator, the `_meta/` indexes, the reference-graph canvas,
the CI check, and the `to-spec-<kind>` / `from-spec-<kind>` converters all continue as
**`devbook`** in the `jsdotnet` marketplace:

<https://github.com/JSdotNet/ai-agent-stack>

## Migrate

```bash
claude plugin marketplace add JSdotNet/ai-agent-stack
```

Then enable `devbook` with `/plugin`, and disable or uninstall `knowledge-base`. This release
declares `devbook@jsdotnet` as a dependency, so a host that resolves plugin dependencies
enables the replacement for you when it finds a stale `knowledge-base` enablement — but the
marketplace must be added first; a dependency cannot add one.

Nothing in a consuming repository has to move. The root dot-folders are still recognized, and
devbook also accepts them nested under one `.devbook/` parent (`.devbook/arc42`, …). Pick one
layout and never mix them. `devbook:install` reconciles the repository with the installed
release — first install, upgrade, and migration are the same idempotent run.

Two things do not carry over:

- `.backlog/` is not a devbook folder. Work items live in whatever tracker the repository
  binds (GitHub Issues, Jira); `orch-backlog` has no successor.
- The per-folder `orch-*` skills are no longer part of the convention plugin. The delivery
  engine (`delivery@jsdotnet`) carries a chapter change as `flow-arc42`, `flow-domain`,
  `flow-tech`, `flow-design`, and `flow-ai`, and reads devbook's rules from the repository.

## Where each skill went

| `knowledge-base` (≤ 0.16.0) | `jsdotnet` |
| --- | --- |
| `knowledge-base-init`, `knowledge-base-validate` | `devbook:install`, `devbook:devbook-check` |
| `knowledge-tech-update` | `devbook:devbook-tech-update` |
| `orch-arc42-content`, `orch-domain`, `orch-tech`, `orch-design`, `orch-ai` | `delivery:flow-arc42`, `flow-domain`, `flow-tech`, `flow-design`, `flow-ai` |
| `orch-backlog` | none |
| `to-spec-<kind>`, `from-spec-<kind>` (5 kinds) | same names in `devbook` |
| `knowledge-canvas` extension | `devbook-graph`, inside `devbook` |

## History

The last full release was `0.16.0`; its README, migration notes, and changelog are in this
repository's history at that tag or commit. Nothing here will be updated again.
