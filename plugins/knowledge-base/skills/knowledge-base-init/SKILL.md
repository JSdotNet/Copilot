---
name: knowledge-base-init
description: 'Scaffold the .arc42/.domain/.tech/.design/.backlog knowledge-folder convention into a repository, install the knowledge-meta generator and its CI check, and generate the first derived indexes. Use when: adopting the knowledge folders, bootstrapping documentation structure, adding .arc42 or .domain to a repo. Triggers on: "knowledge base", "knowledge folders", "scaffold .arc42", "scaffold .domain", "set up .tech", "set up .design", "knowledge-meta", "adopt knowledge convention".'
---

# Knowledge base init

## Purpose

Materialize the knowledge-folder convention in a target repository: create the
folders the project actually needs, install the `knowledge-meta` generator and
its CI workflow, optionally add repository routing policy, and produce the first
`_meta/` indexes.

Run this once per repository. Re-running is safe — it never overwrites existing
content, only fills gaps.

## Recognized folders

| Folder | Holds | Adopt when |
|--------|-------|-----------|
| `.arc42/` | arc42 architecture chapters, ADRs, TDRs | The system has architecture worth recording |
| `.domain/` | Bounded contexts, ubiquitous language, aggregates | The project models a non-trivial domain |
| `.tech/` | Technology graph: platforms, runtimes, frameworks, versions | The stack has layers or versions worth tracking |
| `.design/` | UX and visual design guidelines and tokens | The product has a user interface |
| `.backlog/` | Durable work-item chapters | Work is planned as Markdown, not only in a tracker |

Adopt only what the repository will actually maintain. An empty knowledge folder
is worse than an absent one — the generator skips folders that do not exist, and
partial adoption is fully supported.

## Steps

1. **Confirm scope.** Ask the user which folders to adopt, defaulting to the ones
   the repository plausibly needs based on what is already in it. Do not adopt all
   five by reflex.

2. **Create the folders.** For each adopted folder create the directory and a
   starting chapter with a valid `meta` block, following the matching instruction
   file:
   - `.arc42/` → `knowledge-arc42.instructions.md`
   - `.domain/` → `knowledge-domain.instructions.md`
   - `.tech/` → `knowledge-tech.instructions.md`
   - `.design/` → `knowledge-design.instructions.md`
   - `.backlog/` → `knowledge-backlog.instructions.md`

   Every chapter needs a `meta` block; see
   `knowledge-chapter-metadata.instructions.md` for the required fields.

3. **Install the generator.** Copy `tools/knowledge-meta/` from the plugin root
   into the repository as `.github/tools/knowledge-meta/`. Copy the whole folder —
   it is self-contained (`build.mjs`, `graph.mjs`, `outline.mjs`, `metadata.mjs`,
   `README.md`) and has no dependencies beyond Node.

4. **Install the CI check.** Copy `assets/workflows/knowledge-meta.yml` from the
   plugin root into `.github/workflows/knowledge-meta.yml`, then trim the `paths`
   filters to the adopted folders and change the branch name if the repository's
   default branch is not `main`.

   If the repository has no GitHub Actions setup, skip this step and tell the
   user the generator must be run manually before committing.

5. **Offer repository routing policy.** Show the user `assets/routing-snippet.md`
   from the plugin root and offer to merge the relevant parts into the
   repository's `.github/copilot-instructions.md` and routing instructions. This
   is optional and repository-specific — never apply it silently.

6. **Generate the indexes.**

   ```
   node .github/tools/knowledge-meta/build.mjs
   ```

   This writes `_meta/graph.json` and `_meta/index.json` at the repository root
   and inside each adopted folder. Commit the generated files — CI compares
   against them.

7. **Verify.**

   ```
   node .github/tools/knowledge-meta/build.mjs --check
   ```

   Exit code `0` means every reference resolves and reading order is consistent.
   Exit code `2` means no knowledge folder was found — step 2 did not run or ran
   in the wrong directory.

## Notes

- The generator resolves the repository root from the current working directory;
  pass `--root <path>` when running it from elsewhere.
- Never hand-edit anything under `_meta/`; see
  `knowledge-derived-artifacts.instructions.md`.
- Once the folders exist, the plugin's instruction files auto-apply to them, and
  the `knowledge-canvas` extension can render the resulting graph.
