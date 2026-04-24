# Extension System Quickstart

Get started with Specify extension workflows in 5 minutes.

## What Are Extensions?

Extensions add specialized workflows to Specify for activities beyond feature development:

- `/speckit.bugfix` - Fix defects with regression tests
- `/speckit.modify` - Change existing features with impact analysis
- `/speckit.refactor` - Improve code quality with metrics tracking
- `/speckit.hotfix` - Emergency production fixes with expedited process
- `/speckit.deprecate` - Sunset features with phased rollout

## Quick Decision Tree

**What are you doing?**

```
Building something new?
└─ Use `/speckit.specify "description"`

Fixing broken behavior?
├─ Production emergency?
│  └─ Use `/speckit.hotfix "incident description"`
└─ Non-urgent bug?
   └─ Use `/speckit.bugfix "bug description"`

Changing existing feature?
├─ Adding/modifying behavior?
│  └─ Use `/speckit.modify 014 "change description"`
└─ Improving code without changing behavior?
   └─ Use `/speckit.refactor "improvement description"`

Removing a feature?
└─ Use `/speckit.deprecate 014 "deprecation reason"`
```

## 5-Minute Tutorial

### Example 1: Fix a Bug

```bash
# Step 1: Create bug report
/speckit.bugfix "save button doesn't persist data"
# Creates: bug-report.md with initial analysis
# Shows: Next steps to review and investigate

# Step 2: Investigate and update bug-report.md with root cause
# Review the bug report, reproduce the issue, identify the problem

# Step 3: Create fix plan
/speckit.plan
# Creates: Detailed fix plan with regression test strategy

# Step 4: Break down into tasks
/speckit.tasks
# Creates: Task list (reproduce, write regression test, fix, verify)

# Step 5: Execute fix
/speckit.implement
# Runs all tasks including regression-test-first approach
```

**Key principle**: Test-first approach with review checkpoints ensures bug won't recur.

### Example 2: Modify a Feature

```bash
# Step 1: Create modification spec with impact analysis
/speckit.modify 014 "add avatar compression to reduce storage costs"
# Creates: modification-spec.md + impact-analysis.md
# Shows: Impact summary and next steps

# Step 2: Review modification spec and impact analysis
# Check affected files, assess backward compatibility, refine requirements

# Step 3: Create implementation plan
/speckit.plan
# Creates: Detailed plan for implementing changes

# Step 4: Break down into tasks
/speckit.tasks
# Creates: Task list (update contracts, update tests, implement)

# Step 5: Execute changes
/speckit.implement
# Runs all tasks in correct order
```

**Key principle**: Impact analysis with review checkpoints prevents breaking other features.

### Example 3: Refactor Code

```bash
# Step 1: Create refactor spec
/speckit.refactor "extract tweet submission into reusable service"
# Creates: refactor-spec.md with behavioral snapshot
# Automatically captures baseline metrics

# Step 2: Review refactoring goals and captured baseline metrics
cat specs/refactor/001-extract-tweet-service/metrics-before.md
# Baseline metrics are automatically captured - review them to confirm

# Step 3: Create refactoring plan
/speckit.plan
# Creates: Detailed incremental refactoring plan

# Step 4: Break down into tasks
/speckit.tasks
# Creates: Task list with small, testable increments

# Step 5: Execute refactoring
/speckit.implement
# Runs all tasks incrementally with tests between each step
```

**Key principle**: Incremental changes with tests and review checkpoints between each step.

### Example 4: Emergency Hotfix

```bash
# Step 1: Create hotfix documentation (URGENT!)
/speckit.hotfix "database connection pool exhausted causing 503 errors"
# Creates: hotfix.md and post-mortem.md
# Shows: URGENT next steps

# Step 2: Quick assessment and stakeholder notification
# Assess severity, notify team, begin investigation

# Step 3: Create expedited fix plan
/speckit.plan
# Creates: Fast-track fix plan (skip extensive analysis)

# Step 4: Create immediate action tasks
/speckit.tasks
# Creates: Urgent task list (fix first, tests after)

# Step 5: Execute emergency fix
/speckit.implement
# Apply fix immediately, deploy, monitor

# Post-deployment (within 24-48 hours):
# - Write regression test
# - Complete post-mortem
```

**Key principle**: Speed matters in emergencies - tests come after deployment, but post-mortem is mandatory.

### Example 5: Deprecate a Feature

```bash
# Step 1: Create deprecation plan with dependency analysis
/speckit.deprecate 014 "low usage (< 1%) and high maintenance burden"
# Creates: deprecation-plan.md + dependency-analysis.md
# Shows: Impact summary and next steps

# Step 2: Review deprecation plan and get stakeholder approval
# Check affected users, review 3-phase timeline, get sign-off

# Step 3: Create detailed implementation plan
/speckit.plan
# Creates: 3-phase rollout plan with specific actions

# Step 4: Break down into phased tasks
/speckit.tasks
# Creates: Task list for Phase 1 (warnings), Phase 2 (disable), Phase 3 (remove)

# Step 5: Execute Phase 1
/speckit.implement
# Implement warnings and migration guides
# (Repeat steps 3-5 for Phase 2 and Phase 3 after appropriate waiting periods)
```

**Key principle**: Gradual 3-phase sunset with stakeholder approval gives users time to migrate.

## Workflow Cheat Sheet

| Workflow | Command | When to Use | Key Feature |
|----------|---------|-------------|-------------|
| **Feature** | `/speckit.specify "..."` | New functionality | Full spec + TDD |
| **Bugfix** | `/speckit.bugfix "..."` | Broken behavior | Regression test first |
| **Modify** | `/speckit.modify 014 "..."` | Change existing | Impact analysis |
| **Refactor** | `/speckit.refactor "..."` | Code quality | Metrics + incremental |
| **Hotfix** | `/speckit.hotfix "..."` | Production emergency | Tests after (only exception) |
| **Deprecate** | `/speckit.deprecate 014 "..."` | Remove feature | 3-phase sunset |

## Common Questions

### When should I use `/speckit.bugfix` vs `/speckit.hotfix`?

- **Bugfix**: Non-urgent, can wait for proper TDD process
- **Hotfix**: Production emergency, every minute counts

### When should I use `/speckit.modify` vs `/speckit.refactor`?

- **Modify**: Changing what the code does (behavior)
- **Refactor**: Improving how the code works (structure/quality)

If tests need to change, it's a modification. If tests stay the same, it's a refactor.

### Can I skip phases in deprecation?

No. The 3-phase approach is required to give users adequate migration time. Skipping phases causes user churn and support burden.

### What if I pick the wrong workflow?

No problem! The worst case is you have the wrong template. You can:
1. Create a new branch with the correct workflow
2. Copy over your work
3. Delete the old branch

## File Structure

Extensions create organized directories:

```
specs/
├── 014-edit-profile-form/          # Original feature
│   ├── spec.md
│   ├── plan.md
│   ├── tasks.md
│   └── modifications/               # Modifications to feature 014
│       └── 001-add-compression/
│           ├── modification-spec.md
│           ├── impact-analysis.md
│           ├── plan.md                # Created by /speckit.plan
│           └── tasks.md               # Created by /speckit.tasks
├── bugfix/
│   └── 001-save-button/              # Standalone bugfix
│       ├── bug-report.md
│       ├── plan.md                    # Created by /speckit.plan
│       └── tasks.md                   # Created by /speckit.tasks
├── refactor/
│   └── 001-extract-service/          # Standalone refactor
│       ├── refactor-spec.md
│       ├── behavioral-snapshot.md
│       ├── plan.md                    # Created by /speckit.plan
│       └── tasks.md                   # Created by /speckit.tasks
├── hotfix/
│   └── 001-connection-pool/          # Emergency hotfix
│       ├── hotfix.md
│       ├── post-mortem.md
│       ├── plan.md                    # Created by /speckit.plan
│       └── tasks.md                   # Created by /speckit.tasks
└── deprecate/
    └── 001-old-editor/               # Feature deprecation
        ├── deprecation-plan.md
        ├── dependency-analysis.md
        ├── plan.md                    # Created by /speckit.plan
        └── tasks.md                   # Created by /speckit.tasks
```

## Next Steps

1. **Try it**: Use a workflow on real work
2. **Read docs**: Check workflow-specific READMEs for details
3. **Customize**: Edit templates if needed for your project
4. **Share feedback**: What works? What doesn't?

## Resources

- [Extension README](.specify/extensions/README.md) - Full documentation
- [Development Guide](.specify/extensions/DEVELOPMENT.md) - Create custom workflows
- [Project Constitution](.specify/memory/constitution.md) - Quality gates per workflow
- Workflow-specific docs:
  - [Bugfix](workflows/bugfix/README.md)
  - [Modify](workflows/modify/README.md)
  - [Refactor](workflows/refactor/README.md)
  - [Hotfix](workflows/hotfix/README.md)
  - [Deprecate](workflows/deprecate/README.md)

## Troubleshooting

**Command doesn't work**: Ensure you're using the exact format:
- ✅ `/speckit.bugfix "description"`
- ❌ `/speckit.bugfix description` (missing quotes)

**Script fails**: Check you're in the repository root with `.specify/` directory

**Wrong workflow used**: Start over with correct workflow, copy work over

**Need help**: Check the workflow-specific README or ask in your project's communication channel

---

**Ready to start?** Pick a workflow above and try it on your next task!

*Extension System Quickstart - Version 1.0.0*
