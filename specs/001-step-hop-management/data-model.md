# Data Model: Step and Hop Management

## Entities

### TransformationStep
- name: string (unique within transformation)
- type: string (must match known step type)
- configuration: object (fields per step type schema)
- xloc: number (GUI X coordinate, 0-9999)
- yloc: number (GUI Y coordinate, 0-9999)
- distribute: boolean (optional)
- copies: number (optional)
- partitioning: object (optional)

### JobEntry
- name: string (unique within job)
- type: string (must match known job entry type)
- configuration: object (fields per entry type schema)
- xloc: number (GUI X coordinate, 0-9999)
- yloc: number (GUI Y coordinate, 0-9999)
- start: boolean (optional)
- parallel: boolean (optional)
- repeat: boolean (optional)

### Hop
- from: string (step name)
- to: string (step name)
- enabled: boolean

### JobHop
- from: string (entry name)
- to: string (entry name)
- evaluation: 'Y' | 'N' | null (success/failure/unconditional)
- unconditional: boolean

### StepType
- typeId: string
- category: string (Input/Transform/Output/Utility/etc.)
- displayName: string
- description: string
- tags: string[]
- configurationSchema: object (zod/JSON schema)

### JobEntryType
- typeId: string
- category: string
- displayName: string
- description: string
- tags: string[]
- configurationSchema: object (zod/JSON schema)

### StepConfigurationSchema
- fields: array of { name: string, type: string, required: boolean, default?: any, validation?: object }

### HopValidationResult
- isValid: boolean
- errors: string[]

## Validation Rules
- Step and entry names must be unique within their parent.
- Step/job entry type must exist in the static type registry.
- All required configuration fields must be present and valid.
- xloc/yloc must be numeric and 0-9999.
- Hops must reference existing steps/entries.
- No circular hop dependencies.

## State Transitions
- Steps/entries can be added, updated, or removed.
- Hops can be added or removed.
- Configuration can be validated before commit.
