# Feature Specification: Step Type Discovery Enhancement

**Feature Branch**: `002-step-type-discovery`
**Created**: 2025-01-18
**Status**: Draft
**Input**: User description: "add support to add specific step types and expose sufficient content to the LLM for it to choose what step types to add for a specific scenario"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - LLM Discovers Available Step Types (Priority: P1)

An AI agent needs to understand what transformation step types are available in the Kettle ecosystem to build appropriate ETL workflows. The agent queries the system to get a comprehensive list of step types with their names, descriptions, categories, and common use cases.

**Why this priority**: This is the foundational capability - without knowing what step types exist, the LLM cannot make informed decisions about which steps to add. This enables the most basic discovery pattern.

**Independent Test**: Can be fully tested by calling the list discovery API and verifying it returns step types with metadata. Delivers immediate value by allowing LLMs to browse available options without requiring schema knowledge.

**Acceptance Scenarios**:

1. **Given** an LLM needs to build a data transformation workflow, **When** it requests available step types, **Then** it receives a list including names, descriptions, categories (Input/Output/Transform/etc.), and common use case tags
2. **Given** an LLM wants to understand Input step types specifically, **When** it requests step types filtered by category="Input", **Then** it receives only Input-related steps (e.g., TableInput, TextFileInput, ExcelInput)
3. **Given** an LLM searches for database-related steps, **When** it requests step types with tag="database", **Then** it receives steps like TableInput, TableOutput with relevant metadata

---

### User Story 2 - LLM Retrieves Step Configuration Schema (Priority: P1)

After discovering a step type, the LLM needs to understand what configuration parameters are required and optional for that step type. The LLM requests the schema for a specific step type and receives structured information about fields, types, validation rules, and examples.

**Why this priority**: Essential for actually using discovered step types. Without schema knowledge, LLMs cannot generate valid configurations. Combined with P1-1, this creates a complete discovery-to-configuration workflow.

**Independent Test**: Can be tested by requesting a schema for a known step type (e.g., "TableInput") and verifying the returned schema includes field names, types, required/optional flags, and validation constraints. Independently valuable for configuration generation.

**Acceptance Scenarios**:

1. **Given** an LLM wants to add a TableInput step, **When** it requests the schema for "TableInput", **Then** it receives field definitions including connection (string, required), sql (string, required), and limit (string, optional)
2. **Given** an LLM needs to validate a user-provided configuration, **When** it retrieves the step schema, **Then** it can identify required fields, type constraints, and validation rules (e.g., min length, patterns)
3. **Given** an LLM wants to help users configure a step, **When** it accesses the schema with examples, **Then** it can generate sample configurations showing typical values and patterns

---

### User Story 3 - LLM Browses Steps by Use Case (Priority: P2)

An LLM receives a user request like "read data from MySQL" or "filter duplicate records" and needs to find the appropriate step type without knowing the exact Kettle terminology. The LLM searches or filters step types by use case tags or semantic descriptions.

**Why this priority**: Improves LLM effectiveness by enabling natural language to step type mapping. Not critical for MVP (P1 stories handle explicit discovery), but significantly enhances user experience.

**Independent Test**: Can be tested by providing natural language queries and validating the system returns relevant step types. For example, "database query" → TableInput, "remove duplicates" → UniqueRows. Independently valuable for conversational AI workflows.

**Acceptance Scenarios**:

1. **Given** an LLM receives user intent "read from database", **When** it searches step types with use case tag "database-read", **Then** it finds TableInput step with description indicating database query capabilities
2. **Given** an LLM needs to perform data filtering, **When** it browses steps tagged with "filtering", **Then** it discovers FilterRows, SelectValues, and UniqueRows with clear differentiation
3. **Given** an LLM wants to suggest steps for CSV processing, **When** it queries for "CSV" or "text file", **Then** it receives TextFileInput, TextFileOutput, and CSVInput with appropriate metadata

---

### User Story 4 - LLM Generates Valid Configuration from Requirements (Priority: P2)

An LLM has user requirements (e.g., "read from MySQL database 'sales', table 'orders', limit 1000 rows") and needs to generate a complete, valid step configuration. The LLM uses schema information to construct a configuration object that passes validation.

**Why this priority**: Enhances the end-to-end workflow but builds on P1 foundations. Can be achieved through P1 capabilities (retrieve schema, construct config), but this story ensures the workflow is well-supported with examples and guidance.

**Independent Test**: Can be tested by providing a set of requirements and validating the LLM generates a configuration that passes the validate_step_configuration API. Independently demonstrates value of schema-driven configuration generation.

**Acceptance Scenarios**:

1. **Given** requirements specify database connection "db-prod", query "SELECT * FROM users", and limit "500", **When** the LLM generates a TableInput configuration, **Then** validation passes and configuration contains all required fields with correct types
2. **Given** requirements include optional parameters like "enable lazy conversion", **When** the LLM generates configuration, **Then** optional fields are correctly included or omitted based on schema defaults
3. **Given** a user provides incomplete requirements, **When** the LLM attempts to generate configuration, **Then** it identifies missing required fields from the schema and prompts the user for additional information

---

### Edge Cases

- What happens when an LLM requests a step type that doesn't exist in the registry?
  - System returns empty result or "not found" response with available step type list suggestion
- How does the system handle requests for schemas when the step type is valid but schema is incomplete/missing?
  - System returns error indicating schema unavailable and suggests alternative discovery methods
- What if an LLM filters by category or tag that has no matching steps?
  - System returns empty list with indication that no steps match the filter criteria
- How does the system handle version differences when step type schemas evolve?
  - Initial implementation: schemas represent current version only; future: include version metadata in responses
- What if an LLM needs to discover job entry types (not transformation step types)?
  - System should provide parallel discovery for job entry types with similar metadata structure

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an API to list all registered transformation step types with metadata including name, display name, description, category, and use case tags
- **FR-002**: System MUST allow filtering step types by category (e.g., Input, Output, Transform, Utility, Flow, Scripting)
- **FR-003**: System MUST allow filtering step types by use case tags (e.g., database, file, filtering, aggregation)
- **FR-004**: System MUST provide an API to retrieve the configuration schema for a specific step type
- **FR-005**: System MUST include schema field information: name, type, required/optional status, validation constraints, and descriptions
- **FR-006**: System MUST include example configurations in schema responses where applicable
- **FR-007**: System MUST return clear error messages when requesting schemas for non-existent step types
- **FR-008**: System MUST provide parallel discovery capabilities for job entry types (not just transformation steps)
- **FR-009**: System MUST return responses in JSON format suitable for LLM parsing
- **FR-010**: System MUST maintain consistent metadata structure across all step types to enable LLM learning

### Key Entities

- **Step Type Metadata**: Represents a transformation step type with properties: name (technical identifier), displayName (human-readable), description (purpose and usage), category (functional grouping), tags (use case keywords), schemaAvailable (boolean indicating if schema is registered)
- **Step Configuration Schema**: Represents the structure of a step's configuration including fields (array of field definitions), each with: fieldName, fieldType (string/number/boolean/object), required (boolean), validation (constraints like min/max/pattern), description, examples
- **Category**: Enumeration of step type categories (Input, Output, Transform, Lookup, Join, Flow, Scripting, Utility, Validation, etc.)
- **Tag**: Free-form keyword for use case classification (database, file, CSV, JSON, filtering, aggregation, deduplication, etc.)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: LLM can discover all available step types in a single API call receiving at least name, category, and description for each type
- **SC-002**: LLM can retrieve complete configuration schema for any registered step type including all required and optional fields
- **SC-003**: LLM can filter step types by category and receive only relevant results (e.g., filtering by "Input" returns only input-related steps)
- **SC-004**: LLM can use schema information to generate valid configurations that pass validation without requiring trial-and-error iteration
- **SC-005**: LLM can map natural language user intents (e.g., "read from database") to appropriate step types using use case tags and descriptions
- **SC-006**: System provides consistent metadata structure across all step types enabling LLM pattern recognition and learning
