---
applyTo: '**/*.md'
---

# Global Markdown Rules

## Purpose
- Apply these rules to every Markdown file in this repository.
- Treat this file as the baseline for Markdown quality and lint safety.
- Apply rules in this order when trade-offs exist: heading format, whitespace/newline safety, then list and code formatting.

## Required Formatting Rules
- Use ATX headings only (`#`, `##`, `###`, ...) for all heading levels, ensuring one space after each `#`.
- Keep exactly one top-level heading (`#`) per file.
- Do not leave trailing whitespace.
- End every file with exactly one newline.
- Example: `## Section Title`.

## Lists
- Use `-` for unordered lists.
- Use ordered lists as `1.`, `2.`, `3.` when sequence matters.
- Example: `- Item` and `1. First step`.

## Code and Commands
- Wrap inline commands, paths, env vars, and identifiers in backticks.
- Use fenced code blocks with language tags when possible.
- Example: use ```` ```bash ```` for shell commands.

## Quality Checklist
- [ ] One `#` heading per file.
- [ ] No trailing spaces.
- [ ] Code blocks are fenced.
- [ ] Links and lists render correctly.
