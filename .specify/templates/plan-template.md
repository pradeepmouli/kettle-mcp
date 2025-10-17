# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

**Language/Version**: [e.g., Python 3.11, or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., mcp SDK, or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., file-based, or N/A]  
**Testing**: [e.g., pytest, or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux/macOS/Windows, or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (if applicable)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (if applicable)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```
src/
├── kettle_mcp/
│   ├── __init__.py
│   ├── server.py
│   ├── tools/
│   ├── kettle/
│   └── utils/

tests/
├── unit/
└── integration/
```

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., additional dependency] | [current need] | [why simpler approach insufficient] |
