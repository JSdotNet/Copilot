---
name: orch-structure
description: 'Orchestrate existing repository structure and layout refactors using GitHub Copilot App canvas. Use for folder moves, project or solution layout corrections, test/harness placement, and reference updates. Do not use for initial scaffolding (use orch-repo or orch-project), new modules/services (use orch-create-module or orch-create-service), or architecture documentation only (use orch-architecture, orch-blueprint, orch-adr, or orch-arc42).'
---

# Orchestrate Structure Refactor

Execute a focused workflow for structural refactors in an existing repository: folder
layout changes, project or solution organization fixes, test/harness placement, and the
reference updates needed to keep the repository working after the move.

> **Scope:** This skill covers structure and layout changes whether or not a prior
> architecture note exists. When approved structure guidance exists, Stage 0 is a short
> intake and Stage 1 proceeds as usual. When it does not -- an ad-hoc request such as
> "move the harness below src" -- Stage 0 derives the verifiable scope from the request,
> codebase, and applicable guidance. Missing notes are a reason to run Stage 0, never a
> reason to route to initial scaffolding or implement the move inline.

## Input Expectations

**Required:**

- Structure or layout change request, such as a folder move, project relocation, solution
  organization fix, or test/harness placement change.

**Derived in Stage 0 when absent:**

- Target layout rule or desired destination.
- Affected folders, projects, solution files, tests, scripts, CI, documentation, and
  architecture tests.
- Verification criteria proving the structure change is complete.
- Runtime validation target, or a reason QA Validation should be skipped.

## Workflow Stages

> Agent transitions follow the shared rule in
> `instructions/orch-shared-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and internal transitions continue without separate user approval until
> Personal Validation.
>
> Model choice per stage follows `instructions/orch-model-selection.instructions.md`
> (category defaults, overridable via personal global model selection or
> `.github/copilot-model-selection.md` in the consuming repo).

### Stage 0: Scope Discovery

Run this stage first, always. It is a quick intake when approved layout guidance
already exists, and a full derivation when it does not.

- **Restate the structure change** in one or two sentences, in the user's terms.
- **Derive the target layout rule** and the concrete folders/projects that should move or
  be reorganized.
- **Derive verification criteria** such as expected folder tree, updated references,
  passing architecture tests, or successful build/test commands.
- **Identify affected surfaces** including solution files, project references, package or
  workspace manifests, scripts, CI workflow paths, documentation links, test fixtures,
  architecture tests, and runtime configuration.
- **Identify governing instructions** - `.github/copilot-instructions.md`, any matching
  `**/*.instructions.md`, and relevant guidelines or ADRs via
  `jsdotnet-guidelines-mcpserver`.
- **Record the derived scope and assumptions** in the stage output and continue to Stage 1 unless escalation is required.

Escalate instead of continuing when the request needs a different work type:

- Initial repository or project scaffolding routes to `orch-repo` or `orch-project`.
- A new architectural decision routes to `orch-adr`.
- A cross-cutting redesign or documentation-only architecture outcome routes to
  `orch-architecture`, `orch-blueprint`, or `orch-arc42`.
- A new bounded context, service boundary, module, or service routes to
  `orch-create-module` or `orch-create-service`.

**Agents:** none required (orchestrator). Optionally `architecture:architect` when the
layout rule needs architecture interpretation; `product-owner:product-owner` only when
verification criteria need backlog wording.

**MCP Servers:** `jsdotnet-guidelines-mcpserver`

### Stage 1: Structure & Architecture Intake

- **Review the recorded scope** and target layout rule from Stage 0.
- **Map the target layout** to repository structure guidance, ADRs, and existing patterns.
- **Identify required compatibility updates** across references, build/test discovery,
  scripts, docs, and CI path filters.
- **Define the validation target** for the resulting structure change.

**Agents:** `architecture:architect`

**MCP Servers:** `jsdotnet-guidelines-mcpserver`

### Stage 2: Refactor Planning

- **List exact moves and renames** before changing files.
- **List reference updates** required after the move, including solution/project files,
  relative paths, package/workspace manifests, scripts, docs, CI, test fixtures, and
  architecture tests.
- **Sequence the refactor** so references are updated in the same change set as the move.
- **Call out risks** such as generated files, case-only renames, path-sensitive tooling, or
  files that should not move.

**Agents:** `architecture:architect`, `csharp-coding:coding`

### Stage 3: Implementation

- **Move or reorganize folders/projects** according to the recorded target layout.
- **Update all affected references** discovered in Stage 2.
- **Update documentation or architecture tests** that encode the old structure.
- **Keep behavior unchanged** except for the intended layout change.

**Agents:** `csharp-coding:coding`

### Final Phases (Shared)

After Implementation, this skill runs the shared delivery phases defined once in
`instructions/orch-shared-phases.instructions.md` (code-modifying tier), in order:

1. **Build & Test** - build, unit tests, and E2E tests, run first.
2. **QA Validation** - existing-structure change, so run targeted validation for affected
   flows when the repository has a runnable application; skip with a recorded reason when
   there is no runtime surface.
3. **Personal Validation** - hand back to the user (no agent); present the code review and
   the recorded validation review, and start the application for the user when applicable.
4. **Create Pull Request** - only after explicit user approval.
5. **Documentation Update** - after the pull request exists, check whether the repository's
   governed documentation is now stale and, if so, update it and commit onto the PR branch;
   a clean no-op when nothing needs changing.
6. **GitHub Issue Update** - when the session was started from a GitHub issue, add a
   comment to that issue with the captured result and QA report; otherwise skip.
7. **Summary** - emit the run summary.

See `instructions/orch-shared-phases.instructions.md` for the full phase definitions;
update that file to change these phases for every orchestration.

## Usage Pattern

Ad-hoc structure refactor -- Stage 0 derives the rest:

```text
Invoke: orch-structure
- Change: "Fix folder structure. harness should be below src"
```

More explicit layout correction:

```text
Invoke: orch-structure
- Change: "Move integration test harness projects under src/harness and update solution references"
- Validation: "Solution loads and all structure/architecture tests pass"
```

## Output Expectations

- Repository structure matches the recorded target layout.
- Moved folders/projects retain working references from solution files, scripts, CI,
  tests, docs, and runtime configuration.
- Architecture tests or documentation that encode folder rules are updated when needed.
- Build/test/validation results are recorded, or skipped with a clear reason when no
  runnable surface exists.
- Personal Validation is completed before any pull request or issue update.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension. Follow the
shared **Dashboard Reporting Contract** in
`instructions/orch-shared-phases.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence, the QA Validation
`scenarios`/`monitoring` passthrough, and the Personal Validation -> Create Pull Request
gating. If the extension is not installed, skip the canvas calls and continue through
standard chat interaction.

- Call `start_run` with `skillId: "orch-structure"` and these stages: Scope Discovery,
  Structure & Architecture Intake, Refactor Planning, Implementation, Build & Test, QA
  Validation, Personal Validation, Create Pull Request, Documentation Update, GitHub Issue
  Update, Summary.
- During **Scope Discovery**, present the restated structure change, derived target layout,
  affected surfaces, and verification criteria as the stage output so the user can review
  or correct them.
- During **Structure & Architecture Intake** or **Refactor Planning**, optionally
  open/update `markdown-canvas` (`markdown-preview`) with the recorded structure plan and
  `diagram-canvas` (`mermaid-diagram`) with any accompanying layout diagram, per
  `instructions/canvas-usage.instructions.md`. Optional; skip gracefully if not installed.

See `plugins/copilot-app/extensions/orch-dashboard/README.md` for the full canvas action
contract.

## Reference

Source skill location: `plugins/copilot-app/skills/orch-structure/SKILL.md`
