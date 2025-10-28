# Quickstart: Adding New Step Types

**Feature**: 003-all-kettle-step-types  
**Audience**: Contributors adding new Kettle step type definitions  
**Time**: 15-30 minutes per step type

---

## Prerequisites

- Familiarity with TypeScript and Zod schemas
- Understanding of Pentaho Kettle step types and their XML structure
- Access to Kettle documentation or sample transformation files

---

## Step-by-Step Guide

### Step 1: Identify the Step Type

**Determine**:
1. Step type identifier (e.g., `TableInput`, `SelectValues`, `TextFileOutput`)
2. Category (Input, Output, Transform, Lookup, Join, Flow, Scripting, Utility, BigData, Validation)
3. Common use cases and capabilities

**Resources**:
- Pentaho Kettle documentation: <https://help.hitachivantara.com/Documentation/Pentaho/>
- Kettle source code: <https://github.com/pentaho/pentaho-kettle>
- Sample .ktr files in `examples/sample_kettle_files/`

---

### Step 2: Choose the Category File

Navigate to the appropriate category file:

```text
src/kettle/schemas/transformations/stepTypes/
├── input.ts         ← Input steps (data sources)
├── output.ts        ← Output steps (data destinations)
├── transform.ts     ← Transform steps (data manipulation)
├── lookup.ts        ← Lookup steps (data enrichment)
├── flow.ts          ← Flow control steps (workflow logic)
├── scripting.ts     ← Scripting steps (custom code)
├── utility.ts       ← Utility steps (helpers, variables)
├── bigdata.ts       ← Big data/cloud steps
└── validation.ts    ← Data quality steps
```

**If category file doesn't exist yet**: Create it following the pattern from `input.ts` or `transform.ts`.

---

### Step 3: Define the Configuration Schema

Create a Zod schema defining the step's configuration structure:

```typescript
import { z } from 'zod';

// Example: MySQL Bulk Loader step
const mysqlBulkLoaderConfigSchema = z.object({
  connection: z.string()
    .min(1)
    .describe('Database connection name'),
  
  schema: z.string()
    .optional()
    .describe('Database schema (optional)'),
  
  table: z.string()
    .min(1)
    .describe('Target table name'),
  
  truncate: z.boolean()
    .default(false)
    .describe('Truncate table before loading'),
  
  fields: z.array(z.object({
    stream: z.string().describe('Field name in data stream'),
    table: z.string().describe('Column name in target table'),
  }))
    .min(1)
    .describe('Field mappings between stream and table'),
  
  bulkSize: z.number()
    .min(1)
    .default(1000)
    .describe('Number of rows per bulk insert batch'),
});
```

**Schema Best Practices**:
- ✅ Use `.describe()` on every field (required for LLM understanding)
- ✅ Mark required vs. optional fields correctly
- ✅ Include `.default()` values matching Kettle's defaults
- ✅ Add validation constraints (`.min()`, `.max()`, `.regex()`, `.email()`, etc.)
- ✅ Use `z.enum()` for fixed choices (case-sensitive, match Kettle exactly)
- ✅ Use nested `z.object()` for complex structures
- ✅ Use `z.array()` for repeating elements (fields, keys, conditions)

---

### Step 4: Select Tags

Choose 3-5 tags from the standardized taxonomy in `src/utils/tag-taxonomy.ts`:

```typescript
// Import tag constants
import { TAG_TAXONOMY } from '../../../../utils/tag-taxonomy.js';

// Example tags for MySQL Bulk Loader
tags: ['database', 'write', 'mysql', 'bulk', 'output']
```

**Tag Selection Guidelines**:
- Include data source type (database, file, streaming, etc.)
- Include operation (read, write, transform, filter, etc.)
- Include specific technology (mysql, kafka, json, etc.)
- Include general category (input, output, transform, etc.)
- Max 5 tags - prioritize most relevant

**Tag Categories**:
- Data sources: database, file, streaming, api, nosql, cloud, queue, cache
- File formats: csv, json, xml, excel, text, parquet, avro, yaml
- Operations: read, write, transform, filter, join, lookup, aggregate, validate
- Technologies: sql, mysql, postgresql, kafka, mongodb, s3, rest, etc.

---

### Step 5: Write the Description

Create an action-oriented description (50+ characters) explaining:
1. What the step does
2. Key capabilities
3. Common use cases

```typescript
description: 'Load data into MySQL tables using bulk insert operations. Provides high-performance batch loading with configurable batch sizes, truncate-before-load option, and field mapping. Ideal for large-scale data loading scenarios where speed is critical.',
```

**Description Best Practices**:
- ✅ Start with action verb ("Load data...", "Filter rows...", "Join datasets...")
- ✅ Explain primary purpose first
- ✅ Mention key features (what makes this step useful?)
- ✅ Use LLM-friendly language (avoid technical jargon)
- ✅ 50-200 characters (concise but comprehensive)
- ❌ Don't use passive voice ("Data is loaded..." → "Load data...")
- ❌ Don't assume deep Kettle knowledge

---

### Step 6: Create Example Configurations

Provide 2+ realistic examples demonstrating common use cases:

```typescript
examples: [
  {
    name: "Bulk Load Customer Data",
    description: "Load customer records from CSV file into MySQL customers table with 10,000 row batches",
    configuration: {
      connection: "MySQL_Production",
      schema: "crm",
      table: "customers",
      truncate: false,
      fields: [
        { stream: "customer_id", table: "id" },
        { stream: "name", table: "full_name" },
        { stream: "email", table: "email_address" },
      ],
      bulkSize: 10000,
    },
  },
  {
    name: "Replace Staging Table",
    description: "Truncate and reload staging table with today's transaction data",
    configuration: {
      connection: "MySQL_Analytics",
      schema: "staging",
      table: "daily_transactions",
      truncate: true,
      fields: [
        { stream: "txn_id", table: "transaction_id" },
        { stream: "amount", table: "amount_usd" },
        { stream: "timestamp", table: "created_at" },
      ],
      bulkSize: 5000,
    },
  },
],
```

**Example Best Practices**:
- ✅ Use realistic scenario names ("Bulk Load Customer Data", not "Example 1")
- ✅ Provide detailed descriptions explaining the scenario
- ✅ Include complete configurations (all required fields)
- ✅ Use realistic values (real connection names, table names, field names)
- ✅ Show diversity (different scenarios, different configurations)
- ✅ Demonstrate advanced features in second example

---

### Step 7: Add the Step Type Definition

Add to the category's STEPS registry object:

```typescript
export const INPUT_STEPS: Record<string, StepType> = {
  // ... existing steps ...
  
  MySQLBulkLoader: {
    typeId: 'MySQLBulkLoader',
    category: StepCategory.INPUT,
    displayName: 'MySQL Bulk Loader',
    description: 'Load data into MySQL tables using bulk insert operations. Provides high-performance batch loading with configurable batch sizes, truncate-before-load option, and field mapping. Ideal for large-scale data loading scenarios where speed is critical.',
    tags: ['database', 'write', 'mysql', 'bulk', 'output'],
    configurationSchema: mysqlBulkLoaderConfigSchema,
    examples: [/* examples from step 6 */],
  },
  
  // ... more steps ...
};
```

**Ordering**: Alphabetical by typeId within each category for easy navigation.

---

### Step 8: Test Your Step Type

#### Unit Test

Create a test in `tests/unit/step_type_registry.test.ts`:

```typescript
describe('MySQLBulkLoader step type', () => {
  it('should be registered', () => {
    const stepType = getStepTypeSchema('MySQLBulkLoader');
    expect(stepType).toBeDefined();
    expect(stepType?.category).toBe(StepCategory.INPUT);
    expect(stepType?.tags).toContain('mysql');
  });

  it('should validate valid configuration', () => {
    const result = validateStepConfiguration('MySQLBulkLoader', {
      connection: 'MySQL_Prod',
      table: 'customers',
      fields: [{ stream: 'id', table: 'customer_id' }],
    });
    expect(result.valid).toBe(true);
  });

  it('should reject invalid configuration', () => {
    const result = validateStepConfiguration('MySQLBulkLoader', {
      connection: 'MySQL_Prod',
      // Missing required 'table' field
      fields: [],
    });
    expect(result.valid).toBe(false);
  });
});
```

#### Integration Test

Add test case in `tests/integration/discovery_workflow.test.ts`:

```typescript
it('should discover MySQLBulkLoader by mysql tag', async () => {
  const result = await listStepTypes(undefined, ['mysql']);
  const mysqlSteps = result.filter(s => s.typeId === 'MySQLBulkLoader');
  expect(mysqlSteps).toHaveLength(1);
  expect(mysqlSteps[0].description).toContain('bulk');
});
```

---

### Step 9: Run Tests

```bash
npm test                          # Run all tests
npm test -- step_type_registry    # Run unit tests only
npm test -- discovery_workflow    # Run integration tests only
npm run lint                      # Check code style
```

**Expected Results**:
- ✅ All tests pass
- ✅ No lint errors
- ✅ Test coverage remains above 75%

---

### Step 10: Document Your Work

Update `docs/step-type-coverage.md`:

```markdown
### Input Steps (32 implemented)

- [x] TableInput - Read from database tables
- [x] TextFileInput - Read from text/CSV files
- [x] MySQLBulkLoader - **NEW** - Bulk load into MySQL
...
```

---

## Common Patterns

### Database Connection Steps

Reusable connection schema:

```typescript
const dbConnectionSchema = z.object({
  connection: z.string().min(1).describe('Database connection name'),
  schema: z.string().optional().describe('Database schema'),
  table: z.string().optional().describe('Table name'),
});
```

### File Path Steps

Reusable file path schema:

```typescript
const filePathSchema = z.object({
  filename: z.string().min(1).describe('File path (supports variables)'),
  createParentFolder: z.boolean().default(false).describe('Create parent directory if missing'),
});
```

### Field Mapping Steps

Reusable field mapping schema:

```typescript
const fieldMappingSchema = z.array(z.object({
  stream: z.string().describe('Field name in data stream'),
  table: z.string().describe('Column name in target'),
  type: z.string().optional().describe('Data type'),
}));
```

---

## Troubleshooting

### "Schema validation failed"

**Problem**: Example configuration doesn't match schema

**Solution**: Validate example manually:
```typescript
const result = mysqlBulkLoaderConfigSchema.safeParse(exampleConfig);
if (!result.success) {
  console.log(result.error.issues);
}
```

### "Tag not in taxonomy"

**Problem**: Used custom tag not in `TAG_TAXONOMY`

**Solution**: 
1. Check `src/utils/tag-taxonomy.ts` for existing tag
2. If needed, add new tag to taxonomy first
3. Use existing tag if close enough (prefer reuse)

### "Tests failing after adding step type"

**Problem**: Breaking change to existing tests

**Solution**:
1. Check if you modified shared schemas
2. Update affected tests
3. Run `npm test` to verify all tests pass

---

## Review Checklist

Before submitting, verify:

- [ ] Schema includes `.describe()` on all fields
- [ ] Tags are from standardized taxonomy (3-5 tags)
- [ ] Description is action-oriented and 50+ characters
- [ ] At least 2 realistic example configurations provided
- [ ] Examples validate against schema
- [ ] Step type added to correct category file
- [ ] Unit tests added and passing
- [ ] Integration tests updated
- [ ] No lint errors (`npm run lint`)
- [ ] Test coverage maintained (75%+)
- [ ] Documentation updated (`docs/step-type-coverage.md`)

---

## Need Help?

- Review existing step types in `src/kettle/schemas/transformations/stepTypes/`
- Check Kettle documentation for step type details
- Look at similar step types for patterns
- Consult `research.md` for best practices and decisions

---

## Example: Complete Step Type Addition

See `src/kettle/schemas/transformations/stepTypes/input.ts` for `TableInput` as a reference implementation demonstrating all best practices.
