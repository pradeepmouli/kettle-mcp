# Kettle-MCP

An MCP (Model Context Protocol) server that exposes tools for reading, creating, and updating Pentaho Kettle jobs and transformations.

## Overview

Kettle-MCP provides a bridge between AI agents and Pentaho Kettle workflows, enabling programmatic manipulation of ETL (Extract, Transform, Load) processes through the Model Context Protocol.

### Features

- **Read Operations**: Parse and read Pentaho Kettle job (.kjb) and transformation (.ktr) files
- **Validation**: Validate file structure and content with detailed error reporting
- **Search & List**: Discover artifacts by name, step type, parameters, and more
- **Edit Operations**: Update workflows with atomic writes, backups, and diff preview
- **Execution** (guarded): Execute transformations and jobs with environment variable guards
- **Server Status**: Track registered artifacts and server health (local mode)
- **MCP Integration**: 20 fully-wired MCP tools compatible with AI agents

See [MCP Tools Reference](docs/mcp-tools-reference.md) for complete API documentation and [Quickstart Guide](docs/quickstart.md) for examples.

## Project Structure

This project uses [GitHub Spec-Kit](https://github.com/github/spec-kit) for spec-driven development:

```text
kettle-mcp/
├── .github/                    # GitHub workflows and prompts
├── .specify/                   # Spec-kit configuration and templates
│   ├── memory/                # Project memory (constitution)
│   ├── scripts/               # Automation scripts
│   ├── specs/                 # Feature specifications
│   └── templates/             # Document templates
├── src/                       # TypeScript source code
│   ├── index.ts              # Main entry point
│   ├── server.ts             # MCP server implementation
│   ├── handlers/             # Tool implementation handlers
│   ├── schemas/              # Zod schemas for validation
│   └── __tests__/            # Test suites (unit, integration, E2E)
├── docs/                      # Documentation
│   ├── mcp-tools-reference.md  # Complete MCP API reference
│   ├── quickstart.md         # Getting started examples
│   ├── kettle-formats.md     # Kettle XML formats
│   └── getting-started.md    # General guide
├── examples/                  # Example Kettle files
│   └── sample_kettle_files/  # Sample .kjb and .ktr files
├── package.json               # Node.js dependencies
├── tsconfig.json              # TypeScript configuration
├── README.md                  # This file
└── LICENSE                    # MIT License
```

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- Git
- An MCP-compatible AI agent (Claude, Copilot, etc.)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/pradeepmouli/kettle-mcp.git
   cd kettle-mcp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:

   ```bash
   npm run build
   ```

4. Run tests:

   ```bash
   npm test
   ```

### Development

- **Build**: `npm run build` - Compile TypeScript to JavaScript
- **Dev mode**: `npm run dev` - Watch mode for development
- **Test**: `npm test` - Run test suite
- **Lint**: `npm run lint` - Check code quality
- **Format**: `npm run format` - Format code with Prettier

### Development Workflow

This project follows the Spec-Kit methodology:

1. **Define Features**: Use `/speckit.specify` to create feature specifications
2. **Create Plan**: Use `/speckit.plan` to generate implementation plans
3. **Break Down Tasks**: Use `/speckit.tasks` to create actionable task lists
4. **Implement**: Use `/speckit.implement` to build the features

### Initial Setup

The repository includes the spec-kit structure in `.specify/` with:

- **Constitution** (`.specify/memory/constitution.md`): Project principles and guidelines
- **Templates**: Reusable templates for specs, plans, and tasks
- **Scripts**: Automation helpers for feature creation

## Key References

- [Pentaho Kettle GitHub Repository](https://github.com/pentaho/pentaho-kettle)
- [Context7 Documentation](https://context7.com) for Pentaho Kettle
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [GitHub Spec-Kit](https://github.com/github/spec-kit)

## Contributing

We follow spec-driven development. To contribute:

1. Fork the repository
2. Create a feature branch using the spec-kit workflow
3. Write specifications before code
4. Submit a pull request with your spec and implementation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Status

✅ **Feature Complete**: Core functionality implemented with 20 MCP tools, comprehensive test coverage (49 passing tests), and full documentation. Ready for integration with MCP clients.

### Test Coverage

- **Unit Tests**: Handler functions, parsers, validators
- **Integration Tests**: Tool wiring, edge cases, error handling
- **E2E Tests**: Complete workflows (search→get→execute, edit flows)

Run `npm test` to verify all tests pass.
