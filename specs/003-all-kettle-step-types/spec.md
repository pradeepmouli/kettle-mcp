# Feature Specification: Complete Kettle Step Type Library

**Feature Branch**: `003-all-kettle-step-types`  
**Created**: 2025-10-28  
**Status**: Draft  
**Input**: User description: "implement all step types shipped with Kettle"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Input Step Types Coverage (Priority: P1)

An AI agent needs to read data from all common data sources that Kettle supports. The system provides comprehensive input step type definitions including database connectors, file readers (CSV, Excel, JSON, XML, fixed-width), streaming sources (Kafka, JMS), web services (REST, SOAP), and cloud storage connectors.

**Why this priority**: Input steps are the foundation of any ETL pipeline - without the ability to read data from various sources, no transformation workflow can begin. This is the most critical category for LLM-assisted pipeline building.

**Independent Test**: Can be fully tested by verifying that each input step type (TableInput, CSVFileInput, ExcelInput, JSONInput, XMLInput, KafkaConsumer, RestClient, etc.) is registered with complete metadata, schemas, examples, and tags. Delivers immediate value by enabling LLMs to create data ingestion workflows.

**Acceptance Scenarios**:

1. **Given** an LLM needs to read from a relational database, **When** it searches for database input steps, **Then** it finds TableInput, MySQLInput, PostgreSQLInput, OracleInput, SQL ServerInput with connection schemas and SQL query examples
2. **Given** an LLM needs to process CSV files, **When** it retrieves CSVFileInput schema, **Then** it receives field definitions for filename, delimiter, encoding, header rows, and data type mappings
3. **Given** an LLM needs to consume streaming data, **When** it searches for streaming input steps, **Then** it finds Kafka Consumer, JMS Consumer, MQTT Subscriber with broker configuration schemas
4. **Given** an LLM needs to call REST APIs, **When** it searches for HTTP-related steps, **Then** it finds REST Client with URL, headers, authentication, and response parsing configurations
5. **Given** an LLM needs to read Excel files, **When** it retrieves ExcelInput schema, **Then** it receives field definitions for filename, sheet selection, cell ranges, and column mappings

---

### User Story 2 - Transform Step Types Coverage (Priority: P1)

An AI agent needs to transform, filter, manipulate, and enrich data using all transformation capabilities Kettle provides. The system provides comprehensive transform step type definitions including field operations (select, rename, calculate), filtering (rows, values), sorting, deduplication, joins, lookups, aggregations, string operations, date operations, and data quality steps.

**Why this priority**: Transformation is the "T" in ETL and represents the core business logic layer. Without comprehensive transform steps, LLMs cannot build meaningful data processing workflows. This is equally critical to input steps for MVP delivery.

**Independent Test**: Can be fully tested by verifying that each transform step type (SelectValues, FilterRows, SortRows, Calculator, StringOperations, DateCalculator, Denormalizer, Normalizer, Joiner, MergeJoin, StreamLookup, GroupBy, etc.) is registered with complete metadata, schemas, and examples. Independently valuable for data transformation workflows.

**Acceptance Scenarios**:

1. **Given** an LLM needs to select specific columns, **When** it searches for field manipulation steps, **Then** it finds SelectValues, AddConstants, FieldSplitter with field selection and mapping schemas
2. **Given** an LLM needs to filter data, **When** it retrieves FilterRows schema, **Then** it receives condition definitions for comparison operators, AND/OR logic, and null handling
3. **Given** an LLM needs to calculate derived fields, **When** it searches for calculation steps, **Then** it finds Calculator, Formula with arithmetic operations, mathematical functions, and field references
4. **Given** an LLM needs to join datasets, **When** it searches for join operations, **Then** it finds Joiner, MergeJoin, MultiWayMerge with join type options (inner, outer, cross) and key field configurations
5. **Given** an LLM needs to aggregate data, **When** it retrieves GroupBy schema, **Then** it receives field definitions for grouping keys and aggregation functions (sum, average, count, min, max)
6. **Given** an LLM needs to deduplicate records, **When** it searches for deduplication steps, **Then** it finds Unique, UniqueRowsByHashKey with comparison field configurations
7. **Given** an LLM needs to perform lookups, **When** it searches for lookup steps, **Then** it finds StreamLookup, DatabaseLookup with key matching and value retrieval schemas

---

### User Story 3 - Output Step Types Coverage (Priority: P1)

An AI agent needs to write processed data to all common destinations that Kettle supports. The system provides comprehensive output step type definitions including database writers, file writers (CSV, Excel, JSON, XML, Parquet), streaming destinations (Kafka, JMS), web services, cloud storage, and data warehouses.

**Why this priority**: Output steps complete the ETL pipeline by persisting results. Without the ability to write data to various destinations, transformation workflows provide no lasting value. This is essential for MVP as it completes the data flow cycle.

**Independent Test**: Can be fully tested by verifying that each output step type (TableOutput, TextFileOutput, ExcelOutput, JSONOutput, XMLOutput, KafkaProducer, InsertUpdate, Update, Delete, etc.) is registered with complete metadata, schemas, and examples. Independently delivers value for data export workflows.

**Acceptance Scenarios**:

1. **Given** an LLM needs to write to a database table, **When** it searches for database output steps, **Then** it finds TableOutput, InsertUpdate, Update, Delete with connection, table, and field mapping schemas
2. **Given** an LLM needs to generate CSV files, **When** it retrieves TextFileOutput schema, **Then** it receives field definitions for filename, delimiter, encoding, header options, and compression
3. **Given** an LLM needs to produce streaming events, **When** it searches for streaming output steps, **Then** it finds Kafka Producer, JMS Producer with broker configuration and serialization schemas
4. **Given** an LLM needs to call external APIs, **When** it searches for HTTP output steps, **Then** it finds REST Client (POST/PUT/DELETE methods) with URL, headers, body, and authentication configurations
5. **Given** an LLM needs to write Excel files, **When** it retrieves ExcelOutput schema, **Then** it receives field definitions for filename, sheet naming, formatting options, and column mappings

---

### User Story 4 - Utility and Flow Control Step Types (Priority: P2)

An AI agent needs to implement workflow logic, error handling, variable management, and utility operations. The system provides step type definitions for flow control (Switch/Case, Filter rows to target, Abort), utility operations (SetVariable, GetVariable, WriteToLog), scripting (JavaScript, SQL, Shell), and data validation steps.

**Why this priority**: While not required for basic ETL flows, these steps enable sophisticated workflow logic and error handling. Important for production-quality pipelines but can be added after core input/transform/output capabilities.

**Independent Test**: Can be fully tested by verifying that flow control and utility step types (SwitchCase, FilterRowsToTarget, Abort, SetVariable, WriteToLog, JavaScript, etc.) are registered with complete metadata and schemas. Independently valuable for workflow orchestration.

**Acceptance Scenarios**:

1. **Given** an LLM needs conditional routing, **When** it searches for flow control steps, **Then** it finds SwitchCase, FilterRowsToTarget with condition and target step configurations
2. **Given** an LLM needs to set workflow variables, **When** it retrieves SetVariable schema, **Then** it receives field definitions for variable name, value, and scope (JVM, parent job, current transformation)
3. **Given** an LLM needs to log execution details, **When** it searches for logging steps, **Then** it finds WriteToLog with log level and message field configurations
4. **Given** an LLM needs to execute custom logic, **When** it searches for scripting steps, **Then** it finds JavaScript, Formula, UserDefinedJavaClass with script editor configurations
5. **Given** an LLM needs to validate data quality, **When** it searches for validation steps, **Then** it finds DataValidator, CheckSum with validation rule schemas

---

### User Story 5 - Lookup and Join Step Types (Priority: P2)

An AI agent needs to enrich data by looking up values from reference datasets or joining multiple data streams. The system provides comprehensive lookup and join step type definitions including stream lookups, database lookups, fuzzy matching, and various join types.

**Why this priority**: Data enrichment and joining are common ETL patterns but build on core transform capabilities. Can be delivered after P1 stories while still providing significant value for complex data integration scenarios.

**Independent Test**: Can be fully tested by verifying that lookup and join step types (StreamLookup, DatabaseLookup, FuzzyMatch, Joiner, MergeJoin, MultiwayMergeJoin, etc.) are registered with complete metadata and schemas. Independently demonstrates value for data enrichment workflows.

**Acceptance Scenarios**:

1. **Given** an LLM needs to lookup reference data, **When** it retrieves StreamLookup schema, **Then** it receives field definitions for lookup keys, return values, and default values for non-matches
2. **Given** an LLM needs to join sorted streams, **When** it retrieves MergeJoin schema, **Then** it receives field definitions for join keys, join type (inner, left outer, right outer, full outer), and key ordering requirements
3. **Given** an LLM needs fuzzy matching, **When** it searches for matching steps, **Then** it finds FuzzyMatch with algorithm selection (Levenshtein, Jaro-Winkler) and similarity threshold configurations
4. **Given** an LLM needs to merge multiple streams, **When** it retrieves MultiwayMergeJoin schema, **Then** it receives configurations for multiple input sources and unified key matching

---

### User Story 6 - Data Quality and Validation Steps (Priority: P3)

An AI agent needs to implement data quality checks, validation rules, and data cleansing operations. The system provides step type definitions for validation, null handling, data cleansing, and quality reporting.

**Why this priority**: Data quality is important for production systems but not essential for basic ETL functionality. Can be added after core ETL capabilities are in place.

**Independent Test**: Can be fully tested by verifying that data quality step types (DataValidator, IfNull, NullIf, Coalesce, ValueMapper, DataCleanse, etc.) are registered with complete metadata and schemas.

**Acceptance Scenarios**:

1. **Given** an LLM needs to validate field constraints, **When** it retrieves DataValidator schema, **Then** it receives validation rule configurations for data types, ranges, patterns, and null checks
2. **Given** an LLM needs to handle null values, **When** it searches for null handling steps, **Then** it finds IfNull, NullIf, Coalesce with default value and condition configurations
3. **Given** an LLM needs to map values, **When** it retrieves ValueMapper schema, **Then** it receives field definitions for source values, target values, and default mappings

---

### User Story 7 - Big Data and Cloud Integration Steps (Priority: P3)

An AI agent needs to integrate with big data platforms and cloud services. The system provides step type definitions for Hadoop, S3, Azure, Google Cloud, MongoDB, Cassandra, and other modern data platforms.

**Why this priority**: Cloud and big data integrations are important for modern data pipelines but represent a smaller subset of use cases. Lower priority than core ETL capabilities.

**Independent Test**: Can be fully tested by verifying that big data and cloud step types (S3Input, S3Output, HadoopFileInput, MongoDbInput, CassandraInput, etc.) are registered with complete metadata and schemas.

**Acceptance Scenarios**:

1. **Given** an LLM needs to read from S3, **When** it retrieves S3Input schema, **Then** it receives field definitions for bucket, key, credentials, and region configurations
2. **Given** an LLM needs to query MongoDB, **When** it retrieves MongoDbInput schema, **Then** it receives field definitions for connection string, database, collection, and query/aggregation pipeline
3. **Given** an LLM needs to read from Hadoop, **When** it searches for Hadoop steps, **Then** it finds HadoopFileInput, HiveInput with HDFS path and configuration schemas

---

### Edge Cases

- What happens when an LLM requests a step type that exists in Kettle but isn't yet implemented in the MCP server?
  - System returns "not implemented" status with reference to similar implemented step types and suggestion to use generic step type if available
- How does the system handle deprecated step types that exist in Kettle?
  - System includes deprecated step types with metadata marking them as deprecated and suggesting modern alternatives
- What if different Kettle versions have different step types available?
  - Initial implementation targets Kettle 9.x step types (most comprehensive); version metadata included in step type definitions for future extensibility
- How does the system handle step types with complex nested configurations (e.g., Joiner with multiple keys)?
  - Schema serialization supports nested objects and arrays; examples demonstrate complex configurations with proper structure
- What if an LLM needs to discover step types by capability rather than name?
  - Tag taxonomy includes capability-based tags (e.g., "database", "file", "streaming", "transformation", "aggregation") enabling capability-based discovery
- How are step type variations handled (e.g., TableInput vs. specific database inputs like MySQLInput)?
  - Both generic and database-specific step types are provided; generic types include database-type parameter; specific types provide optimized configurations

## Requirements *(mandatory)*

### Functional Requirements

#### Input Step Types

- **FR-001**: System MUST provide step type definitions for all relational database input steps (TableInput, plus database-specific variants: MySQLInput, PostgreSQLInput, OracleInput, SQL ServerInput, etc.)
- **FR-002**: System MUST provide step type definitions for all file input steps (TextFileInput, CSVInput, FixedFileInput, ExcelInput, AccessInput, PropertyInput)
- **FR-003**: System MUST provide step type definitions for all structured data input steps (XMLInput, JSONInput, YAMLInput, LDIFInput)
- **FR-004**: System MUST provide step type definitions for all streaming input steps (KafkaConsumer, JMSInput, MQInput, MQTTSubscriber)
- **FR-005**: System MUST provide step type definitions for all web service input steps (RESTClient, SOAPInput, HTTPClient)
- **FR-006**: System MUST provide step type definitions for all cloud/NoSQL input steps (S3Input, MongoDbInput, CassandraInput, ElasticSearchInput, SalesforceInput)

#### Transform Step Types

- **FR-007**: System MUST provide step type definitions for all field manipulation steps (SelectValues, AddConstants, ValueMapper, FieldSplitter, ConcatFields, ColumnSplitter)
- **FR-008**: System MUST provide step type definitions for all filtering steps (FilterRows, JavaFilter, RegexEval)
- **FR-009**: System MUST provide step type definitions for all calculation steps (Calculator, Formula, Analytic Query, RankValues)
- **FR-010**: System MUST provide step type definitions for all sorting steps (SortRows, SortedMerge)
- **FR-011**: System MUST provide step type definitions for all deduplication steps (Unique, UniqueRowsByHashKey)
- **FR-012**: System MUST provide step type definitions for all string operation steps (StringOperations, StringCut, StringReplace, ReplaceString, SplitFields)
- **FR-013**: System MUST provide step type definitions for all date/time operation steps (SelectValues with date conversion, DateCalculator, DateDiff)
- **FR-014**: System MUST provide step type definitions for all normalization/denormalization steps (RowNormalizer, RowDenormalizer, ColumnToRows, RowsToColumns)
- **FR-015**: System MUST provide step type definitions for all join steps (Joiner, MergeJoin, MultiWayMergeJoin, JoinRows)
- **FR-016**: System MUST provide step type definitions for all lookup steps (StreamLookup, DatabaseLookup, FuzzyMatch, DBProc)
- **FR-017**: System MUST provide step type definitions for all aggregation steps (GroupBy, MemoryGroupBy, AggregateRows, Unique Rows)
- **FR-018**: System MUST provide step type definitions for all data validation steps (DataValidator, IfNull, NullIf, Coalesce)

#### Output Step Types

- **FR-019**: System MUST provide step type definitions for all database output steps (TableOutput, InsertUpdate, Update, Delete, Synchronize, BulkLoader variants for MySQL, PostgreSQL, Oracle, etc.)
- **FR-020**: System MUST provide step type definitions for all file output steps (TextFileOutput, ExcelOutput, AccessOutput, PropertyOutput)
- **FR-021**: System MUST provide step type definitions for all structured data output steps (XMLOutput, JSONOutput, YAMLOutput)
- **FR-022**: System MUST provide step type definitions for all streaming output steps (KafkaProducer, JMSOutput, MQOutput, MQTTPublisher)
- **FR-023**: System MUST provide step type definitions for all web service output steps (RESTClient POST/PUT/DELETE, SOAPOutput, HTTPPost)
- **FR-024**: System MUST provide step type definitions for all cloud/NoSQL output steps (S3Output, MongoDbOutput, CassandraOutput, ElasticSearchBulkInsert, SalesforceOutput)

#### Utility and Flow Control Step Types

- **FR-025**: System MUST provide step type definitions for all flow control steps (SwitchCase, FilterRowsToTarget, Abort, BlockThisStep, BlockUntilStepsFinish)
- **FR-026**: System MUST provide step type definitions for all variable management steps (SetVariable, GetVariable, SetVariableFromFile)
- **FR-027**: System MUST provide step type definitions for all logging steps (WriteToLog, LogRowCount)
- **FR-028**: System MUST provide step type definitions for all scripting steps (JavaScript, Formula, UserDefinedJavaClass, UserDefinedJavaExpression, ExecuteSQL, ExecSQLRow)
- **FR-029**: System MUST provide step type definitions for all data generation steps (GenerateRows, RandomValue, SequenceGenerator, AddSequence)

#### Metadata and Schema Requirements

- **FR-030**: Each step type MUST include displayName, description (>50 characters, action-oriented), category, and minimum 3 relevant tags
- **FR-031**: Each step type MUST include serialized Zod configuration schema with field names, types, required/optional flags, and descriptions
- **FR-032**: Each step type MUST include at least 2 example configurations demonstrating common use cases
- **FR-033**: All tags MUST use standardized taxonomy from tag-taxonomy.ts (no custom/undocumented tags)
- **FR-034**: Step type descriptions MUST use action-oriented language suitable for LLM understanding and intent mapping
- **FR-035**: Step type schemas MUST include validation constraints (min/max length, patterns, enum values) where applicable

#### Discovery and API Requirements

- **FR-036**: System MUST allow filtering step types by category (Input, Output, Transform, Lookup, Flow, Scripting, BigData, etc.)
- **FR-037**: System MUST allow filtering step types by tags for capability-based discovery
- **FR-038**: System MUST provide combined filtering by category AND tags
- **FR-039**: System MUST return step type metadata in consistent JSON format suitable for LLM parsing
- **FR-040**: System MUST handle requests for non-existent step types with clear error messages

### Key Entities

- **Step Type Definition**: Represents a Kettle transformation step type with properties: typeId (technical identifier matching Kettle's internal name), category (functional grouping: Input/Output/Transform/etc.), displayName (human-readable name), description (purpose and usage in action-oriented language), tags (capability keywords from standardized taxonomy), configurationSchema (Zod schema defining required/optional configuration fields), examples (array of sample configurations demonstrating common patterns)

- **Step Category**: Enumeration of step functional categories: Input (data sources), Output (data destinations), Transform (data manipulation), Lookup (data enrichment), Join (combining datasets), Flow (workflow control), Scripting (custom logic), Utility (helper operations), BigData (Hadoop/Spark/Cloud), Validation (data quality), Deprecated (legacy steps)

- **Configuration Schema**: Structured representation of a step's configuration including field name, field type (string/number/boolean/object/array), required flag, validation constraints (pattern, min/max, enum values), description, default values, and nested object/array structures for complex configurations

- **Example Configuration**: Concrete instance of a step configuration including example name, description of the scenario, and complete configuration object with realistic values demonstrating typical usage patterns

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: LLM can discover all major Kettle step types (target: 150+ step types) across all categories through a single discovery API call
- **SC-002**: LLM can filter step types by category and receive only relevant results (e.g., filtering by "Input" returns only input-related steps with 100% accuracy)
- **SC-003**: LLM can filter step types by tags and find all steps matching specific capabilities (e.g., "database" tag returns all database-related steps with 100% recall)
- **SC-004**: Each step type includes complete schema information enabling LLMs to generate valid configurations without trial-and-error (target: 95%+ first-attempt success rate in validation)
- **SC-005**: LLM can map natural language user intents to appropriate step types using descriptions and tags (e.g., "read from MySQL" → TableInput/MySQLInput with >90% accuracy)
- **SC-006**: Step type discovery APIs maintain performance under load (target: <50ms for list operations, <100ms for schema retrieval, even with 150+ step types)
- **SC-007**: All step type metadata follows consistent structure enabling LLM pattern recognition (100% compliance with quality standards: action-oriented descriptions, 3+ tags, standardized taxonomy)
- **SC-008**: Step type examples enable LLMs to generate working configurations (target: 90%+ of generated configurations pass validation on first attempt)
- **SC-009**: Coverage includes 95%+ of commonly used Kettle step types based on community usage patterns
- **SC-010**: System supports future extensibility for new Kettle versions or custom step types without breaking existing functionality
