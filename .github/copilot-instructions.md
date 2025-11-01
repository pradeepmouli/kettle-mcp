# kettle-mcp Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-31

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
  kettle/
    schemas/
      transformations/stepTypes/
        - input.ts (33 types)
        - transform.ts (44 types)
        - output.ts (23 types)
        - bigdata.ts (15 types) ✨ NEW
        - validation.ts (10 types)
        - lookup.ts (5 types)
        - join.ts (2 types)
  tools/
  handlers/
tests/
  contract/
  integration/
  unit/
  performance/
docs/
  step-type-coverage.md ✨ NEW
```

## Commands
npm test && npm run lint

## Code Style
TypeScript (Node.js >= 18): Follow standard conventions

## Step Type Library Coverage (FR003)
**Total Step Types**: 132
- Input: 33 types (databases, files, streaming, APIs, cloud/NoSQL)
- Transform: 44 types (field ops, filtering, joins, aggregations)
- Output: 23 types (databases, files, streaming, APIs, cloud/NoSQL)
- BigData: 15 types (Hadoop, HDFS, HBase, S3, Azure, Salesforce, Avro) ✅ Phase 9 Complete
- Validation: 10 types (data quality, checksums, cleansing)
- Lookup: 5 types (data enrichment, dimensional operations)
- Join: 2 types (multi-stream operations)

**Phase 9 Complete**: All 15 BigData step types implemented with comprehensive schemas, examples, and valid tags.

## Recent Changes
- 2025-10-31: Phase 9 Complete - Added 15 BigData step types (HadoopFileInput/Output, HDFSFileInput/Output, HBaseInput/Output, S3FileInput/Output, AzureEventHubsConsumer/Producer, GoogleAnalytics, SalesforceUpsert/Delete, AvroInput/Output)
- 2025-10-31: Phase 10 In Progress - Documentation updates (step-type-coverage.md, README.md updates)
- 003-all-kettle-step-types: Added TypeScript (Node.js >= 18) + @modelcontextprotocol/sdk (MCP server), zod (schema validation and serialization), fast-xml-parser (XML I/O for Kettle files)
- 002-step-type-discovery: Added TypeScript (Node.js >= 18) + @modelcontextprotocol/sdk (MCP), zod (schema validation), fast-xml-parser (XML I/O)
- 001-kettle-tools-implementation: Added TypeScript (Node.js >= 18) + `@modelcontextprotocol/sdk` (MCP), `fast-xml-parser` (parse/write via j2x), `zod` (I/O schemas), `fast-glob` (scan), `diff` (unified diff)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
