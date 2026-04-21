# Modification Workflow

## Overview

The modification workflow handles changes to existing features. It emphasizes **impact analysis** and **backward compatibility** to ensure changes don't break existing functionality.

## When to Use

Use `/speckit.modify` when:

- Changing behavior of an existing feature
- Adding capabilities to existing functionality
- Removing functionality from a feature
- Altering contracts/APIs of existing code
- Responding to changed requirements

**Do NOT use `/speckit.modify` for**:
- Creating new features → use `/speckit.specify` instead
- Fixing bugs without changing intended behavior → use `/speckit.bugfix` instead
- Improving code quality without behavior changes → use `/speckit.refactor` instead
- Deprecating entire features → use `/speckit.deprecate` instead

## Process

### 1. Impact Analysis
- Run `scan-impact.sh` to identify affected code
- Review original feature specification
- Identify all files that import/use the feature
- Check contracts and API usage
- Find related tests that may need updates

### 2. Modification Planning
- Document what's being added/modified/removed
- Assess backward compatibility
- Plan migration path for breaking changes
- Update original feature documentation
- Define rollback strategy

### 3. Implementation
- Make changes incrementally
- Update affected code paths
- Modify contracts/interfaces
- Update integration points
- Add new tests for modified behavior

### 4. Verification
- All existing tests still pass (or updated appropriately)
- New tests cover modified behavior
- Dependent features still work
- Migration path tested (if applicable)
- Documentation updated

### 5. Communication
- Document breaking changes clearly
- Update API documentation
- Notify affected teams/users
- Provide migration examples
- Update CHANGELOG

## Quality Gates

- ✅ Impact analysis MUST identify all affected files and contracts
- ✅ Original feature spec MUST be linked
- ✅ Backward compatibility MUST be assessed
- ✅ Migration path MUST be documented if breaking changes
- ✅ All dependent code MUST be updated

## Files Created

```
specs/
└── 014-edit-profile-form/
    └── modifications/
        └── 001-add-avatar-compression/
            ├── modification-spec.md  # Change documentation (created by /speckit.modify)
            ├── impact-analysis.md    # Auto-generated impact analysis (created by /speckit.modify)
            ├── plan.md               # Implementation plan (created by /speckit.plan after review)
            └── tasks.md              # Task breakdown (created by /speckit.tasks after plan review)
```

## Command Usage

```bash
/speckit.modify 014 "add avatar compression to reduce storage costs"
```

This will:
1. Find original feature `014-edit-profile-form`
2. Run impact analysis on feature files
3. Create branch `014-mod-001-add-avatar-compression`
4. Generate `modification-spec.md` with template
5. Generate `impact-analysis.md` with scan results
6. Set `SPECIFY_MODIFICATION` environment variable
7. Show "Next Steps" for checkpoint-based workflow

**Next steps after running the command:**
1. Review `modification-spec.md` and `impact-analysis.md`
2. Check affected files - are there dependencies you missed?
3. Assess backward compatibility - will this break anything?
4. Run `/speckit.plan` to create implementation plan
5. Review the plan - is the migration strategy correct?
6. Run `/speckit.tasks` to break down into tasks
7. Review the tasks - are all affected files covered?
8. Run `/speckit.implement` to execute the changes

## Example Modification Document

```markdown
# Modification: Add Avatar Compression

**Modification ID**: 014-mod-001
**Original Feature**: specs/014-edit-profile-form/
**Status**: Planning

## Changes Overview

### Added Functionality
- Compress uploaded avatars to max 500KB
- Support JPEG, PNG, WebP formats
- Generate multiple sizes (thumbnail, small, medium, large)

### Modified Functionality
- Profile image upload now triggers compression pipeline
- API response includes URLs for all image sizes
- Storage path structure changed to include size variants

### Removed Functionality
- None

## Backward Compatibility

**Breaking Changes**: Yes

1. **API Response Shape Changed**
   - Before: `{ avatarUrl: string }`
   - After: `{ avatarUrl: { thumbnail: string, small: string, medium: string, large: string } }`

   **Migration**: Clients should use `avatarUrl.medium` for default display

2. **Storage Structure Changed**
   - Before: `/avatars/user-123.jpg`
   - After: `/avatars/user-123/medium.jpg`

   **Migration**: Run migration script to restructure existing avatars

## Impact Analysis

From `impact.md`:
- 3 files directly use profile upload
- 12 components display user avatars
- 2 API endpoints return avatar URLs
- 5 tests verify upload behavior

**Risk Level**: Medium - Multiple components affected
```

## Impact Analysis Output

The `scan-impact.sh` script automatically generates:

```markdown
# Impact Analysis

**Feature**: 014-edit-profile-form
**Scan Date**: 2025-10-01

## Feature Files (Created by This Feature)
- `app/routes/profile.edit.tsx` (245 lines)
- `app/components/EditProfileForm.tsx` (180 lines)
- `tests/profile-edit.test.ts` (95 lines)

## Code Dependencies (Other Files Importing Feature Files)
Files importing `app/components/EditProfileForm.tsx`:
- `app/routes/profile.tsx`
- `app/routes/settings.tsx`

## Contract Dependencies
Contracts affected by this feature:
- `contracts/profile-request.ts` (used by 3 routes)
- `contracts/profile-response.ts` (used by 5 components)

## Test Dependencies
Tests referencing feature files:
- `tests/integration/profile-flow.test.ts`
```

## Checkpoint-Based Workflow

The modify workflow uses checkpoints to ensure you review the impact analysis and backward compatibility before making changes:

### Phase 1: Impact Analysis
- **Command**: `/speckit.modify 014 "description"`
- **Creates**: `modification-spec.md` and auto-generated `impact-analysis.md`
- **Checkpoint**: Review impacted files - did the scan catch everything? Are there hidden dependencies?

### Phase 2: Implementation Planning
- **Command**: `/speckit.plan`
- **Creates**: `plan.md` with migration strategy and backward compatibility approach
- **Checkpoint**: Review plan - is the migration path safe? Are breaking changes documented?

### Phase 3: Task Breakdown
- **Command**: `/speckit.tasks`
- **Creates**: `tasks.md` with ordered tasks (contracts → tests → implementation)
- **Checkpoint**: Review tasks - are all affected files included? Is order correct?

### Phase 4: Implementation
- **Command**: `/speckit.implement`
- **Executes**: All tasks (update contracts, modify code, update tests, verify)
- **Result**: Feature modified with all dependent code updated

**Why checkpoints matter**: Impact analysis catches ~80% of affected files automatically, but review ensures you don't miss critical dependencies. Checkpoint before planning prevents breaking changes.

## Tips

### Managing Breaking Changes

**Option 1: Versioned APIs**
```typescript
// Support both old and new structure
export function getAvatarUrl(profile: Profile, size: 'thumbnail' | 'medium' = 'medium') {
  // New structure
  if (typeof profile.avatarUrl === 'object') {
    return profile.avatarUrl[size]
  }
  // Old structure (deprecated)
  return profile.avatarUrl
}
```

**Option 2: Gradual Migration**
```typescript
// Phase 1: Add new field alongside old
{
  avatarUrl: string,  // deprecated
  avatarUrls: { thumbnail, small, medium, large }
}

// Phase 2: Remove old field after clients migrate
{ avatarUrls: { ... } }
```

**Option 3: Feature Flags**
```typescript
if (featureFlags.avatarCompression) {
  return compressedAvatarUrl
} else {
  return originalAvatarUrl
}
```

### When to Create a Modification vs. New Feature

**Create Modification If**:
- Building on existing feature's foundation
- Sharing most of the original code
- Users think of it as "enhancing X"
- Original spec is still mostly accurate

**Create New Feature If**:
- Largely independent functionality
- Could exist without original feature
- Users think of it as "new feature Y"
- Requires extensive new specification

## Integration with Constitution

This workflow upholds:

- **Section IV: Progressive Enhancement** - Build upon stable foundations
- **Section VI: Workflow Selection** - Proper workflow for feature changes
- **Quality Gates** - Impact analysis and compatibility assessment required

## Related Workflows

- **Specify** - For creating new features from scratch
- **Refactor** - For improving code without changing behavior
- **Deprecate** - For removing features entirely

## Common Modifications

### Adding Optional Parameter
```typescript
// Before
function createTweet(content: string): Tweet

// After (backward compatible)
function createTweet(content: string, options?: { tags?: string[] }): Tweet
```

### Extending Response Data
```typescript
// Before
{ id, username, displayName }

// After (backward compatible)
{ id, username, displayName, bio, avatarUrl }  // Added fields
```

### Changing Validation Rules
```typescript
// Before: Username 3-15 chars
// After: Username 3-30 chars

// Impact: Users can now choose longer usernames
// Compatibility: Existing usernames still valid
// Migration: None required
```

---

*Modification Workflow Documentation - Part of Specify Extension System*
