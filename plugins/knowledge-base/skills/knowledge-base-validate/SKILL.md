---
name: knowledge-base-validate
description: 'Validate and repair the .arc42/.domain/.tech/.design/.backlog knowledge folders — resolve broken metadata references, fix reading order, add missing meta blocks, and refresh stale _meta indexes. Use when: the knowledge-meta check fails, CI reports stale indexes, references do not resolve. Triggers on: "knowledge-meta failed", "broken reference", "stale _meta", "validate knowledge folders", "knowledge base check", "build.mjs --check".'
---

# Knowledge base validate

## Purpose

Run the `knowledge-meta` check over a repository's knowledge folders and repair
whatever it reports: unresolved references, inconsistent reading order, missing
or malformed `meta` blocks, and stale committed `_meta/` indexes.

## Steps

1. **Run the check** from the repository root:

   ```
   node .github/tools/knowledge-meta/build.mjs --check
   ```

   Exit codes:

   | Code | Meaning | Action |
   |------|---------|--------|
   | `0` | Every reference resolves, order is consistent | Go to step 4 |
   | `1` | One or more problems at `error` severity | Go to step 2 |
   | `2` | No knowledge folder found | Wrong directory, or the repo has not adopted the convention — run `knowledge-base-init` instead |

   `--check` parses and reports without writing. Add `--root <path>` when running
   from outside the repository root, and `--scope <folder>` to narrow the run to
   one knowledge folder.

2. **Fix the reported problems.** Each problem names the file it came from.
   Common causes and the correct fix:

   | Problem | Cause | Fix |
   |---------|-------|-----|
   | Unresolved reference | A `related`, `depends-on`, or `refines` target was renamed, moved, or never existed | Repoint the reference at the real chapter, or remove it if the relationship is gone. Never delete the target to silence the error. |
   | Missing `meta` block | A chapter was added without one | Add a block per `knowledge-chapter-metadata.instructions.md` |
   | Malformed `meta` block | Wrong field name, wrong value shape, or bad fencing | Correct it against `knowledge-chapter-metadata.instructions.md` |
   | Inconsistent reading order | Duplicate or missing `order` values within a folder | Renumber the affected folder so `order` is unique and gapless |
   | Unknown status or kind | A value outside the allowed ladder | Use one of the values listed in the folder's own instruction file |

   Fix the **source Markdown**, never the generated JSON. Anything under `_meta/`
   is derived; see `knowledge-derived-artifacts.instructions.md`.

3. **Re-run the check** until it exits `0`.

4. **Refresh the derived indexes** and commit them:

   ```
   node .github/tools/knowledge-meta/build.mjs
   git diff --stat -- "*_meta/*.json"
   ```

   Output is deterministic — no timestamps — so a clean `git diff` means the
   committed indexes were already current. Any diff must be committed alongside
   the Markdown change that caused it, otherwise CI fails on stale indexes.

## When CI fails but local is clean

The workflow runs the same two commands. A CI-only failure almost always means
the `_meta/` changes were not committed. Re-run step 4 and commit the result.

If the generator itself is missing from the repository, install it with the
`knowledge-base-init` skill rather than copying files ad hoc.

## Do not

- Do not hand-edit files under `_meta/` to make the check pass.
- Do not delete a chapter to resolve a dangling reference — repoint the reference.
- Do not weaken or remove the CI workflow to get a pull request green.
