---
name: react-testing
description: 'Write React component and hook tests that assert user-visible behavior with accessible queries, using the test runner the repository already has. Use when adding or updating frontend tests.'
---

# React Component And Hook Testing

Test what a user can observe. A test that asserts internal state or a rendered class name
locks in the implementation and blocks refactoring.

## When To Use

- Adding tests for new UI behavior from an approved plan.
- Updating tests after a component or hook change.
- Diagnosing a frontend test that fails intermittently.

## Before Writing Tests

1. Apply `frontend-stack-detect` to fix the test runner, component testing library, setup
   file, and the non-watch test command.
2. Open the nearest existing test for the same kind of unit and reuse its file placement,
   naming, setup, and mocking approach.
3. Never introduce a second test runner or a second assertion style alongside the existing one.

## What To Assert

- Assert the rendered result and the effects a user can perceive.
- Query by role, label, and visible text. Fall back to a test id only when no accessible
  query can reach the element, and say why.
- Drive interaction through the library's user-event layer so focus, typing, and pointer
  behavior are realistic.
- Cover the happy path, one failure path, and one edge case per behavior.
- Assert the loading, empty, and error branches of every asynchronous view.

## What Not To Assert

- Internal state, refs, or hook call counts.
- CSS class names, inline styles, or DOM structure as a proxy for behavior.
- Snapshot output as the only assertion for a behavior.
- A mock's call arguments when the observable result already proves the behavior.

## Async And Determinism

- Await the library's async utilities rather than a fixed timer.
- Never assert immediately after an interaction that triggers a request.
- Use fake timers only for code that owns a timer, and restore real timers afterwards.
- Reset handlers, mocks, and any shared client between tests so order cannot matter.
- Avoid a real network call: stub at the network boundary the repository already stubs at.

## Hooks

- Test a hook through the library's hook-rendering utility, or through a small host component
  when the hook depends on context.
- Provide the real providers the hook needs rather than mocking the provider away.
- Assert the value the hook returns and the effects it causes, not its internal sequence.

## Validation

Run the detected commands in non-watch mode and report both:

1. The frontend test command, scoped to the changed area first, then the full suite.
2. The typecheck command, so test types are checked too.

## Quality Checks

- Queries are accessible-first, with any test id justified.
- Happy path, failure path, and one edge case are covered per behavior.
- No prohibited assertion from the list above is present.
- Tests pass in isolation and in a full run, with no fixed-delay waits.
- Detected test and typecheck results are reported.
