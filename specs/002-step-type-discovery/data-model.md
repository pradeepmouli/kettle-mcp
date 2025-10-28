# Data Model: Step Type Discovery Enhancement

**Feature**: 002-step-type-discovery
**Date**: 2025-10-27
**Status**: Complete

## Overview

This feature enhances existing data structures with additional metadata fields. No new entities are introduced - we extend the current `StepType` and `JobEntryType` models with richer metadata.

## Entities

### StepType (Enhanced)

**Purpose**: Represents a Kettle transformation step type with metadata for LLM discovery and understanding

**Existing Fields**:
- `typeId: string` - Unique identifier (e.g., "TableInput")
- `category: StepCategory` - Functional category enum
- `displayName: string` - Human-readable name
- `description: string` - Brief description
- `tags: string[]` - Use case keywords (currently empty)
- `configurationSchema: z.ZodObject<any>` - Zod validation schema

**New/Enhanced Fields**:
- `tags: string[]` - **POPULATE** with use case keywords (e.g., `['database', 'sql', 'read']`)
- `description: string` - **ENHANCE** with LLM-friendly explanations
- `examples?: ConfigurationExample[]` - **ADD** optional example configurations

**Validation Rules**:
- `typeId` must match Kettle step type identifier (alphanumeric, no spaces)
- `category` must be valid StepCategory enum value
- `tags` should contain 2-5 keywords for optimal discovery
- `configurationSchema` must be valid Zod object schema
- `examples` must validate against `configurationSchema` if provided

**Relationships**:
- One StepType per Kettle step type
- Multiple StepTypes can share the same category
- Multiple StepTypes can share the same tags

---

### JobEntryType (Enhanced)

**Purpose**: Represents a Kettle job entry type with metadata for LLM discovery and understanding

**Existing Fields**:
- `typeId: string` - Unique identifier (e.g., "JOB")
- `category: JobEntryCategory` - Functional category enum
- `displayName: string` - Human-readable name
- `description: string` - Brief description
- `tags: string[]` - Use case keywords (currently empty)
- `configurationSchema: z.ZodObject<any>` - Zod validation schema

**New/Enhanced Fields**:
- `tags: string[]` - **POPULATE** with use case keywords
- `description: string` - **ENHANCE** with LLM-friendly explanations
- `examples?: ConfigurationExample[]` - **ADD** optional example configurations

**Validation Rules**:
(Same as StepType but for job entries)

---

### ConfigurationExample (New Interface)

**Purpose**: Provides example configurations for step types and job entries

**Fields**:
- `name: string` - Example name (e.g., "Read from MySQL")
- `description: string` - What this example demonstrates
- `configuration: object` - Valid configuration matching the schema

**Validation Rules**:
- `name` must be descriptive (10-50 characters)
- `configuration` must pass validation against parent StepType/JobEntryType schema
- Each StepType/JobEntryType should have 0-3 examples

**Example**:

```typescript
{
  name: "Read from MySQL",
  description: "Reads all records from a MySQL users table",
  configuration: {
    connection: "mysql-prod",
    sql: "SELECT * FROM users",
    limit: 1000
  }
}
```

---

### SerializedSchema (Response Format)

**Purpose**: JSON-serializable representation of Zod schema for LLM consumption

**Fields**:
- `fields: SchemaField[]` - Array of field definitions

**SchemaField**:
- `name: string` - Field name
- `type: string` - Type name (e.g., "string", "number", "boolean", "object", "array")
- `required: boolean` - Whether field is required
- `description: string` - Field description (from `.describe()`)
- `default?: any` - Default value if specified

**Validation Rules**:
- Must be JSON-serializable (no functions or Zod objects)
- `type` should be normalized to common names (not "ZodString" - use "string")
- All fields from source schema must be represented

---

### StepCategory (Existing Enum)

No changes to enum values:

```typescript
enum StepCategory {
  INPUT = 'Input',
  OUTPUT = 'Output',
  TRANSFORM = 'Transform',
  UTILITY = 'Utility',
  FLOW = 'Flow',
  SCRIPTING = 'Scripting',
  LOOKUP = 'Lookup',
  JOIN = 'Join',
  VALIDATION = 'Validation',
  STATISTICS = 'Statistics',
}
```

---

### JobEntryCategory (Existing Enum)

No changes to enum values (examples):

```typescript
enum JobEntryCategory {
  GENERAL = 'General',
  FILE = 'File Management',
  MAIL = 'Mail',
  SCRIPTING = 'Scripting',
  BULK_LOADING = 'Bulk Loading',
  // ... other categories
}
```

---

## Tag Taxonomy

**Standard Tags** (to be used consistently across step types):

**Data Sources**:
- `database` - Database operations
- `file` - File I/O
- `csv` - CSV file format
- `json` - JSON format
- `xml` - XML format
- `excel` - Excel files
- `rest-api` - REST API calls
- `kafka` - Kafka streaming

**Operations**:
- `read` - Read/input operations
- `write` - Write/output operations
- `filter` - Data filtering
- `transform` - Data transformation
- `aggregate` - Aggregation operations
- `join` - Join operations
- `lookup` - Lookup operations
- `sort` - Sorting data
- `deduplicate` - Remove duplicates

**Domains**:
- `sql` - SQL-based
- `nosql` - NoSQL databases
- `streaming` - Streaming data
- `batch` - Batch processing
- `etl` - ETL operations
- `validation` - Data validation

---

## State Transitions

Not applicable - metadata is static. No runtime state changes.

---

## Data Flow

```text
1. LLM calls list_step_types(categoryFilter?)
   ↓
2. System filters STEP_TYPE_REGISTRY by category (if provided)
   ↓
3. System maps each StepType to metadata response object
   ↓
4. Returns: [{ typeId, category, displayName, description, tags }]

---

1. LLM calls get_step_type_schema(typeId)
   ↓
2. System looks up StepType in STEP_TYPE_REGISTRY
   ↓
3. System serializes configurationSchema to SchemaField[]
   ↓
4. Returns: { typeId, category, displayName, description, tags, schema: { fields }, examples? }
```

---

## Constraints & Assumptions

**Constraints**:
- Metadata is static (defined at compile time in step-types.ts and job-entry-types.ts)
- No dynamic tag generation
- Examples must be manually curated
- Schema serialization is runtime operation (introspects Zod schemas)

**Assumptions**:
- LLMs can parse JSON response formats
- Tag taxonomy covers 80%+ of common use cases
- 2-5 tags per step type provides sufficient granularity
- Field-level descriptions in Zod schemas are sufficient documentation
- Examples are optional (not all step types need examples)

---

## Summary

This data model extends existing structures with minimal changes:
- **StepType/JobEntryType**: Add examples field, populate tags array, enhance descriptions
- **ConfigurationExample**: New interface for example configurations
- **SerializedSchema**: New response format for schema field metadata
- **Tag Taxonomy**: Standardized keywords for consistent discovery

No database, no persistence, no complex state management - purely data enrichment.
