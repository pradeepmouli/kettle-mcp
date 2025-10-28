# Research: Step Type Discovery Enhancement

**Feature**: 002-step-type-discovery
**Date**: 2025-10-27
**Status**: Complete

## Research Tasks

This feature builds on existing infrastructure with minimal unknowns. All necessary context is available from the current codebase and MCP SDK documentation.

## Decision Log

### Decision 1: Metadata Structure for Step Types

**Decision**: Extend the existing `StepType` interface with use case tags and configuration examples

**Rationale**:
- Current `StepType` interface already includes: `typeId`, `category`, `displayName`, `description`, `tags[]`, `configurationSchema`
- Tags array already exists but is not populated with use case keywords
- No structural changes needed - just populate existing fields with richer content
- Zod schemas already provide field descriptions via `.describe()` method

**Alternatives Considered**:
- Create separate metadata registry: Rejected - adds complexity and duplication
- Use external documentation files: Rejected - would require file I/O and parsing overhead
- Embed examples in Zod schemas: Rejected - Zod doesn't support example metadata natively

**Implementation Approach**:
- Populate `tags` arrays with use case keywords (e.g., `['database', 'sql', 'read']` for TableInput)
- Enhance `description` fields with more LLM-friendly explanations
- Add example configurations as optional field in StepType interface
- Keep schema definitions unchanged (already use `.describe()` for field documentation)

---

### Decision 2: API Response Format

**Decision**: Return flat JSON objects with schema information serialized for LLM consumption

**Rationale**:
- LLMs work best with structured JSON data
- Current `discovery_tools.ts` returns basic metadata - extend with schema field descriptions
- Zod schemas can be introspected to extract field metadata (name, type, required, description)
- MCP protocol supports arbitrary JSON responses

**Alternatives Considered**:
- Return Zod schema objects directly: Rejected - not serializable, LLMs need plain JSON
- Generate OpenAPI/JSON Schema: Rejected - adds dependency and complexity
- Return schema as string (TypeScript type): Rejected - harder for LLMs to parse

**Implementation Approach**:
- Serialize Zod schema to JSON format: `{ fields: [{ name, type, required, description }] }`
- Include examples in response when available
- Keep response structure flat and predictable
- Document expected response format in API contracts

---

### Decision 3: Category and Tag Taxonomy

**Decision**: Use existing `StepCategory` enum and add standardized tags based on Kettle documentation

**Rationale**:
- Categories already defined: Input, Output, Transform, Utility, Flow, Scripting, Lookup, Join, Validation, Statistics
- Categories are well-established in Kettle UI and documentation
- Tags provide finer-grained classification for LLM use case mapping
- Tags can overlap (a step can be both "database" and "input")

**Tag Taxonomy**:
- **Data Source**: database, file, csv, json, xml, excel, rest-api, kafka
- **Operation**: read, write, filter, transform, aggregate, join, lookup, sort, deduplicate
- **Domain**: sql, nosql, streaming, batch, etl, validation

**Alternatives Considered**:
- Create multi-level category hierarchy: Rejected - over-engineering for current needs
- Use only categories without tags: Rejected - too coarse for natural language mapping
- Dynamic tag generation: Rejected - prefer curated, consistent tags

**Implementation Approach**:
- Define tag constants in step-types.ts for consistency
- Assign 2-5 tags per step type based on primary use cases
- Document tag taxonomy in quickstart.md for contributors

---

### Decision 4: Schema Field Serialization

**Decision**: Extract field metadata from Zod schemas using runtime introspection

**Rationale**:
- Zod provides `schema.shape` to access field definitions
- Can iterate over fields and extract: key name, type (via `_def.typeName`), optionality, descriptions
- No schema changes needed - metadata already present via `.describe()` calls
- Runtime extraction avoids code generation or build steps

**Implementation Details**:

```typescript
function serializeZodSchema(schema: z.ZodObject<any>) {
  const shape = schema.shape;
  const fields = Object.entries(shape).map(([name, fieldSchema]: [string, any]) => ({
    name,
    type: fieldSchema._def.typeName, // e.g., "ZodString", "ZodNumber"
    required: !fieldSchema.isOptional(),
    description: fieldSchema.description || '',
  }));
  return { fields };
}
```

**Alternatives Considered**:
- Manual schema documentation: Rejected - error-prone, requires duplicate maintenance
- Use zod-to-json-schema library: Rejected - adds dependency for simple task
- Generate TypeScript interfaces: Rejected - not runtime-accessible

---

### Decision 5: Testing Strategy

**Decision**: Add contract tests for enhanced API responses, maintain existing test structure

**Rationale**:
- Contract tests validate API response structure (critical for LLM consumers)
- Integration tests validate end-to-end discovery workflows
- Unit tests for metadata formatting functions
- Existing test infrastructure (Vitest) sufficient

**Test Coverage**:
- Contract tests: Validate list_step_types returns tags, validate get_step_type_schema returns field metadata
- Integration tests: Test filtering by category, filtering by tag, schema retrieval workflow
- Unit tests: Test Zod schema serialization, test tag taxonomy consistency

**Alternatives Considered**:
- Only integration tests: Rejected - misses fine-grained validation of response structure
- E2E tests with real LLM: Rejected - out of scope, not deterministic
- Snapshot tests: Rejected - too brittle for metadata that may evolve

---

## Dependencies & Best Practices

### MCP Protocol Best Practices

**Source**: @modelcontextprotocol/sdk documentation

**Relevant Patterns**:
- Tools should return structured JSON data suitable for AI consumption
- Tool descriptions should be clear and action-oriented
- Parameter schemas should use standard JSON Schema types
- Response validation recommended but not enforced by protocol

**Application**:
- Discovery tools already follow MCP patterns
- Enhanced responses maintain JSON structure
- Tool descriptions updated to reflect enhanced metadata
- No protocol changes needed

### Zod Schema Best Practices

**Source**: Zod documentation (<https://zod.dev>)

**Relevant Patterns**:
- Use `.describe()` for field documentation
- Use `.optional()` for optional fields
- Use `.default()` for default values
- Schemas are runtime-validated and type-safe

**Application**:
- Existing schemas already use `.describe()` - leverage this
- No schema restructuring needed
- Runtime introspection via `schema.shape` and `field._def`

### Pentaho Kettle Step Types

**Source**: Pentaho Kettle documentation (<https://github.com/pentaho/pentaho-kettle>)

**Common Step Types** (to prioritize for metadata enhancement):
- Input: TableInput, TextFileInput, ExcelInput, CSVInput, JSONInput, XMLInput
- Output: TableOutput, TextFileOutput, ExcelOutput, InsertUpdate, Delete
- Transform: SelectValues, FilterRows, SortRows, UniqueRows, Calculator
- Lookup: StreamLookup, DatabaseLookup
- Join: MergeJoin, JoinRows

**Application**:
- Prioritize these 20-25 step types for P1 implementation
- Use Kettle documentation for accurate descriptions and use cases
- Tags derived from Kettle category structure and common usage patterns

---

## Open Questions

None. All technical decisions resolved based on existing codebase analysis and established patterns.

---

## Summary

This research phase confirmed that:
1. No new dependencies required
2. No architectural changes needed
3. Existing infrastructure (Zod schemas, discovery tools, MCP protocol) fully supports enhanced metadata
4. Implementation is primarily data enrichment (populating tags, descriptions, examples)
5. Testing strategy aligns with existing Vitest-based approach

**Ready to proceed to Phase 1: Design & Contracts**
