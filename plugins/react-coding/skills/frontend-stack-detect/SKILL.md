---
name: frontend-stack-detect
description: 'Detect a repository frontend stack from its own files — package manager, React version, routing, state, data fetching, styling, test runner, and the exact build, typecheck, lint, and test commands. Use before any frontend edit or validation run so no framework or command is assumed.'
---

# Frontend Stack Detection

Read the stack out of the repository. Never assume a framework version, a package manager,
or a command name.

## When To Use

- Before the first frontend edit in a session.
- Before running any frontend validation command.
- When a handoff, plan, or issue names a library the repository may not actually use.

## Detection Order

Work outside in and stop at the first authoritative source for each value.

1. Locate the frontend root. Look for a `package.json` that declares `react` as a dependency.
   Common roots: repository root, `src/Web/`, `src/web/`, `web/`, `frontend/`, `client/`,
   `app/`, or a workspace member folder.
2. Read the frontend `package.json`: `dependencies`, `devDependencies`, `scripts`,
   `packageManager`, `workspaces`, and `type`.
3. Read the lockfile next to it to fix the package manager.
4. Read `tsconfig.json` (and any referenced base config) for strictness, path aliases, and
   JSX mode.
5. Read the bundler or framework config file.
6. Read the test runner config, then confirm against an existing test file.
7. Read `.eslintrc*`, `eslint.config.*`, `biome.json`, or `.prettierrc*` for lint and format.
8. Confirm library choices against real usage in source, not just the manifest — a
   dependency may be present but unused.

## Package Manager

Resolve from the lockfile, then cross-check the `packageManager` field:

| Lockfile | Manager | Install | Run a script |
|---|---|---|---|
| `pnpm-lock.yaml` | pnpm | `pnpm install --frozen-lockfile` | `pnpm run <script>` |
| `yarn.lock` | Yarn | `yarn install --immutable` | `yarn <script>` |
| `package-lock.json` | npm | `npm ci` | `npm run <script>` |
| `bun.lockb` or `bun.lock` | Bun | `bun install --frozen-lockfile` | `bun run <script>` |

Rules:

- The lockfile wins. Never run a manager whose lockfile is absent.
- In a monorepo, note whether scripts run from the workspace root with a filter or from the
  package folder, and record the exact invocation.

## Values To Report

Report every value with the file that proved it, and mark anything unproven as an assumption.

- Frontend root, and workspace layout if any.
- Package manager, lockfile, and install command.
- React version, and whether the project is on the React Compiler or legacy `memo` patterns.
- Meta-framework or bundler, and its config file.
- Router, state management, data fetching, and form libraries.
- Component library, styling approach, and design token source.
- Test runner, component testing library, and E2E tool.
- TypeScript strictness, `noUncheckedIndexedAccess`, and path aliases.
- Lint and format tooling.
- Commands for: install, dev, build, typecheck, lint, test, test-watch, format.

## Command Resolution

Prefer a declared script over a raw tool invocation, so the project's own flags apply.

1. If `scripts` declares the gate, use `<manager> run <script>`.
2. If it does not, use the closest raw equivalent and mark it as a fallback:
   - typecheck: `tsc --noEmit -p <tsconfig>`
   - lint: the detected linter's own CLI
   - test: the detected runner's own CLI in non-watch mode
   - build: the detected bundler's build command
3. If neither exists, report the gate as unavailable. Do not invent a command, and do not
   report the gate as passed.

Force non-interactive, non-watch execution for test runs so a gate cannot hang.

## Output Format

```text
Frontend root: <path>            (evidence: <file>)
Package manager: <name>          (evidence: <lockfile>)
React: <version>                 (evidence: package.json)
Bundler/framework: <name>        (evidence: <config file>)
Router / state / data: <libs>    (evidence: <files>)
Styling: <approach>              (evidence: <files>)
Tests: <runner> + <library>      (evidence: <config>, <example test>)
TypeScript: <strictness notes>   (evidence: tsconfig.json)
Commands:
  install   <command>
  typecheck <command>   [script | fallback | unavailable]
  lint      <command>   [script | fallback | unavailable]
  test      <command>   [script | fallback | unavailable]
  build     <command>   [script | fallback | unavailable]
Assumptions: <list, or "none">
```

## Quality Checks

- Every reported value names the file that proved it.
- No command was invented; fallbacks and gaps are labelled as such.
- The package manager matches the lockfile actually present.
- Library claims were confirmed in source, not only in `package.json`.
- Monorepo invocations record where the command must run from.
