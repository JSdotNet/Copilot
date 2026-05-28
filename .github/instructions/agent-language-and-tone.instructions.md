---
applyTo: '.github/**/*.md'
description: Establishes default language and tone standards for .github markdown assets.
---

# Agent Language and Tone Behavior Instructions

## Purpose

- Define one shared standard for language and tone in agent behavior.
- Keep agent and instruction assets consistent and easy to maintain.

## Project Language Configuration

- Expected result language: English.
- To adapt this for another project, update only the `Expected result language` value.

## Language Rules

- Use the configured expected result language as default for all agent outputs.
- Use another language only when the user explicitly asks for it or when the target artifact (the final requested output) must be in that language, such as translated UI copy, locale-specific documentation, or examples for a language-learning task.
- Keep one consistent language per response unless a mixed-language format is explicitly requested.

## Common Tone for Agent Results

- Use a concise, direct, and friendly tone.
- Be actionable first: lead with clear next steps and decisions.
- Avoid unnecessary verbosity and avoid slang.
- Keep wording professional and collaborative.

## Quick Compliance Check

- [ ] Default output language follows the configured expected result language.
- [ ] Output tone is concise, direct, friendly, and actionable.