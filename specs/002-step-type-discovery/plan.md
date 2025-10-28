# Implementation Plan: Step Type Discovery Enhancement

**Branch**: `002-step-type-discovery` | **Date**: 2025-10-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-step-type-discovery/spec.md`

## Summary

Enable LLMs to intelligently discover and understand Kettle transformation step types and job entry types by exposing rich metadata (categories, use case tags, descriptions) and detailed configuration schemas. This enhancement builds on the existing `discovery_tools.ts` implementation to provide comprehensive API responses that enable LLMs to map natural language user intents to appropriate step types and generate valid configurations.

**Technical Approach**: Enhance the existing step type and job entry type registries with additional metadata fields (use case tags, examples, schema field descriptions). Update discovery tool APIs to return enriched metadata and schema information formatted for LLM consumption.

## Technical Context

**Language/Version**: TypeScript (Node.js >= 18)
**Primary Dependencies**: @modelcontextprotocol/sdk (MCP), zod (schema validation), fast-xml-parser (XML I/O)
**Storage**: In-memory registry (no persistent storage - stateless MCP server)
**Testing**: Vitest with @vitest/coverage-v8 (current: 75% coverage)
**Target Platform**: Node.js server (MCP protocol over stdio/SSE)
**Project Type**: Single project (MCP server)
**Performance Goals**: <50ms response time for discovery API calls, <100ms for schema retrieval
**Constraints**: Stateless server (no caching across requests), must parse schema definitions efficiently
**Scale/Scope**: ~20-30 step types initially, ~15-20 job entry types, expandable registry architecture

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Alignment with Core Principles

✅ **Simplicity First**: This feature enhances existing discovery APIs without adding new dependencies. It leverages the existing Zod schema system and TypeScript metadata structures already in place.

✅ **Technology Philosophy**: Uses standard TypeScript interfaces and enums for metadata. No new libraries required - builds on @modelcontextprotocol/sdk and zod already in use.

✅ **Code Quality Standards**:
- Metadata additions are self-documenting (tags, descriptions)
- Changes localized to `src/kettle/schemas/` and `src/tools/discovery_tools.ts`
- Maintains existing test coverage standards (target: 80%+)
- Functions remain focused and under 50 lines

✅ **Architecture Guidelines**:
- Tools remain atomic (single responsibility maintained)
- Follows MCP protocol specifications
- Discovery tools already exist - this enhances their output format
- No changes to file operations or XML parsing

✅ **User Experience**:
- Improves AI agent DX by providing richer context
- API responses more useful for LLM decision-making
- Maintains backward compatibility with existing tools

✅ **Performance & Scale**:
- No impact on performance (metadata is static)
- Target response times well within <100ms constraint
- In-memory registry scales to hundreds of step types
- No persistent storage needed (aligns with stateless design)

✅ **Security & Safety**: No changes to file operations or validation logic

✅ **Complexity Tracking**:
- No new architectural patterns introduced
- No new dependencies
- Extends existing registry pattern
- Justification: Minimal complexity increase for high LLM usability value

### Gate Status: **PASS** ✅

No constitution violations. This feature is a natural enhancement of existing discovery capabilities.

---

## Post-Phase 1 Constitution Re-Check

*Re-evaluated after completing research, data model, and API contracts*

✅ **Simplicity Maintained**: Phase 1 design confirms no new dependencies or architectural complexity. Data model extends existing structures with metadata fields only.

✅ **Code Quality**: API contracts define clear, focused responses. Data model remains simple (4 entities, 3 are enhancements to existing). Testing strategy aligns with existing Vitest approach.

✅ **Performance**: Schema serialization is lightweight runtime introspection. Response times well within targets (<50ms discovery, <100ms schema retrieval).

✅ **Scope Creep Check**: Phase 1 design stays focused on discovery enhancement only. No feature bloat detected. Tag taxonomy is minimal and standardized.

### Re-Check Status: **PASS** ✅

Phase 1 design validates initial technical approach. Ready to proceed to Phase 2 (tasks).

## Project Structure

### Documentation (this feature)

```text
specs/002-step-type-discovery/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── list_step_types.json
│   ├── get_step_type_schema.json
│   ├── list_job_entry_types.json
│   └── get_job_entry_type_schema.json
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── kettle/
│   └── schemas/
│       ├── step-types.ts        # MODIFY: Add metadata (tags, examples, enhanced descriptions)
│       └── job-entry-types.ts   # MODIFY: Add metadata (tags, examples, enhanced descriptions)
├── tools/
│   ├── discovery_tools.ts       # MODIFY: Enhance response format with new metadata
│   └── index.ts                 # UPDATE: Export enhanced discovery tools
└── server.ts                    # UPDATE: Register enhanced tool schemas

tests/
├── contract/
│   └── discovery_enhanced.test.ts  # NEW: Contract tests for enhanced metadata
├── integration/
│   └── discovery_workflow.test.ts  # NEW: Integration tests for discovery workflows
└── unit/
    └── metadata_formatting.test.ts # NEW: Unit tests for metadata transformations

docs/
└── api-reference.md             # UPDATE: Document enhanced discovery APIs
```

**Structure Decision**: Single project structure maintained. Changes are localized to existing `src/kettle/schemas/` for metadata definitions and `src/tools/discovery_tools.ts` for API enhancements. No new architectural layers or modules needed - this is a data enrichment feature.

## Complexity Tracking

No constitution violations - this section left empty per template guidance.
