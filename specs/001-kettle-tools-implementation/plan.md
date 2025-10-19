# Implementation Plan: Implement All Kettle Tools

**Branch**: `001-kettle-tools-implementation` | **Date**: 2025-10-18 | **Spec**: specs/001-kettle-tools-implementation/spec.md
**Input**: Feature specification from `/specs/001-kettle-tools-implementation/spec.md`

**Note**: This plan is produced by the `/speckit.plan` workflow.

## Summary

Implement MCP tools to inspect, validate, search, safely edit, and (locally) execute Pentaho Kettle artifacts (.ktr/.kjb) with round‑trip safety and performance targets. Parsing/writing via XML utilities with fidelity-preserving options; provide dependency graph navigation and search indexing. Execution is local-only, explicitly opt-in, and safeguarded.

## Technical Context

**Language/Version**: TypeScript (Node.js >= 18)
**Primary Dependencies**: `@modelcontextprotocol/sdk` (MCP), `fast-xml-parser` (parse/write via j2x), `zod` (I/O schemas), `fast-glob` (scan), `diff` (unified diff)
**Storage**: Local filesystem (no persistent DB)
**Testing**: Vitest with 80% coverage thresholds; unit + integration tests over sample Kettle files; Zod schema conformance tests
**Target Platform**: Cross-platform developer machines (macOS/Linux/Windows)
**Project Type**: Single MCP server project
**Performance Goals**: Summarize typical artifact (<5MB) in <2s p95; search across 1k artifacts in <1s p95
**Constraints**: Memory efficient parsing; retain unknown fields; atomic writes with backups; do not exceed 10MB files, ~1k steps/entries
**Scale/Scope**: Local directories up to ~1k artifacts; 9.x Kettle baseline; best‑effort read‑only for others

Open Questions: None (clarifications resolved in spec). Risk: Constitution conflict on execution (see below) mitigated by strict guardrails and explicit opt-in; requires justification.

## Constitution Check

GATE: Must pass before Phase 0 research; re-check after Phase 1 design.

Principles Alignment:

- Simplicity first: minimal deps, filesystem-only, no DB — PASS
- Language/Framework: TypeScript, MCP SDK — PASS
- Kettle standards: .ktr/.kjb XML, preserve metadata — PASS
- Security-conscious file ops, safe XML parsing — PASS
- “Never execute Kettle jobs/transformations directly” — VIOLATION (spec requires local execution)

Violation Justification (proposed):

- Provide local execution as an explicitly opt-in capability guarded by:
  - Disabled by default; enabled via environment variable and tool option
  - Strict path constraints (workspace only), timeouts, resource limits
  - Pre-execution dry-run showing command; user must confirm per call
  - No credential storage; no remote execution; logs sanitized
- Rationale: Enables end-to-end validation workflows requested by stakeholders; kept narrowly scoped and safe.

Gate Result: PASS WITH JUSTIFICATION (tracked in Complexity Tracking). If governance rejects, execution tool will be excluded without impacting other tools.

## Project Structure

### Documentation (this feature)

```text
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

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: Single-project structure retained.

src/

- `index.ts` (entry) and `server.ts` (MCP wiring)
- `tools/` (each MCP tool: inspect, validate, search, edit-preview, edit-save, deps, execute-local)
- `kettle/` (xml reader/writer, models, validators, diffing, indexer)
- `utils/` (fs safety, encoding/EOL, path guards, result formatting)

tests/

- `unit/` (kettle parsing, writers, validators)
- `integration/` (end-to-end tool calls over sample files)

## Complexity Tracking

Fill ONLY if Constitution Check has violations that must be justified.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Local execution capability | Stakeholder-required validation flows | Execution disabled by default; scoped to local only; opt-in per call; alternative (no execution) rejected due to insufficient end-to-end validation |
