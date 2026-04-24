# Refactor Workflow

## Overview

The refactor workflow is for improving code quality without changing behavior. It emphasizes **metrics-driven improvement** and **behavior preservation** through comprehensive testing between each change.

## When to Use

Use `/speckit.refactor` when:

- Code works but is hard to understand/maintain
- Identifying code smells (duplication, complexity, coupling)
- Improving performance without changing functionality
- Restructuring code for better organization
- Extracting reusable components
- Reducing technical debt

**Do NOT use `/speckit.refactor` for**:
- Changing behavior intentionally → use `/speckit.modify` instead
- Fixing bugs → use `/speckit.bugfix` instead
- Adding features → use `/speckit.specify` instead
- Improving code as part of feature work → include in feature tasks

## Core Principle

**Behavior MUST NOT change during refactoring.**

All existing tests should pass before, during, and after the refactor. If tests need modification, it's not a refactoring - it's a modification.

## Process

### 0. Testing Gap Assessment (Pre-Baseline)
**CRITICAL FIRST STEP**: Assess test coverage BEFORE capturing baseline

- **Purpose**: Ensure adequate test coverage exists to validate behavior preservation
- **Document**: Complete `testing-gaps.md` to identify coverage gaps
- **Assess**: Review all code that will be modified during refactoring
- **Identify**: Document critical testing gaps (untested functionality)
- **Add Tests**: Write tests for all critical gaps BEFORE proceeding
- **Validate**: Ensure all new tests pass

**Why this matters**: Refactoring requires verifying behavior is preserved. Without adequate test coverage, we cannot validate that the refactor didn't break anything.

**Checkpoint**: Only proceed to baseline capture when critical testing gaps are addressed.

### 1. Baseline Capture
- Baseline metrics are **automatically captured** when you run `/speckit.refactor`
- To manually re-capture: `.specify/extensions/workflows/refactor/measure-metrics.sh --before`
- Document current metrics (LOC, complexity, performance, bundle size)
- Run all tests and record pass rate (including newly added tests from Phase 0)
- Create behavioral snapshot
- Commit baseline

### 2. Target Setting
- Define specific improvement goals (e.g., "reduce complexity by 30%")
- Document code smells being addressed
- Set measurable success criteria
- Estimate effort and risk

### 3. Incremental Refactoring
**CRITICAL RULE**: After EVERY change, tests must pass

- Make one small change
- Run tests
- Tests must pass before proceeding
- Commit
- Repeat

This ensures you always have a working state to return to.

### 4. Post-Refactor Verification
- Run `measure-metrics.sh --after` to capture new state
- Compare metrics to baseline
- Verify improvement goals met
- Ensure no performance regressions
- Verify bundle size didn't increase unexpectedly

### 5. Deployment & Monitoring
- Deploy to staging
- Run performance tests
- Monitor error rates
- Deploy to production
- Monitor for 24-48 hours

## Quality Gates

- ✅ **Testing gaps MUST be assessed and addressed before baseline** (NEW)
- ✅ Critical test coverage gaps MUST be filled before proceeding
- ✅ Baseline metrics MUST be captured before any refactoring changes
- ✅ Tests MUST pass after EVERY incremental change
- ✅ Behavior preservation MUST be guaranteed (tests unchanged or only added)
- ✅ Target metrics MUST show measurable improvement
- ✅ No performance regressions allowed

## Files Created

```
specs/
└── refactor/
    └── 001-extract-tweet-service/
    ├── refactor-spec.md          # Refactoring goals (created by /speckit.refactor)
    ├── testing-gaps.md           # Testing gap assessment (NEW - created by /speckit.refactor)
    ├── behavioral-snapshot.md    # Behavior documentation (created by /speckit.refactor)
    ├── metrics-before.md         # Baseline metrics (created by /speckit.refactor)
    ├── metrics-after.md          # Post-refactor metrics (placeholder)
    ├── plan.md                   # Refactoring plan (created by /speckit.plan)
    └── tasks.md                  # Incremental tasks (created by /speckit.tasks)
```

## Command Usage

```bash
/speckit.refactor "extract tweet submission logic into reusable service"
```

This will:
1. Create branch `refactor/001-extract-tweet-service`
2. Generate `refactor-spec.md` with template
3. Generate `behavioral-snapshot.md` and `metrics-before.md` placeholders
4. Set `SPECIFY_REFACTOR` environment variable
5. Show "Next Steps" for checkpoint-based workflow

**Next steps after running the command:**
1. **FIRST**: Complete testing gap assessment in `testing-gaps.md`
   - Identify all code that will be modified
   - Assess test coverage for each area
   - Document critical gaps
   - Add tests for critical gaps BEFORE proceeding
2. Capture baseline metrics: `.specify/extensions/workflows/refactor/measure-metrics.sh --before`
3. Document behaviors to preserve in `behavioral-snapshot.md`
4. Run `/speckit.plan` to create incremental refactoring plan
5. Review the plan - are changes small enough? Tests after each?
6. Run `/speckit.tasks` to break down into incremental tasks
7. Review the tasks - tests must pass after EVERY task
8. Run `/speckit.implement` to execute refactoring incrementally

## Example Refactor Document

```markdown
# Refactor: Extract Tweet Service

**Refactor ID**: refactor-001
**Status**: Planning

## Motivation

**Code Smells Identified**:
- ❌ **Duplication**: Tweet submission logic duplicated in 3 routes
- ❌ **God Object**: TweetController has 500+ lines
- ❌ **Long Method**: createTweet() is 80 lines long
- ❌ **Poor Cohesion**: Validation, storage, notification mixed together

**Impact**:
- Bug fixes require changes in multiple places
- Testing is difficult due to tight coupling
- Adding features (mentions, media) would increase complexity

## Baseline Metrics

### Code Metrics
- **LOC**: 1,247 (app/routes/tweets/)
- **Cyclomatic Complexity**: 18 (createTweet function)
- **Duplication**: 23% (across 3 files)
- **Functions > 40 lines**: 5

### Performance Metrics
- **Tweet Submission**: 180ms p95
- **Bundle Size**: 245 KB (tweets chunk)

### Quality Metrics
- **Test Coverage**: 78%
- **Tests Passing**: 42/42 (100%)

## Target Metrics

### Code Metrics
- **LOC**: < 1,000 (reduce by 20%)
- **Cyclomatic Complexity**: < 10 (reduce by 44%)
- **Duplication**: < 5%
- **Functions > 40 lines**: 0

### Performance Metrics
- **Tweet Submission**: < 200ms p95 (no regression)
- **Bundle Size**: < 250 KB (no regression)

### Quality Metrics
- **Test Coverage**: > 85%
- **Tests Passing**: 100% (all must pass)

## Refactoring Steps

1. Extract validation → `TweetValidator` service
2. Extract storage → `TweetRepository` service
3. Extract notification → `NotificationService`
4. Simplify route handlers to orchestrate services
5. Add service-level tests
6. Remove duplication

## Behavior Preservation Guarantee

**No behavior changes allowed:**
- API contracts remain identical
- Response formats unchanged
- Error handling same
- Performance characteristics maintained
- All 42 existing tests pass without modification

## Risk Assessment

**Risk Level**: Medium

**Risks**:
- Service boundaries might be wrong initially
- Dependency injection may add complexity
- Team needs to learn new patterns

**Mitigation**:
- Incremental approach with tests after each step
- Code review before merging
- Rollback plan prepared
```

## Metrics Collection

The `measure-metrics.sh` script captures:

```markdown
# Metrics Snapshot (Before)

## Code Metrics
- **Total LOC**: 1,247
- **Average Function Length**: 23 lines
- **Max Function Length**: 80 lines
- **Cyclomatic Complexity**: 18 (worst function)
- **Duplication %**: 23%

## Performance Metrics
- **Response Time (p50)**: 85ms
- **Response Time (p95)**: 180ms
- **Response Time (p99)**: 320ms
- **Memory Usage**: 42 MB
- **CPU Usage**: 18%

## Bundle Metrics
- **Bundle Size**: 245 KB
- **Gzipped**: 78 KB
- **Dependencies**: 12 packages

## Test Metrics
- **Total Tests**: 42
- **Passing**: 42 (100%)
- **Coverage**: 78%
- **Test Runtime**: 2.3s
```

## Checkpoint-Based Workflow

The refactor workflow uses checkpoints with metrics to ensure code quality improves without breaking behavior:

### Phase 0: Testing Gap Assessment (NEW)
- **Command**: `/speckit.refactor "description"`
- **Creates**: `refactor-spec.md`, `testing-gaps.md`, `behavioral-snapshot.md`, `metrics-before.md`
- **Checkpoint**: Complete testing gap assessment FIRST. Identify untested code that will be refactored. Add tests for critical gaps BEFORE capturing baseline.

### Phase 1: Baseline Capture
- **Command**: `.specify/extensions/workflows/refactor/measure-metrics.sh --before`
- **Updates**: `metrics-before.md` with actual metrics
- **Checkpoint**: Capture baseline metrics AFTER testing gaps are addressed. Document behaviors to preserve.

### Phase 2: Refactoring Planning
- **Command**: `/speckit.plan`
- **Creates**: `plan.md` with incremental refactoring steps
- **Checkpoint**: Review plan - are steps small enough? Is there a test after EVERY change?

### Phase 3: Task Breakdown
- **Command**: `/speckit.tasks`
- **Creates**: `tasks.md` with micro-tasks (one per refactoring step + test)
- **Checkpoint**: Review tasks - every task must end with passing tests

### Phase 4: Incremental Execution
- **Command**: `/speckit.implement`
- **Executes**: Tasks one at a time, running tests after each
- **Result**: Refactored code with all tests passing, metrics improved

**Why checkpoints matter**: Refactoring without testing gap assessment, baseline metrics, or incremental testing leads to broken code. Checkpoints ensure you can always roll back to a working state.

## Tips

### Safe Refactoring Techniques

**1. Extract Method**
```typescript
// Before: Long method
function createTweet(content: string) {
  // Validation (20 lines)
  // Storage (25 lines)
  // Notification (15 lines)
}

// After: Extracted methods
function createTweet(content: string) {
  validateTweet(content)
  const tweet = storeTweet(content)
  notifyFollowers(tweet)
  return tweet
}
```

**2. Extract Class/Service**
```typescript
// Before: God class
class TweetController {
  validate() { ... }
  store() { ... }
  notify() { ... }
  format() { ... }
}

// After: Separate services
class TweetValidator { validate() }
class TweetRepository { store() }
class NotificationService { notify() }
class TweetFormatter { format() }
```

**3. Replace Conditional with Polymorphism**
```typescript
// Before: Type checking
if (type === 'text') { ... }
else if (type === 'image') { ... }
else if (type === 'video') { ... }

// After: Polymorphism
abstract class Tweet { render() }
class TextTweet extends Tweet { render() }
class ImageTweet extends Tweet { render() }
class VideoTweet extends Tweet { render() }
```

### Incremental Refactoring Steps

1. **Make one small change** (e.g., extract one variable)
2. **Run tests** - They must pass
3. **Commit** - So you can rollback if needed
4. **Repeat** - Next small change

Never make multiple changes before running tests. If tests fail, you won't know which change broke them.

### When to Stop Refactoring

**Stop when**:
- Target metrics achieved
- Code is readable and maintainable
- No obvious code smells remain
- Team agrees it's "good enough"

**Don't over-engineer**:
- Premature abstraction is worse than duplication
- Simpler is better than clever
- YAGNI applies to refactoring too

### Common Pitfalls

- ❌ **Changing behavior** → Not a refactor, it's a modification
- ❌ **Big-bang refactor** → Do incrementally with tests
- ❌ **No metrics** → How do you know it improved?
- ❌ **Skipping tests** → You'll break something

## Integration with Constitution

This workflow upholds:

- **Section III: Test-Driven Development** - Tests pass throughout
- **Section VI: Workflow Selection** - Proper workflow for quality improvements
- **Quality Gates** - Baseline metrics and behavior preservation required

## Related Workflows

- **Modify** - For changing behavior intentionally
- **Bugfix** - For fixing defects
- **Specify** - For adding new features

## Refactoring Catalog

Common refactorings to apply:

### Code Structure
- Extract Method
- Extract Class/Service
- Inline Method
- Move Method
- Rename Variable/Function

### Complexity Reduction
- Replace Conditional with Polymorphism
- Decompose Conditional
- Consolidate Duplicate Conditional Fragments
- Remove Dead Code

### Data Organization
- Encapsulate Field
- Replace Data Value with Object
- Change Value to Reference
- Extract Interface

### Dependency Management
- Hide Delegate
- Remove Middle Man
- Introduce Parameter Object
- Preserve Whole Object

---

*Refactor Workflow Documentation - Part of Specify Extension System*
