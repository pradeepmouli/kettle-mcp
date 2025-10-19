# Data Model: Implement All Kettle Tools

**Date**: 2025-10-18

## Entities

### KettleArtifact

- Fields: path (string), name (string), type ("job"|"transformation"), parameters (map<string,string>), variables (map<string,string>), notes (string?)
- Relationships: specialization of KettleJob or KettleTransformation
- Validation: path must be within workspace; name non-empty; type required

### KettleTransformation

- Fields: steps (Step[]), hops (Hop[]), metadata (map<string,any>)
- Relationships: may be referenced by KettleJob entries
- Validation: all step ids unique; hops reference valid step ids; graph connected or flagged

### KettleJob

- Fields: entries (Entry[]), hops (Hop[]), metadata (map<string,any>)
- Relationships: may call KettleTransformation or other KettleJob
- Validation: entries ids unique; hops reference valid entry ids; start/end paths valid

### Step (Transformation)

- Fields: id (string), name (string), type (string), config (map<string,any>)
- Relationships: connects via Hop (from/to ids)
- Validation: id unique; required fields by type (type-specific minimal set)

### Entry (Job)

- Fields: id (string), name (string), type (string), config (map<string,any>)
- Relationships: connects via Hop (from/to ids)
- Validation: id unique; required fields by type (type-specific minimal set)

### Hop

- Fields: from (string), to (string), enabled (boolean)
- Validation: from/to refer to existing Step/Entry ids

### ValidationIssue

- Fields: severity ("info"|"warning"|"error"), code (string), message (string), location (string), suggestion (string?)
- Validation: severity and message required

### SearchIndex

- Fields: artifacts (KettleArtifact[]), tokens (map<string,string[]>)
- Validation: tokenization stable; index build under N ms per 1k artifacts

## Notes

- Data model is implementation-agnostic and reflects information shaped from Kettle XML while preserving unknowns.
- Corresponding Zod schemas will be provided for artifact JSON shapes and tool I/O envelopes to enforce contracts at runtime.
