# Review Workflow

The Review workflow provides structured code review for completed work, validating implementations against specifications and updating task status.

## When to Use Review

Use `/speckit.review` when:

- ✅ You've completed implementation work and need code review
- ✅ You want to validate implementation against specification
- ✅ You need to mark tasks as complete in tasks.md
- ✅ You want structured feedback on completed work

## How It Works

The Review workflow:

1. **Loads Context**: Reads the current feature's specification, plan, and tasks
2. **Reviews Implementation**: Validates code changes against requirements
3. **Provides Feedback**: Documents findings, bugs, or improvements
4. **Updates Tasks**: Marks reviewed tasks as complete in tasks.md
5. **Generates Report**: Summarizes review findings and test results

## Usage

### Basic Review

```bash
# Review current implementation work
/speckit.review
```

### Review Specific Task

```bash
# Review a specific task by ID
/speckit.review T001
```

### Review with Context

```bash
# Review with additional context
/speckit.review "Implemented user authentication feature"
```

## Review Process

The review follows these steps:

### 1. Load Context

- Read feature specification (`spec.md`)
- Read implementation plan (`plan.md`)
- Read task list (`tasks.md`)
- Review code changes (diffs, new files)

### 2. Conduct Review

- Verify implementation against specification
- Check for bugs, regressions, or issues
- Validate tests and documentation
- Run automated tests if available
- Check code quality and best practices
- Confirm the reviewed scope contains no placeholder/TODO/FIXME code

### 3. Provide Feedback

Document findings in one of three outcomes:

**✅ Approved**: Implementation meets requirements
- All acceptance criteria met
- Tests passing
- No blocking issues
- Ready for merge

**⚠️ Approved with Notes**: Minor issues that don't block
- Implementation is functional
- Minor improvements suggested
- Can be addressed later
- OK to merge with follow-up

**❌ Needs Changes**: Issues must be fixed
- Bugs or regressions found
- Acceptance criteria not met
- Tests failing or missing
- Must fix before merge

### 4. Update Tasks

For approved work:
- Mark completed tasks as done in `tasks.md`
- Update task checkboxes: `[ ]` → `[X]`

### 5. Generate Report

Produce a summary including:
- Tasks reviewed and status
- Key findings and feedback
- Tests executed and results
- Follow-up actions (if any)

## Review Template Structure

The review generates a structured report with these sections:

```markdown
# Review Report

**Feature**: [Feature Name]
**Reviewer**: [AI Agent]
**Date**: [Review Date]
**Status**: [Approved / Approved with Notes / Needs Changes]

## Summary

Brief overview of what was reviewed and the outcome.

## Implementation Quality

Assessment of code quality, architecture, and best practices.

## Tests

Tests executed and their results.

## Findings

### What Worked Well
- Positive aspects of the implementation

### Issues Found (if any)
- List of issues, bugs, or concerns
- Severity: Critical / High / Medium / Low

## Tasks Completed

List of tasks marked as complete:
- [X] T001: Task description
- [X] T002: Task description

## Recommendations

Suggestions for improvement or follow-up work.

## Next Steps

What should happen next (merge, fix issues, etc.)
```

## Quality Gates

The Review workflow enforces these quality standards:

### Code Quality
- ✅ Follows project coding standards
- ✅ No obvious bugs or logic errors
- ✅ Proper error handling
- ✅ Clear and maintainable code
- ✅ No placeholder/TODO/FIXME code in the reviewed scope unless justified and tracked

### Testing
- ✅ Tests exist for new functionality
- ✅ All tests pass
- ✅ Edge cases covered
- ✅ No test regressions

### Documentation
- ✅ Code is documented appropriately
- ✅ Public APIs have clear documentation
- ✅ Complex logic is explained
- ✅ README updated if needed

### Specification Alignment
- ✅ Meets acceptance criteria
- ✅ Follows design decisions
- ✅ Matches expected behavior
- ✅ No scope creep

## Integration with spec-kit

The Review workflow integrates seamlessly with spec-kit:

```bash
# Standard feature workflow
/speckit.specify "user authentication"
/speckit.plan
/speckit.tasks

# Implement tasks...

# Review completed work
/speckit.review

# If approved, merge
git push origin feature-branch
```

## Tips

1. **Review Early and Often**: Don't wait until everything is done
2. **Review Small Chunks**: Easier to review individual tasks than entire features
3. **Run Tests First**: Make sure tests pass before requesting review
4. **Provide Context**: Mention what changed and why
5. **Act on Feedback**: Address issues promptly while context is fresh

## Examples

### Example 1: Basic Review

```bash
$ /speckit.review

✅ Review Complete

**Status**: Approved
**Tasks Reviewed**: T001, T002, T003
**Tests**: 15 passing
**Issues**: None

All acceptance criteria met. Ready to merge.
```

### Example 2: Review with Issues

```bash
$ /speckit.review

⚠️ Review Complete

**Status**: Needs Changes
**Tasks Reviewed**: T001, T002
**Tests**: 12 passing, 2 failing
**Issues**: 3 found

Issues to address:
1. [High] Missing error handling in login function
2. [Medium] Edge case not covered: empty username
3. [Low] Missing documentation for public API

Please fix issues and request re-review.
```

### Example 3: Specific Task Review

```bash
$ /speckit.review T005

✅ Task T005 Review Complete

**Task**: Implement password reset flow
**Status**: Approved
**Tests**: 8 passing

Implementation meets requirements. Email sending properly handled.
Task marked as complete in tasks.md.
```

## Files Generated

The Review workflow updates these files:

- `tasks.md` - Task checkboxes updated to reflect completion
- (Optional) `review-notes.md` - Detailed review findings if needed

## Common Issues

### "No tasks found to review"

**Cause**: No tasks defined in tasks.md
**Solution**: Run `/speckit.tasks` first to create task list

### "Task T001 not found in tasks.md"

**Cause**: Task ID doesn't exist or typo in ID
**Solution**: Check tasks.md for correct task IDs

### "Tests not found"

**Cause**: No test framework detected
**Solution**: Review can still proceed without automated tests

## Related Workflows

- **`/speckit.bugfix`** - Use for bug fixes, then review with `/speckit.review`
- **`/speckit.modify`** - Use for modifications, then review with `/speckit.review`
- **`/speckit.refactor`** - Use for refactoring, then review with `/speckit.review`

## Best Practices

1. **Review Before Merge**: Always review before merging to main
2. **Review Your Own Work**: Even solo developers benefit from structured review
3. **Document Findings**: Write down what you found for future reference
4. **Be Thorough**: Don't rush reviews - quality matters
5. **Test Everything**: Run tests, try edge cases, verify behavior
6. **Check Specs**: Ensure implementation matches specification
7. **Look for Regressions**: Make sure existing features still work

---

**Next Steps**:
- Run `/speckit.review` to review completed implementation work
- Address any issues found during review
- Mark tasks as complete when approved
- Merge feature branch when ready
