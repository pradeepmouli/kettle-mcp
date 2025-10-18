# Configuration Contracts: Jest to Vitest Migration

## Package.json Contract

### Jest Dependencies (TO BE REMOVED)
```json
{
  "devDependencies": {
    "@types/jest": "^29.5.12",
    "jest": "^29.7.0", 
    "ts-jest": "^29.1.2"
  }
}
```

### Vitest Dependencies (TO BE ADDED)  
```json
{
  "devDependencies": {
    "vitest": "^1.0.0"
  }
}
```

### Scripts Contract (MUST PRESERVE EXACT INTERFACE)
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest", 
    "test:coverage": "vitest run --coverage"
  }
}
```

## Configuration File Contract

### Jest Config (CURRENT - jest.config.json)
```json
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "roots": ["<rootDir>/src", "<rootDir>/tests"],
  "testMatch": [
    "**/__tests__/**/*.ts",
    "**/?(*.)+(spec|test).ts"
  ],
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.test.ts", 
    "!src/**/*.spec.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  },
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/src/$1"
  }
}
```

### Vitest Config (TARGET - vitest.config.ts)
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

## Behavioral Contracts

### Test Execution Contract
- `npm test` MUST execute all tests once and exit
- `npm run test:watch` MUST run tests in watch mode with file change detection
- `npm run test:coverage` MUST generate coverage reports with same thresholds
- All scripts MUST have identical exit codes (0 for success, non-zero for failure)

### Coverage Contract  
- Coverage reports MUST maintain 80% threshold for branches, functions, lines, statements
- Coverage output format MUST be compatible with existing CI/CD pipeline
- Coverage files MUST be generated in standard locations

### TypeScript Contract
- MUST work with existing tsconfig.json without modifications
- MUST support all current TypeScript features used in project
- MUST NOT require additional TypeScript compilation steps

### Development Tool Contract
- MUST NOT conflict with existing ESLint configuration
- MUST NOT conflict with existing Prettier configuration  
- MUST work with VS Code TypeScript integration