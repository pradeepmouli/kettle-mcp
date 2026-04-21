# kettle-mcp

> MCP server for Pentaho Kettle job and transformation management.

> **⚠️ Pre-1.0 software** — APIs are subject to change between minor versions. Pin to exact versions in production. See the [release notes](https://github.com/pradeepmouli/kettle-mcp/releases) for breaking changes between releases.

[![npm](https://img.shields.io/npm/v/kettle-mcp)](https://www.npmjs.com/package/kettle-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js >= 20](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)

📚 **Documentation:** <https://pradeepmouli.github.io/kettle-mcp/>

## Overview

Kettle-MCP enables AI agents and applications to read, create, modify, and validate Pentaho Kettle transformations (.ktr) and jobs (.kjb) through a standardized MCP interface.

### Key Features

- **🔍 Discovery Tools**: List and explore available step types and job entry types with schemas
- **📚 Comprehensive Step Library**: 132+ step types across 7 categories (Input, Transform, Output, BigData, Validation, Lookup, Join)
- **☁️ Big Data & Cloud**: Full support for Hadoop, HDFS, HBase, S3, Azure, Salesforce, and modern data platforms
- **✅ Validation**: Validate transformation steps and job entries against their schemas
- **➕ Creation**: Add new steps, job entries, and hops with configuration validation
- **✏️ Modification**: Update existing transformations and jobs with atomic writes
- **🗑️ Deletion**: Remove steps/entries with automatic hop cleanup
- **🔒 Safety**: Automatic backups, diff generation, and atomic file operations
- **📊 Full Coverage**: 16 MCP tools, 210+ tests, 75% code coverage

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/pradeepmouli/kettle-mcp.git
cd kettle-mcp

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Run tests to verify
pnpm test
```

### Usage with MCP Clients

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "kettle": {
      "command": "node",
      "args": ["/path/to/kettle-mcp/dist/index.js"]
    }
  }
}
```

## Available Tools

### Discovery Tools (4 tools)

- **`kettle_list_step_types`** - List all available transformation step types
- **`kettle_get_step_type_schema`** - Get detailed schema for a specific step type
- **`kettle_list_job_entry_types`** - List all available job entry types
- **`kettle_get_job_entry_type_schema`** - Get detailed schema for a specific job entry type

### Validation Tools (2 tools)

- **`kettle_validate_step_configuration`** - Validate a step configuration against its schema
- **`kettle_validate_job_entry_configuration`** - Validate a job entry configuration against its schema

### Transformation Tools (5 tools)

- **`kettle_add_transformation_step`** - Add a new step to a transformation
- **`kettle_add_transformation_hop`** - Add a hop (connection) between steps
- **`kettle_update_transformation_step`** - Update an existing step's configuration or position
- **`kettle_remove_transformation_step`** - Remove a step (auto-removes connected hops)
- **`kettle_remove_transformation_hop`** - Remove a specific hop

### Job Tools (5 tools)

- **`kettle_add_job_entry`** - Add a new entry to a job
- **`kettle_add_job_hop`** - Add a hop (connection) between job entries
- **`kettle_update_job_entry`** - Update an existing job entry's configuration or position
- **`kettle_remove_job_entry`** - Remove a job entry (auto-removes connected hops)
- **`kettle_remove_job_hop`** - Remove a specific hop

## Step Type Library

Kettle-MCP provides comprehensive coverage of Pentaho Kettle step types, enabling AI agents to build complete ETL workflows.

### Coverage Summary

| Category | Count | Examples |
|----------|-------|----------|
| **Input** | 33 | TableInput, CSVInput, KafkaConsumer, MongoDbInput, S3CSVInput |
| **Transform** | 44 | SelectValues, FilterRows, Joiner, GroupBy, Calculator |
| **Output** | 23 | TableOutput, TextFileOutput, KafkaProducer, ElasticsearchBulkInsert |
| **BigData** | 15 | HadoopFileInput, HDFSFileOutput, HBaseInput, S3FileInput, AvroOutput |
| **Validation** | 10 | DataValidator, CheckSum, DataCleanse, FieldValidator |
| **Lookup** | 5 | StreamLookup, DatabaseLookup, FuzzyMatch, DimensionLookup |
| **Join** | 2 | MergeRows, Append |
| **Total** | **132** | |

### Supported Technologies

- **Databases**: MySQL, PostgreSQL, Oracle, SQL Server, MonetDB, Vertica
- **NoSQL**: MongoDB, Cassandra, Elasticsearch, HBase
- **Big Data**: Hadoop, HDFS, Spark, Avro, Parquet, ORC
- **Cloud**: AWS S3, Azure Event Hubs, Google Analytics, Salesforce
- **Streaming**: Kafka, JMS, MQTT, Azure Event Hubs
- **File Formats**: CSV, JSON, XML, Excel, Parquet, Avro, YAML, Fixed-width

For complete step type documentation, see [docs/step-type-coverage.md](docs/step-type-coverage.md).

## Usage Examples

### Example 1: Building a Transformation

```typescript
// 1. List available step types
const stepTypes = await kettle_list_step_types();
// Returns: TableInput, SelectValues, TextFileInput, TextFileOutput, etc.

// 2. Get schema for TableInput
const schema = await kettle_get_step_type_schema({ typeId: "TableInput" });
// Returns detailed schema with required fields

// 3. Add a TableInput step
await kettle_add_transformation_step({
  filePath: "/path/to/transformation.ktr",
  step: {
    name: "Read Customers",
    type: "TableInput",
    configuration: {
      connection: "ProductionDB",
      sql: "SELECT * FROM customers WHERE active = 1"
    },
    xloc: 100,
    yloc: 100
  }
});

// 4. Add a SelectValues step
await kettle_add_transformation_step({
  filePath: "/path/to/transformation.ktr",
  step: {
    name: "Select Columns",
    type: "SelectValues",
    configuration: {
      fields: {
        field: [
          { name: "customer_id" },
          { name: "email" },
          { name: "name" }
        ]
      }
    },
    xloc: 300,
    yloc: 100
  }
});

// 5. Connect the steps
await kettle_add_transformation_hop({
  filePath: "/path/to/transformation.ktr",
  from: "Read Customers",
  to: "Select Columns"
});
```

### Example 2: Building a Job

```typescript
// 1. Add a transformation execution entry
await kettle_add_job_entry({
  filePath: "/path/to/job.kjb",
  entryName: "Extract Data",
  entryType: "TRANS",
  configuration: {
    filename: "/etl/transformations/extract.ktr"
  },
  options: {
    guiX: 200,
    guiY: 100
  }
});

// 2. Add a log entry
await kettle_add_job_entry({
  filePath: "/path/to/job.kjb",
  entryName: "Log Success",
  entryType: "WRITE_TO_LOG",
  configuration: {
    logmessage: "ETL completed successfully",
    loglevel: "Basic"
  },
  options: {
    guiX: 400,
    guiY: 100
  }
});

// 3. Connect with a hop
await kettle_add_job_hop({
  filePath: "/path/to/job.kjb",
  fromEntry: "START",
  toEntry: "Extract Data"
});

await kettle_add_job_hop({
  filePath: "/path/to/job.kjb",
  fromEntry: "Extract Data",
  toEntry: "Log Success",
  options: {
    evaluation: true  // Run on success
  }
});
```

### Example 3: Updating and Validation

```typescript
// 1. Validate configuration before update
const validation = await kettle_validate_step_configuration({
  typeId: "TableInput",
  configuration: {
    connection: "NewDB",
    sql: "SELECT * FROM orders"
  }
});

if (validation.valid) {
  // 2. Update the step
  await kettle_update_transformation_step({
    filePath: "/path/to/transformation.ktr",
    stepName: "Read Customers",
    configuration: {
      connection: "NewDB",
      sql: "SELECT * FROM orders"
    }
  });
}
```

## Documentation

- **[Getting Started Guide](docs/getting-started.md)** - Detailed setup and configuration
- **[Kettle File Formats](docs/kettle-formats.md)** - Understanding .ktr and .kjb XML structures
- **[API Reference](docs/api-reference.md)** - Complete tool documentation

## Development

### Scripts

- `pnpm run build` - Compile TypeScript
- `pnpm run dev` - Watch mode for development
- `pnpm test` - Run all tests
- `pnpm run test:coverage` - Run tests with coverage report
- `pnpm run lint` - Check code quality
- `pnpm run format` - Format code with Prettier

## Architecture

### Directory Structure

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

- Node.js 20.0 or higher
- pnpm package manager
- Git
- An MCP-compatible AI agent (Claude, Copilot, etc.)

### Setup Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/pradeepmouli/kettle-mcp.git
   cd kettle-mcp
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build the project:

   ```bash
   pnpm run build
   ```

4. Run tests:

   ```bash
   pnpm test
   ```

### Development Commands

- **Build**: `pnpm run build` - Compile TypeScript to JavaScript
- **Dev mode**: `pnpm run dev` - Watch mode for development
- **Test**: `pnpm test` - Run test suite
- **Lint**: `pnpm run lint` - Check code quality
- **Format**: `pnpm run format` - Format code with Prettier

### Spec-Kit Workflow

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

## Project Status

✅ **Production Ready** - v0.1.0

- **16 MCP Tools**: Complete CRUD operations for transformations and jobs
- **135 Tests Passing**: Unit, contract, integration, and E2E tests
- **75% Code Coverage**: Core business logic has 80%+ coverage
- **Full Documentation**: API reference, examples, and guides
- **Safety Features**: Automatic backups, validation, atomic writes, diff generation

### Test Suite

- **Contract Tests** (60): Tool behavior contracts and edge cases
- **Integration Tests** (13): End-to-end workflow validation
- **Unit Tests** (62): Handler functions, parsers, validators

Run `pnpm test` to verify all tests pass.

### Supported Step Types

- TableInput, SelectValues, TextFileInput, TextFileOutput
- _Extensible schema system for additional step types_

### Supported Job Entry Types

- TRANS (transformation execution)
- WRITE_TO_LOG (logging)
- _Extensible schema system for additional entry types_
