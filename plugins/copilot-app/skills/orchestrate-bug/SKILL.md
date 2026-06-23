---
name: orchestrate-bug
description: 'Orchestrate bug resolution workflow from triage through deployment. Use this skill to manage bug lifecycle including reproduction, root cause analysis, fix implementation, verification, and production deployment. Prioritizes speed for critical issues and quality for all fixes.'
---

# Orchestrate Bug Resolution

Execute a complete bug fix workflow from identification through production deployment.

## Workflow Stages

### Stage 1: Bug Triage & Analysis
- **Reproduce the bug** following provided steps
- **Determine severity** and impact assessment
- **Identify affected versions** and users
- **Create detailed bug report** with logs/traces
- **Assign priority** (critical, high, medium, low)

**Agents:** `product-owner:product-owner`, `development:developer`, `review:reviewer`

### Stage 2: Root Cause Analysis
- **Debug issue** using logs and diagnostics
- **Identify root cause** in codebase
- **Check for related bugs** (similar patterns)
- **Document findings** for the fix
- **Create minimal reproduction case**

**Agents:** `csharp-coding:coding`, `development:developer`

### Stage 3: Fix Implementation
- **Create hotfix branch** (for critical issues)
- **Implement minimal fix** addressing root cause
- **Add regression test** to prevent recurrence
- **Validate fix** doesn't break other functionality
- **Consider performance impact**

**Agents:** `csharp-coding:coding`, `development:developer`

### Stage 4: Testing & Verification
- **Run unit tests** including new regression test
- **Perform integration testing** on affected features
- **Test edge cases** and boundary conditions
- **Verify fix** in reproduction environment
- **Check for side effects**

**Agents:** `development:testing`, `csharp-coding:coding`

### Stage 5: Code Review & Security
- **Submit PR for urgent review** (critical bugs)
- **Address review feedback** immediately
- **Run security scanning** for vulnerability checks
- **Verify all automated checks** pass
- **Approve for immediate merge** (critical) or normal review

**Agents:** `review:reviewer`, `csharp-coding:coding`

### Stage 6: Documentation & Communication
- **Update changelog** with bug fix details
- **Document workaround** if applicable
- **Create incident post-mortem** (for critical bugs)
- **Update documentation** if behavior changed
- **Notify affected users** (if applicable)

**Agents:** `documentation:documentation`, `product-owner:product-owner`

### Stage 7: Deployment & Monitoring
- **Merge PR** (immediately for critical)
- **Build and create patch release** if needed
- **Deploy to production** (expedited for critical)
- **Monitor closely** for 24+ hours post-deployment
- **Collect feedback** from users

**Agents:** `csharp-coding:coding`, `development:developer`

## Severity Levels & Response Times

| Severity | Description | Response | Deploy |
|----------|-------------|----------|--------|
| Critical | System down, data loss, security | Immediate | ASAP |
| High | Major feature broken, significant impact | 2-4 hours | Same day |
| Medium | Feature degraded, workaround exists | 1-2 days | Next release |
| Low | Minor issue, cosmetic, edge case | 1 week | Normal cycle |

## Usage Pattern

```
Orchestrate bug fix for:
- Bug: "Login fails with special characters in password"
- Severity: High (affects 5% of users)
- Affected versions: 2.1.0, 2.1.1
- Root cause: Insufficient input sanitization
- Fix type: Hotfix
- Deploy target: Production (same day)
```

## Critical Bug Hotfix Process

```
1. Branch: hotfix/bug-id (from latest production tag)
2. Fix: Minimal changes, test thoroughly
3. PR: Immediate review (no waiting)
4. Merge: Direct to main and develop
5. Release: Create v2.1.2-hotfix
6. Deploy: To production immediately
7. Monitor: Intensive for 24 hours
```

## Integration Points

- **Product Owner Plugin**: Bug reporting and triage
- **Development Plugin**: Root cause analysis and planning
- **C# Coding Plugin**: Fix implementation and testing
- **Review Plugin**: Quality and security validation
- **GitHub Copilot App**: Bug status and deployment tracking
- **GitHub Issues**: Bug tracking and communication

## Reference

Source skill location: `plugins/copilot-app/skills/orchestrate-bug/SKILL.md`
