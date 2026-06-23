# copilot-app

Installable GitHub Copilot App plugin for creating Pull Requests across JSdotNet repositories and orchestrating development workflows with canvas-based interfaces.

## Purpose

This plugin provides specialized skills for GitHub Copilot App users who need to:

1. **Create Pull Requests** efficiently in any JSdotNet organization repository
2. **Orchestrate Development Tasks** with canvas interfaces including:
   - Project setup with .github folder initialization
   - MVP creation and sprint planning
   - Package/dependency updates with security scanning
   - Feature development lifecycle management
   - Bug triage with test-driven development (TDD)

Each orchestration skill opens an interactive canvas in GitHub Copilot App and coordinates multiple agents from other plugins (development, architecture, documentation, product-owner, csharp-coding, review) to execute complete workflows with minimal manual intervention.

## Includes

### Skills

- `skills/pr-jsdotnet/SKILL.md` - Create PRs across all JSdotNet organization repositories
- `skills/orch-project-setup/SKILL.md` - Setup .github folder, guidelines, and Aspire scaffolding
- `skills/orch-create-mvp/SKILL.md` - MVP development from planning to deployment (canvas)
- `skills/orch-update-packages/SKILL.md` - Safe, coordinated dependency updates (canvas)
- `skills/orch-feature/SKILL.md` - Feature development lifecycle management (canvas)
- `skills/orch-bug/SKILL.md` - Bug triage and TDD-based fix workflow (canvas)

## Install

```bash
copilot plugin install JSdotNet/Copilot:plugins/copilot-app
copilot plugin list
```

## Verify Installation

After installation, the plugin skills should appear in GitHub Copilot App:

- In the command palette: `orch-project-setup`, `orch-create-mvp`, `orch-feature`, `orch-bug`
- In skill suggestions when relevant
- Canvas panels open for each orchestration skill
- Integration buttons to switch to `csharp-coding:coding` agent

## Key Features

- **Canvas Interfaces** - Interactive workflow orchestration in GitHub Copilot App
- **TDD Bug Fixes** - Solve bugs by creating tests first with csharp-coding agent
- **Aspire Integration** - Project setup includes .NET Aspire AppHost scaffolding
- **Project Guidelines** - Uses project-guideline-MCP for consistent standards
- **Multi-Repository** - PR creation works across all JSdotNet organization repos
- **Automated Handoffs** - Seamless switching to specialized agents (csharp-coding, documentation, etc.)

## Dependencies

This plugin works best with the following installed plugins:

- `development` - For development planning and execution
- `architecture` - For architecture documentation (arc42, ADRs)
- `csharp-coding` - For code implementation with TDD
- `product-owner` - For user stories and backlog management
- `documentation` - For documentation generation

Install recommended plugins:

```bash
copilot plugin install JSdotNet/Copilot:plugins/development
copilot plugin install JSdotNet/Copilot:plugins/architecture
copilot plugin install JSdotNet/Copilot:plugins/csharp-coding
copilot plugin install JSdotNet/Copilot:plugins/product-owner
copilot plugin install JSdotNet/Copilot:plugins/documentation
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

### Orchestrate Project Setup

```
Invoke: orch-project-setup
- Repository: "MyAwesomeAPI" (already exists)
- Setup .github folder with guidelines (project-guideline-MCP)
- Create Aspire AppHost for distributed services
- Initialize GitHub workflows and branch protection
```

### Orchestrate MVP Creation

```
Invoke: orch-create-mvp
- Project: "PaymentService"
- Core features: Payments, webhooks, reporting
- Timeline: 4 weeks
- Deploy to: Azure Container Apps
```

### Orchestrate Package Updates

```
Invoke: orch-update-packages
- Project: "CoreLibrary"
- Update types: Security, critical patches
- Testing: Full integration suite
- Deployment: Staging → Production
```

### Orchestrate Feature Development

```
Invoke: orch-feature
- Feature: "Role-Based Access Control"
- Epic: "Security & Authorization"
- Target: Next sprint
- Deployment: Blue-green strategy
```

### Orchestrate Bug Fix (with TDD)

```
Invoke: orch-bug
- Bug: "Login fails with special characters"
- Severity: High
- Root cause: Input sanitization missing
- Approach: Create failing test first, then implement fix
- Deploy: Production (same day hotfix)
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
        ├── ↔ documentation plugin (documentation agent)
        └── ↔ review plugin (reviewer agent)
```

## Workflow Coordination Model

Each orchestration skill with canvas:

1. **Opens canvas interface** in GitHub Copilot App
2. **Planning stage** - Define scope and approach
3. **Design stage** - Architecture and design decisions
4. **Implementation stage** - Code creation with agent handoff to csharp-coding
5. **Testing stage** - Quality assurance and validation
6. **Review stage** - Peer and security review
7. **Documentation** - Update docs, changelog, guides
8. **Deployment** - Release to production with monitoring

Agent selection per stage is automated based on the task context.

## Skills Can Use Other Skills

The orchestration skills are designed to coordinate with other plugin skills:
- `orch-project-setup` uses the `aspire` skill from the development plugin
- `orch-bug` uses TDD approach with `csharp-coding:coding` agent
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
