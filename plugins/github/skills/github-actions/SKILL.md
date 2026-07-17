---
name: github-actions
description: "Create, review, and optimize GitHub Actions workflow files. Use when authoring new CI/CD workflows, hardening existing ones for security, or upgrading action versions. Covers secure pinning, least-privilege permissions, OIDC authentication, caching, matrix strategies, and reusable workflows."
user-invocable: true
---

# GitHub Actions

## Purpose

Use this skill to create, review, and optimize GitHub Actions workflows under `.github/workflows/`.
Apply security-first defaults on every workflow regardless of whether you are writing from scratch
or modifying an existing file.

> **Awesome Copilot reference:** A dedicated `github-actions-expert` agent and
> `github-actions-ci-cd-best-practices` instructions are available at
> `github-actions-expert@awesome-copilot`. Install for deeper CI/CD guidance:
> `copilot plugin install github-actions-expert@awesome-copilot`

## Hard Constraints

- Always pin third-party and first-party actions to a full-length commit SHA (e.g. `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2`).
- Never use mutable references such as `@main`, `@latest`, or bare major version tags (e.g. `@v4`).
- Add a human-readable version comment (e.g. `# v4.2.2`) next to every pinned SHA.
- Set `permissions: contents: read` at the workflow level; narrow only at the job level.
- Never log secrets or expose them in outputs.

## When To Use

- Creating a new CI workflow (build, test, lint, security scan).
- Creating a new CD workflow (release, deploy, publish).
- Auditing an existing workflow for security or performance issues.
- Upgrading actions after a Dependabot PR.
- Setting up OIDC authentication for cloud providers (AWS, Azure, GCP).
- Adding reusable workflow patterns (`workflow_call`).

## Inputs

- Repository path or an existing `.github/workflows/*.yml` file (optional).
- Workflow purpose description when creating from scratch.

## Security Checklist

- [ ] All actions pinned to full commit SHA with version comment.
- [ ] `permissions` set at workflow level; overridden at job level only when necessary.
- [ ] Secrets accessed via environment variables only (`${{ secrets.MY_SECRET }}`).
- [ ] OIDC preferred over long-lived access keys for cloud deployments.
- [ ] `pull_request_target` trigger reviewed carefully for untrusted code risk.
- [ ] `concurrency` configured to cancel stale runs when appropriate.

## Workflow Structure Guidelines

- Name workflows descriptively: `build-and-test.yml`, `deploy-production.yml`.
- Use `on.push.branches` and `on.pull_request.branches` to limit trigger scope.
- Add `workflow_dispatch` for manual runs on any workflow that may need it.
- Use `needs` to express job ordering; avoid implicit ordering.
- Use `outputs` to pass data between jobs.
- Cache dependencies with `actions/cache` keyed on lock file hash.

## OIDC Quick Reference

| Provider | Action | Trust Policy Claim |
| --- | --- | --- |
| AWS | `aws-actions/configure-aws-credentials` | `token.actions.githubusercontent.com` |
| Azure | `azure/login` with `client-id` + workload identity | `repo:owner/repo:ref:refs/heads/main` |
| GCP | `google-github-actions/auth` | `sub: repo:owner/repo:ref:refs/heads/main` |

## Example Invocation

```text
/github-actions Create a CI workflow that builds and tests a .NET solution on push and pull_request.
```

## Success Response Format

Returns a complete `.github/workflows/<name>.yml` file ready to commit, plus a short summary of
security decisions made.
