# Kettle-MCP Project Constitution

**Version**: 1.0  
**Last Updated**: 2025-10-17

## Core Principles

### 1. Purpose & Scope

This project provides an MCP (Model Context Protocol) server that exposes tools for reading, creating, and updating Pentaho Kettle jobs and transformations. The server acts as a bridge between AI agents and Pentaho Kettle workflows, enabling programmatic manipulation of ETL processes.

### 2. Technology Philosophy

**Simplicity First**
- Use standard, well-established libraries and frameworks
- Avoid unnecessary dependencies and complexity
- Prefer vanilla implementations where appropriate
- Use the MCP SDK for server implementation

**Language & Framework**
- Primary language: Python 3.11+ (for MCP server compatibility)
- Use the official MCP Python SDK
- Leverage existing Pentaho Kettle XML parsing capabilities
- Support reading and writing Kettle .ktr (transformation) and .kjb (job) files

### 3. Code Quality Standards

**Readability**
- Clear, self-documenting code with meaningful names
- Comments only when necessary to explain "why", not "what"
- Follow PEP 8 style guide for Python code
- Maximum function length: ~50 lines
- Maximum file length: ~500 lines

**Testing**
- Unit tests for core functionality
- Integration tests for MCP tool endpoints
- Test coverage target: 80%+ for critical paths
- Use pytest as the testing framework

**Error Handling**
- Fail fast with clear error messages
- Log errors appropriately for debugging
- Validate inputs at API boundaries
- Handle Kettle file parsing errors gracefully

### 4. Architecture Guidelines

**MCP Server Design**
- Follow MCP protocol specifications strictly
- Expose clear, well-documented tools for Kettle operations
- Tools should be atomic and focused (single responsibility)
- Support both reading and writing Kettle files

**Key Tools to Expose**
- `read_kettle_job`: Read a Kettle job (.kjb) file
- `read_kettle_transformation`: Read a Kettle transformation (.ktr) file
- `create_kettle_job`: Create a new Kettle job
- `create_kettle_transformation`: Create a new Kettle transformation
- `update_kettle_job`: Update an existing Kettle job
- `update_kettle_transformation`: Update an existing Kettle transformation
- `list_kettle_steps`: List available Kettle step types
- `list_kettle_job_entries`: List available Kettle job entry types

**File Structure**
```
kettle-mcp/
├── src/
│   ├── kettle_mcp/
│   │   ├── __init__.py
│   │   ├── server.py          # MCP server implementation
│   │   ├── tools/              # Individual MCP tools
│   │   ├── kettle/             # Kettle file parsing & manipulation
│   │   └── utils/              # Utility functions
├── tests/
│   ├── unit/
│   └── integration/
├── examples/
│   └── sample_kettle_files/
├── docs/
├── .specify/
├── pyproject.toml
├── README.md
└── LICENSE
```

### 5. User Experience

**Documentation**
- Clear README with setup instructions
- Example usage for each MCP tool
- Sample Kettle files for testing
- API documentation for all exposed tools

**Developer Experience**
- Easy local development setup
- Clear contribution guidelines
- Automated testing in CI/CD
- Well-structured logging for debugging

### 6. Pentaho Kettle Integration

**File Format Understanding**
- Kettle jobs (.kjb) and transformations (.ktr) are XML files
- Preserve Kettle file structure and metadata
- Validate against Kettle XML schemas where possible
- Support common Kettle versions (8.x, 9.x)

**Context7 Documentation Reference**
- Use Context7 documentation for Pentaho Kettle as authoritative reference
- Reference: https://github.com/pentaho/pentaho-kettle
- Stay aligned with current Kettle standards and best practices

### 7. Performance & Scale

**Efficiency**
- Parse Kettle files efficiently using streaming XML parsers where appropriate
- Cache parsed files when beneficial
- Minimize memory footprint for large Kettle files
- Target: Parse typical Kettle files in <100ms

**Constraints**
- Support Kettle files up to 10MB in size
- Handle up to 1000 steps/entries per file
- No persistent state required (stateless server)

### 8. Security & Safety

**File Operations**
- Validate file paths to prevent directory traversal
- Sanitize XML content to prevent XXE attacks
- Use safe XML parsing libraries
- Never execute Kettle jobs/transformations directly

**Data Privacy**
- Log minimal information
- No sensitive data in error messages
- Clear documentation about what data is accessed

### 9. Development Process

**Spec-Driven Development**
- Follow spec-kit workflow for all features
- Write specifications before implementation
- Create implementation plans with clear steps
- Break down features into testable user stories

**Quality Gates**
- All tests must pass before merge
- Code review required for all changes
- Documentation updated with code changes
- No decrease in test coverage

### 10. Complexity Tracking

**Avoid Over-Engineering**
- Question every new dependency
- Justify architectural decisions
- Prefer composition over inheritance
- Keep abstractions minimal

**When Complexity is Justified**
- Multi-format support (if extending beyond Kettle)
- Advanced XML manipulation features
- Performance optimization for large files

## Governance

This constitution guides all technical decisions in the kettle-mcp project. When in doubt:

1. Refer to these principles
2. Prioritize simplicity and clarity
3. Consider the end user experience
4. Validate against Pentaho Kettle best practices

Any deviation from these principles must be documented and justified in the implementation plan.
