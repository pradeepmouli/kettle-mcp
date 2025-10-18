# Jest to Vitest Migration - Current State Documentation

**Migration Date**: 2025-10-18 10:43:12
**Project**: kettle-mcp v0.1.0

## Current Jest Configuration

### Package.json Scripts
- `test`: "jest"
- `test:watch`: "jest --watch"
- `test:coverage`: "jest --coverage"

### Jest Configuration (jest.config.json)
- **Preset**: ts-jest
- **Environment**: node
- **Test Roots**: src/, tests/
- **Test Patterns**: **/__tests__/**/*.ts, **/?(*.)+(spec|test).ts
- **Coverage Collection**: src/**/*.ts (excluding .d.ts, .test.ts, .spec.ts)
- **Coverage Thresholds**: 80% for branches, functions, lines, statements
- **Module Mapping**: @/* -> src/*

### Dependencies to Remove
- @types/jest: ^29.5.12
- jest: ^29.7.0
- ts-jest: ^29.1.2

### Current Test State
- No existing test files found
- No tests/ directory exists
- Clean slate for Vitest implementation

### Project Context
- **Type**: ES Modules ("type": "module")
- **TypeScript**: Target ES2022, Node16 module resolution
- **Runtime**: Node.js >=18.0.0
- **Architecture**: MCP server for Pentaho Kettle management