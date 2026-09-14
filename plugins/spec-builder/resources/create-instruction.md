---
name: create-instruction
description: Where a rule lives and what it carries — a repository rule with one wrapper per host, or a plugin contract in resources/.
---

# Create Instruction

A rule has exactly two homes, and which one decides its shape.

## A repository rule

Guidance for people working *in* this repository, scoped to a path glob:

```
.agents/rules/<topic>.md                     the rule. One copy. name / description / paths.
  ├── .claude/rules/<topic>.md               wrapper: paths verbatim → one sentence pointing back
  └── .github/instructions/<topic>.instructions.md
                                             wrapper: applyTo = paths joined with "," → pointer
```

- The shared file carries `name`, `description`, and a `paths` list, and is host-neutral.
- A wrapper is frontmatter and one sentence. It never restates the rule; a third host adds a
  third wrapper, never a second copy. `node tools/check-assets.mjs` fails when a wrapper's
  glob drifts from the shared `paths`.
- Change the rule and both wrappers in the same commit.

## A plugin contract

Shared text a skill or an agent reads by path — a rule of the craft, a template, a schema:

- `resources/<name>.md` with `name` and `description` frontmatter. Never `applyTo` or `paths`:
  neither host auto-applies a glob from inside a plugin, so a glob there is one host's spelling
  on a file no host reads it from.
- It reaches a session only through an explicit relative-path reference from a skill or an
  agent. Add that reference in the same change — an unreferenced contract silently does
  nothing in either host. A rule that must apply with no reference is promoted to the plugin's
  `hooks.json` `sessionStart` prompt instead.
- Name the file for what it governs, and cross-reference a sibling by bare filename.
- Carry every layout the contract supports when it names a path in the consuming repository —
  `.arc42/` and `.devbook/arc42/` alike.

## Either way

- Write rules as actionable statements; separate mandatory rules from recommendations.
- Keep each rule in the one file that owns it; point at the others by path.
- Follow [spec-conciseness.md](spec-conciseness.md) for pruning and the 60-line budget.

## Validation Checklist

- [ ] Repository rule: `paths` in the shared file, both wrappers present and derivable.
- [ ] Plugin contract: `name` + `description` only, referenced by path from at least one
      skill or agent, or promoted to `sessionStart`.
- [ ] `description` is specific and discoverable.
- [ ] Every line changes behavior versus the model default, and no meaning appears twice.
