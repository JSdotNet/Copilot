# copilot-app

Installable GitHub Copilot App plugin for creating Pull Requests across JSdotNet repositories and orchestrating development workflows with canvas-based interfaces.

## Purpose

This plugin provides specialized skills for GitHub Copilot App users who need to:

1. **Create Pull Requests** efficiently in any JSdotNet organization repository
2. **Orchestrate Development Tasks** with local-first canvas interfaces including:
   - Project setup with `.github` folder initialization
   - MVP creation and sprint planning
   - Package/dependency updates with security scanning
   - Aspire upgrade orchestration with plan refinement and feature adoption
   - Feature development lifecycle management
   - Bug triage with test-driven development (TDD)
   - Module creation inside existing projects
   - New service creation in existing projects

Each orchestration skill opens an interactive canvas in GitHub Copilot App and coordinates multiple agents from other plugins (development, architecture, product-owner, csharp-coding, review) to execute complete workflows with minimal manual intervention.

## Includes

### Skills

- `skills/pr-jsdotnet/SKILL.md` - Create PRs across all JSdotNet organization repositories
- `skills/orch-setup/SKILL.md` - Setup `.github` folder, guidelines, and Aspire scaffolding
- `skills/orch-create-mvp/SKILL.md` - MVP development from planning to local run and monitoring (canvas)
- `skills/orch-update-packages/SKILL.md` - Safe, coordinated dependency updates with local validation (canvas)
- `skills/orch-aspire-update/SKILL.md` - Plan-first Aspire upgrade and new feature adoption (canvas)
- `skills/orch-feature/SKILL.md` - Feature development lifecycle management with local validation (canvas)
- `skills/orch-bug/SKILL.md` - Bug triage and TDD-based fix workflow with local monitoring (canvas)
- `skills/orch-create-module/SKILL.md` - Create and validate a new module in an existing project (canvas)
- `skills/orch-create-service/SKILL.md` - Create and wire a new service in an existing project (canvas)

## Install

```bash
copilot plugin install JSdotNet/Copilot:plugins/copilot-app
copilot plugin list
```

## Verify Installation

After installation, the plugin skills should appear in GitHub Copilot App:

- In the command palette: `orch-setup`, `orch-create-mvp`, `orch-aspire-update`, `orch-feature`, `orch-bug`, `orch-create-module`, `orch-create-service`
- In skill suggestions when relevant
- Canvas panels open for each orchestration skill
- Integration buttons to switch to `csharp-coding:coding` agent

## Key Features

- **Canvas Interfaces** - Interactive workflow orchestration in GitHub Copilot App
- **TDD Bug Fixes** - Solve bugs by creating tests first with csharp-coding agent
- **Aspire Integration** - Project setup includes .NET Aspire AppHost scaffolding
- **Project Guidelines** - Uses project-guideline-MCP for consistent standards
- **Local-First Validation** - Workflows focus on local run, health checks, and monitoring
- **Multi-Repository** - PR creation works across all JSdotNet organization repos
- **Automated Handoffs** - Seamless switching to specialized agents (csharp-coding, review, etc.)

## Dependencies

This plugin works best with the following installed plugins:

- `development` - For development planning and execution
- `architecture` - For architecture guidance
- `csharp-coding` - For code implementation with TDD
- `product-owner` - For user stories and backlog management
- `review` - For validation and quality review

Install recommended plugins:

```bash
copilot plugin install JSdotNet/Copilot:plugins/development
copilot plugin install JSdotNet/Copilot:plugins/architecture
copilot plugin install JSdotNet/Copilot:plugins/csharp-coding
copilot plugin install JSdotNet/Copilot:plugins/product-owner
copilot plugin install JSdotNet/Copilot:plugins/review
```

## Usage Examples

### Create a PR in JSdotNet Repository

```
Invoke: pr-jsdotnet
- Repository: "JSdotNet/Copilot" (or any JSdotNet repo)
- Title: "Add GitHub Copilot App integration"
- Description: Comprehensive change summary
- Labels: feature, copilot-app
- Branch: already committed on feature branch
```

### Orchestrate Setup

```
Invoke: orch-setup
- Repository: "MyAwesomeAPI" (already exists)
- Setup .github folder with guidelines (project-guideline-MCP)
- Create Aspire AppHost for distributed services
- Validate compilation and local run monitoring
```

### Orchestrate MVP Creation

```
Invoke: orch-create-mvp
- Project: "PaymentService"
- Core features: Payments, webhooks, reporting
- Timeline: 4 weeks
- Runtime target: Local run + monitoring
```

### Orchestrate Package Updates

```
Invoke: orch-update-packages
- Project: "CoreLibrary"
- Update types: Security, critical patches
- Testing: Full integration suite
- Runtime target: Local run + monitoring
```

### Orchestrate Aspire Update

```
Invoke: orch-aspire-update
- Project: "Orders.Platform"
- Current Aspire: 9.x
- Target Aspire: latest supported
- Refine update plan before implementation
- Enable selected new Aspire features after upgrade
- Record local validation evidence and summary
```

### Orchestrate Feature Development

```
Invoke: orch-feature
- Feature: "Role-Based Access Control"
- Epic: "Security & Authorization"
- Target: Next sprint
- Runtime target: Local run + monitoring
```

### Orchestrate Bug Fix (with TDD)

```
Invoke: orch-bug
- Bug: "Login fails with special characters"
- Severity: High
- Root cause: Input sanitization missing
- Approach: Create failing test first, then implement fix
- Runtime target: Local run + monitoring
```

### Orchestrate Module Creation

```
Invoke: orch-create-module
- Project: "Billing.Core"
- Module: "InvoiceRules"
- Scope: Domain logic + tests
- Runtime target: Local run + monitoring
```

### Orchestrate New Service

```
Invoke: orch-create-service
- Project: "Orders.Platform"
- Service: "NotificationService"
- Integration: AppHost + service discovery + health checks
- Runtime target: Local run + monitoring
```

## Integration Architecture

```
GitHub Copilot App
    ↓
copilot-app plugin
    ├── pr-jsdotnet (works across JSdotNet repos)
    └── orch-* skills (with canvas interfaces)
        ├── ↔ development plugin (development-plan, developer agents)
        ├── ↔ architecture plugin (architect agent)
        ├── ↔ csharp-coding plugin (coding agent for implementation)
        ├── ↔ product-owner plugin (product-owner agent)
        └── ↔ review plugin (reviewer agent)
```

## Workflow Coordination Model

Each orchestration skill with canvas follows a staged workflow tailored to the scenario (project setup, MVP, feature, package updates, bug fix, module creation, or service creation):

1. **Opens canvas interface** in GitHub Copilot App
2. **Planning and design stages** - Define scope, architecture, and risks
3. **Implementation stage** - Code creation with handoff to `csharp-coding:coding`
4. **Validation stages** - Unit, integration, and local runtime validation with recorded outcomes
5. **Quality stage** - Review readiness and blocker resolution

Agent selection per stage is automated based on the task context.

## Skills Can Use Other Skills

The orchestration skills are designed to coordinate with other plugin skills:

- `orch-setup` uses the `aspire` skill from the development plugin
- `orch-aspire-update` uses `aspire` and `nuget-manager` skills with plan refinement before updates
- `orch-bug` uses TDD approach with `csharp-coding:coding` agent
- `orch-create-service` can use `aspire` for AppHost wiring
- All orchestration skills can invoke specialized agents and their associated skills
- Canvas interfaces provide easy integration points for skill composition

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/Copilot:plugins/copilot-app
```

## Uninstall

```bash
copilot plugin uninstall copilot-app
```

## Contributing

Updates to skills should follow:

- [Agent Language and Tone](../.github/instructions/agent-language-and-tone.instructions.md)
- [Customization Structure](../.github/instructions/customization-structure.instructions.md)
- [Markdown Guidelines](../.github/instructions/markdown.instructions.md)

## Support

For issues or questions about this plugin:

1. Check GitHub Issues: https://github.com/JSdotNet/Copilot/issues
2. Review skill documentation for specific tasks
3. Verify dependent plugins are installed and current

## License

UNLICENSED

## Author

Job Schepers
