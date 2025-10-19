# Quickstart: Jest to Vitest Migration

**Date**: October 17, 2025
**Feature**: Jest to Vitest Migration
**Purpose**: Step-by-step migration guide for developers

## Prerequisites

- Node.js 18+ installed
- Existing Jest configuration in place
- Git branch `001-jest-to-vitest-migration` checked out

## Migration Steps

### Step 1: Remove Jest Dependencies

```bash
npm uninstall jest @types/jest ts-jest
```

**Expected Result**: Jest packages removed from package.json devDependencies

### Step 2: Install Vitest Dependencies

```bash
npm install --save-dev vitest
```

**Expected Result**: Vitest added to package.json devDependencies

### Step 3: Create Vitest Configuration

Create `vitest.config.ts` in project root:

```typescript
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      '**/__tests__/**/*.ts',
      '**/?(*.)+(spec|test).ts'
    ],
    coverage: {
      include: [
        'src/**/*.ts'
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.spec.ts'
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
```

### Step 4: Update NPM Scripts

Edit `package.json` scripts section:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Step 5: Remove Jest Configuration

```bash
rm jest.config.json
```

**Expected Result**: Jest configuration file removed

### Step 6: Verify Migration

Test each npm script to ensure identical behavior:

```bash
# Test basic execution
npm test

# Test watch mode (press 'q' to quit)
npm run test:watch

# Test coverage reporting
npm run test:coverage
```

**Expected Results**:
- All scripts execute without errors
- Coverage thresholds are enforced (80%)
- No breaking changes to developer workflow

## Validation Checklist

- [ ] Jest dependencies removed from package.json
- [ ] Vitest dependency added to package.json
- [ ] vitest.config.ts created with equivalent settings
- [ ] jest.config.json removed
- [ ] npm scripts updated to use Vitest commands
- [ ] `npm test` executes successfully
- [ ] `npm run test:watch` works in watch mode
- [ ] `npm run test:coverage` generates coverage reports
- [ ] Coverage thresholds enforced at 80%
- [ ] TypeScript compilation works without ts-jest
- [ ] ESLint and Prettier still work without conflicts

## Troubleshooting

### Issue: "Command not found: vitest"
**Solution**: Run `npm install` to ensure Vitest is properly installed

### Issue: "Cannot find module 'vitest/config'"
**Solution**: Ensure Vitest version is 1.0.0 or higher

### Issue: "Coverage thresholds not enforced"
**Solution**: Verify `coverage.thresholds` section in vitest.config.ts

### Issue: "Module resolution errors"
**Solution**: Check `resolve.alias` configuration matches Jest's `moduleNameMapper`

## Rollback Plan

If issues are encountered, rollback using:

```bash
git checkout -- package.json
git checkout -- jest.config.json
rm vitest.config.ts
npm install
```

This restores the original Jest configuration.

## Next Steps

After successful migration:
1. Create test files to validate Vitest functionality
2. Update CI/CD pipeline if needed for Vitest compatibility
3. Consider using additional Vitest features like `@vitest/ui`
4. Update developer documentation to reference Vitest

## Performance Expectations

Expected improvements after migration:
- 20%+ faster test execution
- Better ES module support
- Improved TypeScript integration
- Enhanced debugging capabilities