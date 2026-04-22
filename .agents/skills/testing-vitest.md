---
name: testing-vitest
description: Comprehensive testing with Vitest including unit tests, integration tests, mocking, coverage, and best practices
---

# Vitest Testing Guide

Use this skill when writing tests with Vitest, setting up test infrastructure, creating mocks, or debugging test failures.

## Setup and Configuration

### 1. Installation

```bash
pnpm add -D vitest @vitest/coverage-v8
```

### 2. vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node', // or 'jsdom' for browser-like tests

    // Global test utilities
    globals: true, // Makes describe, it, expect available globally

    // Test file patterns
    include: ['**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', '.cache'],

    // Coverage configuration
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/test-utils.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },

    // Test timeout
    testTimeout: 10000,

    // Setup files
    setupFiles: ['./tests/setup.ts'],

    // Parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },

    // Watch mode
    watch: false,
    watchExclude: ['node_modules', 'dist'],

    // Reporters
    reporters: ['verbose'],

    // Mock reset
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});
```

### 3. Setup File (tests/setup.ts)

```typescript
import { beforeAll, afterAll, afterEach } from 'vitest';

// Global setup
beforeAll(() => {
  console.log('Starting test suite');
});

// Global teardown
afterAll(() => {
  console.log('Test suite complete');
});

// Reset between tests
afterEach(() => {
  // Clear any test state
});

// Extend matchers (optional)
import { expect } from 'vitest';

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be within range ${floor} - ${ceiling}`
          : `expected ${received} to be within range ${floor} - ${ceiling}`,
    };
  },
});

// Declare custom matchers for TypeScript
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeWithinRange(floor: number, ceiling: number): T;
  }
}
```

## Test Structure

### Unit Tests

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Calculator } from '../src/calculator.js';

describe('Calculator', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(calculator.add(2, 3)).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(calculator.add(-2, -3)).toBe(-5);
    });

    it('should handle zero', () => {
      expect(calculator.add(0, 5)).toBe(5);
    });
  });

  describe('divide', () => {
    it('should divide numbers', () => {
      expect(calculator.divide(10, 2)).toBe(5);
    });

    it('should throw on division by zero', () => {
      expect(() => calculator.divide(10, 0)).toThrow('Division by zero');
    });
  });
});
```

### Async Tests

```typescript
import { describe, it, expect } from 'vitest';
import { fetchUser } from '../src/api.js';

describe('API', () => {
  it('should fetch user data', async () => {
    const user = await fetchUser('123');

    expect(user).toBeDefined();
    expect(user.id).toBe('123');
    expect(user.name).toBeTypeOf('string');
  });

  it('should handle errors', async () => {
    await expect(fetchUser('invalid')).rejects.toThrow('User not found');
  });

  it('should timeout after 5 seconds', async () => {
    await expect(fetchUser('slow')).rejects.toThrow('timeout');
  }, 5000); // Custom timeout
});
```

### Parameterized Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('isPalindrome', () => {
  it.each([
    ['racecar', true],
    ['hello', false],
    ['level', true],
    ['world', false],
    ['a', true],
    ['', true],
  ])('isPalindrome("%s") should be %s', (input, expected) => {
    expect(isPalindrome(input)).toBe(expected);
  });
});

// Alternative syntax with objects
describe('add', () => {
  it.each([
    { a: 1, b: 2, expected: 3 },
    { a: -1, b: 1, expected: 0 },
    { a: 0, b: 0, expected: 0 },
  ])('add($a, $b) should equal $expected', ({ a, b, expected }) => {
    expect(add(a, b)).toBe(expected);
  });
});
```

## Mocking

### Function Mocks

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('Mocking functions', () => {
  it('should mock a function', () => {
    const mockFn = vi.fn();

    mockFn('hello');
    mockFn('world');

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith('hello');
    expect(mockFn).toHaveBeenNthCalledWith(2, 'world');
  });

  it('should mock return values', () => {
    const mockFn = vi.fn()
      .mockReturnValueOnce('first')
      .mockReturnValueOnce('second')
      .mockReturnValue('default');

    expect(mockFn()).toBe('first');
    expect(mockFn()).toBe('second');
    expect(mockFn()).toBe('default');
    expect(mockFn()).toBe('default');
  });

  it('should mock async functions', async () => {
    const mockAsync = vi.fn().mockResolvedValue('success');

    const result = await mockAsync();
    expect(result).toBe('success');
  });

  it('should mock rejections', async () => {
    const mockAsync = vi.fn().mockRejectedValue(new Error('failed'));

    await expect(mockAsync()).rejects.toThrow('failed');
  });
});
```

### Module Mocks

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock entire module
vi.mock('../src/api.js', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: '123', name: 'John' }),
  saveUser: vi.fn().mockResolvedValue(true),
}));

import { fetchUser, saveUser } from '../src/api.js';
import { UserService } from '../src/user-service.js';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserService();
  });

  it('should fetch user', async () => {
    const user = await service.getUser('123');

    expect(fetchUser).toHaveBeenCalledWith('123');
    expect(user.name).toBe('John');
  });
});
```

### Partial Module Mocks

```typescript
import { describe, it, expect, vi } from 'vitest';

// Import actual module
const actual = await vi.importActual('../src/utils.js');

// Mock only specific exports
vi.mock('../src/utils.js', () => ({
  ...actual,
  fetchData: vi.fn().mockResolvedValue({ data: 'mocked' }),
  // Keep other exports as-is
}));
```

### Spy on Methods

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('Spying', () => {
  it('should spy on object methods', () => {
    const obj = {
      getValue: () => 42,
    };

    const spy = vi.spyOn(obj, 'getValue');

    const result = obj.getValue();

    expect(result).toBe(42);
    expect(spy).toHaveBeenCalled();

    spy.mockRestore(); // Restore original implementation
  });

  it('should mock spied method', () => {
    const obj = {
      getValue: () => 42,
    };

    const spy = vi.spyOn(obj, 'getValue').mockReturnValue(100);

    expect(obj.getValue()).toBe(100);
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
    expect(obj.getValue()).toBe(42); // Original behavior restored
  });
});
```

### Timer Mocks

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Timers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fast-forward time', () => {
    const callback = vi.fn();

    setTimeout(callback, 1000);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledOnce();
  });

  it('should run all timers', () => {
    const callback = vi.fn();

    setTimeout(callback, 100);
    setTimeout(callback, 200);
    setInterval(callback, 50);

    vi.runAllTimers();

    expect(callback).toHaveBeenCalled();
  });

  it('should mock Date.now()', () => {
    const now = new Date('2025-01-01');
    vi.setSystemTime(now);

    expect(Date.now()).toBe(now.getTime());
  });
});
```

## Integration Tests

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDatabase, teardownTestDatabase } from './test-utils.js';
import { UserRepository } from '../src/user-repository.js';
import { Database } from '../src/database.js';

describe('UserRepository Integration', () => {
  let db: Database;
  let repository: UserRepository;

  beforeAll(async () => {
    db = await setupTestDatabase();
    repository = new UserRepository(db);
  });

  afterAll(async () => {
    await teardownTestDatabase(db);
  });

  it('should save and retrieve user', async () => {
    const user = {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
    };

    await repository.save(user);
    const retrieved = await repository.findById('123');

    expect(retrieved).toEqual(user);
  });

  it('should update user', async () => {
    const user = {
      id: '456',
      name: 'Jane Doe',
      email: 'jane@example.com',
    };

    await repository.save(user);
    await repository.update('456', { name: 'Jane Smith' });

    const updated = await repository.findById('456');
    expect(updated?.name).toBe('Jane Smith');
  });
});
```

## Test Utilities

### Test Helpers (tests/test-utils.ts)

```typescript
import { vi } from 'vitest';

export function createMockLogger() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
}

export function createMockFetch(response: any) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => response,
  });
}

export async function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('waitFor timeout');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

export function createTestUser(overrides = {}) {
  return {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    ...overrides,
  };
}
```

### Fixtures

```typescript
import { readFile } from 'fs/promises';
import path from 'path';

export async function loadFixture(name: string) {
  const filepath = path.join(__dirname, 'fixtures', `${name}.json`);
  const content = await readFile(filepath, 'utf-8');
  return JSON.parse(content);
}

// Usage
const mockUsers = await loadFixture('users');
```

## Assertions

### Common Matchers

```typescript
// Equality
expect(value).toBe(expected);          // Strict equality (===)
expect(value).toEqual(expected);       // Deep equality
expect(value).toStrictEqual(expected); // Stricter deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeDefined();
expect(value).toBeUndefined();
expect(value).toBeNull();

// Numbers
expect(number).toBeGreaterThan(3);
expect(number).toBeGreaterThanOrEqual(3);
expect(number).toBeLessThan(5);
expect(number).toBeLessThanOrEqual(5);
expect(number).toBeCloseTo(0.3, 1); // Within 0.1

// Strings
expect(string).toMatch(/pattern/);
expect(string).toContain('substring');

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);
expect(array).toContainEqual({ id: 1 });

// Objects
expect(object).toHaveProperty('key');
expect(object).toHaveProperty('key', 'value');
expect(object).toMatchObject({ key: 'value' });

// Functions
expect(fn).toThrow();
expect(fn).toThrow('error message');
expect(fn).toThrow(ErrorClass);

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();

// Mock functions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenLastCalledWith(arg);
expect(mockFn).toHaveReturnedWith(value);
```

### Snapshot Testing

```typescript
import { describe, it, expect } from 'vitest';

describe('Snapshots', () => {
  it('should match snapshot', () => {
    const data = {
      id: '123',
      name: 'John',
      createdAt: new Date('2025-01-01'),
    };

    expect(data).toMatchSnapshot();
  });

  it('should match inline snapshot', () => {
    const value = { x: 1, y: 2 };

    expect(value).toMatchInlineSnapshot(`
      {
        "x": 1,
        "y": 2,
      }
    `);
  });
});
```

## Coverage

### Run Coverage

```bash
# Generate coverage report
pnpm test --coverage

# Watch mode with coverage
pnpm test --coverage --watch

# Coverage for specific files
pnpm test --coverage src/specific-file.ts
```

### Coverage Thresholds

In `vitest.config.ts`:
```typescript
coverage: {
  thresholds: {
    global: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    // Per-file thresholds
    './src/critical.ts': {
      lines: 95,
      functions: 95,
      branches: 95,
      statements: 95,
    },
  },
}
```

## Debugging Tests

### Using VS Code Debugger

Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Vitest Tests",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["test", "--run", "--threads=false"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Console Debugging

```typescript
it('should debug', () => {
  const value = computeValue();

  console.log('Debug:', value); // Visible in test output

  expect(value).toBe(42);
});
```

### Only/Skip Tests

```typescript
// Run only this test
it.only('should run only this', () => {
  // ...
});

// Skip this test
it.skip('should skip this', () => {
  // ...
});

// Skip entire suite
describe.skip('Skipped suite', () => {
  // ...
});

// Run only this suite
describe.only('Only this suite', () => {
  // ...
});
```

## Best Practices

### 0. Test Only Public APIs

Focus tests on **public interfaces only**:

- Test exported functions, classes, and methods
- Don't test private/internal implementation details
- Test behavior, not implementation
- If you need to test internals, consider if they should be public or extracted

```typescript
// Good: Test public API behavior
it('should return user by ID', async () => {
  const user = await userService.getUser('123');
  expect(user.id).toBe('123');
});

// Bad: Testing internal caching mechanism
it('should cache users internally', () => {
  // Don't test private #cache implementation
});
```

### 1. Test Organization

- Group related tests in `describe` blocks
- Use clear, descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', () => {
      // Arrange
      const userData = { name: 'John', email: 'john@example.com' };
      const service = new UserService();

      // Act
      const user = service.createUser(userData);

      // Assert
      expect(user.id).toBeDefined();
      expect(user.name).toBe('John');
    });
  });
});
```

### 2. Test Independence

Each test should be independent:

```typescript
describe('Counter', () => {
  let counter: Counter;

  beforeEach(() => {
    counter = new Counter(); // Fresh instance for each test
  });

  it('should increment', () => {
    counter.increment();
    expect(counter.value).toBe(1);
  });

  it('should decrement', () => {
    counter.decrement();
    expect(counter.value).toBe(-1);
  });
});
```

### 3. Avoid Test Logic

Tests should be simple and straightforward:

```typescript
// Bad: Complex logic in test
it('should process items', () => {
  const items = [];
  for (let i = 0; i < 10; i++) {
    items.push(processItem(i));
  }
  expect(items.every(item => item.processed)).toBe(true);
});

// Good: Simple assertion
it('should process items', () => {
  const items = [item1, item2, item3];
  const processed = processItems(items);

  expect(processed).toHaveLength(3);
  expect(processed[0].processed).toBe(true);
});
```

### 4. Mock External Dependencies

```typescript
// Good: Mock external API
vi.mock('../src/api.js', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'test' }),
}));

// Bad: Making real API calls in tests
it('should fetch data', async () => {
  const data = await fetch('https://api.example.com/data');
  // ...
});
```

### 5. Test Error Cases

```typescript
describe('divide', () => {
  it('should divide numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('should throw on division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });

  it('should handle invalid input', () => {
    expect(() => divide(NaN, 2)).toThrow('Invalid input');
  });
});
```

## Common Patterns

### Testing React Components (with jsdom)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../src/Button.js';

describe('Button', () => {
  it('should render button', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Click me</Button>);

    await user.click(screen.getByText('Click me'));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

### Testing Databases

```typescript
import { beforeEach, afterEach } from 'vitest';

describe('Database tests', () => {
  beforeEach(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterEach(async () => {
    await db.migrate.rollback();
  });

  it('should query database', async () => {
    const users = await db('users').select();
    expect(users).toHaveLength(3);
  });
});
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all tests |
| `pnpm test --watch` | Watch mode |
| `pnpm test --coverage` | With coverage |
| `pnpm test --ui` | Open UI mode |
| `pnpm test file.test.ts` | Run specific file |
| `pnpm test -t "pattern"` | Run tests matching pattern |
| `pnpm test --run` | Run once (no watch) |
| `pnpm test --reporter=verbose` | Detailed output |

## Resources

- Vitest Documentation: https://vitest.dev/
- Vitest API: https://vitest.dev/api/
- Coverage: https://vitest.dev/guide/coverage.html
- Mocking: https://vitest.dev/guide/mocking.html
