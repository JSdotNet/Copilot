---
name: automation: package-update
description: >
  Update all outdated packages across the repository (NuGet, Copilot plugins, npm) and open a PR
  with the changes. Use when: running scheduled dependency hygiene, triaging outdated packages,
  keeping dependencies current.
---

# Automation: Package Update

## Purpose

Scan the repository for outdated packages across all package ecosystems, apply safe updates,
verify the build and tests still pass, then open a pull request with the changes.

## Inputs

- Ecosystems to update: `all` (default), `nuget`, `plugins`, `npm` — comma-separated list.
- Update strategy: `minor-and-patch` (default, safe) or `major` (includes breaking changes; requires confirmation).
- Target branch for the PR (default: repository default branch).
- Dry-run mode: `true` previews what would change without writing files (default: `false`).

## Skill Dependencies

This skill orchestrates the following installed skills:

- **`nuget-manager`** — lists outdated NuGet packages and applies version bumps safely via the `dotnet` CLI.
- **`check-plugin-updates`** — identifies Copilot plugins that need reinstall or are missing from the preferred list.
- **`update-plugins`** — reinstalls all preferred Copilot plugins to apply the latest versions.
- **`aspire`** — when the solution uses .NET Aspire, checks whether Aspire hosting and client integration
  packages have new versions and whether any configuration changes are required after an upgrade.

## Workflow

### Phase 1 — Audit

1. **NuGet** (if in scope): use the `nuget-manager` skill to run:

   ```bash
   dotnet list package --outdated
   ```

   Capture each package with its current and latest version.

2. **Copilot plugins** (if in scope): use the `check-plugin-updates` skill to compare installed
   plugins against `resources/preferred-plugins.md` and identify packages that need reinstall.

3. **npm** (if in scope — only when `package.json` files exist in the repo):

   ```bash
   npm outdated --json
   ```

4. **Aspire integrations** (automatically included when an `.AppHost` project is detected): use the
   `aspire` skill to verify hosting and client integration package versions against the latest
   `Aspire.Hosting.*` and `Aspire.*` releases and flag any that are behind.

5. Present an audit table grouped by ecosystem:

   | Ecosystem | Package | Current | Latest | Type | Action |
   |-----------|---------|---------|--------|------|--------|
   | NuGet | `Newtonsoft.Json` | `13.0.1` | `13.0.3` | patch | Update |
   | Plugin | `automations` | — | — | reinstall | Reinstall |
   | npm | `lodash` | `4.17.20` | `4.17.21` | patch | Update |

6. If `update-strategy` is `major`, highlight all major bumps and ask for explicit confirmation
   before including them. Stop here if dry-run is `true`.

### Phase 2 — Apply Updates

7. Create a new branch named `chore/package-updates-<YYYY-MM-DD>`.

8. **NuGet updates**: for each outdated package, follow the `nuget-manager` skill procedure:
   - Edit `<PackageReference Version="..." />` in `.csproj` or `Directory.Packages.props`.
   - Run `dotnet restore` after each batch to catch dependency conflicts early.

9. **Plugin updates**: use the `update-plugins` skill to reinstall all outdated plugins.

10. **npm updates** (when applicable):

    ```bash
    npm update
    ```

11. **Aspire updates**: if Aspire packages were flagged, use the `aspire` skill to apply any
    configuration or API changes required by the new version (for example, renamed integration
    packages or updated `AddResource` signatures).

### Phase 3 — Verify

12. Build and test after all updates:

    ```bash
    dotnet build
    dotnet test
    ```

    If tests fail, revert the failing package update, record it as **Skipped (test failure)**,
    and continue with the remaining packages.

### Phase 4 — Pull Request

13. Commit all changes with message:

    ```
    chore: update packages <YYYY-MM-DD>

    - NuGet: <n> packages updated
    - Plugins: <n> plugins reinstalled
    - npm: <n> packages updated
    ```

14. Push the branch and open a PR:
    - **Title:** `chore: package updates <YYYY-MM-DD>`
    - **Body:** the audit table from Phase 1 with each row marked Updated or Skipped.
    - **Labels:** `dependencies`, `automated`.

### Phase 5 — Summary

15. Output a final summary table:

    | Package | Ecosystem | Old | New | Result |
    |---------|-----------|-----|-----|--------|
    | `Newtonsoft.Json` | NuGet | `13.0.1` | `13.0.3` | ✅ Updated |
    | `xunit` | NuGet | `2.6.0` | `2.7.0` | ⚠️ Skipped (test failure) |
    | `automations` | Plugin | — | — | ✅ Reinstalled |

## Output

- Branch with all safe package updates applied and tests passing.
- Pull request with a full audit table in the body.
- Summary table of results per package.

## Notes

- Major version bumps are opt-in; always confirm with the user before applying them.
- Packages that break tests are skipped and flagged, not force-updated.
- Run this automation on a fixed weekly schedule to keep dependency debt low.
- Phases for ecosystems not present in the repository are silently skipped.
