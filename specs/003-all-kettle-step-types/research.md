# Research: Complete Kettle Step Type Library

**Feature**: 003-all-kettle-step-types  
**Date**: 2025-10-28  
**Purpose**: Research Kettle step types, categorization patterns, and implementation best practices

## Research Questions

### Q1: What are all the step types available in Pentaho Kettle 9.x?

**Research Approach**: Analyze Pentaho Kettle source code, documentation, and community resources

**Findings**:

Pentaho Kettle (PDI) ships with 150+ transformation step types organized into functional categories. Based on the Pentaho Kettle repository and documentation:

**Input Steps** (~35 types):
- **Database**: TableInput, MySQLBulkLoader, PostgreSQLBulkLoader, OracleBulkLoader, SQLServerBulkLoader, etc.
- **File**: TextFileInput, CSVInput, FixedFileInput, ExcelInput, AccessInput, PropertyInput, LDIFInput
- **Structured Data**: XMLInput, JSONInput, YAMLInput, GetXMLData
- **Streaming**: KafkaConsumer, JMSInput, MQInput, MQTTSubscriber, AMQPConsumer
- **Web Services**: REST Client, SOAP Client, HTTP Client
- **Cloud/NoSQL**: S3 CSV Input, MongoDB Input, Cassandra Input, Elasticsearch Input, Salesforce Input
- **Other**: LDAP Input, RSS Feed Input, SAP Input, Vertica Bulk Loader

**Transform Steps** (~50 types):
- **Field Operations**: SelectValues, AddConstants, ValueMapper, FieldSplitter, ConcatFields, ColumnsSplitter, RowsToColumns, ColumnToRows
- **Filtering**: FilterRows, JavaFilter, RegexEval, SampleRows
- **Calculations**: Calculator, Formula, AnalyticQuery, NumberRange
- **Sorting**: SortRows, SortedMerge
- **Deduplication**: Unique, UniqueRowsByHashKey
- **String Operations**: StringOperations, StringCut, ReplaceString, Split Fields, IfNull
- **Date/Time**: SelectValues (date conversion), Add Sequence
- **Normalization**: Row Normalizer, Row Denormalizer
- **Joins**: Joiner, Merge Join, Multiway Merge Join, Join Rows (Cartesian product)
- **Lookups**: Stream Lookup, Database Lookup, Fuzzy Match, Database Join
- **Aggregations**: Group By, Memory Group By, Aggregate Rows
- **Validation**: Data Validator, Null If, Coalesce
- **Other**: Switch/Case, Transpose, Pivot, Unpivot

**Output Steps** (~25 types):
- **Database**: Table Output, Insert/Update, Update, Delete, Synchronize after merge, Execute SQL, Execute Row SQL
- **File**: Text File Output, Excel Output, Access Output, Property Output, XML Output
- **Structured Data**: JSON Output, YAML Output
- **Streaming**: Kafka Producer, JMS Output, MQ Output, MQTT Publisher, AMQP Producer
- **Web Services**: REST Client (POST/PUT/DELETE), HTTP Post
- **Cloud/NoSQL**: S3 CSV Output, MongoDB Output, Cassandra Output, Elasticsearch Bulk Insert, Salesforce Insert/Update
- **Other**: Email, LDAP Output, Vertica Bulk Loader

**Utility/Flow Steps** (~20 types):
- **Flow Control**: Switch/Case, Filter Rows to Target, Abort, Block This Step, Block Until Steps Finish, Delay Row
- **Variables**: Set Variable, Get Variable, Set Variables from File
- **Logging**: Write to Log, Log Row Count
- **Scripting**: JavaScript, User Defined Java Class, User Defined Java Expression, Modified Java Script Value
- **SQL**: Execute SQL, Execute Row SQL
- **Data Generation**: Generate Rows, Random Value, Sequence Generator, Add Sequence
- **Other**: Mail, HTTP, HTTP Post, LDAP Input/Output

**Lookup/Join Steps** (~10 types):
- Stream Lookup, Database Lookup, Database Join, Fuzzy Match
- Joiner, Merge Join, Multiway Merge Join, Join Rows
- Dimension Lookup/Update, Combination Lookup/Update

**Scripting Steps** (~8 types):
- JavaScript, Modified Java Script Value
- User Defined Java Class, User Defined Java Expression
- Formula, Execute SQL, Execute Row SQL Script, Execute SQL Script

**Big Data/Cloud Steps** (~15 types):
- Hadoop File Input/Output, HDFS File Input/Output
- HBase Input/Output, HBase Row Decoder
- S3 CSV Input/Output, S3 File Output
- MongoDB Input/Output, Cassandra Input/Output
- Elasticsearch Bulk Insert, Salesforce Input/Insert/Update/Delete/Upsert
- Azure Event Hubs, Google Analytics

**Data Quality/Validation Steps** (~10 types):
- Data Validator, Check Sum, CRC-32, MD5
- Null If, If Null, Coalesce
- Value Mapper, Data Cleanse
- Dummy, Generate Rows

**Decision**: Implement 150+ step types across all categories with priority:
- P1: Input (30 types), Transform (40 types), Output (20 types) - Core ETL
- P2: Utility (15 types), Lookup/Join (10 types) - Advanced workflows
- P3: Data Quality (10 types), Big Data/Cloud (15 types) - Specialized use cases

---

### Q2: How should step types be categorized for optimal discovery?

**Research Approach**: Analyze existing Kettle UI organization and LLM discovery patterns

**Findings**:

Kettle's Spoon UI organizes steps into these categories:
- Input, Output, Transform, Utility, Flow, Scripting, Lookup, Join, Statistics, Validation, Deprecated, Bulk Loading, Big Data, Experimental, Agile BI, Data Quality, Palo

**LLM Discovery Considerations**:
- AI agents think in terms of actions ("read from database", "filter rows", "join datasets")
- Category-based filtering is intuitive (all input steps together)
- Tags enable capability-based discovery ("database", "file", "streaming")
- Descriptions should be action-oriented, not technical jargon

**Decision**: Use simplified category system aligned with ETL workflow phases:

```typescript
export enum StepCategory {
  INPUT = 'Input',           // Data sources (databases, files, APIs, streaming)
  OUTPUT = 'Output',         // Data destinations (databases, files, APIs, streaming)
  TRANSFORM = 'Transform',   // Data manipulation (fields, filtering, calculations)
  LOOKUP = 'Lookup',         // Data enrichment (lookups, dimensions)
  JOIN = 'Join',             // Combining datasets (joins, merges)
  FLOW = 'Flow',             // Workflow control (switch, abort, block)
  SCRIPTING = 'Scripting',   // Custom logic (JavaScript, Java, SQL scripts)
  UTILITY = 'Utility',       // Helper operations (variables, logging, generation)
  BIGDATA = 'BigData',       // Big data platforms (Hadoop, Spark, cloud)
  VALIDATION = 'Validation', // Data quality (validators, checksums, cleansing)
}
```

**Rationale**: 
- Aligns with ETL mental model (extract → transform → load)
- Clear separation of concerns
- Enables targeted filtering by workflow phase
- Backward compatible with existing StepCategory enum (just add new values)

---

### Q3: What tag taxonomy should be used for capability-based discovery?

**Research Approach**: Analyze existing tags from feature 002 and extend for new capabilities

**Findings**:

Current tag taxonomy (from `src/utils/tag-taxonomy.ts` in feature 002):
- Data source tags: 'database', 'file', 'csv', 'json', 'xml', 'excel', 'text'
- Operation tags: 'read', 'write', 'transform', 'filter', 'calculate', 'aggregate'
- Technology tags: 'sql', 'nosql', 'streaming', 'rest', 'http'

**Extension Needed**:
- Cloud tags: 's3', 'azure', 'gcp', 'cloud'
- Big data tags: 'hadoop', 'spark', 'hdfs', 'hbase', 'kafka'
- NoSQL tags: 'mongodb', 'cassandra', 'elasticsearch'
- Operation tags: 'join', 'lookup', 'validate', 'cleanse', 'normalize', 'denormalize'
- Scripting tags: 'javascript', 'java', 'groovy', 'python'
- Quality tags: 'quality', 'validation', 'checksum', 'deduplication'

**Decision**: Extend tag taxonomy to 60-70 tags organized by:

```typescript
export const TAG_TAXONOMY = {
  // Data sources (12 tags)
  dataSource: ['database', 'file', 'streaming', 'api', 'nosql', 'cloud', ...],
  
  // File formats (10 tags)
  fileFormat: ['csv', 'json', 'xml', 'excel', 'text', 'parquet', 'avro', ...],
  
  // Operations (15 tags)
  operation: ['read', 'write', 'transform', 'filter', 'join', 'lookup', 'aggregate', ...],
  
  // Technologies (20 tags)
  technology: ['sql', 'nosql', 'kafka', 'mongodb', 'hadoop', 's3', 'rest', ...],
  
  // Data quality (8 tags)
  quality: ['validate', 'cleanse', 'deduplicate', 'checksum', 'quality', ...],
};
```

Each step type receives 3-5 tags from this taxonomy based on primary use cases.

---

### Q4: What schema validation patterns should be used for complex step configurations?

**Research Approach**: Analyze existing Zod schemas and Kettle XML structure

**Findings**:

**Existing Pattern** (from feature 002):
- Zod schemas define configuration structure
- Nested objects for complex configurations (e.g., database connections, field mappings)
- Array types for repeating elements (e.g., multiple fields, multiple conditions)
- Enums for fixed choices (e.g., join types: INNER, LEFT, RIGHT, FULL)
- Optional fields with `.optional()`, defaults with `.default(value)`
- Validation constraints: `.min()`, `.max()`, `.regex()`, `.email()`, etc.

**Complex Configuration Examples**:

1. **Joiner** (multiple join keys, join type selection):
```typescript
const joinerConfigSchema = z.object({
  joinType: z.enum(['INNER', 'LEFT', 'RIGHT', 'FULL']),
  mainStep: z.string(),
  lookupStep: z.string(),
  keys: z.array(z.object({
    main: z.string(),
    lookup: z.string(),
  })),
});
```

2. **Group By** (multiple group fields, multiple aggregations):
```typescript
const groupByConfigSchema = z.object({
  groupFields: z.array(z.object({
    name: z.string(),
  })),
  aggregations: z.array(z.object({
    subject: z.string(),
    type: z.enum(['SUM', 'COUNT', 'AVERAGE', 'MIN', 'MAX']),
    value: z.string().optional(),
  })),
});
```

3. **Database Connection** (reusable pattern):
```typescript
const databaseConnectionSchema = z.object({
  connection: z.string().describe('Database connection name'),
  schema: z.string().optional().describe('Database schema'),
  table: z.string().optional().describe('Table name'),
});
```

**Decision**: Use nested Zod objects and arrays for complex configurations, following patterns:
- Reusable sub-schemas for common patterns (connections, field mappings)
- Clear descriptions on all fields using `.describe()`
- Validation constraints aligned with Kettle's XML validation rules
- Default values matching Kettle's defaults

---

### Q5: What example configurations should be provided per step type?

**Research Approach**: Analyze real-world Kettle transformations and common patterns

**Findings**:

**Example Quality Criteria** (from feature 002):
- Realistic scenarios with meaningful names
- Complete configurations (all required fields populated)
- Diverse use cases (different data sources, different operations)
- Comments/descriptions explaining the scenario

**Common Patterns**:

1. **Input Steps**: 2 examples each
   - Example 1: Simple/common use case (e.g., "Read customer data from MySQL")
   - Example 2: Advanced use case (e.g., "Read partitioned data with filtering")

2. **Transform Steps**: 2 examples each
   - Example 1: Basic transformation (e.g., "Select and rename 3 fields")
   - Example 2: Complex transformation (e.g., "Multi-condition filtering with null handling")

3. **Output Steps**: 2 examples each
   - Example 1: Standard output (e.g., "Write to PostgreSQL table")
   - Example 2: Advanced output (e.g., "Upsert with conflict resolution")

**Decision**: Provide 2 examples per step type (minimum), following this template:

```typescript
examples: [
  {
    name: "Basic Use Case Name",
    description: "Concrete scenario description (e.g., 'Read customer records from MySQL customers table')",
    configuration: {
      // Complete, realistic configuration
      field1: "value1",
      field2: 123,
      nestedObject: { ... },
    },
  },
  {
    name: "Advanced Use Case Name",
    description: "More complex scenario (e.g., 'Stream processing with error handling')",
    configuration: {
      // More complex configuration demonstrating advanced features
    },
  },
],
```

---

### Q6: What is the implementation order for 150+ step types?

**Research Approach**: Analyze user story priorities and dependencies

**Findings**:

**Priority Levels** (from spec.md):
- **P1** (MVP - User Stories 1-3): Input, Transform, Output steps (90 types total)
  - Critical for basic ETL workflows
  - Enables end-to-end data pipelines
  - Highest ROI for LLM-assisted development
- **P2** (Enhanced - User Stories 4-5): Utility, Flow, Lookup/Join steps (35 types)
  - Enables sophisticated workflow logic
  - Important for production-quality pipelines
  - Common but not essential for MVP
- **P3** (Advanced - User Stories 6-7): Data Quality, Big Data/Cloud steps (25 types)
  - Specialized use cases
  - Modern platform integrations
  - Lower usage frequency

**Implementation Dependencies**:
- No technical dependencies between step types
- Each category file is independent
- Can parallelize work across categories

**Decision**: Implement in 3 phases aligned with priorities:

**Phase 1 (P1) - Core ETL Capabilities** (~90 step types):
1. Input steps (30 types): Database, File, Structured, Streaming, Web, Cloud
2. Transform steps (40 types): Field ops, Filtering, Calculations, Joins, Lookups, Aggregations
3. Output steps (20 types): Database, File, Structured, Streaming, Web, Cloud

**Phase 2 (P2) - Advanced Workflows** (~35 step types):
4. Flow control steps (10 types): Switch, Filter to target, Abort, Block
5. Utility steps (15 types): Variables, Logging, Data generation
6. Lookup/Join steps (10 types): Stream lookup, Database lookup, Fuzzy match

**Phase 3 (P3) - Specialized Capabilities** (~25 step types):
7. Data Quality steps (10 types): Validation, Checksums, Cleansing
8. Big Data/Cloud steps (15 types): Hadoop, S3, MongoDB, Cassandra, Elasticsearch

**Rationale**: Phased approach enables:
- Incremental delivery and validation
- Early feedback on patterns and structure
- Parallel development across phases
- Risk mitigation (MVP delivered first)

---

## Decision Summary

### Decision 1: Step Type Catalog
**Decision**: Implement 150+ step types across 10 categories based on Pentaho Kettle 9.x

**Rationale**: Comprehensive coverage of Kettle's transformation capabilities. Prioritized by usage frequency and ETL workflow phases.

**Alternatives Considered**:
- Minimal set (30-40 types): Rejected - insufficient for real-world ETL needs
- Full set (200+ including experimental): Rejected - too many low-usage types

**Implementation**: Category-based files (input.ts, transform.ts, output.ts, etc.)

---

### Decision 2: Category System
**Decision**: Use 10-category system aligned with ETL workflow phases

**Rationale**: Clear separation of concerns, intuitive for LLM discovery, backward compatible

**Alternatives Considered**:
- Match Kettle UI exactly (15+ categories): Rejected - too granular, overlapping categories
- Simple 3-category (Input/Transform/Output): Rejected - insufficient for advanced workflows

**Implementation**: Extend StepCategory enum with new values (LOOKUP, JOIN, FLOW, etc.)

---

### Decision 3: Tag Taxonomy
**Decision**: Extend to 60-70 tags organized by data source, format, operation, technology

**Rationale**: Enables capability-based discovery, maps to LLM natural language queries

**Alternatives Considered**:
- Minimal tags (20-30): Rejected - insufficient granularity for 150+ types
- Free-form tags: Rejected - inconsistent, poor discoverability

**Implementation**: Extend `src/utils/tag-taxonomy.ts` with new tag constants

---

### Decision 4: Schema Patterns
**Decision**: Use nested Zod objects/arrays for complex configurations with reusable sub-schemas

**Rationale**: Type-safe, validates against Kettle XML structure, enables LLM configuration generation

**Alternatives Considered**:
- Generic Record<string, any>: Rejected - no validation, poor LLM guidance
- JSON Schema: Rejected - Zod already in use, better TypeScript integration

**Implementation**: Follow patterns from feature 002, create reusable connection/field schemas

---

### Decision 5: Example Strategy
**Decision**: Provide 2+ examples per step type (basic + advanced scenarios)

**Rationale**: Enables LLM first-attempt success, demonstrates real-world usage patterns

**Alternatives Considered**:
- 1 example per type: Rejected - insufficient coverage of use cases
- 5+ examples per type: Rejected - diminishing returns, maintenance overhead

**Implementation**: Embed examples in step type definitions using ConfigurationExample interface

---

### Decision 6: Implementation Order
**Decision**: 3-phase implementation (P1: Core ETL, P2: Advanced, P3: Specialized)

**Rationale**: Incremental delivery, early validation, aligned with user story priorities

**Alternatives Considered**:
- Alphabetical order: Rejected - doesn't align with value delivery
- Random/opportunistic: Rejected - no clear completion criteria

**Implementation**: Phase 1 → Phase 2 → Phase 3, with checkpoints for validation

---

## Best Practices

### Kettle Step Type Research Sources

1. **Official Documentation**:
   - Pentaho Data Integration docs: https://help.hitachivantara.com/Documentation/Pentaho/
   - Step reference guides in PDI documentation

2. **Source Code**:
   - pentaho-kettle GitHub repository
   - Plugin source code for step definitions
   - XML schema definitions

3. **Community Resources**:
   - Kettle forums and user groups
   - Real-world transformation examples
   - Step usage statistics from community surveys

### Schema Definition Best Practices

1. **Field Descriptions**: Every field must have `.describe()` with clear, LLM-friendly explanation
2. **Required vs Optional**: Match Kettle's XML requirements (use `.optional()` only when truly optional)
3. **Validation Constraints**: Include `.min()`, `.max()`, `.regex()` aligned with Kettle's validation
4. **Default Values**: Use `.default()` matching Kettle's defaults (e.g., `enabled: true`)
5. **Enums**: Use string enums matching Kettle's exact values (case-sensitive)
6. **Nested Objects**: Use for logical grouping (e.g., connection settings, field mappings)
7. **Arrays**: Use for repeating elements (e.g., multiple fields, multiple keys)

### Example Configuration Best Practices

1. **Realistic Names**: Use meaningful scenario names (e.g., "Read Sales Data", not "Example 1")
2. **Complete Configs**: All required fields populated with realistic values
3. **Diverse Scenarios**: Cover different use cases (different data sources, different patterns)
4. **Clear Descriptions**: Explain what the configuration does and when to use it

### Tag Selection Best Practices

1. **3-5 Tags**: Each step type gets 3-5 tags (primary use cases)
2. **Use Taxonomy**: Only use tags from standardized taxonomy (no custom tags)
3. **Think LLM**: Tags should map to natural language queries ("read database" → ['database', 'read', 'sql'])
4. **Hierarchical**: Include both specific and general tags (e.g., 'mysql' + 'database' + 'sql')

### Description Writing Best Practices

1. **Action-Oriented**: Start with verb (e.g., "Read data from...", "Filter rows based on...")
2. **Comprehensive**: 50+ characters, explain purpose AND common use cases
3. **LLM-Friendly**: Use terms LLMs will recognize from natural language queries
4. **Differentiation**: Explain how this step differs from similar steps

---

## Open Questions

**None** - All research questions resolved with clear decisions.

---

## Next Steps

1. ✅ Research complete - all unknowns resolved
2. → Proceed to Phase 1: Create data-model.md (entity definitions)
3. → Proceed to Phase 1: Generate contracts/ (MCP tool API schemas)
4. → Proceed to Phase 1: Create quickstart.md (contributor guide)
5. → Update agent context with technology decisions
