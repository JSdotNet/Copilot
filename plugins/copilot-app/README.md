# copilot-app

Installable GitHub Copilot App plugin for GitHub PR creation and orchestrating development workflows with JSdotNet account integration.

## Purpose

This plugin provides specialized skills for GitHub Copilot App users who need to:

1. **Create Pull Requests** efficiently with JSdotNet account
2. **Orchestrate Development Tasks** including:
   - Project setup and initialization
   - MVP creation and sprint planning
   - Package/dependency updates
   - Feature development lifecycle
   - Bug triage and resolution

Each orchestration skill coordinates multiple agents from other plugins (development, architecture, documentation, product-owner, review) to execute complete workflows with minimal manual intervention.

## Includes

### Skills

- `skills/create-pr-jsdotnet/SKILL.md` - Create PRs with JSdotNet account via GitHub Copilot App
- `skills/orchestrate-project-setup/SKILL.md` - Automated project initialization and setup
- `skills/orchestrate-create-mvp/SKILL.md` - MVP development from planning to deployment
- `skills/orchestrate-update-packages/SKILL.md` - Safe, coordinated dependency updates
- `skills/orchestrate-feature/SKILL.md` - Feature development lifecycle management
- `skills/orchestrate-bug/SKILL.md` - Bug triage, fix, and deployment workflow

## Install

```bash
copilot plugin install JSdotNet/Copilot:plugins/copilot-app
copilot plugin list
```

## Verify Installation

After installation, the plugin skills should appear in GitHub Copilot App:

- In the command palette: `Orchestrate project setup`
- In skill suggestions when relevant
- In workflow menus for development tasks

## Dependencies

This plugin works best with the following installed plugins:

- `development` - For development planning and execution
- `architecture` - For architecture documentation (arc42, ADRs)
- `csharp-coding` - For code implementation and review
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

### Create a PR with JSdotNet Account

```
Invoke: create-pr-jsdotnet
- Title: "Add GitHub Copilot App integration"
- Description: Comprehensive change summary
- Labels: feature, copilot-app
- Branch: already committed on feature branch
```

### Orchestrate New Project Setup

```
Invoke: orchestrate-project-setup
- Project: "ReportingEngine"
- Type: "ASP.NET Core API"
- Include: Dev Container, architecture docs, setup scripts
```

### Orchestrate MVP Creation

```
Invoke: orchestrate-create-mvp
- Project: "PaymentService"
- Core features: Payments, webhooks, reporting
- Timeline: 4 weeks
- Deploy to: Azure Container Apps
```

### Orchestrate Package Updates

```
Invoke: orchestrate-update-packages
- Project: "CoreLibrary"
- Update types: Security, critical patches
- Testing: Full integration suite
- Deployment: Staging → Production
```

### Orchestrate Feature Development

```
Invoke: orchestrate-feature
- Feature: "Role-Based Access Control"
- Epic: "Security & Authorization"
- Target: Next sprint
- Deployment: Blue-green strategy
```

### Orchestrate Bug Fix

```
Invoke: orchestrate-bug
- Bug: "Login fails with special characters"
- Severity: High
- Root cause: Input sanitization missing
- Deploy: Production (same day hotfix)
```

## Integration Architecture

```
GitHub Copilot App
    ↓
copilot-app plugin
    ├── create-pr-jsdotnet
    └── orchestrate-* skills
        ├── Coordinates with development plugin
        ├── Coordinates with architecture plugin
        ├── Coordinates with csharp-coding plugin
        ├── Coordinates with product-owner plugin
        ├── Coordinates with documentation plugin
        └── Coordinates with review plugin
```

## Workflow Coordination Model

Each orchestration skill follows a similar multi-stage workflow:

1. **Planning** - Define scope, requirements, and approach
2. **Design** - Architecture and design decisions
3. **Implementation** - Code and resource creation
4. **Testing** - Quality assurance and validation
5. **Review** - Peer and security review
6. **Documentation** - Update docs, changelog, guides
7. **Deployment** - Release to production with monitoring

Agent selection per stage is automated based on the task context.

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
