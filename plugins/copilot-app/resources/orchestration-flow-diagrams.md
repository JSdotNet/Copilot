# Orchestration Flow Diagrams

Centralized workflow diagrams for the `copilot-app` orchestration skills. This keeps the
individual `SKILL.md` files focused on execution rules while preserving one reviewable
overview of stage order, approval gates, and PR handoff points.

## orch-repo

```mermaid
flowchart TD
    A["Repository Creation (Manual)"] --> B["README"]
    B --> C["MCP Configuration"]
    C --> D["Copilot Instructions"]
    D --> E["Branch Protection"]
    E --> F["Issue and PR Templates"]
    F --> G["Repository Governance"]
    G --> H["Personal Validation"]
    H --> I{User approves?}
    I -->|Yes| J["Create Pull Request or Skip"]
    I -->|No| K["Return to the relevant earlier stage"]
    K --> A
    J --> L["Summary"]
```

## orch-project

```mermaid
flowchart TD
    A["GitHub Folder Setup (Foundation)"] --> B["GitHub Actions Workflows"]
    B --> C["Architecture & Planning"]
    C --> D["Tooling & Dependencies"]
    D --> E["Aspire AppHost & Project Scaffolding"]
    E --> F["Build & Test"]
    F --> G["QA Validation"]
    G --> H["Personal Validation"]
    H --> I{User approves?}
    I -->|Yes| J["Create Pull Request or Skip"]
    I -->|No| K["Return to the relevant earlier stage"]
    K --> A
    J --> L["Summary"]
```

## orch-create-mvp

```mermaid
flowchart TD
    A["MVP Definition & Planning"] --> B["Architecture & Design"]
    B --> C["Implementation Sprint"]
    C --> D["Build & Test"]
    D --> E["QA Validation"]
    E --> F["Personal Validation"]
    F --> G{User approves?}
    G -->|Yes| H["Create Pull Request or Skip"]
    G -->|No| I["Return to the relevant earlier stage"]
    I --> A
    H --> J["Summary"]
```

## orch-update-packages

```mermaid
flowchart TD
    A["Dependency Analysis"] --> B["Update Planning"]
    B --> C["Staged Updates"]
    C --> D["Security Validation"]
    D --> E["Build & Test"]
    E --> F["QA Validation"]
    F --> G["Personal Validation"]
    G --> H{User approves?}
    H -->|Yes| I["Create Pull Request or Skip"]
    H -->|No| J["Return to the relevant earlier stage"]
    J --> A
    I --> K["Summary"]
```

## orch-aspire-update

```mermaid
flowchart TD
    A["Baseline & Plan Creation"] --> B["Plan Refinement"]
    B --> C["Staged Aspire Upgrade"]
    C --> D["New Feature Adoption"]
    D --> E["Build & Test"]
    E --> F["QA Validation"]
    F --> G["Personal Validation"]
    G --> H{User approves?}
    H -->|Yes| I["Create Pull Request or Skip"]
    H -->|No| J["Return to the relevant earlier stage"]
    J --> A
    I --> K["Summary"]
```

## orch-architecture

```mermaid
flowchart TD
    A["Goal & Guideline Retrieval"] --> B["Architecture Investigation"]
    B --> C["Drafting & Review"]
    C --> D["Personal Validation"]
    D --> E{User approves?}
    E -->|Yes| F["Create Pull Request or Skip"]
    E -->|No| G["Return to the relevant earlier stage"]
    G --> A
    F --> H["Summary"]
```

## orch-arc42

```mermaid
flowchart TD
    A["Context & Guideline Retrieval"] --> B["Section Drafting"]
    B --> C["Cross-Section Review"]
    C --> D["Personal Validation"]
    D --> E{User approves?}
    E -->|Yes| F["Create Pull Request or Skip"]
    E -->|No| G["Return to the relevant earlier stage"]
    G --> A
    F --> H["Summary"]
```

## orch-blueprint

```mermaid
flowchart TD
    A["Scope & Guideline Retrieval"] --> B["Blueprint Drafting"]
    B --> C["Review & Traceability"]
    C --> D["Personal Validation"]
    D --> E{User approves?}
    E -->|Yes| F["Create Pull Request or Skip"]
    E -->|No| G["Return to the relevant earlier stage"]
    G --> A
    F --> H["Summary"]
```

## orch-adr

```mermaid
flowchart TD
    A["Decision Context Retrieval"] --> B["ADR Drafting"]
    B --> C["Traceability Review"]
    C --> D["Personal Validation"]
    D --> E{User approves?}
    E -->|Yes| F["Create Pull Request or Skip"]
    E -->|No| G["Return to the relevant earlier stage"]
    G --> A
    F --> H["Summary"]
```

## orch-tdr

```mermaid
flowchart TD
    A["Debt Context Retrieval"] --> B["TDR Drafting"]
    B --> C["Risk & Follow-Up Review"]
    C --> D["Personal Validation"]
    D --> E{User approves?}
    E -->|Yes| F["Create Pull Request or Skip"]
    E -->|No| G["Return to the relevant earlier stage"]
    G --> A
    F --> H["Summary"]
```

## orch-feature

```mermaid
flowchart TD
    A["Implementation"] --> B["Build & Test"]
    B --> C["QA Validation"]
    C --> D["Personal Validation"]
    D --> E{User approves?}
    E -->|Yes| F["Create Pull Request or Skip"]
    E -->|No| G["Return to the relevant earlier stage"]
    G --> A
    F --> H["Summary"]
```

## orch-bug

```mermaid
flowchart TD
    A["Bug Triage & Analysis"] --> B["Root Cause Analysis"]
    B --> C["Fix Implementation (TDD Approach)"]
    C --> D["Build & Test"]
    D --> E["QA Validation"]
    E --> F["Personal Validation"]
    F --> G{User approves?}
    G -->|Yes| H["Create Pull Request or Skip"]
    G -->|No| I["Return to the relevant earlier stage"]
    I --> A
    H --> J["Summary"]
```

## orch-create-module

```mermaid
flowchart TD
    A["Module Scope & Contract"] --> B["Architecture & Design"]
    B --> C["Module Implementation"]
    C --> D["Build & Test"]
    D --> E["QA Validation"]
    E --> F["Personal Validation"]
    F --> G{User approves?}
    G -->|Yes| H["Create Pull Request or Skip"]
    G -->|No| I["Return to the relevant earlier stage"]
    I --> A
    H --> J["Summary"]
```

## orch-create-service

```mermaid
flowchart TD
    A["Service Scope & Requirements"] --> B["Service Architecture & Integration Design"]
    B --> C["Service Implementation & Wiring"]
    C --> D["Build & Test"]
    D --> E["QA Validation"]
    E --> F["Personal Validation"]
    F --> G{User approves?}
    G -->|Yes| H["Create Pull Request or Skip"]
    G -->|No| I["Return to the relevant earlier stage"]
    I --> A
    H --> J["Summary"]
```
