---
applyTo: 'skills/c4-diagram-generator/**/*.md'
description: Defines rules, notation standards, and quality gates for C4 architecture diagram generation.
---

# C4 Model — Global Instructions

## What is the C4 Model?

The C4 model was created by Simon Brown as a simple, hierarchical notation for communicating software architecture to different audiences. It defines four levels of abstraction, each serving a different stakeholder group. C4 stands for **Context**, **Containers**, **Components**, and **Code**.

Official reference: <https://c4model.com>

## The Four Abstraction Levels

### Level 1 — System Context

- Shows the target system as a single box surrounded by its users and external systems.
- Audience: business stakeholders, product owners, and non-technical leadership.
- Scope: the entire system treated as a black box.
- Questions answered: What does the system do? Who uses it? What external systems does it depend on?

### Level 2 — Container

- Zooms into the system to show its high-level technology building blocks (containers).
- Audience: architects, developers, and DevOps teams.
- Scope: runnable or deployable units such as web apps, APIs, databases, message queues, and mobile apps.
- Questions answered: What are the major parts? What technology does each use? How do they communicate?

### Level 3 — Component

- Zooms into a single container to show its internal logical components.
- Audience: developers working on that specific container.
- Scope: logical groupings such as controllers, services, repositories, and domain models within one container.
- Questions answered: What are the responsibilities? How do components collaborate within the container?

### Level 4 — Code

- Zooms into a single component to show implementation-level detail.
- Audience: developers implementing or reviewing that component.
- Scope: classes, interfaces, and their relationships.
- Questions answered: How is it implemented? What are the class relationships and design patterns?

## Notation Standards

### Element Types

| Element | Level | Description |
| --- | --- | --- |
| `Person` / `Person_Ext` | 1, 2, 3 | A human user (internal / external) |
| `System` / `System_Ext` | 1 | A software system (in scope / external) |
| `Container` / `ContainerDb` | 2 | A runnable unit or data store |
| `Component` | 3 | A logical grouping inside a container |
| Class / Interface | 4 | Implementation artifact |

### Relationship Conventions

- Label every relationship with a verb phrase (e.g., "reads data from", "sends events to").
- Specify protocol or technology when relevant (e.g., HTTPS, gRPC, AMQP, SQL).
- Use directional arrows; avoid bidirectional arrows unless the interaction is truly symmetric.
- Do not draw inferred relationships — only model what is architecturally significant.

### Naming Conventions

- Use short, meaningful names for all elements (maximum 3 words).
- Use bracketed technology labels in container and component diagrams (e.g., `[React SPA]`, `[PostgreSQL]`).
- Distinguish internal from external elements using the `_Ext` variants.

## Preferred Notation: Mermaid C4

Prefer Mermaid C4 notation for all C4 diagrams in Markdown documents. Mermaid renders natively in GitHub and GitHub Copilot chat without additional tooling.

### Mermaid C4 Diagram Keywords

| Level | Mermaid Keyword |
| --- | --- |
| System Context | `C4Context` |
| Container | `C4Container` |
| Component | `C4Component` |
| Code | `classDiagram` (standard UML class notation) |

### Example — Level 1 System Context

```mermaid
C4Context
  title System Context — Online Banking Platform
  Person(customer, "Bank Customer", "Manages accounts and makes payments")
  System(banking, "Online Banking System", "Core banking platform")
  System_Ext(email, "Email Provider", "Sends transaction notifications")
  Rel(customer, banking, "Uses", "HTTPS")
  Rel(banking, email, "Sends emails via", "SMTP")
```

### Example — Level 2 Container

```mermaid
C4Container
  title Container — Online Banking Platform
  Person(customer, "Bank Customer", "Manages accounts")
  System_Boundary(banking, "Online Banking System") {
    Container(spa, "Single Page App", "React", "Customer-facing web UI")
    Container(api, "API Gateway", "ASP.NET Core", "Handles all client requests")
    ContainerDb(db, "Database", "PostgreSQL", "Stores accounts and transactions")
  }
  System_Ext(email, "Email Provider", "Sends notifications")
  Rel(customer, spa, "Uses", "HTTPS")
  Rel(spa, api, "Calls", "REST/HTTPS")
  Rel(api, db, "Reads/writes", "TCP")
  Rel(api, email, "Sends emails via", "SMTP")
```

### Example — Level 3 Component

```mermaid
C4Component
  title Component — API Gateway
  Container_Boundary(api, "API Gateway") {
    Component(auth, "Auth Controller", "ASP.NET Core", "Handles login and token issuance")
    Component(accounts, "Accounts Service", "C#", "Business logic for account management")
    Component(repo, "Accounts Repository", "EF Core", "Reads and writes account records")
  }
  ContainerDb(db, "Database", "PostgreSQL", "Account storage")
  Rel(auth, accounts, "Delegates to")
  Rel(accounts, repo, "Uses")
  Rel(repo, db, "Reads/writes", "SQL")
```

## Scope Guidelines

- Level 1: one diagram per project is usually sufficient.
- Level 2: one diagram per system; add a separate diagram per bounded context when the system is large.
- Level 3: one diagram per container; focus on architecturally significant containers.
- Level 4: use sparingly; only for components with non-obvious class structure or critical design decisions.

## Output Rules

- Embed all diagrams in fenced `mermaid` code blocks.
- Follow every diagram with a prose summary (3–5 sentences) explaining key relationships and design decisions.
- Include a note block for any non-standard symbols or conventions.
- Produce one diagram per level per scope; create multiple diagrams only when the scope genuinely requires it.
- Store diagrams inside arc42 sections or blueprint documents where they belong; do not create standalone diagram files.

## Traceability

- Link Level 1 diagrams to arc42 Section 3 (Context and Scope).
- Link Level 2 diagrams to arc42 Section 5 (Building Block View) and Section 7 (Deployment View).
- Link Level 3 diagrams to arc42 Section 5 (Building Block View — deeper levels).
- Reference relevant ADRs for every technology choice visible in Level 2 and Level 3 diagrams.

## Validation Checklist

- [ ] Correct C4 level is used for the audience and scope.
- [ ] All elements have a name, technology tag (if applicable), and short description.
- [ ] All relationships are labelled with a verb phrase and protocol where relevant.
- [ ] External elements are distinguished from internal ones using `_Ext` variants.
- [ ] Diagram is embedded in a fenced `mermaid` code block.
- [ ] Prose summary accompanies every diagram.
- [ ] Traceability links to related arc42 sections, ADRs, or blueprints are present.
