# kettle-mcp Development Guidelines

## Project Overview

MCP server for Pentaho Kettle job and transformation management. Exposes 25+ tools for reading, creating, modifying, validating, and executing Kettle transformations (`.ktr`) and jobs (`.kjb`) through a standardized Model Context Protocol stdio interface.

## Tech Stack

- TypeScript 5 (strict mode), Node.js >= 20
- `@modelcontextprotocol/sdk` — MCP server framework
- `fast-xml-parser` — parse/write Kettle XML (j2x)
- `zod` — I/O schema validation
- `diff` — unified diff generation for change tracking
- Vitest (test runner), ESLint + `@typescript-eslint`, Prettier

## Project Structure

```text
src/
  index.ts          # Entry point — creates MCP Server, calls registerTools()
  server.ts         # registerTools() — all tool definitions + request dispatch
  handlers/         # Tool implementation handlers (job, transformation, execution, search)
  tools/            # Additional tool helpers (discovery_tools.ts)
  schemas/          # Zod schemas (tool-io.ts, kettle-types.ts)
  kettle/           # Kettle XML schemas — 132+ step types by category
  models/           # Domain models
  parser/           # XML parse/write utilities
  utils/            # General utilities
tests/              # contract/, integration/, unit/, performance/
apps/docs/          # VitePress + TypeDoc documentation site
```

## Commands

```bash
pnpm install              # Install dependencies
pnpm run build            # Compile TypeScript → dist/
pnpm run dev              # Watch mode
pnpm test                 # Run all tests (vitest)
pnpm run test:coverage    # Tests with coverage
pnpm run lint             # ESLint
pnpm run lint:fix         # ESLint --fix
pnpm run format           # Prettier write
pnpm run format:check     # Prettier check
pnpm run docs:dev         # VitePress dev server
pnpm run docs:build       # Build docs site
```

## Code Style

- TypeScript strict mode, no `any`
- ESLint with `@typescript-eslint` rules
- Prettier for formatting
- Conventional commits

## Key Patterns

- **Stdio MCP transport** — server connects via `StdioServerTransport`; all tools registered in `KETTLE_TOOLS` array in `server.ts`
- **Stateless server** — no persistent storage; in-memory registry of registered artifacts per session
- **Safety writes** — `createBackup: true` triggers `.bak` file before overwrite; atomic writes via temp-file swap
- **Zod schemas at boundaries** — all tool inputs validated via Zod before touching the filesystem

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
