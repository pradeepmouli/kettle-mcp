# Feature Specification: Implement All Kettle Tools

**Feature Branch**: `001-kettle-tools-implementation`
**Created**: 2025-10-18
**Status**: Draft
**Input**: User description: "implement all kettle tools"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Inspect Kettle Artifacts (Priority: P1)

As a developer/analyst, I want to load and inspect Kettle jobs (.kjb) and transformations (.ktr) so I can understand their steps, parameters, variables, and wiring without needing to open a GUI.

**Why this priority**: Enables immediate value with safe, read-only capabilities for exploration, troubleshooting, and documentation.

**Independent Test**: Can be fully tested by loading sample .ktr/.kjb files and retrieving structured summaries (names, steps, hops, parameters, variables) and validation results.

**Acceptance Scenarios**:

1. Given a valid .ktr file, When I request a structured summary, Then I receive the transformation name, steps with types, hop/wiring info, parameters and variables.
2. Given a valid .kjb file, When I request a structured summary, Then I receive the job name, entries (steps) with types, hops, parameters and variables.
3. Given a malformed or incomplete Kettle file, When I request validation, Then I receive a list of issues including severity, location, and human-readable messages.
4. Given a directory of mixed files, When I list Kettle artifacts, Then I see only .ktr and .kjb with basic metadata (path, name).

---

### User Story 2 - Modify and Save Safely (Priority: P2)

As a developer, I want to make targeted, auditable edits to Kettle jobs/transformations (e.g., rename, update parameters, add/remove steps, change descriptions) and save them safely so I can iterate quickly with minimal risk.

**Why this priority**: Editing with safety nets (dry-run, diffs, backup) is essential for practical workflows and reduces fear of breaking artifacts.

**Independent Test**: Can be fully tested by applying edits to a sample artifact in a temp location, previewing diffs, and writing changes with a backup.

**Acceptance Scenarios**:

1. Given a .ktr file, When I change the transformation description and preview, Then I see a clean diff of only the description field.
2. Given a .kjb file, When I add a new entry with minimal required fields and preview, Then I see the added node and necessary wiring in the diff.
3. Given any artifact, When I save changes, Then the tool creates a timestamped backup and writes the updated file atomically.
4. Given a conflicting concurrent change, When I attempt to save, Then I’m alerted and can rebase or cancel without data loss.

---

### User Story 3 - Search and Navigate (Priority: P3)

As a developer, I want to search for Kettle artifacts and navigate dependencies (which jobs call which transformations; step references) so I can answer “where-used” and impact analysis questions.

**Why this priority**: Improves productivity and reduces risk by revealing relationships across artifacts.

**Independent Test**: Can be fully tested by indexing a sample directory and executing queries by name, type, and references.

**Acceptance Scenarios**:

1. Given a directory of artifacts, When I search by artifact name substring, Then matching .ktr and .kjb are returned with paths.
2. Given a job that calls a transformation, When I request dependents and dependencies, Then I see both directions with a concise summary.
3. Given a transformation with many steps, When I request step-by-step wiring, Then the upstream/downstream links are returned per step.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Corrupted or truncated XML: parsing fails gracefully with validation issues, not crashes.
- Unsupported or unknown step types: represented as opaque nodes with preserved attributes; flagged in validation.
- Large artifacts (e.g., >10MB or >1,000 steps): operations complete within documented timeouts, with partial results if needed.
- Cyclic or disconnected graphs: highlighted in validation with clear references.
- Permission errors or locked files: read-only operations proceed where possible; write operations fail safely with guidance.
- Mixed encodings or line endings: read operations normalize without data loss; write preserves original encoding/line endings where safe.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST allow users to list Kettle artifacts in a directory (jobs and transformations) with basic metadata.
- **FR-002**: System MUST load and summarize a .ktr transformation (name, steps with types, hops/wiring, parameters, variables, notes/description).
- **FR-003**: System MUST load and summarize a .kjb job (name, entries with types, hops, parameters, variables, notes/description).
- **FR-004**: System MUST validate artifacts and return structured issues (severity, code, message, location/path within artifact).
- **FR-005**: Users MUST be able to preview edits (dry-run) as a human-readable diff without writing to disk.
- **FR-006**: System MUST support safe write operations: create timestamped backup, write atomically, and confirm success.
- **FR-007**: Users MUST be able to make targeted edits: update descriptions, parameters, variables; add/remove steps/entries with minimal required fields; rename artifacts.
- **FR-008**: System MUST support dependency queries: list dependencies (what this artifact calls) and dependents (who calls this artifact).
- **FR-009**: System MUST provide search across artifacts by name, type, parameter name, and step type.
- **FR-010**: System MUST preserve unknown fields and formatting such that non-semantic changes are minimized on save (round‑trip safety).

- **FR-014**: Define and publish versioned Zod schemas for the JSON representations of Kettle artifacts and tool I/O, including: KettleJob, KettleTransformation, Step, Entry, Hop, ValidationIssue, SearchIndex, and per-tool input/output envelopes. All tool inputs MUST be validated against these schemas, and all tool outputs MUST conform to them.

Additional scope requirements:

- **FR-011**: System MUST support local execution of Kettle jobs and transformations. Remote execution is out of scope for this phase.
- **FR-012**: System MUST access artifacts from the local filesystem only in this phase. Repository/metastore integrations are out of scope and will be planned as a follow-up.
- **FR-013**: System MUST support Kettle/PDI 9.x file formats as the baseline. For other versions, the system SHOULD warn and attempt best‑effort read‑only support without guaranteeing round‑trip fidelity.

### Key Entities *(include if feature involves data)*

- **KettleArtifact**: Base concept for Job/Transformation; attributes: path, name, type (job/transformation), parameters, variables, notes.
- **KettleTransformation**: Steps, hops (edges), metadata; relationships: uses Steps; may be called by Jobs.
- **KettleJob**: Entries (job steps), hops; relationships: may call Transformations or other Jobs.
- **Step/Entry**: Node in graph; attributes: id, name, type, config map; relationships: upstream/downstream.
- **Hop**: Directed edge connecting nodes; attributes: from, to, enabled.
- **ValidationIssue**: severity, code, message, location (path/selector), suggestions.
- **SearchIndex**: lightweight index over artifact fields for fast queries.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Users can load and summarize a typical artifact (<5MB) in under 2 seconds for 95% of cases.
- **SC-002**: Validation identifies at least 95% of common structural issues in sample corpora (missing hops, orphan steps, unresolved references).
- **SC-003**: Save operations are safe: 100% of writes create a backup and preserve unknown fields (verified by round‑trip comparison) for supported versions.
- **SC-004**: Search queries return matches in under 1 second for directories up to 1,000 artifacts on a typical developer machine.
- **SC-005**: Users can perform at least 10 core edit operations (e.g., update description, add/remove step, set parameter) without encountering data loss across 20 sample artifacts.
- **SC-006**: Documentation includes at least 5 copy‑pasteable examples demonstrating inspect, validate, edit (preview), save, and search flows.
- **SC-007**: 100% of tool I/O paths perform Zod validation with test coverage proving rejection of malformed inputs and conformance of outputs across 20 sample cases.

### Assumptions

- Primary users interact via a conversational agent or CLI that invokes these tools; outputs are structured and human-readable.
- “All kettle tools” for this phase focuses on inspect, validate, search, safe edits, and local execution. Remote execution is explicitly out of scope for this phase.
- Artifact sources are limited to the local filesystem in this phase; repository/metastore integrations will be addressed in a follow-up.
- Supported Kettle/PDI baseline is 9.x; older/newer versions may load read-only with warnings.
- Local filesystem access is permitted within the user’s working directory; destructive operations require explicit confirmation.
