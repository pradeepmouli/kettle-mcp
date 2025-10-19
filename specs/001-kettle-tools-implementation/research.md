# Research: Implement All Kettle Tools

**Date**: 2025-10-18
**Scope**: Inspect, validate, search, safe edit, and local execution for Kettle .ktr/.kjb

## Decisions

### D1: Parsing & Writing Libraries

- Decision: Use fast-xml-parser for parsing and j2x conversion for writing.
- Rationale: High performance, minimal deps, mature project; supports parse and XML generation without separate writers.
- Alternatives: xml2js+xmlbuilder2 (flexible but heavier), fast-xml-parser + custom writer (more work), DOM libs (heavier).

### D2: Round‑Trip Safety Strategy

- Decision: Preserve unknown nodes/attributes; avoid normalization; track original EOL/encoding where feasible.
- Rationale: Ensures minimal non-semantic diffs and prevents data loss.
- Alternatives: Normalize and reformat (simpler but risks churn and loss of vendor-specific fields).

### D3: Diffing for Dry-Run Previews

- Decision: Use `diff` (unified diff) to render human-readable previews.
- Rationale: Simple, well-known format fits CLI/agent display; avoids heavy HTML rendering.
- Alternatives: custom structural diff (richer but complex), jsondiffpatch (great for JSON but needs XML->JSON mapping).

### D4: Search & Indexing

- Decision: Use fast-glob to find artifacts; build in-memory index on fields (name, type, parameters, step types).
- Rationale: Keeps dependencies minimal and performance adequate for ~1k artifacts.
- Alternatives: external indexers (overkill), on-demand search without index (simpler but slower for repeated queries).

### D5: Local Execution Scope

- Decision: Allow local execution only, disabled by default; opt-in flag and env var required; pre-flight confirmation.
- Rationale: Meets stakeholder need while honoring safety; avoids remote concerns.
- Alternatives: No execution (safer but fails end-to-end validation); remote execution (complex and against constitution).

### D6: Version Support

- Decision: 9.x baseline; other versions best-effort read-only with warnings.
- Rationale: Aligns with current installations and spec decision; constrains validation complexity.
- Alternatives: 7–9 broad coverage (more complexity), latest two only (excludes older fleets).

### D7: Validation Strategy

- Decision: Implement structural validations (orphan steps, unresolved references, disconnected graphs); consider Ajv only where JSON-schema parallels exist.
- Rationale: XML schema coverage incomplete for Kettle; pragmatic rule-based validation is effective.
- Alternatives: Strict XSD validation (limited availability), ad hoc warnings only (too weak).

### D8: Zod Schemas for Tool I/O

- Decision: Define Zod schemas for JSON representations (job, transformation, step/entry, hop, issues, search index) and for each tool's input/output envelope.
- Rationale: Enforces consistent contracts, improves DX, and enables precise error messages at boundaries.
- Alternatives: Type-only with TS (no runtime validation), Ajv/JSON Schema (more verbose; Zod ergonomics preferred for TS projects).

## Open Items Resolved

- None. All clarifications applied (execution local-only, sources local-only, 9.x baseline).

## Risks & Mitigations

- Execution expands attack surface → Default-off, sandbox paths, timeouts, explicit confirmation, sanitized logs.
- Large files → Stream where possible, avoid deep copies, cap sizes, document limits.
- Round-trip fidelity → Preserve unknowns, minimal reformatting, add tests comparing before/after XML.
