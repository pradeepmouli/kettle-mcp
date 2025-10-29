# kettle-mcp Development Guidelines

A Model Context Protocol (MCP) server for managing Pentaho Kettle ETL workflows programmatically.

Last updated: 2025-10-29

## Project Overview

Kettle-MCP enables AI agents and applications to read, create, modify, and validate Pentaho Kettle transformations (.ktr) and jobs (.kjb) through a standardized MCP interface. The project provides 16 MCP tools with comprehensive validation, safety features, and full test coverage.

## Build & Test Commands

### Essential Commands
- `npm install` - Install all dependencies (required after cloning)
- `npm run build` - Compile TypeScript to JavaScript (output to `dist/`)
- `npm test` - Run complete test suite (207 tests, should all pass)
- `npm run test:coverage` - Run tests with coverage report (target: 75%+)
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without changes

### Development Workflow
- `npm run dev` - Watch mode for development (auto-recompile on changes)
- `npm run test:watch` - Run tests in watch mode during development
- `npm run clean` - Remove build artifacts from `dist/`

### Before Committing
Always run these commands before committing changes:
```bash
npm test && npm run format:check
```

Note: `npm run lint` currently fails due to ESLint v9 migration (not blocking for contributions)

## Active Technologies

### Core Stack
- **TypeScript** (Node.js >= 18) - Type-safe development with strict mode enabled
- **@modelcontextprotocol/sdk** (v1.20.1+) - MCP server implementation
- **fast-xml-parser** (v5.3.0+) - Parse and write Kettle XML files (.ktr, .kjb)
- **zod** (v3.25.76+) - Schema validation and type-safe I/O
- **diff** (v8.0.2+) - Generate unified diffs for file changes

### Testing Stack
- **vitest** (v3.2.4+) - Primary test framework
- **@vitest/coverage-v8** - Code coverage reporting
- Unit, integration, contract, and E2E test suites

### Architecture
- **Stateless MCP server** - No persistent storage, all state in Kettle files
- **Local filesystem operations** - Direct .ktr/.kjb file manipulation
- **In-memory registries** - Step type and job entry type schemas cached at startup
- **Atomic file operations** - Automatic backups before modifications

## Project Structure

```
kettle-mcp/
├── src/                        # TypeScript source code
│   ├── index.ts               # Main entry point (MCP server startup)
│   ├── server.ts              # MCP server implementation
│   ├── handlers/              # Tool implementation handlers
│   │   ├── discovery/         # Step/job type discovery tools
│   │   ├── validation/        # Configuration validation tools
│   │   ├── transformation/    # Transformation manipulation tools
│   │   └── job/              # Job manipulation tools
│   ├── schemas/               # Zod schemas for validation
│   │   ├── step-types/        # Step type definitions (TableInput, etc.)
│   │   └── job-entry-types/   # Job entry type definitions (TRANS, etc.)
│   ├── parser/                # XML parsing utilities
│   ├── tools/                 # MCP tool definitions
│   ├── utils/                 # Helper utilities
│   ├── kettle/                # Kettle-specific types and models
│   ├── models/                # Data models
│   └── __tests__/             # Unit and E2E tests
│
├── tests/                      # Test suites
│   ├── contract/              # Tool behavior contracts (60 tests)
│   ├── integration/           # End-to-end workflows (13 tests)
│   ├── unit/                  # Isolated unit tests (62 tests)
│   ├── performance/           # Performance benchmarks
│   └── quality/               # Code quality tests
│
├── docs/                       # Documentation
│   ├── api-reference.md       # Complete MCP API reference
│   ├── mcp-tools-reference.md # Tool usage examples
│   ├── getting-started.md     # Setup and configuration guide
│   ├── kettle-formats.md      # Kettle XML format documentation
│   └── quickstart.md          # Quick start examples
│
├── examples/                   # Example files
│   └── sample_kettle_files/   # Sample .ktr and .kjb files for testing
│
├── .github/                    # GitHub configuration
│   ├── copilot-instructions.md # This file
│   └── prompts/               # Spec-kit prompts (don't modify)
│
├── .specify/                   # Spec-kit configuration
│   ├── memory/                # Project constitution
│   ├── specs/                 # Feature specifications
│   ├── scripts/               # Automation scripts
│   └── templates/             # Document templates
│
├── dist/                       # Build output (generated, not committed)
├── coverage/                   # Test coverage reports (generated, not committed)
├── node_modules/              # Dependencies (not committed)
└── backup/                    # File backups created during operations
```

## Code Style & Standards

### TypeScript Guidelines
- **Strict mode enabled** - All TypeScript strict checks are enforced
- **Type safety** - Always use explicit types; avoid `any`
- **ES2022 target** - Use modern JavaScript features
- **Module system** - Node16 module resolution with ESM
- **No unused code** - Compiler enforces no unused locals/parameters
- **Exhaustive checks** - All switch cases must be handled

### Code Quality
- **Function length** - Keep functions focused and under ~50 lines
- **File length** - Aim for files under ~500 lines; split if larger
- **Self-documenting code** - Clear variable and function names
- **Comments for WHY, not WHAT** - Explain complex logic reasoning
- **Error handling** - Always validate inputs at API boundaries
- **Type imports** - Use `import type` for type-only imports

### Naming Conventions
- **Files** - kebab-case for files: `step-discovery.ts`
- **Classes/Types** - PascalCase: `StepTypeSchema`
- **Functions/Variables** - camelCase: `parseKettleFile`
- **Constants** - UPPER_SNAKE_CASE: `DEFAULT_TIMEOUT`
- **MCP Tools** - snake_case with `kettle_` prefix: `kettle_add_transformation_step`

### File Organization
- **Imports** - Group: Node built-ins, external deps, internal modules
- **Exports** - Place at end of file or use named exports inline
- **One responsibility** - Each file should have a single clear purpose

## Testing Strategy

### Test Coverage Requirements
- **Overall coverage**: 75%+ (currently at 75%)
- **Core handlers**: 80%+ coverage required
- **Integration tests**: Cover all 16 MCP tools
- **Contract tests**: Validate tool behavior and edge cases

### Test Types
1. **Unit Tests** (`src/__tests__/`) - Test individual functions and modules in isolation
2. **Contract Tests** (`tests/contract/`) - Verify MCP tool contracts and edge cases
3. **Integration Tests** (`tests/integration/`) - Test complete workflows end-to-end
4. **E2E Tests** (`src/__tests__/e2e/`) - Full transformation/job creation flows
5. **Performance Tests** (`tests/performance/`) - Benchmark critical operations

### Writing Tests
- **Use vitest** - All tests use vitest framework
- **Descriptive names** - Test names should clearly state what they verify
- **Arrange-Act-Assert** - Structure tests clearly
- **Test edge cases** - Include error conditions, empty inputs, boundary values
- **Mock external dependencies** - Use vitest mocking for file I/O when appropriate
- **Clean up** - Remove test files after integration tests

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npx vitest run tests/contract/discovery_tools.test.ts
```

## MCP-Specific Development Notes

### MCP Tool Structure
Every MCP tool follows this pattern:
1. **Tool definition** in `src/tools/` - Schema and metadata
2. **Handler implementation** in `src/handlers/` - Business logic
3. **Contract tests** in `tests/contract/` - Verify tool behavior
4. **Integration tests** in `tests/integration/` - End-to-end workflows

### Tool Categories
- **Discovery (4 tools)** - List and explore step/job entry types
- **Validation (2 tools)** - Validate configurations against schemas
- **Transformation (5 tools)** - Manipulate .ktr files
- **Job (5 tools)** - Manipulate .kjb files

### XML Processing Guidelines
- **Use fast-xml-parser** - Don't write raw XML strings
- **Preserve formatting** - Maintain Kettle's XML structure
- **Validate before write** - Always validate against schemas
- **Create backups** - Automatic backups before modifications
- **Generate diffs** - Show changes made to files

### Safety Features (Always Maintained)
- ✅ Automatic backups before file modifications
- ✅ Unified diff generation for all changes
- ✅ Atomic file writes (write to temp, then rename)
- ✅ Configuration validation before applying changes
- ✅ Automatic hop cleanup when removing steps/entries

## Common Development Tasks

### Adding a New Step Type
1. Create schema in `src/schemas/step-types/`
2. Register in step type registry
3. Add validation tests in `tests/contract/`
4. Update documentation in `docs/`

### Adding a New MCP Tool
1. Define tool in `src/tools/`
2. Implement handler in `src/handlers/`
3. Add contract tests in `tests/contract/`
4. Add integration test workflow
5. Update `docs/mcp-tools-reference.md`

### Modifying XML Parsing
1. Update parser in `src/parser/`
2. Add unit tests for new parsing logic
3. Run integration tests to ensure no breakage
4. Test with example files in `examples/sample_kettle_files/`

### Debugging Tips
- **MCP Server Logs** - Server runs on stdio, check console output
- **XML Validation** - Use online XML validators for complex structures
- **Test Files** - Use files in `examples/sample_kettle_files/` for testing
- **Diff Output** - Check generated diffs to verify file changes
- **Backup Files** - Review `.backup` files if something goes wrong

## Documentation Requirements

When making changes, update relevant documentation:
- **README.md** - For user-facing features or major changes
- **docs/api-reference.md** - For new tools or tool parameter changes
- **docs/mcp-tools-reference.md** - For tool usage examples
- **CONTRIBUTING.md** - For workflow or contribution process changes
- **This file** - For build, test, or development process changes

## Spec-Kit Workflow

This project follows spec-driven development:
1. **Specify** - Create feature specs in `.specify/specs/`
2. **Plan** - Generate implementation plans
3. **Tasks** - Break down into actionable tasks
4. **Implement** - Build according to plan and tasks
5. **Validate** - Ensure all tests pass and coverage maintained

For new features, always start with a specification before coding.

## Dependencies & Security

### Installing New Dependencies
- **Minimize dependencies** - Only add if truly necessary
- **Check bundle size** - Avoid bloating the package
- **Verify licenses** - MIT-compatible only
- **Security audit** - Run `npm audit` after adding deps

### Current Key Dependencies
```json
{
  "@modelcontextprotocol/sdk": "^1.20.1",  // MCP protocol implementation
  "fast-xml-parser": "^5.3.0",              // XML parsing/writing
  "zod": "^3.25.76",                        // Schema validation
  "diff": "^8.0.2"                          // Diff generation
}
```

## Known Issues & Limitations

- **ESLint** - Currently fails due to v9 migration (not blocking)
- **Python migration** - Old Python code in `pyproject.toml.legacy` (ignore)
- **Legacy files** - `backup/` directory contains old migration files

## What NOT to Modify

Unless specifically required for your task:
- ❌ `.github/prompts/` - Spec-kit prompts (managed separately)
- ❌ `.specify/` - Project specs and constitution
- ❌ `backup/` - Old migration files
- ❌ `examples/sample_kettle_files/` - Reference files for testing
- ❌ Core MCP server initialization logic without careful review

## Quick Reference

| Task | Command |
|------|---------|
| First time setup | `npm install && npm run build && npm test` |
| Build | `npm run build` |
| Test | `npm test` |
| Format | `npm run format` |
| Clean | `npm run clean` |
| Dev mode | `npm run dev` |
| Coverage | `npm run test:coverage` |

## Getting Help

- **Documentation** - Start with `docs/getting-started.md`
- **Examples** - See `docs/quickstart.md` for usage examples
- **Tool Reference** - Full tool docs in `docs/mcp-tools-reference.md`
- **Issues** - Open GitHub issues for bugs or questions
- **Contributing** - Read `CONTRIBUTING.md` for contribution guidelines

---

<!-- MANUAL ADDITIONS START -->
<!-- Add any project-specific custom instructions below this line -->

<!-- MANUAL ADDITIONS END -->
