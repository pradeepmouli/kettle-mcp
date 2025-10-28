# Feature Specification: Step and Hop Management for Kettle Transformations and Jobs

**Feature Branch**: `001-step-hop-management`
**Created**: 2025-10-19
**Status**: Draft
**Input**: User description: "add tools for to add/update/remove steps and hops for transformations and jobs. consider approaches to share context regarding the step/plugin types with the MCP client so it can understand what should be steps are available to add, what they do and how they should be configured. use kettle docs from Context7 and/or pentaho kettle github repo (https://github.com/pentaho/pentaho-kettle) as a guide."

## Clarifications

### Session 2025-10-19

- Q: Step Type Schema Source - Should schemas be extracted from Pentaho source code, documentation scraping, or manually curated? → A: Static curated schemas covering all documented step types, with tools for developers to add/generate new definitions
- Q: Hop Dependency Handling - When removing a step with connected hops, should we auto-remove hops, require confirmation, or attempt reconnection? → A: Auto-remove all connected hops (clean and simple behavior)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Step to Transformation (Priority: P1)

An AI agent needs to add a new step (e.g., "Table Input", "Filter Rows", "Calculator") to an existing transformation, configure its properties, and connect it to other steps via hops.

**Why this priority**: This is the most fundamental operation - adding steps is the core of transformation modification. Without this, users cannot extend or modify transformations programmatically.

**Independent Test**: Can be fully tested by creating a minimal transformation with one step, adding a second step with valid configuration, saving the transformation, and validating that the XML contains both steps with correct properties.

**Acceptance Scenarios**:

1. **Given** a transformation with an existing "Generate Rows" step, **When** AI agent calls \`add_transformation_step\` with type="SelectValues" and configuration specifying which fields to select, **Then** the transformation contains the new step with correct XML structure and properties
2. **Given** a transformation with two unconnected steps, **When** AI agent calls \`add_transformation_hop\` to connect them, **Then** a hop element is created in the \`<order>\` section linking the steps
3. **Given** a transformation, **When** AI agent requests available step types via \`list_step_types\`, **Then** receives a categorized list of step types (Input, Transform, Output, etc.) with descriptions and required configuration fields

---

### User Story 2 - Update Existing Step Configuration (Priority: P1)

An AI agent needs to modify properties of an existing step, such as changing SQL queries in a Table Input step, updating field mappings in a Select Values step, or adjusting filter conditions.

**Why this priority**: Modification is equally critical as creation - users need to programmatically adjust existing workflows without manual XML editing. This enables workflow optimization and dynamic configuration.

**Independent Test**: Can be fully tested by reading a transformation, identifying a step by name, updating its configuration properties, saving, and validating that only the target step's properties changed while other steps remain unchanged.

**Acceptance Scenarios**:

1. **Given** a transformation with a "Table Input" step containing a SQL query, **When** AI agent calls \`update_transformation_step\` with the step name and new SQL query, **Then** the step's SQL property is updated while other properties remain unchanged
2. **Given** a transformation with a "Select Values" step, **When** AI agent updates the field selection list, **Then** the \`<fields>\` section of the step is updated with the new field list
3. **Given** a step with GUI positioning, **When** AI agent updates coordinates via \`update_transformation_step\`, **Then** the \`<GUI><xloc>\` and \`<yloc>\` values are updated

---

### User Story 3 - Remove Step and Associated Hops (Priority: P2)

An AI agent needs to delete a step from a transformation, automatically removing or handling any hops connected to that step.

**Why this priority**: Removal is necessary for workflow cleanup and refactoring, but less critical than add/update since users can work around it. However, it must handle hop dependencies correctly.

**Independent Test**: Can be fully tested by creating a transformation with 3 steps connected in sequence, removing the middle step, and validating that both the step and its associated hops are removed, leaving a valid (though disconnected) transformation.

**Acceptance Scenarios**:

1. **Given** a transformation with 3 steps (A→B→C) connected by hops, **When** AI agent calls \`remove_transformation_step\` with step name "B", **Then** step B and both hops (A→B and B→C) are automatically removed from the XML
2. **Given** a transformation with a step that has no connections, **When** AI agent removes the step, **Then** only the step is removed with no impact on other elements
3. **Given** a step removal request, **When** the step is referenced in \`<step_error_handling>\`, **Then** the system removes the step, its hops, and cleans up the error handling reference

---

### User Story 4 - Manage Job Entries and Hops (Priority: P2)

An AI agent needs to add, update, or remove job entries (the equivalent of steps in jobs) and manage the conditional/unconditional hops between them.

**Why this priority**: Jobs are equally important as transformations, but can be handled after transformation step management since they follow similar patterns. Job entry management is critical for orchestration workflows.

**Independent Test**: Can be fully tested by creating a job with START entry, adding a "Write to log" entry, connecting them with a hop, and validating the XML structure matches Kettle's job format.

**Acceptance Scenarios**:

1. **Given** a job with a START entry, **When** AI agent calls \`add_job_entry\` with type="WRITE_TO_LOG" and configuration, **Then** the entry is added to \`<entries>\` with correct properties
2. **Given** a job with two entries, **When** AI agent calls \`add_job_hop\` with evaluation=Y (success) or evaluation=N (failure), **Then** a conditional hop is created with correct evaluation flag
3. **Given** a job entry, **When** AI agent updates its configuration via \`update_job_entry\`, **Then** only the specified properties are modified

---

### User Story 5 - Discover Step/Entry Types and Configuration Schema (Priority: P1)

An AI agent needs to understand what step types are available, what each type does, and what configuration fields are required/optional for each type, enabling intelligent workflow construction.

**Why this priority**: This is foundational for all other stories - without knowing available types and their schemas, AI agents cannot correctly construct or modify workflows. This enables self-service workflow creation.

**Independent Test**: Can be fully tested by calling \`list_step_types\` with optional filter (e.g., category="Input"), receiving a structured response with step metadata, and verifying that the metadata includes type ID, category, description, and configuration schema.

**Acceptance Scenarios**:

1. **Given** an AI agent planning to add an input step, **When** it calls \`list_step_types\` with category filter="Input", **Then** receives a list including "TableInput", "TextFileInput", "CSVInput" with descriptions
2. **Given** an AI agent needs to configure a "TableInput" step, **When** it calls \`get_step_type_schema\` with type="TableInput", **Then** receives a schema showing required fields (connection, SQL) and optional fields (limit, variables)
3. **Given** an AI agent working with jobs, **When** it calls \`list_job_entry_types\`, **Then** receives categories like START, TRANSFORMATION, JOB, SCRIPT, MAIL, etc. with descriptions

---

### User Story 6 - Validate Step Configuration Before Adding (Priority: P3)

An AI agent wants to validate that a step's configuration is correct before actually adding it to the transformation, reducing errors and providing immediate feedback.

**Why this priority**: Validation improves user experience and prevents invalid XML, but can be handled after basic CRUD operations are working. Users can work around this with try/catch patterns.

**Independent Test**: Can be fully tested by calling \`validate_step_configuration\` with a complete step config object, receiving success/failure response with specific validation errors if any.

**Acceptance Scenarios**:

1. **Given** a step configuration object for "TableInput", **When** AI agent calls \`validate_step_configuration\` without required "connection" field, **Then** receives validation error listing missing required field
2. **Given** a complete valid step configuration, **When** AI agent validates it, **Then** receives success response with no errors
3. **Given** a step configuration with invalid field values, **When** validated, **Then** receives specific error messages explaining what's wrong

---

### Edge Cases

- **Duplicate step names**: What happens when adding a step with a name that already exists in the transformation?
- **Circular hop references**: How does the system detect and prevent circular dependencies in hops?
- **Invalid hop references**: What happens when creating a hop that references a non-existent step name?
- **Step type not found**: How does the system handle requests for unknown or deprecated step types?
- **Conflicting hop connections**: What happens when multiple hops have the same from/to combination?
- **Missing required configuration**: How are validation errors reported for steps missing critical config fields?
- **GUI coordinates**: Should the system auto-calculate xloc/yloc positions or require explicit values?
- **Step ordering**: Does the order of steps in the XML matter, or only the hop definitions?
- **Concurrent modifications**: How does the system handle multiple agents modifying the same transformation?

## Requirements *(mandatory)*

### Functional Requirements

#### Step/Entry Management

- **FR-001**: System MUST provide \`add_transformation_step\` tool to add a new step to a transformation with name, type, and configuration
- **FR-002**: System MUST provide \`update_transformation_step\` tool to modify an existing step's configuration by step name
- **FR-003**: System MUST provide \`remove_transformation_step\` tool to delete a step and automatically remove all connected hops
- **FR-003a**: System MUST clean up any error handling references when removing a step
- **FR-004**: System MUST provide \`add_job_entry\` tool to add a new entry to a job with name, type, and configuration
- **FR-005**: System MUST provide \`update_job_entry\` tool to modify an existing job entry's configuration
- **FR-006**: System MUST provide \`remove_job_entry\` tool to delete a job entry and automatically remove all connected hops

#### Hop Management

- **FR-007**: System MUST provide \`add_transformation_hop\` tool to create a hop between two steps
- **FR-008**: System MUST provide \`remove_transformation_hop\` tool to delete a hop by from/to step names
- **FR-009**: System MUST provide \`add_job_hop\` tool to create a hop between two job entries with evaluation (success/failure/unconditional) flags
- **FR-010**: System MUST provide \`remove_job_hop\` tool to delete a job hop
- **FR-011**: System MUST validate that hop references point to existing steps/entries before adding

#### Discovery and Schema APIs

- **FR-012**: System MUST provide `list_step_types` tool to return all available transformation step types with metadata (category, description)
- **FR-013**: System MUST provide `get_step_type_schema` tool to return configuration schema for a specific step type using static curated definitions
- **FR-013a**: System MUST include static schema definitions for ALL documented Pentaho Kettle step types (100+ steps across Input, Output, Transform, Utility, Flow, Scripting, Lookup, Join, etc. categories)
- **FR-013b**: System MUST provide developer tools to add/generate new step type definitions (e.g., schema generator from XML examples or Pentaho plugin metadata)
- **FR-014**: System MUST provide `list_job_entry_types` tool to return all available job entry types with metadata
- **FR-015**: System MUST provide `get_job_entry_type_schema` tool to return configuration schema for a specific job entry type using static curated definitions
- **FR-015a**: System MUST include static schema definitions for ALL documented Pentaho Kettle job entry types
- **FR-016**: Step type metadata MUST include: type ID, category, display name, description, and tags/keywords for searchability

#### Validation

- **FR-017**: System MUST validate step/entry names to ensure uniqueness within the transformation/job
- **FR-018**: System MUST validate that required configuration fields are present when adding/updating steps
- **FR-019**: System MUST provide \`validate_step_configuration\` tool to pre-validate configuration before committing changes
- **FR-020**: System MUST detect and report circular hop dependencies
- **FR-021**: System MUST validate GUI coordinates are numeric and within reasonable bounds (0-9999)

#### Data Preservation

- **FR-022**: System MUST preserve all existing XML elements and attributes not explicitly modified during updates
- **FR-023**: System MUST maintain XML formatting and structure consistent with Kettle's expectations
- **FR-024**: System MUST preserve step execution order defined by hops when adding/removing steps
- **FR-025**: System MUST use atomic file operations with backup for all modifications (leveraging existing edit-handlers)

#### Response Format

- **FR-026**: All tools MUST return structured JSON responses with success/error status
- **FR-027**: Error responses MUST include specific error messages and affected element identifiers
- **FR-028**: Success responses MUST include the updated transformation/job structure or confirmation of the operation

### Key Entities *(include if feature involves data)*

- **TransformationStep**: Represents a step in a transformation with name, type, configuration fields, GUI position, and metadata (distribute, copies, partitioning)
- **JobEntry**: Represents an entry in a job with name, type, configuration fields, position, and execution properties (start, parallel, repeat)
- **Hop**: Represents a connection between two transformation steps with from/to names and enabled flag
- **JobHop**: Represents a connection between two job entries with from/to names, evaluation flag (Y/N), and unconditional flag
- **StepType**: Metadata about an available step type including type ID, category (Input/Transform/Output/Utility/etc.), display name, description, and configuration schema
- **JobEntryType**: Metadata about an available job entry type including type ID, category (START/SUCCESS/TRANSFORMATION/JOB/SCRIPT/etc.), display name, description, and configuration schema
- **StepConfigurationSchema**: Defines required and optional configuration fields for a step type, including field names, data types, validation rules, and default values
- **HopValidationResult**: Result of validating hop connections, including circular dependency detection

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: AI agents can successfully add a new step to a transformation and connect it with hops in under 3 MCP tool calls (list types, add step, add hop)
- **SC-002**: System provides schema information for ALL documented Pentaho Kettle step types (100+ steps covering all categories)
- **SC-002a**: Developers can add new step type definitions in under 10 minutes using provided schema generation tools
- **SC-003**: 100% of add/update/remove operations preserve XML validity and can be successfully loaded by Pentaho Kettle
- **SC-004**: System detects and prevents 100% of circular hop dependencies before committing changes
- **SC-005**: AI agents can discover step types without prior knowledge by using category filters and keyword search
- **SC-006**: Step configuration validation catches at least 90% of common configuration errors before modification
- **SC-007**: All operations complete with atomic file writes and automatic backup creation (building on existing edit-handlers)
- **SC-008**: Schema metadata enables AI agents to construct valid steps without human intervention in 80%+ of common use cases

## Assumptions & Constraints *(optional)*

### Assumptions

1. The existing kettle-mcp implementation (PR #4) provides read/write/validate operations for transformations and jobs
2. Pentaho Kettle's XML format remains stable and backward-compatible across versions
3. Step type schemas can be extracted from Pentaho documentation or source code
4. AI agents using this API have basic understanding of ETL concepts (though the schema API should guide them)
5. Users will not directly edit XML files while MCP tools are modifying them (or file locking is handled externally)

### Constraints

1. Must maintain compatibility with existing Pentaho Kettle 9.x+ XML format
2. Cannot modify Kettle's core behavior - only manipulate XML files
3. Step type discovery is limited to what's documented or extractable from Pentaho sources
4. GUI positioning (xloc/yloc) may not match Spoon's auto-layout algorithms
5. Some advanced step configurations may require manual XML editing if not covered by schema

## Technical Considerations *(optional)*

### Dependencies

- **Existing Implementation**: Builds on PR #4 (kettle-tools-implementation) handlers, parsers, and schemas
- **XML Parser**: Leverages existing fast-xml-parser and Zod validation infrastructure
- **File Operations**: Uses existing atomic save operations with backup/diff preview from edit-handlers.ts
- **Context7**: May use Context7 Pentaho Kettle documentation API for step type metadata [NEEDS CLARIFICATION: Context7 API availability and coverage]
- **Pentaho Kettle GitHub**: Reference implementation at https://github.com/pentaho/pentaho-kettle for step type definitions and XML structure

### Architecture Approach

1. **Handler Layer**: Create new handlers (step-handlers.ts, hop-handlers.ts) following existing pattern
2. **Schema Repository**: Build a comprehensive static repository of step type schemas:
   - Create curated JSON/TypeScript definitions for ALL documented Kettle step types (100+ steps)
   - Organize by category (Input, Output, Transform, Utility, Flow, Scripting, Lookup, Join, etc.)
   - Include required/optional fields, data types, validation rules, defaults, and examples
   - Provide schema generation tools (CLI or MCP tool) for developers to create new definitions from XML examples or Pentaho plugin metadata
3. **Validation Layer**: Extend existing validation utils with step-specific validation rules
4. **MCP Tools**: Add 12-15 new MCP tools for step/hop management, discovery, and schema generation
5. **GUI Positioning**: Step entities will include `xloc` and `yloc` properties for GUI positioning. Defaults will be calculated if not provided, ensuring explicit placement for all steps. Positioning is for visualization in Spoon and compatible GUIs, not execution order.
6. **Testing**: Comprehensive unit tests for CRUD operations, E2E tests for complete workflows, schema coverage tests

### Open Questions for Clarification

1. **Step Type Schema Source** ~~[NEEDS CLARIFICATION]~~ **[RESOLVED]**:
   - ✅ **Decision**: Static curated schemas covering all documented step types, with developer tools to add/generate new definitions
   - Implementation will include schema generator CLI/tool for creating new step type definitions

2. **Hop Dependency Handling** ~~[NEEDS CLARIFICATION]~~ **[RESOLVED]**:
   - ✅ **Decision**: Auto-remove all connected hops when removing a step (clean and simple behavior)
   - Implementation will automatically clean up hops and error handling references when a step is deleted

3. **GUI Positioning Strategy** [NEEDS CLARIFICATION]:

   - ✅ **Decision**: Use explicit coordinates (xloc/yloc) for each step, with sensible defaults for new steps if not provided. This enables predictable placement and supports downstream GUI tools. Position is for visualization only, not execution order.

## Risks & Mitigation *(optional)*

### Technical Risks

1. **Risk**: Step type schemas may be incomplete or inaccurate for less common steps
   - **Mitigation**: Start with 20-30 most common steps, accept user-provided configurations for others, iterate based on usage patterns

2. **Risk**: XML structure variations across Kettle versions may break parsing
   - **Mitigation**: Test against multiple Kettle versions, use lenient parsing where possible, document supported versions

3. **Risk**: Complex step configurations may have undocumented dependencies
   - **Mitigation**: Provide escape hatch for "raw XML" configuration input, comprehensive error messages

4. **Risk**: Context7 API may have rate limits or availability issues
   - **Mitigation**: Implement caching, fallback to static schemas, graceful degradation

### Adoption Risks

1. **Risk**: AI agents may struggle to correctly configure complex steps without examples
   - **Mitigation**: Provide rich schema documentation with examples, common patterns, validation with helpful error messages

2. **Risk**: Users may prefer manual XML editing for complex scenarios
   - **Mitigation**: Ensure MCP tools don't interfere with manual editing, provide hybrid workflows

## Future Enhancements *(optional)*

- **Visual Layout Algorithms**: Auto-calculate optimal GUI positioning based on hop topology
- **Step Templates**: Pre-configured common step patterns (e.g., "CSV to Database" flow)
- **Hop Optimization**: Suggest hop reconfigurations for better parallelization
- **Configuration Validation**: Real-time validation against connected databases/files
- **Step Cloning**: Duplicate existing steps with modifications
- **Bulk Operations**: Add/update/remove multiple steps in a single transaction
- **Dependency Analysis**: Show which steps depend on specific fields or connections
- **Performance Hints**: Suggest step configurations for better performance
- **Integration Testing**: Tools to test transformations with sample data
