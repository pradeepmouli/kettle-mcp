# Schemas: Kettle JSON & Tool I/O

This document summarizes the top-level JSON shapes to be validated by Zod. Exact Zod definitions will live in source under `src/kettle/schemas/`.

## Artifact JSON Shapes

- KettleJob
- KettleTransformation
- Step (Transformation)
- Entry (Job)
- Hop
- ValidationIssue
- SearchIndex

## Tool I/O Envelopes

- InspectInput / InspectOutput
- ValidateInput / ValidateOutput
- SearchInput / SearchOutput
- EditPreviewInput / EditPreviewOutput
- EditSaveInput / EditSaveOutput
- DepsInput / DepsOutput
- ExecuteLocalInput / ExecuteLocalOutput

## Versioning

- Schemas are versioned (e.g., `x-kettle-schema-version`) and included in outputs for forward compatibility.

## Validation Policy

- All tool inputs are validated with Zod; invalid inputs return structured errors.
- All tool outputs conform to Zod schemas and are tested in integration suites.
