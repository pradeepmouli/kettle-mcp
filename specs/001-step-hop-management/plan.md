# Implementation Plan: [FEATURE]

**Branch**: `001-step-hop-management` | **Date**: 2025-10-19 | **Spec**: [/specs/001-step-hop-management/spec.md]
**Input**: Feature specification from `/specs/001-step-hop-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add, update, remove, and discover steps and hops in Pentaho Kettle transformations and jobs via MCP tools. Provide static curated schemas for all documented step types, developer tools for schema generation, and atomic file operations. Architecture includes handler layer, schema repository, validation, explicit GUI positioning, and comprehensive testing. All clarifications resolved.

## Technical Context

**Language/Version**: TypeScript (Node.js >= 18)
**Primary Dependencies**: @modelcontextprotocol/sdk, fast-xml-parser, zod, fast-glob, diff
**Storage**: Local filesystem (no persistent DB)
**Testing**: Jest or Vitest (unit, integration, contract)
**Target Platform**: Linux/macOS/Windows (Node.js server)
**Project Type**: Single MCP server (src/, tests/)
**Performance Goals**: Parse typical Kettle files in <100ms; add step operation <500ms for <100 steps
**Constraints**: Support Kettle files up to 10MB, 1000 steps/entries, stateless server, atomic file ops, no persistent state
**Scale/Scope**: 1000 steps/entries per file, 10MB file size, no user auth, local file access only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Gates:**
- Language: TypeScript (matches constitution)
- Framework: MCP SDK, fast-xml-parser, zod (approved)
- File structure: src/, tests/, tools/, kettle/, utils/ (matches constitution)
- Testing: Jest/Vitest, 80%+ coverage (matches constitution)
- No persistent state, stateless server (matches constitution)
- Spec-driven, atomic file ops, error handling, and documentation (matches constitution)

**Status:** All gates PASS. No unresolved clarifications.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/

### Documentation (this feature)

```
specs/001-step-hop-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
kettle-mcp/
├── src/
│   ├── index.ts             # Main entry point
│   ├── server.ts            # MCP server implementation
│   ├── tools/               # Individual MCP tools
│   ├── kettle/              # Kettle file parsing & manipulation
│   └── utils/               # Utility functions
├── tests/
│   ├── unit/
│   └── integration/
├── examples/
│   └── sample_kettle_files/
├── docs/
├── .specify/
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

No constitution violations. No complexity justifications required.
