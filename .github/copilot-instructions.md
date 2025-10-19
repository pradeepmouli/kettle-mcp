# kettle-mcp Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-18

## Active Technologies
- TypeScript (Node.js >= 18) + `@modelcontextprotocol/sdk` (MCP), `fast-xml-parser` (parse/write via j2x), `zod` (I/O schemas), `fast-glob` (scan), `diff` (unified diff) (001-kettle-tools-implementation)
- Local filesystem (no persistent DB) (001-kettle-tools-implementation)

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
- 001-kettle-tools-implementation: Added TypeScript (Node.js >= 18) + `@modelcontextprotocol/sdk` (MCP), `fast-xml-parser` (parse/write via j2x), `zod` (I/O schemas), `fast-glob` (scan), `diff` (unified diff)
- 001-kettle-tools-implementation: Added TypeScript (Node.js >= 18) + `@modelcontextprotocol/sdk` (MCP), `xml2js` (parse), `xmlbuilder2` (write), `fast-glob` (scan), `diff` (unified diff), `ajv` (optional schema-ish validations)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
