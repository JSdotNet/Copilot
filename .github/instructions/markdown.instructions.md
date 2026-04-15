---
applyTo: '**/*.md'
---

# Global Markdown Rules

## Purpose
- Apply these rules to every Markdown file in this repository.
- Treat this file as the baseline for Markdown quality and lint safety.

## Required Formatting Rules
- Use ATX headings only (`#`, `##`, `###`, ...), with one space after `#`.
- Keep exactly one top-level heading (`#`) per file.
- Do not leave trailing whitespace.
- End every file with exactly one newline.

## Lists
- Use `-` for unordered lists.
- Use ordered lists as `1.`, `2.`, `3.` when sequence matters.

## Code and Commands
- Wrap inline commands, paths, env vars, and identifiers in backticks.
- Use fenced code blocks with language tags when possible.

## Quality Checklist
- [ ] One `#` heading per file.
- [ ] No trailing spaces.
- [ ] Code blocks are fenced.
- [ ] Links and lists render correctly.
