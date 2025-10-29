# Tasks: Complete Kettle Step Type Library

**Input**: Design documents from `/specs/003-all-kettle-step-types/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are NOT explicitly requested in the specification. This feature extends existing discovery APIs which already have comprehensive test coverage. Test updates will be minimal and focused on validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5, US6, US7)
- Include exact file paths in descriptions

## Path Conventions

Single project structure at repository root: `src/`, `tests/`

---

## Implementation Strategy

**MVP Scope**: User Stories 1-3 (P1) - Core ETL capabilities (Input, Transform, Output)
**Enhanced Scope**: User Stories 4-5 (P2) - Advanced workflows (Utility, Flow, Lookup/Join)
**Full Scope**: User Stories 6-7 (P3) - Specialized capabilities (Data Quality, Big Data/Cloud)

**Incremental Delivery**:
- Phase 1: Setup and foundational work (T001-T004)
- Phase 2: US1 - Input Steps (30 types) → MVP Checkpoint
- Phase 3: US2 - Transform Steps (40 types) → MVP Checkpoint
- Phase 4: US3 - Output Steps (20 types) → MVP Complete ✅
- Phase 5: US4 - Utility/Flow Steps (25 types)
- Phase 6: US5 - Lookup/Join Steps (10 types)
- Phase 7: US6 - Validation Steps (10 types)
- Phase 8: US7 - BigData Steps (15 types)
- Phase 9: Polish and documentation

**Parallel Execution**: Most category files are independent and can be worked on in parallel within each user story phase.

---

## Dependencies

**Story Completion Order**:
- Foundational phase MUST complete before any user story work
- User Stories 1-7 are independent (can be implemented in any order after foundational)
- Recommended order: US1 → US2 → US3 (MVP), then US4 → US5 → US6 → US7

**No Cross-Story Dependencies**: Each user story can be fully tested independently

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend tag taxonomy and update StepCategory enum with new values

- [x] T001 [P] Extend TAG_TAXONOMY in src/utils/tag-taxonomy.ts with 60 new tags (cloud, bigdata, nosql, scripting, quality categories)
- [x] T002 [P] Update StepCategory enum in src/kettle/schemas/transformations/stepTypes/types.ts to add LOOKUP, JOIN, FLOW, SCRIPTING, BIGDATA, VALIDATION categories
- [x] T003 [P] Create empty category files: src/kettle/schemas/transformations/stepTypes/lookup.ts, flow.ts, scripting.ts, utility.ts, bigdata.ts, validation.ts
- [x] T004 Update src/kettle/schemas/transformations/stepTypes/index.ts to import and export new category registries

**Checkpoint**: ✅ Infrastructure ready - user story implementation can now begin in parallel

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schema patterns and validation utilities that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 [P] Create reusable database connection schema pattern in src/kettle/schemas/transformations/stepTypes/types.ts
- [ ] T006 [P] Create reusable file path schema pattern in src/kettle/schemas/transformations/stepTypes/types.ts
- [ ] T007 [P] Create reusable field mapping schema pattern in src/kettle/schemas/transformations/stepTypes/types.ts

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Input Step Types Coverage (Priority: P1) 🎯 MVP

**Goal**: Implement 30 input step type definitions covering databases, files, structured data, streaming, web services, and cloud/NoSQL sources

**Independent Test**: LLM can discover all input step types (30) with complete metadata, schemas, examples, and tags. Can filter by "Input" category with 100% accuracy. Can search for specific technologies (mysql, kafka, s3) and find relevant input steps.

### Implementation for User Story 1

**Database Input Steps (8 types)** - All can be done in parallel

- [x] T008 [P] [US1] Add MySQLBulkLoader step type to src/kettle/schemas/transformations/stepTypes/input.ts (schema, 2 examples, tags)
- [x] T009 [P] [US1] Add PostgreSQLBulkLoader step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T010 [P] [US1] Add OracleBulkLoader step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T011 [P] [US1] Add SQLServerBulkLoader step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T012 [P] [US1] Add MonetDBBulkLoader step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T013 [P] [US1] Add VerticaBulkLoader step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T014 [P] [US1] Add DatabaseJoin step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T015 [P] [US1] Add GetTableNames step type to src/kettle/schemas/transformations/stepTypes/input.ts

**File Input Steps (7 types)** - All can be done in parallel

- [x] T016 [P] [US1] Add CSVInput step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T017 [P] [US1] Add FixedFileInput step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T018 [P] [US1] Add AccessInput step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T019 [P] [US1] Add PropertyInput step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T020 [P] [US1] Add LDIFInput step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T021 [P] [US1] Add YAMLInput step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T022 [P] [US1] Add ParquetInput step type to src/kettle/schemas/transformations/stepTypes/input.ts

**Streaming Input Steps (4 types)** - All can be done in parallel

- [x] T023 [P] [US1] Add KafkaConsumer step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T024 [P] [US1] Add JMSInput step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T025 [P] [US1] Add MQInput step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T026 [P] [US1] Add MQTTSubscriber step type to src/kettle/schemas/transformations/stepTypes/input.ts

**Web Service Input Steps (3 types)** - All can be done in parallel

- [x] T027 [P] [US1] Add SOAPInput step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T028 [P] [US1] Add HTTPClient step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T029 [P] [US1] Add WebServiceLookup step type to src/kettle/schemas/transformations/stepTypes/input.ts

**Cloud/NoSQL Input Steps (5 types)** - All can be done in parallel

- [x] T030 [P] [US1] Add S3CSVInput step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T031 [P] [US1] Add MongoDbInput step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T032 [P] [US1] Add CassandraInput step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T033 [P] [US1] Add ElasticsearchInput step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T034 [P] [US1] Add SalesforceInput step type to src/kettle/schemas/transformations/stepTypes/input.ts

**Other Input Steps (3 types)** - All can be done in parallel

- [x] T035 [P] [US1] Add GetXMLData step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T036 [P] [US1] Add RSSInput step type to src/kettle/schemas/transformations/stepTypes/input.ts
- [x] T037 [P] [US1] Add LDAPInput step type to src/kettle/schemas/transformations/stepTypes/input.ts

### Validation for US1

- [x] T038 [US1] Update tests/contract/step_type_discovery.test.ts to verify all 30 input step types are discoverable
- [x] T039 [US1] Update tests/integration/discovery_workflow.test.ts to test filtering by Input category (should return 35+ types now)
- [x] T040 [US1] Run npm test to verify all tests pass and coverage remains above 75%

**Checkpoint**: ✅ COMPLETE - LLMs can discover 35+ input step types (5 existing + 30 new) with rich metadata and filter by category. MVP Checkpoint 1/3.

---

## Phase 4: User Story 2 - Transform Step Types Coverage (Priority: P1) 🎯 MVP

**Goal**: Implement 40 transform step type definitions covering field operations, filtering, calculations, sorting, deduplication, string operations, normalization, joins, lookups, and aggregations

**Independent Test**: LLM can discover all transform step types (44) with complete metadata, schemas, examples, and tags. Can filter by "Transform" category. Can search for specific operations (join, aggregate, filter) and find relevant transform steps.

### Implementation for User Story 2

**Field Operation Steps (6 types)** - All can be done in parallel

- [ ] T041 [P] [US2] Add AddConstants step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T042 [P] [US2] Add ValueMapper step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T043 [P] [US2] Add FieldSplitter step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T044 [P] [US2] Add ConcatFields step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T045 [P] [US2] Add ColumnsSplitter step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T046 [P] [US2] Add SetFieldValue step type to src/kettle/schemas/transformations/stepTypes/transform.ts

**Filtering Steps (3 types)** - All can be done in parallel

- [ ] T047 [P] [US2] Add JavaFilter step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T048 [P] [US2] Add RegexEval step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T049 [P] [US2] Add SampleRows step type to src/kettle/schemas/transformations/stepTypes/transform.ts

**Calculation Steps (4 types)** - All can be done in parallel

- [ ] T050 [P] [US2] Add Formula step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T051 [P] [US2] Add AnalyticQuery step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T052 [P] [US2] Add NumberRange step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T053 [P] [US2] Add Constant step type to src/kettle/schemas/transformations/stepTypes/transform.ts

**Sorting Steps (2 types)** - All can be done in parallel

- [ ] T054 [P] [US2] Add SortedMerge step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T055 [P] [US2] Add ReservoirSampling step type to src/kettle/schemas/transformations/stepTypes/transform.ts

**Deduplication Steps (2 types)** - All can be done in parallel

- [ ] T056 [P] [US2] Add Unique step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T057 [P] [US2] Add UniqueRowsByHashKey step type to src/kettle/schemas/transformations/stepTypes/transform.ts

**String Operation Steps (6 types)** - All can be done in parallel

- [ ] T058 [P] [US2] Add StringOperations step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T059 [P] [US2] Add StringCut step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T060 [P] [US2] Add ReplaceString step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T061 [P] [US2] Add SplitFields step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T062 [P] [US2] Add IfNull step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T063 [P] [US2] Add NullIf step type to src/kettle/schemas/transformations/stepTypes/transform.ts

**Date/Time Steps (3 types)** - All can be done in parallel

- [ ] T064 [P] [US2] Add AddSequence step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T065 [P] [US2] Add GetSystemInfo step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T066 [P] [US2] Add DateDiff step type to src/kettle/schemas/transformations/stepTypes/transform.ts

**Normalization Steps (4 types)** - All can be done in parallel

- [ ] T067 [P] [US2] Add RowNormalizer step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T068 [P] [US2] Add RowDenormalizer step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T069 [P] [US2] Add ColumnToRows step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T070 [P] [US2] Add RowsToColumns step type to src/kettle/schemas/transformations/stepTypes/transform.ts

**Join Steps (4 types)** - All can be done in parallel

- [ ] T071 [P] [US2] Add Joiner step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T072 [P] [US2] Add MergeJoin step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T073 [P] [US2] Add MultiWayMergeJoin step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T074 [P] [US2] Add JoinRows step type to src/kettle/schemas/transformations/stepTypes/transform.ts

**Aggregation Steps (4 types)** - All can be done in parallel

- [ ] T075 [P] [US2] Add GroupBy step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T076 [P] [US2] Add MemoryGroupBy step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T077 [P] [US2] Add AggregateRows step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T078 [P] [US2] Add UniqueRows step type to src/kettle/schemas/transformations/stepTypes/transform.ts

**Other Transform Steps (2 types)** - All can be done in parallel

- [ ] T079 [P] [US2] Add SwitchCase step type to src/kettle/schemas/transformations/stepTypes/transform.ts
- [ ] T080 [P] [US2] Add Transpose step type to src/kettle/schemas/transformations/stepTypes/transform.ts

### Validation for US2

- [ ] T081 [US2] Update tests/contract/step_type_discovery.test.ts to verify all 40 new transform step types are discoverable
- [ ] T082 [US2] Update tests/integration/discovery_workflow.test.ts to test filtering by Transform category (should return 44+ types now)
- [ ] T083 [US2] Run npm test to verify all tests pass and coverage remains above 75%

**Checkpoint**: ✅ COMPLETE - LLMs can discover 44+ transform step types (4 existing + 40 new) with rich metadata and filter by category. MVP Checkpoint 2/3.

---

## Phase 5: User Story 3 - Output Step Types Coverage (Priority: P1) 🎯 MVP

**Goal**: Implement 20 output step type definitions covering database writers, file writers, structured data, streaming, web services, and cloud/NoSQL destinations

**Independent Test**: LLM can discover all output step types (23) with complete metadata, schemas, examples, and tags. Can filter by "Output" category. Can search for specific technologies (mysql, kafka, s3) and find relevant output steps.

### Implementation for User Story 3

**Database Output Steps (6 types)** - All can be done in parallel

- [ ] T084 [P] [US3] Add InsertUpdate step type to src/kettle/schemas/transformations/stepTypes/output.ts
- [ ] T085 [P] [US3] Add Update step type to src/kettle/schemas/transformations/stepTypes/output.ts
- [ ] T086 [P] [US3] Add Delete step type to src/kettle/schemas/transformations/stepTypes/output.ts
- [ ] T087 [P] [US3] Add SynchronizeAfterMerge step type to src/kettle/schemas/transformations/stepTypes/output.ts
- [ ] T088 [P] [US3] Add MySQLBulkLoader step type to src/kettle/schemas/transformations/stepTypes/output.ts
- [ ] T089 [P] [US3] Add PostgreSQLBulkLoader step type to src/kettle/schemas/transformations/stepTypes/output.ts

**File Output Steps (4 types)** - All can be done in parallel

- [ ] T090 [P] [US3] Add ExcelOutput step type to src/kettle/schemas/transformations/stepTypes/output.ts
- [ ] T091 [P] [US3] Add AccessOutput step type to src/kettle/schemas/transformations/stepTypes/output.ts
- [ ] T092 [P] [US3] Add PropertyOutput step type to src/kettle/schemas/transformations/stepTypes/output.ts
- [ ] T093 [P] [US3] Add ParquetOutput step type to src/kettle/schemas/transformations/stepTypes/output.ts

**Structured Data Output Steps (2 types)** - All can be done in parallel

- [ ] T094 [P] [US3] Add XMLOutput step type to src/kettle/schemas/transformations/stepTypes/output.ts
- [ ] T095 [P] [US3] Add YAMLOutput step type to src/kettle/schemas/transformations/stepTypes/output.ts

**Streaming Output Steps (4 types)** - All can be done in parallel

- [ ] T096 [P] [US3] Add KafkaProducer step type to src/kettle/schemas/transformations/stepTypes/output.ts
- [ ] T097 [P] [US3] Add JMSOutput step type to src/kettle/schemas/transformations/stepTypes/output.ts
- [ ] T098 [P] [US3] Add MQOutput step type to src/kettle/schemas/transformations/stepTypes/output.ts
- [ ] T099 [P] [US3] Add MQTTPublisher step type to src/kettle/schemas/transformations/stepTypes/output.ts

**Cloud/NoSQL Output Steps (4 types)** - All can be done in parallel

- [ ] T100 [P] [US3] Add S3CSVOutput step type to src/kettle/schemas/transformations/stepTypes/output.ts
- [ ] T101 [P] [US3] Add MongoDbOutput step type to src/kettle/schemas/transformations/stepTypes/output.ts
- [ ] T102 [P] [US3] Add CassandraOutput step type to src/kettle/schemas/transformations/stepTypes/output.ts
- [ ] T103 [P] [US3] Add ElasticsearchBulkInsert step type to src/kettle/schemas/transformations/stepTypes/output.ts

### Validation for US3

- [ ] T104 [US3] Update tests/contract/step_type_discovery.test.ts to verify all 20 new output step types are discoverable
- [ ] T105 [US3] Update tests/integration/discovery_workflow.test.ts to test filtering by Output category (should return 23+ types now)
- [ ] T106 [US3] Run npm test to verify all tests pass and coverage remains above 75%

**Checkpoint**: ✅ MVP COMPLETE - LLMs can discover 23+ output step types (3 existing + 20 new) with rich metadata. Core ETL capabilities fully implemented (Input + Transform + Output = 102+ step types).

---

## Phase 6: User Story 4 - Utility and Flow Control Step Types (Priority: P2)

**Goal**: Implement 25 utility and flow control step type definitions covering flow control, variable management, logging, scripting, and data generation

**Independent Test**: LLM can discover all utility and flow step types (25) with complete metadata, schemas, examples, and tags. Can filter by "Flow", "Scripting", and "Utility" categories. Can search for specific operations (abort, logging, javascript) and find relevant steps.

### Implementation for User Story 4

**Flow Control Steps (6 types)** - Implement in new flow.ts file - All can be done in parallel

- [ ] T107 [P] [US4] Add SwitchCase step type to src/kettle/schemas/transformations/stepTypes/flow.ts
- [ ] T108 [P] [US4] Add FilterRowsToTarget step type to src/kettle/schemas/transformations/stepTypes/flow.ts
- [ ] T109 [P] [US4] Add Abort step type to src/kettle/schemas/transformations/stepTypes/flow.ts
- [ ] T110 [P] [US4] Add BlockThisStep step type to src/kettle/schemas/transformations/stepTypes/flow.ts
- [ ] T111 [P] [US4] Add BlockUntilStepsFinish step type to src/kettle/schemas/transformations/stepTypes/flow.ts
- [ ] T112 [P] [US4] Add DelayRow step type to src/kettle/schemas/transformations/stepTypes/flow.ts

**Variable Management Steps (3 types)** - Implement in new utility.ts file - All can be done in parallel

- [ ] T113 [P] [US4] Add SetVariable step type to src/kettle/schemas/transformations/stepTypes/utility.ts
- [ ] T114 [P] [US4] Add GetVariable step type to src/kettle/schemas/transformations/stepTypes/utility.ts
- [ ] T115 [P] [US4] Add SetVariablesFromFile step type to src/kettle/schemas/transformations/stepTypes/utility.ts

**Logging Steps (2 types)** - Add to utility.ts - All can be done in parallel

- [ ] T116 [P] [US4] Add WriteToLog step type to src/kettle/schemas/transformations/stepTypes/utility.ts
- [ ] T117 [P] [US4] Add LogRowCount step type to src/kettle/schemas/transformations/stepTypes/utility.ts

**Scripting Steps (8 types)** - Implement in new scripting.ts file - All can be done in parallel

- [ ] T118 [P] [US4] Add JavaScript step type to src/kettle/schemas/transformations/stepTypes/scripting.ts
- [ ] T119 [P] [US4] Add ModifiedJavaScriptValue step type to src/kettle/schemas/transformations/stepTypes/scripting.ts
- [ ] T120 [P] [US4] Add UserDefinedJavaClass step type to src/kettle/schemas/transformations/stepTypes/scripting.ts
- [ ] T121 [P] [US4] Add UserDefinedJavaExpression step type to src/kettle/schemas/transformations/stepTypes/scripting.ts
- [ ] T122 [P] [US4] Add ExecuteSQL step type to src/kettle/schemas/transformations/stepTypes/scripting.ts
- [ ] T123 [P] [US4] Add ExecuteRowSQL step type to src/kettle/schemas/transformations/stepTypes/scripting.ts
- [ ] T124 [P] [US4] Add ExecSQLScript step type to src/kettle/schemas/transformations/stepTypes/scripting.ts
- [ ] T125 [P] [US4] Add HTTPPost step type to src/kettle/schemas/transformations/stepTypes/scripting.ts

**Data Generation Steps (6 types)** - Add to utility.ts - All can be done in parallel

- [ ] T126 [P] [US4] Add GenerateRows step type to src/kettle/schemas/transformations/stepTypes/utility.ts
- [ ] T127 [P] [US4] Add RandomValue step type to src/kettle/schemas/transformations/stepTypes/utility.ts
- [ ] T128 [P] [US4] Add SequenceGenerator step type to src/kettle/schemas/transformations/stepTypes/utility.ts
- [ ] T129 [P] [US4] Add RowGenerator step type to src/kettle/schemas/transformations/stepTypes/utility.ts
- [ ] T130 [P] [US4] Add Dummy step type to src/kettle/schemas/transformations/stepTypes/utility.ts
- [ ] T131 [P] [US4] Add CloneRow step type to src/kettle/schemas/transformations/stepTypes/utility.ts

### Validation for US4

- [ ] T132 [US4] Update tests/contract/step_type_discovery.test.ts to verify all 25 new utility/flow/scripting step types are discoverable
- [ ] T133 [US4] Update tests/integration/discovery_workflow.test.ts to test filtering by Flow, Scripting, and Utility categories
- [ ] T134 [US4] Run npm test to verify all tests pass and coverage remains above 75%

**Checkpoint**: ✅ COMPLETE - LLMs can discover 25+ utility/flow/scripting step types with rich metadata. Advanced workflow capabilities implemented.

---

## Phase 7: User Story 5 - Lookup and Join Step Types (Priority: P2)

**Goal**: Implement 10 lookup and join step type definitions for data enrichment and multi-stream operations

**Independent Test**: LLM can discover all lookup and join step types (10) with complete metadata, schemas, examples, and tags. Can filter by "Lookup" and "Join" categories. Can search for specific operations (lookup, join, fuzzy) and find relevant steps.

### Implementation for User Story 5

**Lookup Steps (5 types)** - Implement in new lookup.ts file - All can be done in parallel

- [ ] T135 [P] [US5] Add StreamLookup step type to src/kettle/schemas/transformations/stepTypes/lookup.ts
- [ ] T136 [P] [US5] Add DatabaseLookup step type to src/kettle/schemas/transformations/stepTypes/lookup.ts
- [ ] T137 [P] [US5] Add FuzzyMatch step type to src/kettle/schemas/transformations/stepTypes/lookup.ts
- [ ] T138 [P] [US5] Add DimensionLookup step type to src/kettle/schemas/transformations/stepTypes/lookup.ts
- [ ] T139 [P] [US5] Add CombinationLookup step type to src/kettle/schemas/transformations/stepTypes/lookup.ts

**Join Steps (5 types)** - Note: Some join steps may already be in transform.ts, add remaining ones

- [ ] T140 [P] [US5] Verify Joiner step type exists in transform.ts or add to lookup.ts
- [ ] T141 [P] [US5] Verify MergeJoin step type exists in transform.ts or add to lookup.ts
- [ ] T142 [P] [US5] Verify MultiWayMergeJoin step type exists in transform.ts or add to lookup.ts
- [ ] T143 [P] [US5] Add MergeRows step type to src/kettle/schemas/transformations/stepTypes/lookup.ts
- [ ] T144 [P] [US5] Add Append step type to src/kettle/schemas/transformations/stepTypes/lookup.ts

### Validation for US5

- [ ] T145 [US5] Update tests/contract/step_type_discovery.test.ts to verify all lookup/join step types are discoverable
- [ ] T146 [US5] Update tests/integration/discovery_workflow.test.ts to test filtering by Lookup category
- [ ] T147 [US5] Run npm test to verify all tests pass and coverage remains above 75%

**Checkpoint**: ✅ COMPLETE - LLMs can discover 10+ lookup/join step types with rich metadata. Data enrichment capabilities fully implemented.

---

## Phase 8: User Story 6 - Data Quality and Validation Steps (Priority: P3)

**Goal**: Implement 10 data quality and validation step type definitions for data validation, null handling, and cleansing

**Independent Test**: LLM can discover all validation step types (10) with complete metadata, schemas, examples, and tags. Can filter by "Validation" category. Can search for specific operations (validate, checksum, cleanse) and find relevant steps.

### Implementation for User Story 6

**Validation Steps (10 types)** - Implement in new validation.ts file - All can be done in parallel

- [ ] T148 [P] [US6] Add DataValidator step type to src/kettle/schemas/transformations/stepTypes/validation.ts
- [ ] T149 [P] [US6] Add CheckSum step type to src/kettle/schemas/transformations/stepTypes/validation.ts
- [ ] T150 [P] [US6] Add CRC32 step type to src/kettle/schemas/transformations/stepTypes/validation.ts
- [ ] T151 [P] [US6] Add MD5 step type to src/kettle/schemas/transformations/stepTypes/validation.ts
- [ ] T152 [P] [US6] Add Coalesce step type to src/kettle/schemas/transformations/stepTypes/validation.ts
- [ ] T153 [P] [US6] Add DataCleanse step type to src/kettle/schemas/transformations/stepTypes/validation.ts
- [ ] T154 [P] [US6] Add DetectEmptyStream step type to src/kettle/schemas/transformations/stepTypes/validation.ts
- [ ] T155 [P] [US6] Add FieldValidator step type to src/kettle/schemas/transformations/stepTypes/validation.ts
- [ ] T156 [P] [US6] Add Validator step type to src/kettle/schemas/transformations/stepTypes/validation.ts
- [ ] T157 [P] [US6] Add DataGrid step type to src/kettle/schemas/transformations/stepTypes/validation.ts

### Validation for US6

- [ ] T158 [US6] Update tests/contract/step_type_discovery.test.ts to verify all validation step types are discoverable
- [ ] T159 [US6] Update tests/integration/discovery_workflow.test.ts to test filtering by Validation category
- [ ] T160 [US6] Run npm test to verify all tests pass and coverage remains above 75%

**Checkpoint**: ✅ COMPLETE - LLMs can discover 10+ validation step types with rich metadata. Data quality capabilities fully implemented.

---

## Phase 9: User Story 7 - Big Data and Cloud Integration Steps (Priority: P3)

**Goal**: Implement 15 big data and cloud integration step type definitions for Hadoop, S3, MongoDB, Cassandra, and other modern platforms

**Independent Test**: LLM can discover all big data/cloud step types (15) with complete metadata, schemas, examples, and tags. Can filter by "BigData" category. Can search for specific technologies (hadoop, s3, mongodb) and find relevant steps.

### Implementation for User Story 7

**Big Data Steps (15 types)** - Implement in new bigdata.ts file - All can be done in parallel

- [ ] T161 [P] [US7] Add HadoopFileInput step type to src/kettle/schemas/transformations/stepTypes/bigdata.ts
- [ ] T162 [P] [US7] Add HadoopFileOutput step type to src/kettle/schemas/transformations/stepTypes/bigdata.ts
- [ ] T163 [P] [US7] Add HDFSFileInput step type to src/kettle/schemas/transformations/stepTypes/bigdata.ts
- [ ] T164 [P] [US7] Add HDFSFileOutput step type to src/kettle/schemas/transformations/stepTypes/bigdata.ts
- [ ] T165 [P] [US7] Add HBaseInput step type to src/kettle/schemas/transformations/stepTypes/bigdata.ts
- [ ] T166 [P] [US7] Add HBaseOutput step type to src/kettle/schemas/transformations/stepTypes/bigdata.ts
- [ ] T167 [P] [US7] Add S3FileInput step type to src/kettle/schemas/transformations/stepTypes/bigdata.ts
- [ ] T168 [P] [US7] Add S3FileOutput step type to src/kettle/schemas/transformations/stepTypes/bigdata.ts
- [ ] T169 [P] [US7] Add AzureEventHubsConsumer step type to src/kettle/schemas/transformations/stepTypes/bigdata.ts
- [ ] T170 [P] [US7] Add AzureEventHubsProducer step type to src/kettle/schemas/transformations/stepTypes/bigdata.ts
- [ ] T171 [P] [US7] Add GoogleAnalytics step type to src/kettle/schemas/transformations/stepTypes/bigdata.ts
- [ ] T172 [P] [US7] Add SalesforceUpsert step type to src/kettle/schemas/transformations/stepTypes/bigdata.ts
- [ ] T173 [P] [US7] Add SalesforceDelete step type to src/kettle/schemas/transformations/stepTypes/bigdata.ts
- [ ] T174 [P] [US7] Add AvroInput step type to src/kettle/schemas/transformations/stepTypes/bigdata.ts
- [ ] T175 [P] [US7] Add AvroOutput step type to src/kettle/schemas/transformations/stepTypes/bigdata.ts

### Validation for US7

- [ ] T176 [US7] Update tests/contract/step_type_discovery.test.ts to verify all big data/cloud step types are discoverable
- [ ] T177 [US7] Update tests/integration/discovery_workflow.test.ts to test filtering by BigData category
- [ ] T178 [US7] Run npm test to verify all tests pass and coverage remains above 75%

**Checkpoint**: ✅ COMPLETE - LLMs can discover 15+ big data/cloud step types with rich metadata. Modern platform integration capabilities fully implemented.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation, validation, and quality assurance

- [ ] T179 [P] Create docs/step-type-coverage.md documenting all 150+ implemented step types organized by category
- [ ] T180 [P] Update README.md with step type library information and coverage statistics
- [ ] T181 Verify all step type descriptions are 50+ characters and action-oriented
- [ ] T182 Verify all step types have 3-5 tags from standardized taxonomy
- [ ] T183 Verify all step types have 2+ example configurations
- [ ] T184 Run performance tests to verify <50ms list operations, <100ms schema retrieval
- [ ] T185 Run full test suite (npm test) to verify all tests pass and coverage remains above 75%
- [ ] T186 Run linting (npm run lint) to verify no code quality issues
- [ ] T187 Update .github/copilot-instructions.md with final technology stack and coverage information

**Final Checkpoint**: ✅ FEATURE COMPLETE - 150+ step types implemented across all categories with comprehensive metadata, schemas, examples, and tags. All success criteria met.

---

## Summary

**Total Tasks**: 187
**Tasks per User Story**:
- Setup + Foundational: 7 tasks
- US1 (Input Steps): 33 tasks (30 step types + 3 validation)
- US2 (Transform Steps): 43 tasks (40 step types + 3 validation)
- US3 (Output Steps): 23 tasks (20 step types + 3 validation)
- US4 (Utility/Flow/Scripting Steps): 28 tasks (25 step types + 3 validation)
- US5 (Lookup/Join Steps): 13 tasks (10 step types + 3 validation)
- US6 (Validation Steps): 13 tasks (10 step types + 3 validation)
- US7 (BigData Steps): 18 tasks (15 step types + 3 validation)
- Polish: 9 tasks

**Parallel Opportunities**:
- Most step type additions within each user story can be done in parallel (marked with [P])
- Category files are independent (input.ts, output.ts, transform.ts, etc.)
- User stories are independent after foundational phase

**Independent Test Criteria**:
- Each user story delivers a complete, testable increment
- Discovery APIs can list and filter step types by category
- Schema retrieval works for all step types
- Examples validate against schemas

**MVP Scope**: User Stories 1-3 (Input + Transform + Output = 102+ step types)

**Expected Coverage**: 150+ step types total across all user stories
