# Copilot instructions

## Language Policy

All instructions and prompts in this repository must be written in English. This applies to:
- All rule and instruction files in `.github/instructions/`
- All prompt files in `.github/prompts/`
- All documentation and code comments intended for contributors


## Gathering Context

While gathering information, always consider the following context:
1. **Instruction Files**: Review relevant instruction files in `.github/instructions/` to ensure compliance with coding standards and best practices.
2. **Project Configuration**: Take into account settings in:
- `.editorconfig` to ensure compliance with coding standards.
- `directory.build.props`, and `Directory.Packages.props` to ensure consistency with project-wide configurations (like: like `Nullable`, `LangVersion`, `TreatWarningsAsErrors`, and central package management configurations).
3. [ARC42](https://arc42.org/) documentation in the `doc/arc42/` folder
4. **Existing Codebase**: Analyze the existing code in the project to maintain consistency in style, structure, and conventions.

## Development code generation

When working with C# code, follow these instructions very carefully.

It is **EXTREMELY important that you follow the instructions in the rule files very carefully.**

### Workflow implementation

**IMPORTANT:** Always follow these steps when implementing new features:

1. Consult any relevant instructions files listed below and start by listing which rule files have been used to guide the implementation (e.g. `Instructions used: [minimal-api.instructions.md, domain-driven-design.instructions.md]`).

2. Follow TDD when it is possible. Always start new changes by writing new test cases (or changing existing tests). 
Remember to consult [Unit Tests](./instructions/unit-test.instructions.md) for details on how to write tests.

3. Always run `dotnet test` or `dotnet build` to verify that all tests pass before committing your changes. 
Don't ask to run the tests, just do it. If you are not sure how to run the tests, ask for help. 
You can also use `dotnet watch test` to run the tests automatically when you change the code.

4. Fix any compiler warnings and errors before going to the next step.

When you see paths like `/[project]/features/[feature]/` in rules, replace [project] with the name of the project you are working on (e.g. `Ordering`), and `[feature]` with the name of the feature you are working on (e.g. `VerifyOrAddPayment`).
