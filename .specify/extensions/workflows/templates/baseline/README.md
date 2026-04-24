# Baseline Workflow

## Purpose

The baseline workflow creates foundational documentation for a project by:

1. **Establishing a baseline specification** (`baseline-spec.md`) that captures the current/initial state of the project
2. **Creating a change tracking document** (`current-state.md`) that enumerates all changes by workflow type

This provides essential context for AI agents working on subsequent features, modifications, and fixes.

## When to Use

Use the baseline workflow when:

- **Starting with spec-kit-extensions**: You have an existing project and want to establish a documented baseline before creating new specs
- **Post-implementation documentation**: You've been using spec-kit but want to capture the pre-spec-kit state
- **Onboarding context**: You want to provide comprehensive project context to AI agents for better code understanding

## How It Works

### Scenario 1: No Existing Specs (Fresh Start)

When you run `/speckit.baseline` on a project without specs:

1. Analyzes current project state (latest commit)
2. Creates `specs/history/baseline-spec.md` documenting current architecture, features, and structure
3. Creates `specs/history/current-state.md` (initially empty, ready to track future changes)

### Scenario 2: Existing Specs (Retroactive Baseline)

When specs already exist (spec-kit has been used):

1. Finds the first commit that created/modified the specs directory
2. Uses the commit **before** that as the baseline reference
3. Creates `specs/history/baseline-spec.md` documenting the pre-spec-kit project state
4. Creates `specs/history/current-state.md` with all changes enumerated from that point forward

## Output Structure

```
specs/
└── history/
    ├── baseline-spec.md    # Project state at baseline
    └── current-state.md    # All changes since baseline
```

### baseline-spec.md

Comprehensive documentation of the project including:

- Executive summary
- Project structure and components
- Architecture and technology stack
- Core functionality
- Data model
- External dependencies
- Build/deployment process
- Configuration
- Known issues and technical debt
- Future considerations

### current-state.md

Change tracking organized by:

- **Features**: New development from `specs/###-*` directories
- **Modifications**: Changes from `specs/###-*/modifications/`
- **Bugfixes**: Fixes from `specs/bugfix/`
- **Refactors**: Quality improvements from `specs/refactor/`
- **Hotfixes**: Emergency fixes from `specs/hotfix/`
- **Deprecations**: Removed features from `specs/deprecate/`
- **Unspecified**: Git commits not associated with any spec

## Usage

```bash
# Command: /speckit.baseline

# Or manually:
.specify/scripts/bash/create-baseline.sh --json
```

**Note:** The script only accepts the `--json` flag and does not take description arguments.

The workflow will:
1. Detect if specs exist and determine baseline commit
2. Create `specs/history/` directory
3. Generate both template files
4. Output JSON with file paths and baseline information

## Integration with Other Workflows

The baseline provides context for:

- **Feature development** (`/speckit.specify`): Understanding existing architecture
- **Modifications** (`/speckit.modify`): Knowing what features exist
- **Bugfixes** (`/speckit.bugfix`): Understanding related components
- **Refactoring** (`/speckit.refactor`): Seeing technical debt and improvement areas

## Best Practices

1. **Run early**: Create baseline before starting significant spec-driven work
2. **Update current-state.md**: Keep it synchronized as specs are completed
3. **Reference in specs**: Link back to baseline when relevant
4. **Review periodically**: Update baseline-spec.md if major architecture changes occur

## Manual Updates

While the script generates initial templates, you should:

1. **Fill in baseline-spec.md** with actual project details (the AI agent will help)
2. **Update current-state.md** as specs are completed
3. **Maintain both documents** as the project evolves

## Example Workflow

```bash
# 1. Initialize baseline
/speckit.baseline

# AI agent creates templates in specs/history/

# 2. AI agent analyzes codebase and fills baseline-spec.md
# (This happens automatically as part of the command)

# 3. Create new feature
/speckit.specify "user authentication"

# 4. Later, update current-state.md to track the completed feature
# (Can be done manually or via future automation)
```

## Git Behavior

- No branch creation (operates on current branch)
- Creates `specs/history/` directory structure
- Generates two markdown files
- Ready to commit with your next change

## Quality Gates

None - this is a documentation workflow that establishes context rather than implementing changes.

## Related Workflows

- All workflows benefit from having baseline context
- `/speckit.cleanup` can help organize specs after baseline creation
- Consider running baseline before major feature work begins

---

*Part of spec-kit-extensions workflow system*
