# Getting Started with Kettle-MCP

## Overview

Kettle-MCP is an MCP (Model Context Protocol) server that provides tools for working with Pentaho Kettle jobs and transformations. It allows AI agents to read, create, and update ETL workflows programmatically.

## Installation

### Prerequisites

- Python 3.11 or higher
- pip or uv for package management
- Git

### Installing from Source

```bash
# Clone the repository
git clone https://github.com/pradeepmouli/kettle-mcp.git
cd kettle-mcp

# Install in development mode
pip install -e ".[dev]"
```

### Installing with uv (Recommended)

```bash
# Install uv if you don't have it
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install the package
uv pip install -e ".[dev]"
```

## Quick Start

### Running the MCP Server

```bash
# Start the server
python -m kettle_mcp.server
```

### Using with an MCP Client

Configure your MCP client to connect to the Kettle-MCP server. For example, with Claude Desktop:

```json
{
  "mcpServers": {
    "kettle-mcp": {
      "command": "python",
      "args": ["-m", "kettle_mcp.server"]
    }
  }
}
```

### Available Tools

Once connected, the following tools are available:

1. **read_kettle_job**: Read and parse a Kettle job file (.kjb)
2. **read_kettle_transformation**: Read and parse a Kettle transformation file (.ktr)
3. **create_kettle_job**: Create a new Kettle job
4. **create_kettle_transformation**: Create a new Kettle transformation
5. **update_kettle_job**: Update an existing Kettle job
6. **update_kettle_transformation**: Update an existing Kettle transformation
7. **list_kettle_steps**: List available Kettle step types
8. **list_kettle_job_entries**: List available Kettle job entry types

## Example Usage

### Reading a Kettle Transformation

```python
# Through an MCP client, you can ask:
# "Read the transformation file at examples/sample_kettle_files/sample_transformation.ktr"

# This will use the read_kettle_transformation tool to parse the file
# and return information about steps, hops, and metadata
```

### Creating a New Transformation

```python
# Through an MCP client:
# "Create a new transformation called 'data_extract' with a Table Input step 
#  that reads from a database table"

# This will use the create_kettle_transformation tool to generate a new .ktr file
```

## Development

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=kettle_mcp

# Run specific test file
pytest tests/unit/test_parser.py
```

### Linting and Formatting

```bash
# Format code with black
black src/ tests/

# Lint with ruff
ruff check src/ tests/

# Type check with mypy
mypy src/
```

## Next Steps

- Read the [Architecture Documentation](architecture.md)
- Learn about [Kettle File Formats](kettle-formats.md)
- See [API Reference](api-reference.md) for detailed tool documentation
- Check out [Examples](../examples/sample_kettle_files/README.md)

## Troubleshooting

### Common Issues

**Import Error: No module named 'kettle_mcp'**
- Make sure you've installed the package: `pip install -e .`
- Check that you're using the correct Python environment

**MCP Server Not Starting**
- Verify Python version: `python --version` (should be 3.11+)
- Check for port conflicts if running locally
- Review server logs for error messages

**Cannot Parse Kettle File**
- Verify the file is valid XML
- Check file permissions
- Ensure file path is correct and accessible

## Support

- [GitHub Issues](https://github.com/pradeepmouli/kettle-mcp/issues)
- [Contributing Guide](../CONTRIBUTING.md)
- [Project README](../README.md)
