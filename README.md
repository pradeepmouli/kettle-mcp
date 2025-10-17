# Kettle-MCP

An MCP (Model Context Protocol) server that exposes tools for reading, creating, and updating Pentaho Kettle jobs and transformations.

## Overview

Kettle-MCP provides a bridge between AI agents and Pentaho Kettle workflows, enabling programmatic manipulation of ETL (Extract, Transform, Load) processes through the Model Context Protocol.

### Features

- **Read Kettle Files**: Parse and read Pentaho Kettle job (.kjb) and transformation (.ktr) files
- **Create Workflows**: Generate new Kettle jobs and transformations programmatically
- **Update Workflows**: Modify existing Kettle jobs and transformations
- **List Components**: Discover available Kettle step types and job entry types
- **MCP Integration**: Fully compatible with MCP-enabled AI agents

## Project Structure

This project uses [GitHub Spec-Kit](https://github.com/github/spec-kit) for spec-driven development:

```
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
│   ├── tools/                # Individual MCP tools
│   ├── kettle/               # Kettle file parsing & manipulation
│   └── utils/                # Utility functions
├── tests/                     # Test files
│   ├── unit/                 # Unit tests
│   └── integration/          # Integration tests
├── docs/                      # Documentation
├── examples/                  # Example Kettle files
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

🚧 **In Development**: This project is currently being set up with spec-kit. Initial features are being specified and planned.
