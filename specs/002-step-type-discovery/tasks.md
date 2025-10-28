# Tasks: Step Type Discovery Enhancement

**Input**: Design documents from `/specs/002-step-type-discovery/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Status**: MVP Complete (Phases 1-4), Architectural Refactoring Applied
**Last Updated**: 2025-10-28

**Tests**: Tests are included based on existing test infrastructure (Vitest contract and integration tests)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Project Structure Refactoring ✅ COMPLETE

**New Modular Structure**:

```
src/kettle/schemas/
├── transformations/stepTypes/
│   ├── types.ts          # StepCategory enum, StepType interface, ConfigurationExample
│   ├── input.ts          # INPUT_STEPS (TableInput, TextFileInput)
│   ├── output.ts         # OUTPUT_STEPS (TextFileOutput)
│   ├── transform.ts      # TRANSFORM_STEPS (SelectValues)
│   └── index.ts          # Barrel export with STEP_TYPE_REGISTRY
├── jobs/entryTypes/
│   ├── types.ts          # JobEntryCategory enum, JobEntryType interface
│   ├── general.ts        # GENERAL_JOB_ENTRIES (START, TRANS, WRITE_TO_LOG)
│   └── index.ts          # Barrel export with JOB_ENTRY_TYPE_REGISTRY
├── step-types.ts         # @deprecated - backward-compatible re-export
└── job-entry-types.ts    # @deprecated - backward-compatible re-export
```

**Benefits**: Easier maintenance, parallel development, category-based organization, future lazy loading support. All 160 tests passing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Single project structure at repository root: `src/`, `tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Define metadata structures and utility functions needed by all user stories

- [x] T001 [P] Add ConfigurationExample interface to src/kettle/schemas/step-types.ts
- [x] T002 [P] Add ConfigurationExample interface to src/kettle/schemas/job-entry-types.ts
- [x] T003 [P] Create schema serialization utility function in src/utils/schema-serializer.ts
- [x] T004 Define standard tag taxonomy constants in src/kettle/schemas/tag-taxonomy.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core metadata enhancements and utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Implement Zod schema serialization function (serializeZodSchema) in src/utils/schema-serializer.ts
- [x] T006 Add type normalization (ZodString → "string") to schema serializer in src/utils/schema-serializer.ts
- [x] T007 Add unit tests for schema serializer in tests/unit/schema-serializer.test.ts
- [x] T008 Update StepType interface to include optional examples field in src/kettle/schemas/step-types.ts
- [x] T009 Update JobEntryType interface to include optional examples field in src/kettle/schemas/job-entry-types.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - LLM Discovers Available Step Types (Priority: P1) 🎯 MVP

**Goal**: Enable LLMs to list all step types with rich metadata (categories, tags, descriptions)

**Independent Test**: Call list_step_types() and verify response includes typeId, category, displayName, description, and populated tags array for each step type. Filter by category and verify only matching steps returned.

### Tests for User Story 1

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T010 [P] [US1] Create contract test for list_step_types in tests/contract/discovery_enhanced.test.ts
- [x] T011 [P] [US1] Add contract test for category filtering in tests/contract/discovery_enhanced.test.ts
- [x] T012 [P] [US1] Create integration test for step type discovery workflow in tests/integration/step-discovery-workflow.test.ts

### Implementation for User Story 1

- [x] T013 [P] [US1] Enhance TableInput metadata with tags ['database', 'sql', 'read', 'input', 'etl'] in src/kettle/schemas/step-types.ts
- [x] T014 [P] [US1] Enhance TextFileInput metadata with tags ['file', 'csv', 'read', 'input', 'batch', 'text'] in src/kettle/schemas/step-types.ts
- [x] T015 [P] [US1] Enhance SelectValues metadata with tags ['transform', 'filter', 'select', 'fields', 'mapping'] in src/kettle/schemas/step-types.ts
- [x] T016 [P] [US1] Enhance TextFileOutput metadata with tags ['file', 'csv', 'write', 'output', 'batch', 'text'] in src/kettle/schemas/step-types.ts
- [x] T017 [P] [US1] Enhance TableInput description with LLM-friendly explanation in src/kettle/schemas/step-types.ts
- [x] T018 [P] [US1] Enhance TextFileInput description with LLM-friendly explanation in src/kettle/schemas/step-types.ts
- [x] T019 [P] [US1] Enhance SelectValues description with LLM-friendly explanation in src/kettle/schemas/step-types.ts
- [x] T020 [P] [US1] Enhance TextFileOutput description with LLM-friendly explanation in src/kettle/schemas/step-types.ts
- [x] T021 [US1] Update getStepTypeSchematool to serialize Zod schema using serializeZodSchema in src/tools/discovery_tools.ts
- [x] T022 [US1] Update getJobEntryTypeSchemaTool to serialize Zod schema using serializeZodSchema in src/tools/discovery_tools.ts
- [x] T023 [US1] Run contract tests to validate response structure (T010, T011) - All 10 tests passing
- [x] T024 [US1] Run integration test for discovery workflow (T012) - All 4 tests passing

**Checkpoint**: ✅ COMPLETE - LLMs can discover step types with rich metadata and filter by category. All 14 tests passing (10 contract + 4 integration).

---

## Phase 4: User Story 2 - LLM Retrieves Step Configuration Schema (Priority: P1) 🎯 MVP

**Goal**: Enable LLMs to retrieve detailed configuration schemas with field definitions and examples

**Independent Test**: Call get_step_type_schema({ typeId: "TableInput" }) and verify response includes schema.fields array with name, type, required, description for each field, plus optional examples array.

### Tests for User Story 2

- [x] T025 [P] [US2] Create contract test for get_step_type_schema - Already covered in discovery_enhanced.test.ts
- [x] T026 [P] [US2] Add contract test for schema field structure validation - Already covered in discovery_enhanced.test.ts
- [x] T027 [P] [US2] Add integration test for schema retrieval workflow in tests/integration/step-discovery-workflow.test.ts

### Implementation for User Story 2

- [x] T028 [P] [US2] Add example configuration for TableInput (2 examples: Customer Records, Data Warehouse Extract) in src/kettle/schemas/step-types.ts
- [x] T029 [P] [US2] Add example configuration for TextFileInput (2 examples: Customer CSV, Server Logs) in src/kettle/schemas/step-types.ts
- [x] T030 [US2] Update getStepTypeSchematool to serialize Zod schema using serializeZodSchema - Already done in Phase 3
- [x] T031 [US2] Update getStepTypeSchematool to include examples in response - Already done in Phase 3
- [x] T032 [US2] Add error handling for non-existent step types with clear error message - Already present in discovery_tools.ts
- [x] T033 [US2] Run contract tests to validate schema response structure - All 10 tests passing
- [x] T034 [US2] Run integration test for schema retrieval workflow - All 6 tests passing (2 new: examples test, end-to-end workflow)

**Checkpoint**: ✅ COMPLETE - MVP DELIVERED! User Stories 1 AND 2 complete. LLMs can discover step types AND retrieve their schemas with examples. All 16 tests passing (10 contract + 6 integration). 160 total tests passing.

---

## Phase 5: User Story 3 - LLM Browses Steps by Use Case (Priority: P2)

**Goal**: Enable tag-based filtering for natural language to step type mapping

**Independent Test**: Filter step types by tag (e.g., "database") and verify only steps with that tag are returned. Test with multiple common use case queries.

### Tests for User Story 3

- [x] T035 [P] [US3] Add contract test for tag-based filtering in tests/contract/discovery_enhanced.test.ts
- [x] T036 [P] [US3] Add integration test for use case mapping scenarios in tests/integration/step-discovery-workflow.test.ts

### Implementation for User Story 3

- [x] T037 [P] [US3] Added 9 additional step types with metadata (ExcelInput, JSONInput, RestClient, FilterRows, SortRows, Calculator, TableOutput, JSONOutput) across input/transform/output categories
- [x] T038 [P] [US3] Added comprehensive tags for common use cases (excel, json, rest-api, http, filter, sort, calculate, nosql, etc.)
- [x] T039 [US3] Implemented tag filtering logic in listStepTypesTool in src/tools/discovery_tools.ts
- [x] T040 [US3] Added tag filter parameter to list_kettle_steps tool schema in src/server.ts
- [x] T041 [US3] Updated contract tests to validate tag filtering (3 new tests, all passing)
- [x] T042 [US3] Run integration test for use case mapping (2 new tests, all passing)

**Checkpoint**: ✅ COMPLETE - User Stories 1, 2, AND 3 work. LLMs can map natural language to step types via tags. All 165 tests passing (13 contract + 8 integration). Added 9 new step types covering Excel, JSON, REST APIs, filtering, sorting, and calculations.

---

## Phase 6: User Story 4 - LLM Generates Valid Configuration from Requirements (Priority: P2)

**Goal**: Ensure schema information supports end-to-end configuration generation workflow

**Independent Test**: Use schema from get_step_type_schema to generate configuration, validate it passes validate_step_configuration. Test with complete and incomplete requirements.

### Tests for User Story 4

- [ ] T043 [P] [US4] Add integration test for configuration generation workflow in tests/integration/discovery_workflow.test.ts
- [ ] T044 [P] [US4] Add test for incomplete requirements detection in tests/integration/discovery_workflow.test.ts

### Implementation for User Story 4

- [ ] T045 [P] [US4] Add 2-3 more example configurations covering different scenarios in src/kettle/schemas/step-types.ts
- [ ] T046 [P] [US4] Ensure all required fields clearly marked in serialized schema in src/utils/schema-serializer.ts
- [ ] T047 [P] [US4] Add default value extraction to schema serializer in src/utils/schema-serializer.ts
- [ ] T048 [US4] Verify schema examples validate against their schemas in tests/unit/schema-examples.test.ts
- [ ] T049 [US4] Run configuration generation integration test (T043)
- [ ] T050 [US4] Run incomplete requirements test (T044)

**Checkpoint**: All P1 and P2 user stories complete - full discovery-to-configuration workflow functional

---

## Phase 7: Job Entry Types Parallel Support

**Goal**: Extend the same discovery capabilities to job entry types (FR-008)

**Independent Test**: List job entry types with metadata, retrieve schemas for job entries, verify parallel structure to step types

- [ ] T051 [P] Enhance JOB entry type metadata with tags ['workflow', 'orchestration', 'nested'] in src/kettle/schemas/job-entry-types.ts
- [ ] T052 [P] Enhance TRANS entry type metadata with tags ['workflow', 'orchestration', 'etl'] in src/kettle/schemas/job-entry-types.ts
- [ ] T053 [P] Add example configurations for JOB and TRANS entry types in src/kettle/schemas/job-entry-types.ts
- [ ] T054 Update listJobEntryTypesTool to return tags in src/tools/discovery_tools.ts
- [ ] T055 Update getJobEntryTypeSchematool to serialize schema and include examples in src/tools/discovery_tools.ts
- [ ] T056 [P] Add contract tests for job entry discovery in tests/contract/discovery_enhanced.test.ts
- [ ] T057 Run all job entry type tests

**Checkpoint**: Job entry types have same discovery capabilities as step types

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T058 [P] Update API reference documentation with enhanced discovery APIs in docs/api-reference.md
- [ ] T059 [P] Update README.md with examples of tag-based discovery
- [ ] T060 [P] Add JSDoc comments to discovery tool functions in src/tools/discovery_tools.ts
- [ ] T061 [P] Add JSDoc comments to schema serializer in src/utils/schema-serializer.ts
- [ ] T062 Run full test suite and verify 80%+ coverage target maintained
- [ ] T063 Performance test: Verify list_step_types completes in <50ms
- [ ] T064 Performance test: Verify get_step_type_schema completes in <100ms
- [ ] T065 Run quickstart.md validation scenarios
- [ ] T066 Code review: Verify all tags use standardized taxonomy
- [ ] T067 Code review: Verify all descriptions are LLM-friendly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Job Entry Support (Phase 7)**: Can run in parallel with user stories (different files)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories (different functions in same file, but non-conflicting)
- **User Story 3 (P2)**: Depends on US1 completion (extends list_step_types function)
- **User Story 4 (P2)**: Depends on US2 completion (uses schema from get_step_type_schema)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Metadata enhancements (tags, descriptions, examples) can be done in parallel
- Tool function updates after metadata is ready
- Run tests after implementation to verify

### Parallel Opportunities

- **Phase 1**: All 4 tasks can run in parallel (T001-T004)
- **Phase 2**: T007 depends on T005-T006; T008-T009 can run in parallel
- **User Story 1**: All metadata tasks (T013-T020) can run in parallel, then tool updates (T021-T022)
- **User Story 2**: Example tasks (T028-T029) in parallel, then tool updates (T030-T032)
- **User Story 3**: Research and tag additions (T037-T038) in parallel
- **Phase 7**: All metadata tasks (T051-T053) can run in parallel
- **Phase 8**: All documentation tasks (T058-T061) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
parallel:
  - Task T010: "Contract test for list_step_types in tests/contract/discovery_enhanced.test.ts"
  - Task T011: "Contract test for category filtering in tests/contract/discovery_enhanced.test.ts"
  - Task T012: "Integration test for step type discovery workflow in tests/integration/discovery_workflow.test.ts"

# Launch all metadata enhancements for User Story 1 together:
parallel:
  - Task T013: "Enhance TableInput metadata with tags in src/kettle/schemas/step-types.ts"
  - Task T014: "Enhance TextFileInput metadata with tags in src/kettle/schemas/step-types.ts"
  - Task T015: "Enhance SelectValues metadata with tags in src/kettle/schemas/step-types.ts"
  - Task T016: "Enhance TextFileOutput metadata with tags in src/kettle/schemas/step-types.ts"
  - Task T017: "Enhance TableInput description in src/kettle/schemas/step-types.ts"
  - Task T018: "Enhance TextFileInput description in src/kettle/schemas/step-types.ts"
  - Task T019: "Enhance SelectValues description in src/kettle/schemas/step-types.ts"
  - Task T020: "Enhance TextFileOutput description in src/kettle/schemas/step-types.ts"
```

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
parallel:
  - Task T025: "Contract test for get_step_type_schema in tests/contract/discovery_enhanced.test.ts"
  - Task T026: "Contract test for schema field structure in tests/contract/discovery_enhanced.test.ts"
  - Task T027: "Integration test for schema retrieval in tests/integration/discovery_workflow.test.ts"

# Launch all example additions in parallel:
parallel:
  - Task T028: "Add example configuration for TableInput in src/kettle/schemas/step-types.ts"
  - Task T029: "Add example configuration for TextFileInput in src/kettle/schemas/step-types.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only - Both P1)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T009) - CRITICAL
3. Complete Phase 3: User Story 1 (T010-T024)
4. Complete Phase 4: User Story 2 (T025-T034)
5. **STOP and VALIDATE**: Test both P1 stories independently
6. Deploy/demo if ready - **This is the MVP!**

**MVP Delivers**:
- LLMs can list all step types with categories, tags, descriptions
- LLMs can filter step types by category
- LLMs can retrieve detailed schemas for any step type
- LLMs can see example configurations

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo
3. Add User Story 2 → Test independently → Deploy/Demo (MVP complete!)
4. Add User Story 3 → Test independently → Deploy/Demo (tag-based search)
5. Add User Story 4 → Test independently → Deploy/Demo (full workflow)
6. Add Phase 7 → Job entry support
7. Polish (Phase 8) → Documentation and performance

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T009)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T010-T024)
   - **Developer B**: User Story 2 (T025-T034) - can work in parallel
   - **Developer C**: Job Entry Support (T051-T057) - can work in parallel
3. After US1 complete:
   - Developer A moves to User Story 3 (T035-T042) - depends on US1
4. After US2 complete:
   - Developer B moves to User Story 4 (T043-T050) - depends on US2
5. All developers collaborate on Polish (T058-T067)

---

## Task Summary

- **Total Tasks**: 67
- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 5 tasks (CRITICAL - blocks all stories)
- **Phase 3 (US1 - P1)**: 15 tasks
- **Phase 4 (US2 - P1)**: 10 tasks
- **Phase 5 (US3 - P2)**: 8 tasks
- **Phase 6 (US4 - P2)**: 8 tasks
- **Phase 7 (Job Entries)**: 7 tasks
- **Phase 8 (Polish)**: 10 tasks

**Parallel Opportunities**: 35+ tasks marked [P] can run in parallel when dependencies met

**MVP Scope**: Phases 1-4 (User Stories 1 & 2) = 34 tasks = ~50% of total work delivers core value

**Independent Tests**: Each user story has clear acceptance criteria and can be tested independently

---

## Notes

- [P] tasks = different files or non-conflicting changes, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests written first ensure clear acceptance criteria
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Use Context7 and Kettle GitHub repo for accurate step type metadata (T037)
- Maintain 80%+ test coverage throughout
- Follow tag taxonomy from src/kettle/schemas/tag-taxonomy.ts
