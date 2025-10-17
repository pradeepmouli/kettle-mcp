# Kettle-MCP Development Guide

This project follows **Spec-Driven Development** using GitHub Spec-Kit.

## Available Commands

### Core Workflow Commands

- `/speckit.constitution` - Create or update project governing principles
- `/speckit.specify` - Create feature specifications (WHAT and WHY)
- `/speckit.plan` - Create technical implementation plans (HOW)
- `/speckit.tasks` - Generate actionable task breakdowns
- `/speckit.implement` - Execute all tasks according to the plan

### Optional Commands

- `/speckit.clarify` - Clarify underspecified areas before planning
- `/speckit.analyze` - Cross-artifact consistency & coverage analysis

## Development Process

1. **Review Constitution**: Read `.specify/memory/constitution.md` for project principles
2. **Create Specification**: Use `/speckit.specify` to define the feature
3. **Clarify Requirements**: Use `/speckit.clarify` to resolve ambiguities
4. **Create Plan**: Use `/speckit.plan` to design the implementation
5. **Generate Tasks**: Use `/speckit.tasks` to break down the work
6. **Implement**: Use `/speckit.implement` to build the feature

## Project Context

**Purpose**: MCP server for Pentaho Kettle job and transformation management

**Technology Stack**:
- Python 3.11+
- MCP SDK
- XML parsing for Kettle files (.kjb, .ktr)

**Key Principles** (from constitution):
- Simplicity first
- Clear, self-documenting code
- Test-driven development
- Security-conscious file operations
- Follow Pentaho Kettle standards

## File Locations

- **Constitution**: `.specify/memory/constitution.md`
- **Templates**: `.specify/templates/`
- **Specs**: `.specify/specs/[###-feature-name]/`
- **Scripts**: `.specify/scripts/`

## Creating a New Feature

Use the helper script:
```bash
.specify/scripts/create-new-feature.sh <feature-name>
```

This will:
1. Create a new feature branch (`###-feature-name`)
2. Create a spec directory
3. Initialize spec.md from template

## References

- [Pentaho Kettle GitHub](https://github.com/pentaho/pentaho-kettle)
- [MCP Protocol Spec](https://modelcontextprotocol.io)
- [Spec-Kit Documentation](https://github.com/github/spec-kit)
