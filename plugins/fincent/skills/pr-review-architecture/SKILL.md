---
name: pr-review-architecture
description: >
  Review a pull request from the Software Architect perspective: validate architectural fit,
  layer boundaries, dependency direction, NFR compliance, security and compliance implications,
  and consistency with ADRs. Use when reviewing a PR that touches system structure, cross-cutting
  concerns, infrastructure, or integration points in the Fincent codebase.
---

# PR Review — Architecture

## Purpose and Trigger Conditions

Use this skill when a pull request touches architectural boundaries, cross-cutting concerns,
infrastructure, integration points, or any system-level concern in the Fincent codebase.
This review is complementary to the domain review — it focuses on structure and non-functional
correctness rather than domain model semantics.

## Input Expectations

- PR number, branch name, or diff to review.
- Optional: linked Jira story key for context.
- Optional: architecture documentation folder or ADR list.

## Workflow

1. Load the PR diff. Review all changed files, with particular attention to:
   - Layer boundaries (`**/Application/**`, `**/Infrastructure/**`, `**/Api/**`).
   - Cross-cutting concerns (logging, validation, error handling, auth).
   - Integration points (external APIs, message bus, database).
   - Configuration and deployment files.
2. Load any relevant ADRs from the codebase (`.wip/` or architecture folder) if accessible.
3. Evaluate each criterion below across the full diff.
4. Produce a structured finding per criterion with an overall architectural verdict.

## Review Criteria

### Layer Dependencies and Clean Architecture
- Does the dependency direction flow inward only (Infrastructure → Application → Domain)?
- Does the Application layer reference Infrastructure types directly (bypassing interfaces)?
- Does the Domain layer reference anything outside itself (Framework types, EF, HttpClient)?
- Are abstractions (interfaces, ports) defined in the correct layer and implemented outward?

### ADR Compliance
- Are any architectural decisions made in this PR that conflict with existing ADRs?
- If a new architectural decision is introduced, has an ADR been drafted or referenced?
- Are patterns established by ADRs (CQRS handlers, event sourcing, outbox pattern, etc.)
  applied consistently in this PR?

### Non-Functional Requirements (NFRs)
- **Performance**: Are there any N+1 queries, unbounded loops, or synchronous blocking calls
  where async is required?
- **Scalability**: Are any in-memory collections or singleton state introduced that would
  break horizontal scaling?
- **Resilience**: Are external service calls wrapped with retry/timeout/circuit-breaker policies?
- **Observability**: Are structured log entries, metrics, or distributed trace spans added for
  new operations?

### Security and Compliance
- Are new endpoints or operations protected with the appropriate auth policies?
- Is any sensitive data (PII, financial data) logged, cached, or exposed without masking?
- Are there PSD2, GDPR, or AML implications that must be addressed before merge?
- Are secrets injected via configuration (never hardcoded)?

### Integration and Messaging
- Are integration events published via the outbox/message bus pattern (not direct HTTP in
  the domain or application layer)?
- Are integration event schemas backward-compatible with existing consumers?
- Are external API calls using the designated anti-corruption layer or adapter?

### Error Handling and Validation
- Are domain and application errors surfaced using the established result/exception pattern?
- Is input validation performed at the boundary (API layer) before it reaches the application?
- Are unhandled exceptions caught and mapped to appropriate responses at the API layer?

## Output Expectations

- Per-criterion finding with a verdict: ✅ (compliant), ⚠️ (minor issue), ❌ (violation).
- Overall architectural verdict:
  - ✅ **Architecturally sound** — PR can be merged from an architecture perspective.
  - ⚠️ **Minor issues** — do not block merge, but should be tracked and addressed.
  - ❌ **Architectural violation** — structural issues must be resolved before merge.
- Concrete correction per ⚠️ or ❌: the specific refactor, pattern, or ADR reference to apply.

## Quality Checks

- Review all layers — do not limit to the domain layer (that is `pr-review-domain`'s scope).
- ADRs are checked before raising a violation — a pattern may be deliberately non-standard.
- Security and compliance implications are never skipped for Fincent PRs.
- Do not overlap with domain model semantics — stay focused on structure, NFRs, and compliance.

## References

- `resources/dor.md` — Fincent Definition of Ready
