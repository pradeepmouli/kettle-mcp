# Kettle Step Type Coverage

**Last Updated**: 2025-10-31  
**Total Step Types Implemented**: 132

## Overview

This document provides a comprehensive catalog of all Pentaho Kettle transformation step types implemented in the kettle-mcp server. These step types enable AI agents to discover and configure virtually all Kettle ETL capabilities through the MCP protocol.

## Coverage by Category

| Category | Count | Description |
|----------|-------|-------------|
| **Input** | 33 | Read data from databases, files, APIs, streaming sources, and cloud storage |
| **Transform** | 44 | Transform, filter, join, aggregate, and manipulate data |
| **Output** | 23 | Write data to databases, files, APIs, streaming destinations, and cloud storage |
| **BigData** | 15 | Big data platforms: Hadoop, HDFS, HBase, S3, Azure, Salesforce, Avro |
| **Validation** | 10 | Data quality validation, checksums, and data cleansing |
| **Lookup** | 5 | Data enrichment through lookups and dimensional operations |
| **Join** | 2 | Multi-stream join operations |
| **Total** | **132** | |

## Implementation Phases

### Phase 3: Input Step Types (33 types) ✅
Comprehensive input capabilities covering databases, files, structured data, streaming, web services, and cloud/NoSQL sources.

**Database Input** (8 types):
- MySQLBulkLoader, PostgreSQLBulkLoader, OracleBulkLoader, SQLServerBulkLoader
- MonetDBBulkLoader, VerticaBulkLoader, DatabaseJoin, GetTableNames

**File Input** (7 types):
- CSVInput, FixedFileInput, AccessInput, PropertyInput, LDIFInput, YAMLInput, ParquetInput

**Streaming Input** (4 types):
- KafkaConsumer, JMSInput, MQInput, MQTTSubscriber

**Web Service Input** (3 types):
- SOAPInput, HTTPClient, WebServiceLookup

**Cloud/NoSQL Input** (5 types):
- S3CSVInput, MongoDbInput, CassandraInput, ElasticsearchInput, SalesforceInput

**Other Input** (3 types):
- GetXMLData, RSSInput, LDAPInput

**Core Input** (3 existing types):
- TableInput, TextFileInput, ExcelInput, JSONInput, RestClient

### Phase 4: Transform Step Types (44 types) ✅
Complete transformation capabilities including field operations, filtering, calculations, joins, aggregations, and normalization.

**Core Transform** (4 existing types):
- SelectValues, FilterRows, Calculator, SortRows

**Field Operations** (6 types):
- AddConstants, ValueMapper, FieldSplitter, ConcatFields, ColumnsSplitter, SetFieldValue

**Filtering** (3 types):
- JavaFilter, RegexEval, SampleRows

**Calculations** (4 types):
- Formula, AnalyticQuery, NumberRange, Constant

**Sorting** (2 types):
- SortedMerge, ReservoirSampling

**Deduplication** (2 types):
- Unique, UniqueRowsByHashKey

**String Operations** (6 types):
- StringOperations, StringCut, ReplaceString, SplitFields, IfNull, NullIf

**Date/Time** (3 types):
- AddSequence, GetSystemInfo, DateDiff

**Normalization** (4 types):
- RowNormalizer, RowDenormalizer, ColumnToRows, RowsToColumns

**Joins** (4 types):
- Joiner, MergeJoin, MultiWayMergeJoin, JoinRows

**Aggregation** (4 types):
- GroupBy, MemoryGroupBy, AggregateRows, UniqueRows

**Other Transform** (2 types):
- SwitchCase, Transpose

### Phase 5: Output Step Types (23 types) ✅
Comprehensive output capabilities covering database writers, file writers, structured data, streaming, web services, and cloud destinations.

**Database Output** (6 types):
- InsertUpdate, Update, Delete, SynchronizeAfterMerge, MySQLBulkLoader, PostgreSQLBulkLoader

**File Output** (4 types):
- ExcelOutput, AccessOutput, PropertyOutput, ParquetOutput

**Structured Data Output** (2 types):
- XMLOutput, YAMLOutput

**Streaming Output** (4 types):
- KafkaProducer, JMSOutput, MQOutput, MQTTPublisher

**Cloud/NoSQL Output** (4 types):
- S3CSVOutput, MongoDbOutput, CassandraOutput, ElasticsearchBulkInsert

**Core Output** (3 existing types):
- TableOutput, TextFileOutput, XMLOutput

### Phase 7: Lookup and Join Step Types (7 types) ✅
Data enrichment and multi-stream operations.

**Lookup** (5 types):
- StreamLookup, DatabaseLookup, FuzzyMatch, DimensionLookup, CombinationLookup

**Join** (2 types):
- MergeRows, Append

### Phase 8: Validation Step Types (10 types) ✅
Data quality validation, null handling, and cleansing operations.

**Validation** (10 types):
- DataValidator, CheckSum, CRC32, MD5, Coalesce
- DataCleanse, DetectEmptyStream, FieldValidator, Validator, DataGrid

### Phase 9: BigData and Cloud Integration Step Types (15 types) ✅
Modern big data platforms and cloud services integration.

**Hadoop/HDFS** (4 types):
- HadoopFileInput, HadoopFileOutput, HDFSFileInput, HDFSFileOutput

**HBase** (2 types):
- HBaseInput, HBaseOutput

**S3** (2 types):
- S3FileInput, S3FileOutput

**Azure** (2 types):
- AzureEventHubsConsumer, AzureEventHubsProducer

**Cloud Services** (3 types):
- GoogleAnalytics, SalesforceUpsert, SalesforceDelete

**Avro** (2 types):
- AvroInput, AvroOutput

## Step Type Metadata

Each step type includes:

- **typeId**: Unique identifier matching Kettle's internal step type name
- **category**: Classification (Input, Transform, Output, etc.)
- **displayName**: Human-readable name
- **description**: Action-oriented description (>50 characters) optimized for LLM understanding
- **tags**: 3-5 relevant tags from standardized taxonomy for capability-based discovery
- **configurationSchema**: Zod schema with field names, types, validation constraints, and descriptions
- **examples**: 2+ example configurations demonstrating common use cases

## Tag Taxonomy

Tags are organized into categories for consistent discovery:

### Data Sources
database, file, streaming, api, nosql, cloud, queue, cache, ldap, email, ftp, sftp

### File Formats
csv, json, xml, excel, text, parquet, yaml, properties, ldif, access

### Operations
read, write, transform, filter, join, lookup, aggregate, sort, deduplicate, normalize, denormalize, validate, cleanse, calculate, split, merge

### Technologies
sql, mysql, postgresql, oracle, sqlserver, mongodb, cassandra, elasticsearch, kafka, jms, mqtt, hadoop, spark, hdfs, hbase, s3, azure, gcp, rest, soap, http

### Quality
quality, validation, checksum, deduplication, cleansing, profiling, sampling, monitoring

## API Usage

### List All Step Types
```javascript
import { listStepTypes } from './kettle/schemas/transformations/stepTypes/index.js';

// Get all step types
const allSteps = listStepTypes();

// Filter by category
const inputSteps = listStepTypes('Input');
const transformSteps = listStepTypes('Transform');
const bigDataSteps = listStepTypes('BigData');
```

### Get Step Type Schema
```javascript
import { getStepTypeSchema } from './kettle/schemas/transformations/stepTypes/index.js';

// Get specific step type with schema
const tableInputSchema = getStepTypeSchema('TableInput');
console.log(tableInputSchema.configurationSchema);
console.log(tableInputSchema.examples);
```

### MCP Tools

The kettle-mcp server exposes these step types through MCP tools:

- `list_step_types`: List all step types with optional category filter
- `get_step_type_schema`: Get detailed schema for a specific step type
- Tag-based search enabled through standardized taxonomy

## Future Enhancements

Potential additions for future phases:

- **Flow Control Steps** (Phase 6): SwitchCase, FilterRowsToTarget, Abort, BlockThisStep, BlockUntilStepsFinish, DelayRow
- **Scripting Steps** (Phase 6): JavaScript, ModifiedJavaScriptValue, UserDefinedJavaClass, ExecuteSQL, ExecSQLScript, HTTPPost
- **Utility Steps** (Phase 6): SetVariable, GetVariable, WriteToLog, GenerateRows, RandomValue, SequenceGenerator, RowGenerator, Dummy, CloneRow
- **Additional Transform Steps**: IfNull, Analytic Query, Group By enhancements
- **Additional Input/Output**: More database-specific bulk loaders, additional cloud connectors

## Version History

- **2025-10-31**: Phase 9 complete - Added 15 BigData step types (132 total)
- **2025-10-28**: Phases 1-8 complete - Core ETL, Lookup, Join, and Validation (117 total)
- **2025-10-27**: Initial implementation with 12 core step types

---

For implementation details and schema examples, see:
- `/src/kettle/schemas/transformations/stepTypes/` - Step type definitions
- `/tests/contract/discovery_tools.test.ts` - Discovery API tests
- `/specs/003-all-kettle-step-types/` - Feature specification and planning
