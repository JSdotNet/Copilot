# Story Review Checklist

Use this checklist when reviewing a Fincent story. Mark each item ✅, ⚠️, or ❌.
Applies to all story types: features, bugs, and support requests.

## Product Owner Review (DOR — all story types)

### Story Description

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Functionality is independently testable | | |
| 2 | Written from end-user perspective (As a / I want / So that format) | | |
| 3 | Title is a concise summary, not identical to the description | | |
| 4 | Description is in the story field, not in comments | | |
| 5 | Description is not a copy of an email or customer message | | |
| 6 | Description is specific — no vague or conditional wording | | |

### Scope and Context

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 7 | Linked to an epic (if part of larger functionality) | | |
| 8 | Linked to a version / release | | |
| 9 | Screenshots or links of current state attached (if modifying existing) | | |

### Refinement

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 10 | Story has been reviewed and refined by the development team | | |
| 11 | Team estimate present (story points or hours) | | |
| 12 | Story does not exceed 12 hours / equivalent in points (split if larger) | | |

### Design (UI stories only)

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 13 | Design images (screens/mockups) included directly in the story | | |
| 14 | Figma link provided (optional, but images are always required regardless) | | |
| 15 | Interactions and animations worked out in design | | |

## Bug Review (additional criteria for bugs)

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Clear description of what is going wrong | | |
| 2 | Clear description of desired result | | |
| 3 | Reproduction path or steps provided | | |
| 4 | Link to the affected page included | | |
| 5 | Screenshot(s) attached | | |
| 6 | Required conditions stated (logged in/out, user role, etc.) | | |
| 7 | Device type noted | | |
| 8 | Browser and version noted | | |
| 9 | Operating system and version noted | | |

## Pre-Refinement (Architect) Review

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Story fits within a single bounded context | | |
| 2 | Cross-context integrations are explicitly defined | | |
| 3 | No hidden technical assumptions | | |
| 4 | No architecture risks without mitigation noted | | |
| 5 | Enabler story created if infrastructure work is needed | | |
| 6 | Story is implementable without prior unresolved architectural decisions | | |
| 7 | Non-functional requirements (NFRs) are identified | | |
| 8 | Security or compliance implications are noted | | |

## Domain Architect Review

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Domain terminology matches ubiquitous language | | |
| 2 | Affected aggregate or entity is identified | | |
| 3 | Domain events produced or consumed are listed | | |
| 4 | Bounded context ownership is clear | | |
| 5 | No domain invariant violations | | |
| 6 | Policy or rule changes are modelled correctly | | |

## Story Points (Estimation)

| Factor | Value | Notes |
|--------|-------|-------|
| Complexity (1–5) | | |
| Effort (1–5) | | |
| Uncertainty/Risk (1–5) | | |
| Similar stories (reference) | | |
| **Suggested points / hours** | | |
| Exceeds 12 hours? Split needed? | | |
