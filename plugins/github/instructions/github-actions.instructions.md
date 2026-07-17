---
description: GitHub Actions security and authoring rules for workflow files.
applyTo: '.github/workflows/*.yml,.github/workflows/*.yaml'
---

# GitHub Actions Instructions

## Purpose

- Enforce security-first defaults for all GitHub Actions workflow files.
- Keep workflows concise, maintainable, and supply-chain safe.

## Security Rules

- Always pin actions to a full-length commit SHA. Never use `@main`, `@latest`, or bare major tags.
- Add a human-readable version comment next to every SHA, for example: `actions/checkout@<sha> # v4.2.2`.
- Set `permissions: contents: read` at the workflow level. Override only at job level when required.
- Access secrets only via environment variables. Never echo or log secret values.
- Prefer OIDC authentication over long-lived access keys for cloud deployments.
- Review `pull_request_target` triggers carefully — they run in the context of the base repo and can access secrets for untrusted forks.

## Structure Rules

- Use descriptive workflow file names: `build-and-test.yml`, `deploy-production.yml`.
- Declare `on` triggers explicitly; avoid triggering on all events.
- Use `needs` to declare job ordering. Do not rely on implicit sequencing.
- Use `concurrency` to cancel stale runs when a new run starts on the same ref.
- Use `workflow_dispatch` for workflows that benefit from manual triggering.

## Dependency Update Rules

- Use `dependabot.yml` to keep action SHAs current (ecosystem `github-actions`).
- Pin Dependabot updates to the same full-SHA format before merging.
