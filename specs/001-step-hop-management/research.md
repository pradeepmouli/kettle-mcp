# Research Summary: Step and Hop Management

All clarifications from the feature spec are resolved. No open research tasks remain.

## Decisions and Rationale

### Step Type Schema Source
- **Decision**: Use static curated schemas for all documented step types, with developer tools to add/generate new definitions.
- **Rationale**: Ensures reliability, full coverage, and developer extensibility. Avoids external API dependencies.
- **Alternatives Considered**: Dynamic extraction from Pentaho source/docs, Context7 API, hybrid cache+API.

### Hop Dependency Handling
- **Decision**: Auto-remove all connected hops when a step is deleted.
- **Rationale**: Clean, predictable, and easy for agents. Avoids orphaned hops and complex reconnection logic.
- **Alternatives Considered**: Require force flag, smart reconnection, confirmation prompts.

### GUI Positioning Strategy
- **Decision**: Require or allow explicit coordinates (xloc/yloc) for each step, with sensible defaults if not provided.
- **Rationale**: Predictable placement, supports downstream GUIs, simple for agents. Position is for visualization only.
- **Alternatives Considered**: Auto-layout, helper tool for suggestions, no positioning.

## Best Practices and Patterns
- Use atomic file operations for all modifications.
- Validate all input and output against schemas.
- Preserve all unmodified XML and metadata.
- Provide comprehensive error messages and structured JSON responses.
- Follow MCP, Kettle, and project constitution guidelines for code quality, testing, and documentation.

## Status
All research and clarification tasks are complete. Ready to proceed to design and contract generation.
