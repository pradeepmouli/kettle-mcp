---
name: spec-kit
description: Use when working with spec-kit (SDD) and spec-kit-extensions for structured development workflows - features, bugs, modifications, refactoring, and more
user-invocable: true
---

# Spec-Kit + Extensions

Spec-Kit is GitHub's Spec-Driven Development toolkit. Combined with spec-kit-extensions, it provides structured workflows for the complete software development lifecycle.

## Quick Decision Tree

```
Starting with spec-kit?
└─ /speckit.baseline → establish project context

Building something new?
├─ Major feature (multi-phase)?  → /speckit.specify "description"
└─ Minor enhancement (quick)?    → /speckit.enhance "description"

Fixing broken behavior?
├─ Production emergency?         → /speckit.hotfix "incident"
└─ Non-urgent bug?              → /speckit.bugfix "bug description"

Changing existing feature?
├─ Adding/modifying behavior?    → /speckit.modify 014 "change"
└─ Improving code (no behavior change)? → /speckit.refactor "improvement"

Removing a feature?
└─ /speckit.deprecate 014 "reason"

Reviewing completed work?
└─ /speckit.review [task-id]
```

## Installation

```bash
# Install spec-kit CLI
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# Initialize in project
specify init . --ai claude

# Install extensions
pip install specify-extend
specify-extend --all

# With GitHub integration (optional)
specify-extend --all --github-integration
```

## Core Commands Reference

### Feature Development (spec-kit core)

| Command | Description |
|---------|-------------|
| `/speckit.constitution` | Create project governing principles |
| `/speckit.specify "desc"` | Define requirements (what + why, not how) |
| `/speckit.clarify` | Clarify underspecified areas (before plan) |
| `/speckit.plan "tech"` | Create technical implementation plan |
| `/speckit.tasks` | Generate actionable task breakdown |
| `/speckit.implement` | Execute all tasks |
| `/speckit.analyze` | Cross-artifact consistency check |
| `/speckit.checklist` | Generate quality checklists |

### Extended Workflows (spec-kit-extensions)

| Command | Description | Branch Pattern |
|---------|-------------|----------------|
| `/speckit.baseline` | Establish project baseline | `baseline/001-name` |
| `/speckit.bugfix "desc"` | Bug fix (regression-test-first) | `bugfix/001-name` |
| `/speckit.enhance "desc"` | Minor enhancement (streamlined) | `enhance/001-name` |
| `/speckit.modify 014 "desc"` | Modify feature (impact analysis) | `modify/014^002-name` |
| `/speckit.refactor "desc"` | Code quality (metrics tracked) | `refactor/001-name` |
| `/speckit.hotfix "desc"` | Production emergency (post-mortem) | `hotfix/001-name` |
| `/speckit.deprecate 014 "desc"` | Feature sunset (3-phase) | `deprecate/014-name` |
| `/speckit.cleanup` | Codebase cleanup (automated) | `cleanup/001-name` |
| `/speckit.review [id]` | Review completed work | N/A |
| `/speckit.incorporate` | Integrate documents | N/A |

## Workflow Cheat Sheet

| Workflow | Key Feature | Test Strategy |
|----------|-------------|---------------|
| `/speckit.specify` | Full spec + design | TDD |
| `/speckit.baseline` | Context tracking | No tests |
| `/speckit.bugfix` | Regression test | **Test before fix** |
| `/speckit.enhance` | Single-doc workflow | Tests for new behavior |
| `/speckit.modify 014` | Impact analysis | Update affected tests |
| `/speckit.refactor` | Metrics tracking | Tests unchanged |
| `/speckit.hotfix` | Post-mortem | Test after (exception) |
| `/speckit.deprecate 014` | 3-phase sunset | Remove tests last |
| `/speckit.review` | Structured feedback | Verify tests |

## Standard Feature Workflow

```bash
# 1. Establish principles (once per project)
/speckit.constitution Create principles for code quality, testing, UX

# 2. Create specification (what + why, NOT tech stack)
/speckit.specify Build a photo organizer with albums grouped by date,
drag-and-drop reordering, tile preview interface

# 3. Clarify requirements (recommended)
/speckit.clarify

# 4. Technical plan (now specify tech stack)
/speckit.plan Use Vite with vanilla JS. Local SQLite database.

# 5. Generate task breakdown
/speckit.tasks

# 6. Execute implementation
/speckit.implement
```

## Bug Fix Workflow

```bash
# 1. Create bug report
/speckit.bugfix "profile form crashes when submitting without image"
# Creates: bug-report.md, branch: bugfix/001-profile-crash

# 2. Investigate, update bug-report.md with root cause

# 3. Create fix plan with regression test strategy
/speckit.plan

# 4. Task list: reproduce, write test, fix, verify
/speckit.tasks

# 5. Execute (regression-test-first!)
/speckit.implement
```

## Modification Workflow

```bash
# 1. Create modification with impact analysis
/speckit.modify 014 "make profile fields optional"
# Creates: modification-spec.md + impact-analysis.md

# 2. Review impact analysis for:
#    - Affected files and contracts
#    - Backward compatibility
#    - Breaking changes

# 3. Plan implementation
/speckit.plan

# 4. Break down tasks
/speckit.tasks

# 5. Execute changes
/speckit.implement
```

## Refactoring Workflow

```bash
# 1. Create refactor with baseline metrics
/speckit.refactor "reduce code duplication in user service"

# 2. Document baseline metrics:
#    - Code duplication %
#    - Cyclomatic complexity
#    - Lines of code

# 3. Plan refactoring approach
/speckit.plan

# 4. Execute (tests should NOT change)
/speckit.implement

# 5. Compare before/after metrics
```

## Hotfix Workflow (Production Emergency)

```bash
# 1. Create hotfix (expedited)
/speckit.hotfix "payment processing failing for Stripe webhooks"

# 2. Fix immediately (only workflow where test comes AFTER)

# 3. Add tests post-fix

# 4. Complete post-mortem documentation

# 5. Add preventive measures
```

## Project Structure

```
your-project/
├── .specify/
│   ├── memory/
│   │   └── constitution.md        # Project principles
│   ├── extensions/
│   │   ├── enabled.conf           # Enable/disable workflows
│   │   └── workflows/             # Extension templates
│   ├── scripts/bash/
│   │   ├── create-bugfix.sh
│   │   ├── create-enhance.sh
│   │   └── ...
│   └── specs/
│       └── 001-feature/
│           ├── spec.md            # Specification
│           ├── plan.md            # Implementation plan
│           ├── tasks.md           # Task breakdown
│           └── ...
└── .claude/commands/              # Slash commands
    ├── speckit.specify.md
    ├── speckit.bugfix.md
    └── ...
```

## Enable/Disable Workflows

Edit `.specify/extensions/enabled.conf`:

```conf
# Common combinations:
# Minimal: bugfix only
# Standard: bugfix + enhance + modify
# Complete: all workflows

bugfix=enabled
enhance=enabled
modify=enabled
refactor=enabled
hotfix=enabled
deprecate=disabled
cleanup=disabled
```

## Best Practices

### 1. Separate Concerns

- **`/speckit.specify`**: What + why (no tech stack)
- **`/speckit.plan`**: How (tech stack)

### 2. Always Clarify Before Planning

```bash
/speckit.specify "..."
/speckit.clarify        # ← Don't skip this!
/speckit.plan "..."
```

### 3. Pick the Right Workflow

| Situation | DON'T use | DO use |
|-----------|-----------|--------|
| Simple bug | `/speckit.specify` | `/speckit.bugfix` |
| Minor tweak | `/speckit.specify` | `/speckit.enhance` |
| Code cleanup | `/speckit.modify` | `/speckit.refactor` |

### 4. Review Before PRs

```bash
/speckit.review
# Review file is REQUIRED before creating PR
```

### 5. Use Impact Analysis

For modifications, always review impact before planning:
```bash
/speckit.modify 014 "description"
# Review impact-analysis.md BEFORE /speckit.plan
```

## CLI Reference

```bash
# spec-kit CLI
specify init . --ai claude          # Initialize
specify init . --force              # Force overwrite
specify check                       # Check tools

# spec-kit-extensions CLI
specify-extend --all                # Install all
specify-extend --dry-run            # Preview
specify-extend bugfix modify        # Install specific
specify-extend --github-integration # Add GitHub features
specify-extend --llm-enhance        # AI-assisted constitution merge
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SPECIFY_FEATURE` | Override feature detection for non-Git repos |

## Resources

- [spec-kit Repository](https://github.com/github/spec-kit)
- [spec-kit-extensions Repository](https://github.com/pradeepmouli/spec-kit-extensions)
- [Spec-Driven Development Guide](https://github.com/github/spec-kit/blob/main/spec-driven.md)
- [Installation Guide](https://github.com/pradeepmouli/spec-kit-extensions/blob/main/INSTALLATION.md)
