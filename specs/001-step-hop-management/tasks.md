# Tasks: Step and Hop Management for Kettle Transformations and Jobs

## Phase 1: Setup
- [x] T001 Create project structure per implementation plan (src/, tests/, tools/, kettle/, utils/)
- [x] T002 Initialize package.json and install dependencies (@modelcontextprotocol/sdk, fast-xml-parser, zod, fast-glob, diff)
- [x] T003 Create/verify .gitignore, .eslintignore, .prettierignore with required patterns

## Phase 2: Foundational
- [x] T004 Implement static schema repository for step and job entry types in src/kettle/schemas/
- [x] T005 Implement XML read/write utilities in src/kettle/xml-utils.ts
- [x] T006 Implement atomic file operation utilities in src/utils/file-utils.ts

## Phase 3: User Story 1 - Add Step to Transformation (P1)
- [x] T007 [US1] Implement TransformationStep model in src/models/TransformationStep.ts
- [x] T008 [US1] Implement add_transformation_step MCP tool in src/tools/add_transformation_step.ts
- [ ] T009 [US1] Implement contract test for add_transformation_step in tests/contract/add_transformation_step.test.ts
- [ ] T010 [US1] Implement integration test for add_transformation_step in tests/integration/add_transformation_step.test.ts

## Phase 4: User Story 2 - Update Existing Step Configuration (P1)
- [ ] T011 [US2] Implement update_transformation_step MCP tool in src/tools/update_transformation_step.ts
- [ ] T012 [US2] Implement contract test for update_transformation_step in tests/contract/update_transformation_step.test.ts
- [ ] T013 [US2] Implement integration test for update_transformation_step in tests/integration/update_transformation_step.test.ts

## Phase 5: User Story 3 - Remove Step and Associated Hops (P2)
- [ ] T014 [US3] Implement remove_transformation_step MCP tool in src/tools/remove_transformation_step.ts
- [ ] T015 [US3] Implement contract test for remove_transformation_step in tests/contract/remove_transformation_step.test.ts
- [ ] T016 [US3] Implement integration test for remove_transformation_step in tests/integration/remove_transformation_step.test.ts

## Phase 6: User Story 4 - Manage Job Entries and Hops (P2)
- [ ] T017 [US4] Implement JobEntry model in src/models/JobEntry.ts
- [ ] T018 [US4] Implement add_job_entry MCP tool in src/tools/add_job_entry.ts
- [ ] T019 [US4] Implement update_job_entry MCP tool in src/tools/update_job_entry.ts
- [ ] T020 [US4] Implement remove_job_entry MCP tool in src/tools/remove_job_entry.ts
- [ ] T021 [US4] Implement add_job_hop MCP tool in src/tools/add_job_hop.ts
- [ ] T022 [US4] Implement remove_job_hop MCP tool in src/tools/remove_job_hop.ts
- [ ] T023 [US4] Implement contract tests for job entry/hop tools in tests/contract/job_entry_tools.test.ts
- [ ] T024 [US4] Implement integration tests for job entry/hop tools in tests/integration/job_entry_tools.test.ts

## Phase 7: User Story 5 - Discover Step/Entry Types and Configuration Schema (P1)
- [ ] T025 [US5] Implement list_step_types MCP tool in src/tools/list_step_types.ts
- [ ] T026 [US5] Implement get_step_type_schema MCP tool in src/tools/get_step_type_schema.ts
- [ ] T027 [US5] Implement list_job_entry_types MCP tool in src/tools/list_job_entry_types.ts
- [ ] T028 [US5] Implement get_job_entry_type_schema MCP tool in src/tools/get_job_entry_type_schema.ts
- [ ] T029 [US5] Implement contract tests for discovery tools in tests/contract/discovery_tools.test.ts
- [ ] T030 [US5] Implement integration tests for discovery tools in tests/integration/discovery_tools.test.ts

## Phase 8: User Story 6 - Validate Step Configuration Before Adding (P3)
- [ ] T031 [US6] Implement validate_step_configuration MCP tool in src/tools/validate_step_configuration.ts
- [ ] T032 [US6] Implement contract test for validate_step_configuration in tests/contract/validate_step_configuration.test.ts
- [ ] T033 [US6] Implement integration test for validate_step_configuration in tests/integration/validate_step_configuration.test.ts

## Phase 9: Polish & Cross-Cutting Concerns
- [ ] T034 Add documentation for all MCP tools in docs/
- [ ] T035 Add sample Kettle files for testing in examples/sample_kettle_files/
- [ ] T036 Finalize README.md with usage and setup instructions
- [ ] T037 Ensure 80%+ test coverage and run all tests
- [ ] T038 Review and optimize performance for large Kettle files

## Dependencies
- Setup and Foundational phases must be completed before any user story phases
- Each user story phase is independently testable
- Contract tests should precede implementation tasks when possible
- Integration tests follow implementation

## Parallel Execution Opportunities
- Tasks marked [P] (none in this MVP) can be run in parallel
- Most model, tool, and test tasks can be parallelized within their phase if file dependencies allow

## MVP Scope
- Complete Phases 1-3 (Setup, Foundational, Add Step to Transformation)
- Validate with contract and integration tests for add_transformation_step
