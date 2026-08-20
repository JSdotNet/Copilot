---
name: react-component
description: 'Write or change a React component so it matches the patterns already in the repository — composition, typing, state placement, data fetching, and accessibility. Use when implementing UI from an approved plan.'
---

# React Component Implementation

Match the repository before matching any general best practice. The nearest existing
component is the specification for structure, naming, and typing.

## When To Use

- Implementing a UI step from an approved plan.
- Extending or restructuring an existing component.
- Reviewing a component change for consistency with the codebase.

## Before Writing Code

1. Apply `frontend-stack-detect` to fix the React version, router, state, data-fetching, and
   styling libraries.
2. Open the closest existing component of the same kind — page, container, form, list, or
   presentational — and note its file layout, export style, prop typing, and test companion.
3. Bind data with `api-client-contract` before building the view, so props are typed from the
   contract.

## Structure

- Place the component where its siblings live, using the folder and file naming already used.
- Match the export convention of the surrounding files rather than introducing a second one.
- Keep one component per file unless the repository already colocates small subcomponents.
- Separate the data-owning container from the presentational component when the surrounding
  code makes that separation.
- Extract a hook when logic is reused or when a component's body mixes two unrelated concerns.

## Typing

- Type props explicitly; do not rely on inference across a module boundary.
- Reuse contract types rather than restating fields locally.
- Prefer a discriminated union over a set of optional booleans for mutually exclusive states.
- No `any`, no unchecked cast, and no non-null assertion to silence the compiler.
- Respect the project's TypeScript strictness; never relax `tsconfig` to make code compile.

## State And Data

- Keep state at the lowest level that still serves every consumer.
- Server data belongs in the detected data-fetching layer, not mirrored into local state.
- Derive values during render instead of storing a second copy that can drift.
- Use an effect only for synchronizing with something outside React; do not use one to
  compute derived values.
- Give every asynchronous view an explicit loading, empty, and error branch.

## Accessibility

- Use the semantic element first; reach for a role only when no element fits.
- Every input has an associated label, and every control is reachable and operable by keyboard.
- Announce asynchronous state changes to assistive technology, not only visually.
- Never convey meaning through color alone.
- Keep focus handled deliberately across route changes, dialogs, and revealed content.

## Styling

- Use the detected styling approach and the project's design tokens.
- Do not introduce a second styling mechanism alongside the existing one.
- Do not hardcode a color, spacing, or font value that a token already covers.

## Validation

Run the detected commands and report each result:

1. Typecheck.
2. Lint.
3. Tests for the changed area, written with `react-testing`.
4. Production build.

## Quality Checks

- The component mirrors the nearest existing sibling's structure and conventions.
- Props and data are typed from the contract, with no escape hatches.
- Loading, empty, and error states are all handled.
- Accessibility rules above are satisfied.
- Detected typecheck, lint, test, and build results are reported.
