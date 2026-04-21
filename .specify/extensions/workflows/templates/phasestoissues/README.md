# PhasesToIssues Workflow

## Overview

The **phasestoissues** utility creates individual GitHub issues for each development phase with task sub-issues, allowing parallel work and better tracking of complex features.

## Purpose

Convert your spec-kit feature specification into hierarchical GitHub issues:
- **Parent issues**: One per development phase with phase-level context
- **Sub-issues**: One per task within each phase for granular tracking
- Phase description and goals
- Acceptance criteria for each phase
- Individual task tracking and assignment
- Implementation guidance
- Workflow-aware labels

## When to Use

Use this command when you want to:
- Create **one GitHub issue per development phase** (design, implementation, testing, etc.)
- Enable parallel work across different phases
- Track progress at a more granular level
- Facilitate better delegation and ownership
- Break down complex features into manageable chunks

## Command

```bash
/speckit.phasestoissues [optional context]
```

## Prerequisites

- Feature branch checked out
- `spec.md` exists in feature directory (with phases defined)
- `tasks.md` exists in feature directory (task breakdown)
- Git remote is a GitHub repository
- GitHub MCP server configured (for issue creation)

## What It Creates

Hierarchical GitHub issues with parent phases and task sub-issues:

**Phase 1: Design & Planning (Parent Issue #123)**
```markdown
## Description
[Design phase goals from spec.md]

## Acceptance Criteria
- [ ] Architecture documented
- [ ] API contracts defined
- [ ] Dependencies identified

## Tasks
See sub-issues for individual task tracking.

## Context
**Branch**: feature/001-user-auth
**Phase**: 1/3
**Feature Directory**: specs/001-user-auth/
```

**Task Sub-Issues for Phase 1:**
- **#124**: T001: Create architecture diagram
- **#125**: T002: Define API contracts

**Phase 2: Implementation (Parent Issue #126)**
```markdown
## Description
[Implementation phase goals]

## Acceptance Criteria
- [ ] Core functionality implemented
- [ ] Unit tests passing
- [ ] Code reviewed

## Tasks
See sub-issues for individual task tracking.

## Context
**Branch**: feature/001-user-auth
**Phase**: 2/3
**Depends On**: Phase 1 (#123)
```

**Task Sub-Issues for Phase 2:**
- **#127**: T003: Implement authentication service
- **#128**: T004: Add unit tests

## Labels

Automatically adds workflow-aware labels based on branch pattern:

- `bugfix/*` → `bug`, `bugfix`
- `refactor/*` → `refactor`, `technical-debt`
- `hotfix/*` → `hotfix`, `urgent`
- `modify/*` → `enhancement`, `modification`
- `deprecate/*` → `deprecation`, `breaking-change`
- Standard features → `feature`, `enhancement`

Plus status labels:
- `status: planning` - Tasks exist but none completed
- `status: in-progress` - Some tasks completed

## Example Usage

### Basic Usage

```bash
# From your feature branch
/speckit.phasestoissues
```

### With Context

```bash
# Add specific context or guidance
/speckit.phasestoissues "Include dependencies between phases"
```

### Output

```
✅ GitHub Issues Created

Phase 1: Design & Planning
  Issue: #123
  URL: https://github.com/user/repo/issues/123

Phase 2: Implementation
  Issue: #124
  URL: https://github.com/user/repo/issues/124

Phase 3: Testing & Validation
  Issue: #125
  URL: https://github.com/user/repo/issues/125

Total: 3 issues created
Labels: feature, status: planning

Next Steps:
1. Review issues on GitHub
2. Assign phases to different team members
3. Add to project board/milestone
4. Track progress per phase
```

## Workflow Integration

Fits naturally into spec-kit workflows:

### 1. Planning Phase
```bash
/speckit.plan      # Create spec.md with phases defined
/speckit.tasks     # Break down into tasks.md
```

### 2. Issue Creation
```bash
/speckit.phasestoissues  # Create GitHub issues per phase
```

### 3. Implementation
```bash
/speckit.implement  # Execute tasks
# Update phase issues as you complete related tasks
```

### 4. Review
```bash
/speckit.review     # Validate completion
# Update phase issues with review results
```

## Comparison with Single-Issue Approach

| Aspect | Single Issue | PhasesToIssues |
|--------|--------------|------------------|
| **Creates** | One issue for entire feature | One issue per phase |
| **GitHub Issues** | 1 issue with many checkboxes | N issues (phase count) |
| **Parallelization** | Limited | Multiple phases in parallel |
| **Ownership** | One person/pair | Different owners per phase |
| **Progress Tracking** | Single completion bar | Per-phase progress |
| **Best For** | Small features | Complex, multi-phase features |

## Best Practices

1. **Define clear phases**: Ensure phases are well-defined in spec.md (design, implementation, testing, etc.)
2. **Establish dependencies**: Document which phases depend on others
3. **Assign ownership**: Assign phase issues to appropriate team members
4. **Update regularly**: Update phase issues as work progresses
5. **Use milestones**: Add all phase issues to appropriate milestone/project
6. **Link commits**: Reference phase issues in commit messages
7. **Review per phase**: Use `/speckit.review` to validate each phase completion

## Troubleshooting

### "Remote is not a GitHub URL"
- Ensure your Git remote points to a GitHub repository
- Check with: `git config --get remote.origin.url`

### "No spec.md found"
- Run `/speckit.plan` first to create the specification with phases
- Ensure you're on a feature branch with a feature directory

### "No phases defined"
- Update spec.md to include clear phase definitions
- Consider using sections like "Design Phase", "Implementation Phase", "Testing Phase"

### "No tasks.md found"
- Run `/speckit.tasks` to break down work into tasks
- Tasks will be grouped by phase in the created issues

## Safety Features

- **Validates GitHub remote**: Won't create issues in wrong repository
- **Comprehensive error handling**: Clear messages for missing prerequisites
- **CAUTION checks**: Multiple safety checks before creating issues
- **Context preservation**: All feature context included in issues
- **Phase dependencies**: Tracks dependencies between phases

## Related Commands

- `/speckit.plan` - Create specification with phases
- `/speckit.tasks` - Break down work into tasks
- `/speckit.implement` - Execute task implementation
- `/speckit.review` - Validate phase completion

## Additional Resources

See also:
- [PhasesToIssues Guide](../../../docs/phasestoissues.md)
- [Spec-Kit Documentation](https://github.com/github/spec-kit)
- [GitHub Issues Documentation](https://docs.github.com/en/issues)
