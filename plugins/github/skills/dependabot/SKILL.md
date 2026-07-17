---
name: dependabot
description: "Configure and optimize GitHub Dependabot for automated dependency updates and security alerts. Use when creating or updating .github/dependabot.yml, setting up grouped updates, configuring security update strategies, or tuning Dependabot PR behavior."
user-invocable: true
---

# Dependabot

## Purpose

Use this skill to create or update `.github/dependabot.yml` so GitHub Dependabot automatically
keeps dependencies current and alerts on known vulnerabilities.

> **Awesome Copilot reference:** A detailed `dependabot` skill with full ecosystem reference and
> monorepo patterns is available at `awesome-copilot`:
> `copilot plugin install dependabot@awesome-copilot`

## Hard Constraints

- Configuration must be in `.github/dependabot.yml` on the default branch only.
- Do not create multiple `dependabot.yml` files — GitHub supports exactly one per repository.
- Use `directories` (plural) with glob patterns for monorepos; `directory` (singular) does not support globs.

## When To Use

- Setting up Dependabot for the first time in a repository.
- Adding a new package ecosystem after introducing a new technology.
- Reducing PR noise by configuring grouped updates.
- Tuning schedules, reviewers, and labels for team workflows.
- Enabling security update configuration for compliance or supply-chain hardening.

## Inputs

- Repository root path to scan for package manifests.
- Optional: preferred schedule, reviewer list, label preferences.

## Execution Steps

1. Scan the repository for dependency manifests to identify all package ecosystems present.
2. Map directory locations for each ecosystem (root `/` and sub-paths).
3. Generate a `dependabot.yml` entry per ecosystem with a weekly schedule by default.
4. Apply grouping to reduce PR count (minor + patch together; major separate).
5. Add `github-actions` ecosystem entry if `.github/workflows/` is present.
6. Return the complete `.github/dependabot.yml` content.

## Ecosystem Detection Reference

| Technology | Ecosystem Value | Manifest Files |
| --- | --- | --- |
| npm / pnpm / yarn | `npm` | `package.json`, `package-lock.json` |
| pip / poetry | `pip` | `requirements.txt`, `pyproject.toml` |
| NuGet (.NET) | `nuget` | `*.csproj`, `packages.config` |
| Docker | `docker` | `Dockerfile` |
| GitHub Actions | `github-actions` | `.github/workflows/*.yml` |
| Go modules | `gomod` | `go.mod` |
| Cargo (Rust) | `cargo` | `Cargo.toml` |
| Maven (Java) | `maven` | `pom.xml` |
| Gradle (Java) | `gradle` | `build.gradle` |
| Terraform | `terraform` | `*.tf` |

## Grouping Strategy

Group minor and patch updates together to reduce PR count; keep major updates separate for
deliberate review:

```yaml
groups:
  minor-and-patch:
    update-types: ["minor", "patch"]
```

## Example Invocation

```text
/dependabot Set up Dependabot for this repository.
```

## Success Response Format

Returns a complete `.github/dependabot.yml` file with all detected ecosystems configured and
a short explanation of each grouping decision.
