# Fincent Definition of Ready (DOR)

A story is **Ready** for sprint refinement when all of the following criteria are met.

## Mandatory Criteria

### 1. Business Value

- The story has a clear, stated business value or user benefit.
- The value is linked to an epic or initiative goal.

### 2. User Story Format

- Written in the format: *As a [role], I want [goal], so that [benefit].*
- Role, goal, and benefit are specific and unambiguous.

### 3. Acceptance Criteria

- At minimum two acceptance criteria are defined.
- Each criterion is testable and unambiguous.
- Criteria are written in Given/When/Then or bullet format.

### 4. Scope and Boundaries

- Out-of-scope items are explicitly stated.
- The story does not span multiple bounded contexts without an explicit integration point defined.

### 5. Dependencies

- All known dependencies (other stories, services, third parties) are identified.
- Blocking dependencies are flagged with a link to the blocking item.

### 6. Size Estimate

- The story has been sized (story points or T-shirt size).
- Stories larger than 8 points are split or flagged for breakdown.

### 7. Domain Alignment

- Domain terminology matches the Fincent ubiquitous language glossary.
- The affected bounded context is identified.

## Optional Enrichments (recommended)

- Mockups or wireframes are attached or linked.
- A spike or research outcome is referenced if technical uncertainty was high.
- Relevant architecture decision records (ADRs) are linked.

## Enabler Feature Check

- If the story requires infrastructure, platform, or architectural work before it can be delivered,
  an **Enabler Story** or **Enabler Feature** is created and linked.
- Enabler types: Architecture Enabler, Infrastructure Enabler, Research Spike.
