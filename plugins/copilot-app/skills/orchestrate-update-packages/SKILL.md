---
name: orchestrate-update-packages
description: 'Orchestrate dependency and package update workflows. Use this skill to coordinate safe, automated updates of NuGet packages, npm modules, SDKs, and tools across projects. Includes security scanning, compatibility testing, and release management stages.'
---

# Orchestrate Update Packages

Execute a complete package update workflow with validation, testing, and deployment.

## Workflow Stages

### Stage 1: Dependency Analysis
- **Scan all dependencies** for updates available
- **Check security vulnerabilities** (CVE, advisory warnings)
- **Identify breaking changes** in major versions
- **Review changelogs** and release notes

**Agents:** `csharp-coding:coding`, `development:developer`

### Stage 2: Update Planning
- **Categorize updates** (security, patch, minor, major)
- **Prioritize critical/security updates** first
- **Plan rollback strategy** for risky updates
- **Coordinate with stakeholders** for major version upgrades

**Agents:** `product-owner:product-owner`, `development:development-plan`

### Stage 3: Staged Updates
- **Create update branch** per update batch
- **Update packages** using appropriate package managers:
  - NuGet: `nuget-manager` skill
  - npm: Package manager commands
  - .NET SDK: `dotnet` CLI
- **Verify lockfiles** and dependency resolution

**Agents:** `csharp-coding:coding`, `development:developer`

### Stage 4: Compatibility Testing
- **Run full test suite** against updated dependencies
- **Check API compatibility** for breaking changes
- **Perform integration tests** across services
- **Validate build pipeline** with new versions

**Agents:** `development:testing`, `review:reviewer`

### Stage 5: Security Validation
- **Run SAST scanning** (Aikido, Snyk, etc.)
- **Check for security advisories** in updated packages
- **Review dependency tree** for transitive vulnerabilities
- **Document any exceptions** to security policy

**Agents:** `csharp-coding:coding`, `development:security`

### Stage 6: Code Review & Quality Gates
- **Review dependency changes** in PR
- **Check for deprecated API usage**
- **Validate performance metrics**
- **Approve for staging deployment**

**Agents:** `review:reviewer`, `csharp-coding:coding`

### Stage 7: Deployment & Monitoring
- **Deploy to staging** environment
- **Monitor application health** post-update
- **Run smoke tests** and user scenarios
- **Deploy to production** (if no issues detected)

**Agents:** `development:developer`, `csharp-coding:coding`

## Usage Pattern

```
Orchestrate package updates for:
- Project: "PaymentService"
- Update types: Security, critical patches
- Testing: Full integration test suite
- Deployment: Staging → Production
- Notify: On completion with changelog summary
```

## Update Categories

| Category | Urgency | Testing | Deployment |
|----------|---------|---------|-----------|
| Security patches | Critical | Full suite | Fast-track |
| Bug fix patches | High | Core tests | Standard |
| Minor versions | Medium | Full suite | Staged |
| Major versions | Low | Extended | Careful review |

## Integration Points

- **Development Plugin**: Use `nuget-manager` and package update skills
- **C# Coding Plugin**: Code review for compatibility issues
- **Review Plugin**: Security and quality validation
- **Architecture Plugin**: Impact analysis on system design
- **GitHub Copilot App**: Progress tracking and notifications

## Reference

Source skill location: `plugins/copilot-app/skills/orchestrate-update-packages/SKILL.md`
