# Research: Jest to Vitest Migration

**Date**: October 17, 2025
**Feature**: Jest to Vitest Migration
**Purpose**: Resolve technical unknowns and establish migration approach

## Research Tasks Completed

### 1. Vitest Configuration for TypeScript ES Modules

**Decision**: Use `vitest.config.ts` with TypeScript support and ES module configuration

**Rationale**:

- Vitest has native TypeScript support without requiring additional transformers like ts-jest
- Better integration with ES modules (`"type": "module"` in package.json)
- Maintains the same configuration patterns as Jest but with simplified setup

**Alternatives considered**:

- Keep Jest with improved ts-jest configuration: Rejected due to complexity and ES module issues
- Switch to Node's built-in test runner: Rejected due to lack of coverage reporting and watch mode features

### 2. Package Dependencies Mapping

**Decision**: Replace Jest ecosystem with Vitest equivalents

**Migration mapping**:

- `jest` → `vitest`
- `@types/jest` → `@vitest/ui` (optional for enhanced UI)
- `ts-jest` → Not needed (Vitest has native TypeScript support)

**Rationale**: Direct dependency mapping ensures minimal configuration changes while gaining performance benefits

**Alternatives considered**:

- Gradual migration keeping both frameworks: Rejected due to dependency conflicts and complexity
- Using Jest with Vitest as test runner: Rejected as it doesn't solve ES module issues

### 3. Configuration File Migration Strategy

**Decision**: Transform `jest.config.json` to `vitest.config.ts` with equivalent settings

**Key mappings**:

- `preset: "ts-jest"` → Not needed (native TypeScript)
- `testEnvironment: "node"` → `environment: "node"`
- `roots` → `root` (Vitest uses single root)
- `testMatch` → `test.include`
- `collectCoverageFrom` → `coverage.include`
- `coverageThreshold` → `coverage.thresholds`
- `moduleNameMapper` → `resolve.alias`

**Rationale**: One-to-one mapping preserves existing test discovery and coverage behavior

**Alternatives considered**:

- Start with minimal Vitest config: Rejected as it would change existing behavior
- Use Vitest defaults: Rejected as coverage thresholds and aliases must be preserved

### 4. NPM Scripts Migration

**Decision**: Update script commands while preserving script names and behavior

**Script mappings**:

- `"test": "jest"` → `"test": "vitest run"`
- `"test:watch": "jest --watch"` → `"test:watch": "vitest"`
- `"test:coverage": "jest --coverage"` → `"test:coverage": "vitest run --coverage"`

**Rationale**: Maintains developer workflow expectations with identical command interfaces

**Alternatives considered**:

- Change script names to vitest-specific: Rejected due to breaking change requirement
- Add new scripts alongside old ones: Rejected as it would confuse developers

### 5. TypeScript Integration Approach

**Decision**: Leverage Vitest's native TypeScript support with existing tsconfig.json

**Rationale**:

- No additional configuration needed for TypeScript compilation
- Respects existing TypeScript settings in tsconfig.json
- Eliminates ts-jest complexity and potential compatibility issues

**Alternatives considered**:

- Create separate test TypeScript config: Rejected as current config works fine
- Use SWC for faster TypeScript compilation: Rejected as premature optimization

### 6. Coverage Reporting Compatibility

**Decision**: Use Vitest's built-in coverage with c8 provider for equivalent reporting

**Rationale**:

- Maintains same coverage metrics and thresholds (80% across all categories)
- Provides same coverage report formats as Jest
- Better performance than Jest's coverage implementation

**Alternatives considered**:

- Use Istanbul coverage provider: Considered but c8 is the Vitest default and performs better
- Lower coverage thresholds during migration: Rejected as it would violate project standards

## Implementation Approach Summary

The migration follows a configuration-replacement strategy:

1. **Package.json update**: Remove Jest dependencies, add Vitest
2. **Configuration migration**: Replace jest.config.json with vitest.config.ts
3. **Script updates**: Modify npm scripts to use Vitest commands
4. **Validation**: Ensure all existing npm script behaviors are preserved

## Risk Mitigation

- **Backup approach**: Keep jest.config.json until migration is validated
- **Testing strategy**: Verify all npm scripts work identically after migration
- **Rollback plan**: Git branch allows easy rollback if issues are discovered

## Next Steps

Proceed to Phase 1 with clear understanding of:

- Exact dependency replacements needed
- Configuration file structure and mappings
- Script modifications required
- Validation criteria for successful migration
