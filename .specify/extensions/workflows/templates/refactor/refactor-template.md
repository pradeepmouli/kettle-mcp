# Refactor Spec: [IMPROVEMENT DESCRIPTION]

**Refactor ID**: refactor-###
**Branch**: `refactor/###-short-description`
**Created**: [DATE]
**Type**: [ ] Performance | [ ] Maintainability | [ ] Security | [ ] Architecture | [ ] Tech Debt
**Impact**: [ ] High Risk | [ ] Medium Risk | [ ] Low Risk
**Status**: [ ] Planning | [ ] Baseline Captured | [ ] In Progress | [ ] Validation | [ ] Complete

## Input
User description: "$ARGUMENTS"

## Motivation

### Current State Problems
**Code Smell(s)**:
- [ ] Duplication (DRY violation)
- [ ] God Object/Class (too many responsibilities)
- [ ] Long Method (too complex)
- [ ] Feature Envy (accessing other object's data)
- [ ] Primitive Obsession
- [ ] Dead Code
- [ ] Magic Numbers/Strings
- [ ] Tight Coupling
- [ ] Other: [describe]

**Concrete Examples**:
- [File1.ts lines XX-YY: duplicated logic in 3 places]
- [File2.tsx lines AA-BB: 200-line function doing too much]
- [Service.ts: direct database access instead of using repository]

### Business/Technical Justification
[Why is this refactoring needed NOW?]
- [ ] Blocking new features
- [ ] Performance degradation
- [ ] Security vulnerability
- [ ] Causing frequent bugs
- [ ] Developer velocity impact
- [ ] Technical debt accumulation
- [ ] Other: [explain]

## Proposed Improvement

### Refactoring Pattern/Technique
**Primary Technique**: [Extract Method | Extract Class | Introduce Parameter Object | Replace Conditional with Polymorphism | etc.]

**High-Level Approach**:
[2-3 sentences explaining the refactoring strategy]

**Files Affected**:
- **Modified**: [file1.ts, file2.tsx, file3.ts]
- **Created**: [new-file.ts - extracted logic]
- **Deleted**: [old-file.ts - no longer needed]
- **Moved**: [util.ts → lib/util.ts]

### Design Improvements
**Before**:
```
[Simple diagram or description of current structure]
ComponentA → DirectDatabaseAccess
ComponentB → DirectDatabaseAccess
ComponentC → DirectDatabaseAccess
```

**After**:
```
[Simple diagram or description of improved structure]
ComponentA → Repository → Database
ComponentB → Repository → Database
ComponentC → Repository → Database
```

## Phase 0: Testing Gap Assessment
*CRITICAL: Complete BEFORE capturing baseline metrics - see testing-gaps.md*

### Pre-Baseline Testing Requirement
- [ ] **Testing gaps assessment completed** (see `testing-gaps.md`)
- [ ] **Critical gaps identified and addressed**
- [ ] **All affected functionality has adequate test coverage**
- [ ] **Ready to capture baseline metrics**

**Rationale**: Refactoring requires behavior preservation validation. If code lacks test coverage, we cannot verify behavior is preserved. All impacted functionality MUST be tested BEFORE establishing the baseline.

### Testing Coverage Status
**Affected Code Areas**:
- [File/Function 1]: Coverage [X%] - [ ] ✅ Adequate [ ] ❌ Needs Tests
- [File/Function 2]: Coverage [X%] - [ ] ✅ Adequate [ ] ❌ Needs Tests
- [File/Function 3]: Coverage [X%] - [ ] ✅ Adequate [ ] ❌ Needs Tests

**Action Taken**:
- [ ] No gaps found - proceeded to baseline
- [ ] Gaps found - added [N] tests before baseline
- [ ] Gaps documented but deferred (with justification)

---

## Baseline Metrics
*Captured AFTER testing gaps are addressed - see metrics-before.md*

### Code Complexity
- **Cyclomatic Complexity**: [number or "not measured"]
- **Cognitive Complexity**: [number or "not measured"]
- **Lines of Code**: [number]
- **Function Length (avg/max)**: [avg: X lines, max: Y lines]
- **Class Size (avg/max)**: [avg: X lines, max: Y lines]
- **Duplication**: [X% or "Y instances"]

### Test Coverage
- **Overall Coverage**: [X%]
- **Lines Covered**: [X/Y]
- **Branches Covered**: [X/Y]
- **Functions Covered**: [X/Y]

### Performance
- **Build Time**: [X seconds]
- **Bundle Size**: [X KB]
- **Runtime Performance**: [X ms for key operations]
- **Memory Usage**: [X MB]

### Dependencies
- **Direct Dependencies**: [count]
- **Total Dependencies**: [count including transitive]
- **Outdated Dependencies**: [count]

## Target Metrics
*Goals to achieve - measurable success criteria*

### Code Quality Goals
- **Cyclomatic Complexity**: Reduce to [target number] (from [baseline])
- **Lines of Code**: Reduce to [target] or acceptable if increased due to clarity
- **Duplication**: Eliminate [X instances] or reduce to [Y%]
- **Function Length**: Max [N lines], avg [M lines]
- **Test Coverage**: Maintain or increase to [X%]

### Performance Goals
- **Build Time**: Maintain or improve (no regression)
- **Bundle Size**: Reduce by [X KB] or maintain
- **Runtime Performance**: Maintain or improve (no regression > 5%)
- **Memory Usage**: Maintain or reduce

### Success Threshold
**Minimum acceptable improvement**: [Define what "success" means]
Example: "Reduce duplication by 50%, maintain test coverage, no performance regression"

## Behavior Preservation Guarantee
*CRITICAL: Refactoring MUST NOT change external behavior*

### External Contracts Unchanged
- [ ] API endpoints return same responses
- [ ] Function signatures unchanged (or properly deprecated)
- [ ] Component props unchanged
- [ ] CLI arguments unchanged
- [ ] Database schema unchanged
- [ ] File formats unchanged

### Test Suite Validation
- [ ] **All existing tests MUST pass WITHOUT modification**
- [ ] If test needs changing, verify it was testing implementation detail, not behavior
- [ ] Do NOT weaken assertions to make tests pass

### Behavioral Snapshot
**Key behaviors to preserve**:
1. [Behavior 1: specific observable output for given input]
2. [Behavior 2: specific side effect or state change]
3. [Behavior 3: specific error handling]

**Test**: Run before and after refactoring, outputs MUST be identical

## Risk Assessment

### Risk Level Justification
**Why [High/Medium/Low] Risk**:
[Explain based on: code touched, user impact, complexity, blast radius]

### Potential Issues
- **Risk 1**: [What could go wrong]
  - **Mitigation**: [How to prevent/detect]
  - **Rollback**: [How to undo if occurs]

- **Risk 2**: [Another potential issue]
  - **Mitigation**: [Prevention strategy]
  - **Rollback**: [Recovery plan]

### Safety Measures
- [ ] Feature flag available for gradual rollout
- [ ] Monitoring in place for key metrics
- [ ] Rollback plan tested
- [ ] Incremental commits (can revert partially)
- [ ] Peer review required
- [ ] Staging environment test required

## Rollback Plan

### How to Undo
1. [Step 1: revert commit range]
2. [Step 2: any manual cleanup needed]
3. [Step 3: verification steps]

### Rollback Triggers
Revert if any of these occur within 24-48 hours:
- [ ] Test suite failure
- [ ] Performance regression > 10%
- [ ] Production error rate increase
- [ ] User-facing bug reports related to refactored area
- [ ] Monitoring alerts

### Recovery Time Objective
**RTO**: [How fast can we rollback? e.g., "< 30 minutes"]

## Implementation Plan

### Phase 0: Testing Gap Assessment (Pre-Baseline)
**CRITICAL FIRST STEP**: Assess and address testing gaps BEFORE baseline

1. Review `testing-gaps.md` template
2. Identify all code that will be modified during refactoring
3. Assess test coverage for each affected area
4. Document gaps (critical, important, nice-to-have)
5. **Add tests for critical gaps** - DO NOT proceed without these
6. Verify all new tests pass
7. Mark testing gaps assessment as complete

**Checkpoint**: Only proceed to Phase 1 when adequate test coverage exists

### Phase 1: Baseline (Before Refactoring)
1. Capture all baseline metrics (run `.specify/extensions/workflows/refactor/measure-metrics.sh --before`)
2. Create behavioral snapshot (document current outputs)
3. Ensure 100% test pass rate (including newly added tests)
4. Tag current state in git: `git tag pre-refactor-### -m "Baseline before refactor-###"`

### Phase 2: Refactoring (Incremental)
1. [Step 1: small, atomic change]
2. [Step 2: another small change]
3. [Step 3: continue incrementally]

**Principle**: Each step should compile and pass tests

### Phase 3: Validation
1. Run full test suite (MUST pass 100%)
2. Re-measure all metrics
3. Compare behavioral snapshot (MUST be identical)
4. Performance regression test
5. Manual testing of critical paths

### Phase 4: Deployment
1. Code review focused on behavior preservation
2. Deploy to staging
3. Monitor for 24 hours
4. Deploy to production with feature flag (if available)
5. Monitor for 48-72 hours
6. Remove feature flag if stable

## Verification Checklist

### Phase 0: Testing Gap Assessment
- [ ] Testing gaps assessment completed (testing-gaps.md)
- [ ] All affected code areas identified
- [ ] Test coverage assessed for each area
- [ ] Critical gaps identified and documented
- [ ] Tests added for all critical gaps
- [ ] All new tests passing
- [ ] Ready to proceed to baseline capture

### Pre-Refactoring (Phase 1)
- [ ] Baseline metrics captured and documented
- [ ] All tests passing (100% pass rate)
- [ ] Behavioral snapshot created
- [ ] Git tag created
- [ ] Rollback plan prepared

### During Refactoring
- [ ] Incremental commits (each one compiles and tests pass)
- [ ] External behavior unchanged
- [ ] No new dependencies added (unless justified)
- [ ] Comments updated to match code
- [ ] Dead code removed

### Post-Refactoring
- [ ] All tests still passing (100% pass rate)
- [ ] Target metrics achieved or improvement demonstrated
- [ ] Behavioral snapshot matches (behavior unchanged)
- [ ] No performance regression
- [ ] Code review approved
- [ ] Documentation updated

### Post-Deployment
- [ ] Monitoring shows stable performance
- [ ] No error rate increase
- [ ] No user reports related to refactored area
- [ ] 48-72 hour stability period completed

## Related Work

### Blocks
[List features blocked by current technical debt that this refactoring unblocks]

### Enables
[List future refactorings or features this enables]

### Dependencies
[List other refactorings that should happen first]

---
*Refactor spec created using `/refactor` workflow - See .specify/extensions/workflows/refactor/*
