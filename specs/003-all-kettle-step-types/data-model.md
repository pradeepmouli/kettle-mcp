# Data Model: Complete Kettle Step Type Library

**Feature**: 003-all-kettle-step-types
**Date**: 2025-10-28
**Purpose**: Define entity structures and relationships for comprehensive step type library

---

## Entities

### StepType (Core Entity)

**Purpose**: Represents a Kettle transformation step type with complete metadata for LLM discovery and configuration

**Properties**:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `typeId` | string | Yes | Unique identifier matching Kettle's internal step name (e.g., "TableInput", "SelectValues") |
| `category` | StepCategory | Yes | Functional category enum (Input, Output, Transform, Lookup, Join, Flow, Scripting, Utility, BigData, Validation) |
| `displayName` | string | Yes | Human-readable name shown in UI (e.g., "Table Input", "Select Values") |
| `description` | string | Yes | Action-oriented description >50 characters explaining purpose and common use cases |
| `tags` | string[] | Yes | 3-5 capability keywords from standardized taxonomy enabling discovery |
| `configurationSchema` | z.ZodObject<any> | Yes | Zod schema defining required/optional configuration fields with validation |
| `examples` | ConfigurationExample[] | No | Array of 2+ example configurations demonstrating common usage patterns |

**Validation Rules**:
- `typeId`: Alphanumeric, may contain underscores, must match Kettle's XML element name
- `category`: Must be valid StepCategory enum value
- `displayName`: 3-50 characters, human-readable
- `description`: 50+ characters, starts with action verb, LLM-friendly language
- `tags`: 3-5 strings from TAG_TAXONOMY constants, no duplicates
- `configurationSchema`: Valid Zod object schema with field descriptions
- `examples`: If provided, must include name, description, and valid configuration

**Relationships**:
- Belongs to one StepCategory
- References ConfigurationExample[] (0 to many)
- Uses TAG_TAXONOMY (many to many relationship with tags)

**Invariants**:
- typeId must be unique across all step types
- All required fields must be populated
- Tags must exist in TAG_TAXONOMY
- Configuration examples must validate against configurationSchema

---

### StepCategory (Enum)

**Purpose**: Categorizes step types by functional purpose and ETL workflow phase

**Values**:

```typescript
export enum StepCategory {
  INPUT = 'Input',           // Data sources (databases, files, APIs, streaming, cloud)
  OUTPUT = 'Output',         // Data destinations (databases, files, APIs, streaming, cloud)
  TRANSFORM = 'Transform',   // Data manipulation (field ops, filtering, calculations, normalization)
  LOOKUP = 'Lookup',         // Data enrichment (lookups against reference data)
  JOIN = 'Join',             // Combining datasets (joins, merges, unions)
  FLOW = 'Flow',             // Workflow control (switch, abort, block, delay)
  SCRIPTING = 'Scripting',   // Custom logic execution (JavaScript, Java, SQL scripts)
  UTILITY = 'Utility',       // Helper operations (variables, logging, data generation)
  BIGDATA = 'BigData',       // Big data platforms (Hadoop, Spark, cloud storage)
  VALIDATION = 'Validation', // Data quality (validation, checksums, cleansing, deduplication)
}
```

**Usage**:
- Filters step types by functional area
- Organizes step types into separate source files (input.ts, transform.ts, etc.)
- Enables LLM category-based discovery

**Design Decisions**:
- LOOKUP separated from TRANSFORM (common pattern, distinct use case)
- JOIN separated from TRANSFORM (complex multi-stream operations)
- SCRIPTING separate from UTILITY (custom code execution)
- BIGDATA for modern platform integrations (Hadoop, cloud, NoSQL)
- VALIDATION for data quality focus (growing importance)

---

### ConfigurationExample (Interface)

**Purpose**: Provides concrete example configurations for step types to guide LLM usage

**Properties**:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Short, descriptive name for the scenario (e.g., "Read Customer Data") |
| `description` | string | Yes | Detailed explanation of what this configuration does and when to use it |
| `configuration` | Record<string, any> | Yes | Complete configuration object matching the step type's schema |

**Validation Rules**:
- `name`: 5-50 characters, descriptive scenario name
- `description`: 20+ characters, explains the use case clearly
- `configuration`: Must validate against parent StepType's configurationSchema

**Usage Examples**:

```typescript
{
  name: "Read Customer Orders",
  description: "Read all customer orders from MySQL orders table with timestamp filtering",
  configuration: {
    connection: "MySQL_Production",
    schema: "sales",
    table: "orders",
    sql: "SELECT * FROM ${schema}.${table} WHERE created_at > ?",
    parameters: ["${LAST_RUN_DATE}"],
  }
}
```

---

### TAG_TAXONOMY (Constants)

**Purpose**: Standardized vocabulary of capability tags for consistent step type discovery

**Organization**:

```typescript
export const TAG_TAXONOMY = {
  // Data Source Types (12 tags)
  dataSources: [
    'database', 'file', 'streaming', 'api', 'nosql', 'cloud',
    'queue', 'cache', 'ldap', 'email', 'ftp', 'sftp'
  ],

  // File Formats (12 tags)
  fileFormats: [
    'csv', 'json', 'xml', 'excel', 'text', 'parquet',
    'avro', 'orc', 'yaml', 'properties', 'ldif', 'access'
  ],

  // Operations (18 tags)
  operations: [
    'read', 'write', 'transform', 'filter', 'join', 'lookup',
    'aggregate', 'sort', 'deduplicate', 'normalize', 'denormalize',
    'validate', 'cleanse', 'calculate', 'split', 'merge', 'pivot', 'unpivot'
  ],

  // Technologies (22 tags)
  technologies: [
    'sql', 'nosql', 'mysql', 'postgresql', 'oracle', 'sqlserver',
    'mongodb', 'cassandra', 'elasticsearch', 'kafka', 'jms', 'mqtt',
    'hadoop', 'spark', 'hdfs', 'hbase', 's3', 'azure', 'gcp',
    'rest', 'soap', 'http'
  ],

  // Data Quality (8 tags)
  quality: [
    'quality', 'validation', 'checksum', 'deduplication',
    'cleansing', 'profiling', 'sampling', 'monitoring'
  ],

  // Scripting (6 tags)
  scripting: [
    'javascript', 'java', 'groovy', 'python', 'shell', 'sql-script'
  ],
};
```

**Total Tags**: ~78 tags across 6 categories

**Usage**:
- Step types select 3-5 relevant tags
- LLMs filter by tags for capability-based discovery
- Tags map to natural language queries

---

## State Transitions

Not applicable - step type metadata is static. No runtime state changes.

---

## Data Flow

### List Step Types Flow

```text
1. LLM calls list_step_types(category?, tags?)
   ↓
2. System retrieves STEP_TYPE_REGISTRY (in-memory)
   ↓
3. If category provided:
   Filter to step types where type.category === category
   ↓
4. If tags provided:
   Filter to step types where type.tags intersects with tags[]
   ↓
5. Map to metadata response format:
   { typeId, category, displayName, description, tags }
   ↓
6. Return: StepTypeMetadata[]
```

### Get Step Type Schema Flow

```text
1. LLM calls get_step_type_schema(typeId)
   ↓
2. System looks up STEP_TYPE_REGISTRY[typeId]
   ↓
3. If not found:
   Return error: "Unknown step type: {typeId}"
   ↓
4. Serialize configurationSchema using serializeZodSchema():
   - Extract field names, types, required flags
   - Extract validation constraints (min, max, pattern, enum)
   - Extract descriptions
   - Handle nested objects and arrays
   ↓
5. Return:
   {
     typeId, category, displayName, description, tags,
     schema: { fields: SchemaField[] },
     examples: ConfigurationExample[]
   }
```

---

## Storage & Persistence

**Storage**: None - all step type metadata is statically defined in source code

**Registry Structure**:

```typescript
// src/kettle/schemas/transformations/stepTypes/index.ts
export const STEP_TYPE_REGISTRY: Record<string, StepType> = {
  ...INPUT_STEPS,        // from input.ts
  ...OUTPUT_STEPS,       // from output.ts
  ...TRANSFORM_STEPS,    // from transform.ts
  ...LOOKUP_STEPS,       // from lookup.ts
  ...JOIN_STEPS,         // from join.ts (may be merged with LOOKUP_STEPS)
  ...FLOW_STEPS,         // from flow.ts
  ...SCRIPTING_STEPS,    // from scripting.ts
  ...UTILITY_STEPS,      // from utility.ts
  ...BIGDATA_STEPS,      // from bigdata.ts
  ...VALIDATION_STEPS,   // from validation.ts
};
```

**Access Pattern**:
- O(1) lookup by typeId
- O(n) filtering by category or tags (acceptable for 150 items)
- Loaded at server startup, cached in memory
- No runtime modifications

---

## Constraints & Assumptions

**Constraints**:
- Metadata is static (compile-time definitions)
- No dynamic tag generation
- No runtime registration of new step types
- Schema serialization is runtime operation (introspects Zod schemas)
- In-memory registry (no persistence layer)

**Assumptions**:
- 150+ step types fit comfortably in memory (~300KB)
- Filtering 150 types by category/tags is fast enough (<10ms)
- LLMs can parse JSON response formats
- Tag taxonomy covers 90%+ of discovery use cases
- 3-5 tags per step type provide sufficient granularity
- 2 examples per step type are adequate for understanding
- Zod schema descriptions provide sufficient field documentation

**Scale Limits**:
- Maximum step types: ~500 (before considering lazy loading)
- Maximum tags per type: 10 (diminishing returns beyond 5)
- Maximum examples per type: 5 (maintenance overhead)
- Maximum configuration nesting depth: 5 levels

---

## Validation

### Step Type Validation

All step type definitions must pass:

```typescript
const stepTypeSchema = z.object({
  typeId: z.string().regex(/^[A-Za-z0-9_]+$/),
  category: z.nativeEnum(StepCategory),
  displayName: z.string().min(3).max(50),
  description: z.string().min(50),
  tags: z.array(z.string()).min(3).max(5),
  configurationSchema: z.instanceof(z.ZodObject),
  examples: z.array(configurationExampleSchema).min(2).optional(),
});
```

### Configuration Example Validation

```typescript
const configurationExampleSchema = z.object({
  name: z.string().min(5).max(50),
  description: z.string().min(20),
  configuration: z.record(z.any()),
});
```

Each example's configuration must also validate against the parent step type's configurationSchema.

---

## Entity Relationships

```text
StepType
├── has one StepCategory (enum value)
├── has many tags (3-5 from TAG_TAXONOMY)
├── has one configurationSchema (Zod object)
└── has many ConfigurationExample (0+, typically 2)

StepCategory
└── groups many StepType (1 to many)

TAG_TAXONOMY
└── referenced by many StepType.tags (many to many)

ConfigurationExample
└── belongs to one StepType (composition)
```

---

## Summary

This data model extends the existing structure from feature 002 with minimal changes:

**Existing Entities** (unchanged):
- StepType interface (already has all required fields)
- StepCategory enum (add new values: LOOKUP, JOIN, FLOW, SCRIPTING, BIGDATA, VALIDATION)
- ConfigurationExample interface (already defined)

**New Entities**:
- Extended TAG_TAXONOMY with 60+ additional tags

**Implementation Impact**:
- Add ~140 new StepType definitions across category files
- Extend StepCategory enum with 6 new values
- Extend TAG_TAXONOMY with ~60 new tags
- No database, no persistence, no complex state management
- Pure data enrichment of existing structures

The model supports:
- Fast lookup by typeId (O(1))
- Efficient filtering by category/tags (O(n), acceptable for n=150)
- Schema introspection via Zod
- Example-driven learning for LLMs
- Future extensibility (new categories, new tags, new step types)
