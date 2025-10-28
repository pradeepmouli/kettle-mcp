# kettle-mcp Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-28

## Active Technologies
- TypeScript (Node.js >= 18) + `@modelcontextprotocol/sdk` (MCP), `fast-xml-parser` (parse/write via j2x), `zod` (I/O schemas), `fast-glob` (scan), `diff` (unified diff) (001-kettle-tools-implementation)
- Local filesystem (no persistent DB) (001-kettle-tools-implementation)
- TypeScript (Node.js >= 18) + @modelcontextprotocol/sdk (MCP), zod (schema validation), fast-xml-parser (XML I/O) (002-step-type-discovery)
- In-memory registry (no persistent storage - stateless MCP server) (002-step-type-discovery)
- TypeScript (Node.js >= 18) + @modelcontextprotocol/sdk (MCP server), zod (schema validation and serialization), fast-xml-parser (XML I/O for Kettle files) (003-all-kettle-step-types)
- In-memory registry (no persistence - stateless MCP server) (003-all-kettle-step-types)

## Project Structure
```
src/
tests/
```

## Commands
npm test && npm run lint

## Code Style
TypeScript (Node.js >= 18): Follow standard conventions

## Recent Changes
- 003-all-kettle-step-types: Added TypeScript (Node.js >= 18) + @modelcontextprotocol/sdk (MCP server), zod (schema validation and serialization), fast-xml-parser (XML I/O for Kettle files)
- 002-step-type-discovery: Added TypeScript (Node.js >= 18) + @modelcontextprotocol/sdk (MCP), zod (schema validation), fast-xml-parser (XML I/O)
- 001-kettle-tools-implementation: Added TypeScript (Node.js >= 18) + `@modelcontextprotocol/sdk` (MCP), `fast-xml-parser` (parse/write via j2x), `zod` (I/O schemas), `fast-glob` (scan), `diff` (unified diff)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
