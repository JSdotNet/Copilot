# GitHub Copilot Instructions

## Priority Guidelines

When generating changes for this repository:

1. Preserve compatibility with the customization asset formats and manifest schema currently used in this codebase.
2. Prioritize conventions already defined in `.github/instructions/**/*.md`.
3. Follow established patterns in existing plugin bundles under `plugins/*`.
4. Maintain the current plugin-based monorepo structure.
5. Prioritize maintainability, consistency, and traceability over introducing new patterns.

## Brevity And Signal

Less is more.

- Prefer concise rules over repeated explanations.
- Do not restate a rule already covered by a higher-priority instruction.
- If something is important, highlight it once with a clear directive instead of duplicating it in multiple sections.

## Technology And Version Detection

Before generating any output, detect the repository context from existing files:

1. Primary asset types in this repository are Markdown customization assets and JSON plugin manifests.
2. No runtime dependency manifests were found in this repository root structure (for example `package.json`, `.csproj`, `pom.xml`, `requirements.txt`).
3. Plugin manifest versions follow Semantic Versioning style (`0.1.0`, `1.0.0`) in files such as:
   - `plugins/development/.github/plugin/plugin.json`
   - `plugins/copilot-spec-builder/.github/plugin/plugin.json`
   - `plugins/documentation/.github/plugin/plugin.json`

Never assume runtime framework versions when they are not explicitly present in the repository.

## Context File Priority

When generating or editing customization assets, use this source priority:

1. `.github/instructions/markdown.instructions.md`
2. `.github/instructions/customization-structure.instructions.md`
3. `.github/instructions/agent-language-and-tone.instructions.md`
4. `.github/instructions/agent-handoff.instructions.md` (when editing agent files)
5. Existing plugin-local authoring instructions, for example:
   - `plugins/copilot-spec-builder/instructions/authoring/create-agent.instructions.md`
   - `plugins/copilot-spec-builder/instructions/authoring/create-instruction.instructions.md`
   - `plugins/copilot-spec-builder/instructions/authoring/create-plugin.instructions.md`
   - `plugins/copilot-spec-builder/instructions/authoring/create-skill.instructions.md`

When rules overlap, keep the highest-priority rule and remove duplicates from lower-priority assets.

## Repository Architecture Patterns

Follow the plugin package composition already used across `plugins/*`:

- `agents/` for `.agent.md` files.
- `instructions/` for scoped `.instructions.md` files.
- `skills/` for skill folders containing `SKILL.md`.
- `resources/` for reusable domain guidance.
- `.github/plugin/plugin.json` for plugin manifest metadata.

Each plugin must be installable and usable on its own.

- Do not require another local plugin to provide mandatory behavior.
- Avoid hard dependencies on assets outside the plugin being authored.
- If cross-plugin references are optional, mark them as optional and provide an in-plugin fallback.

Concrete examples:

- `plugins/copilot-spec-builder/`
- `plugins/copilot-plugin-manager/`
- `plugins/architecture/`
- `plugins/development/`
- `plugins/wip-convention/`

Do not introduce a new top-level plugin layout unless the user explicitly requests a structural change.

## Naming And File Conventions

Use naming conventions observed in this repository:

- Agent files: `{role}.agent.md` (example: `plugins/development/agents/backend.agent.md`).
- Instruction files: `*.instructions.md` with `applyTo` and `description` frontmatter.
- Skill entry files: `SKILL.md` with frontmatter `name` and `description`.
- Plugin manifests: `.github/plugin/plugin.json` with keys such as `name`, `description`, `version`, `author`, `keywords`, `agents`, `skills`.

Preserve existing capitalization and file naming patterns exactly.

## Markdown Authoring Standards

For Markdown files, follow the active repository baseline:

- Use ATX headings only (`#`, `##`, `###`, ...).
- Keep exactly one top-level heading per file.
- Use `-` for unordered lists.
- Use ordered lists with `1.`, `2.`, `3.`.
- Use fenced code blocks with language tags when possible.
- Remove trailing whitespace.
- End files with exactly one newline.

Source: `.github/instructions/markdown.instructions.md`.

## Instruction Authoring Standards

When creating or updating `.instructions.md` files:

- Include YAML frontmatter with `applyTo` and `description`.
- Keep `applyTo` scope narrow and explicit.
- Write rules as actionable statements.
- Separate mandatory requirements from recommendations.
- Avoid duplication when guidance already exists in another instruction file.
- Keep instruction content in English.

Source: `plugins/copilot-spec-builder/instructions/authoring/create-instruction.instructions.md`.

## Agent Authoring Standards

When creating or updating `.github/agents/**/*.md`:

- Include explicit `model` in frontmatter (`GPT-5.3-Codex`, `GPT-5`, or `auto`).
- Include role purpose, expected behavior, constraints, examples, and references.
- For cross-agent transitions, request explicit user approval before handoff.

Sources:

- `.github/instructions/meta-agent.instructions.md`
- `.github/instructions/agent-handoff.instructions.md`

## Skill And Plugin Standards

When authoring skills and plugins:

- Keep skill definitions focused, with clear trigger intent and expected output.
- Keep plugin manifests aligned to existing schema and folder pointers.
- Keep assets in English for `.github/**` customization content.
- Prefer standalone plugin behavior; a plugin should function when installed alone.

Examples:

- `plugins/copilot-spec-builder/skills/create-instruction/SKILL.md`
- `plugins/development/.github/plugin/plugin.json`

## Codebase Scanning Instructions

If explicit guidance is missing:

1. Find the closest existing file of the same asset type.
2. Reuse its frontmatter structure and section order.
3. Reuse naming and wording style from sibling files in the same plugin.
4. Prefer repository-level instructions over plugin-local preferences when they conflict.
5. If two patterns conflict and both are common, ask the user before introducing a new variant.

While scanning, remove redundant guidance and keep only the highest-signal rule set for the task.

## Scope Boundaries

This repository primarily defines Copilot customization assets, not runtime application source code.

When the user asks for runtime implementation details, first check whether the request should be represented as one of these assets:

- Agent
- Instruction
- Skill
- Prompt
- Plugin manifest or plugin composition

Only propose runtime code patterns when concrete runtime code and version constraints are present in scope.

## Output Quality Checklist

Before finalizing generated changes:

- Verify file placement matches the existing plugin and `.github` structure.
- Verify frontmatter keys and naming conventions match neighboring files.
- Verify Markdown formatting rules are satisfied.
- Verify guidance is based on observed repository patterns.
- Verify no unverified framework or library assumptions were introduced.
- Verify consistency with Semantic Versioning style used in plugin manifests.
- Verify duplicate or restated guidance has been removed.
- Verify plugin assets do not depend on another plugin for required functionality.

## Project-Specific Guidance

- Prefer consistency with existing repository conventions over generic external best practices.
- Use concise, direct, and friendly language in customization assets.
- Keep changes minimal and scoped to the requested asset.
- When uncertain, ask a targeted clarification question instead of inventing conventions.
