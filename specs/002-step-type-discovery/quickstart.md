# Quick Start: Step Type Discovery Enhancement

**Feature**: 002-step-type-discovery
**Date**: 2025-10-27

## Overview

This feature enhances the existing discovery APIs to expose rich metadata that enables LLMs to intelligently discover and understand Kettle step types and job entry types. LLMs can now map natural language user intents to appropriate step types and generate valid configurations.

## For AI Agents

### Discover Available Step Types

```typescript
// List all step types
const allSteps = await list_step_types();
// Returns: [{ typeId, category, displayName, description, tags }, ...]

// Filter by category
const inputSteps = await list_step_types({ categoryFilter: "Input" });
// Returns only Input category steps
```

### Get Schema for a Step Type

```typescript
// Get detailed schema
const schema = await get_step_type_schema({ typeId: "TableInput" });
// Returns: {
//   typeId: "TableInput",
//   category: "Input",
//   displayName: "Table Input",
//   description: "Read data from a database...",
//   tags: ["database", "sql", "read", "input"],
//   schema: {
//     fields: [
//       { name: "connection", type: "string", required: true, description: "..." },
//       { name: "sql", type: "string", required: true, description: "..." },
//       ...
//     ]
//   },
//   examples: [...]
// }
```

### Use Case: Map User Intent to Step Type

```typescript
// User says: "I need to read from a MySQL database"
// 1. Search for database-related input steps
const steps = await list_step_types({ categoryFilter: "Input" });
const dbSteps = steps.filter(s => s.tags.includes("database"));
// Found: TableInput with tags ["database", "sql", "read", "input"]

// 2. Get schema to understand requirements
const schema = await get_step_type_schema({ typeId: "TableInput" });
// Now know: needs "connection" (string) and "sql" (string)

// 3. Generate configuration
const config = {
  connection: "mysql-prod",
  sql: "SELECT * FROM users WHERE active = true",
  limit: 1000
};

// 4. Validate configuration
await validate_step_configuration({
  type: "TableInput",
  configuration: config
});
```

## For Developers

### Adding Metadata to New Step Types

When adding a new step type to `src/kettle/schemas/step-types.ts`:

1. **Choose appropriate category**:
   ```typescript
   category: StepCategory.INPUT  // or OUTPUT, TRANSFORM, etc.
   ```

2. **Write LLM-friendly description**:
   ```typescript
   description: "Read data from JSON files with automatic schema detection. Supports nested JSON structures and arrays."
   ```

3. **Add 2-5 relevant tags** (use standardized tags):
   ```typescript
   tags: ['file', 'json', 'read', 'input']
   ```

4. **Use `.describe()` for schema fields**:
   ```typescript
   const jsonInputSchema = z.object({
     filename: z.string().describe('Path to JSON file'),
     fieldPath: z.string().optional().describe('JSONPath expression to extract specific fields'),
   });
   ```

5. **Add examples** (optional but recommended):
   ```typescript
   {
     typeId: 'JSONInput',
     // ... other fields
     examples: [
       {
         name: 'Read user data',
         description: 'Reads user records from a JSON file',
         configuration: {
           filename: '/data/users.json',
           fieldPath: '$.users[*]'
         }
       }
     ]
   }
   ```

### Standard Tag Taxonomy

**Data Sources**: `database`, `file`, `csv`, `json`, `xml`, `excel`, `rest-api`, `kafka`

**Operations**: `read`, `write`, `filter`, `transform`, `aggregate`, `join`, `lookup`, `sort`, `deduplicate`

**Domains**: `sql`, `nosql`, `streaming`, `batch`, `etl`, `validation`

Use tags consistently to enable effective LLM discovery.

### Testing Your Changes

1. **Contract tests**: Validate API response structure
   ```bash
   npm test -- tests/contract/discovery_enhanced.test.ts
   ```

2. **Integration tests**: Validate end-to-end workflows
   ```bash
   npm test -- tests/integration/discovery_workflow.test.ts
   ```

3. **Manual testing** via MCP:
   ```bash
   npm run dev
   # In MCP client, call list_step_types and verify tags appear
   ```

## Common Patterns

### Pattern 1: Category-Based Discovery

LLM wants input steps → filter by category="Input"

### Pattern 2: Tag-Based Discovery

LLM wants database operations → filter results by `tags.includes('database')`

### Pattern 3: Schema-Driven Configuration

LLM has user requirements → get schema → extract required fields → build config → validate

### Pattern 4: Example-Based Learning

LLM is unsure about config format → request schema with examples → learn from examples

## Tips for LLM Developers

- **Always check tags first**: They provide the fastest path to discovering relevant step types
- **Use categories for broad filtering**: Input, Output, Transform, etc.
- **Combine filters**: Category + tags gives the best precision
- **Leverage examples**: When available, examples show real-world usage patterns
- **Validate configurations**: Always use `validate_step_configuration` before using configs

## API Reference

See `contracts/` directory for detailed API contracts:
- `list_step_types.json` - Discovery API for step types
- `get_step_type_schema.json` - Schema retrieval API for step types
- `list_job_entry_types.json` - Discovery API for job entries
- `get_job_entry_type_schema.json` - Schema retrieval API for job entries
