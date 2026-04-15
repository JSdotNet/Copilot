---
applyTo: '**/*Tests/**/*.cs'
description: GitHub Copilot instructions for writing .NET unit tests with builders and TestDataHelpers
---

# Unit test instructions for Copilot

## Purpose

Guide generation of C#/.NET unit tests following repository TDD and builder-first patterns.

## Core Rules

- Follow TDD where possible.
- Use Arrange/Act/Assert comments.
- Prefer builders and test data helpers in Arrange.
- Keep assertions deterministic and intention-revealing.
- Cover happy path, failure path, and one edge case.

## Done Criteria

- Affected tests pass with `dotnet test`.
- No unresolved TODO/FIXME introduced.
- Test arrangement remains concise and reusable.
