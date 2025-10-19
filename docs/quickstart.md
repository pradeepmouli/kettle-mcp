# Kettle-MCP Quickstart

Get started with Kettle-MCP in minutes.

## Installation

```bash
npm install -g kettle-mcp
```

Or use it locally:

```bash
git clone https://github.com/pradeepmouli/kettle-mcp.git
cd kettle-mcp
npm install
npm run build
```

## Basic Usage

### Example 1: Read and Validate a Transformation

```javascript
// In your MCP client or AI agent
const result = await callTool('read_kettle_transformation', {
  path: '/path/to/my_transformation.ktr'
});

console.log(result.transformation.info.name);
console.log(result.transformation.steps.length);

// Validate it
const validation = await callTool('validate_kettle_transformation', {
  path: '/path/to/my_transformation.ktr'
});

console.log(validation.result.valid); // true/false
```

### Example 2: Search for Artifacts

```javascript
// Find all transformations with "customer" in the name or steps
const results = await callTool('search_kettle_artifacts', {
  query: 'customer',
  type: 'transformation',
  directory: '/path/to/kettle/files',
  maxResults: 10
});

results.results.forEach(artifact => {
  console.log(`Found: ${artifact.name} at ${artifact.path}`);
});
```

### Example 3: Edit a Transformation

```javascript
// Read existing transformation
const { transformation, path } = await callTool('read_kettle_transformation', {
  path: '/path/to/transform.ktr'
});

// Modify it
transformation.info.description = 'Updated by MCP';

// Save with backup
const saved = await callTool('save_kettle_transformation', {
  path: path,
  transformation: transformation,
  createBackup: true
});

console.log(`Backup created at: ${saved.backupPath}`);
console.log(`Diff:\n${saved.diff}`);
```

### Example 4: Execute with Guards (Local Mode)

```bash
# Set required environment variables
export KETTLE_MCP_ALLOW_EXECUTION=1
export KETTLE_MCP_EXEC_ROOT=/path/to/safe/directory
export KETTLE_MCP_AUTO_CONFIRM=1
```

```javascript
const result = await callTool('execute_kettle_transformation', {
  path: '/path/to/safe/directory/transform.ktr',
  timeoutMs: 30000
});

console.log(result.success);
console.log(result.output);
```

## Common Workflows

### Workflow 1: Read → Validate → Edit → Validate

```javascript
// 1. Read
const { transformation } = await callTool('read_kettle_transformation', {
  path: '/path/to/transform.ktr'
});

// 2. Validate before edit
const v1 = await callTool('validate_kettle_transformation', {
  path: '/path/to/transform.ktr'
});
if (!v1.result.valid) {
  console.error('Validation failed:', v1.result.issues);
  return;
}

// 3. Edit
transformation.info.description = 'Modified description';

// 4. Save
await callTool('save_kettle_transformation', {
  path: '/path/to/transform.ktr',
  transformation: transformation,
  createBackup: true
});

// 5. Validate after edit
const v2 = await callTool('validate_kettle_transformation', {
  path: '/path/to/transform.ktr'
});
console.log('Still valid:', v2.result.valid);
```

### Workflow 2: Search → Get → Execute

```javascript
// 1. Search for a specific transformation
const search = await callTool('search_kettle_artifacts', {
  query: 'daily_import',
  type: 'transformation',
  directory: '/etl/transformations'
});

if (search.total === 0) {
  console.log('No transformations found');
  return;
}

// 2. Get full details
const trans = await callTool('read_kettle_transformation', {
  path: search.results[0].path
});

console.log(`Found: ${trans.transformation.info.name}`);
console.log(`Steps: ${trans.transformation.steps?.length || 0}`);

// 3. Execute (with guards enabled)
const exec = await callTool('execute_kettle_transformation', {
  path: search.results[0].path,
  timeoutMs: 60000
});

console.log('Execution result:', exec.success);
```

## MCP Client Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

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

### VS Code with Copilot

Configure in `.vscode/settings.json`:

```json
{
  "mcp.servers": {
    "kettle": {
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "${workspaceFolder}/kettle-mcp"
    }
  }
}
```

## Environment Variables

### Execution Guards

- `KETTLE_MCP_ALLOW_EXECUTION=1` - **Required** to enable execution
- `KETTLE_MCP_EXEC_ROOT=/path` - Restrict execution to a specific directory
- `KETTLE_MCP_AUTO_CONFIRM=1` - Skip confirmation prompts (for automation)

### Example: Safe Execution Setup

```bash
# Restrict execution to a specific project directory
export KETTLE_MCP_ALLOW_EXECUTION=1
export KETTLE_MCP_EXEC_ROOT=/home/user/kettle-projects/dev
export KETTLE_MCP_AUTO_CONFIRM=1

# Now only files under /home/user/kettle-projects/dev can be executed
```

## Testing Your Setup

```bash
# Run the test suite
npm test

# Run specific test category
npm test -- src/__tests__/transformation-handlers.test.ts

# Run E2E tests
npm test -- src/__tests__/e2e/
```

## Next Steps

- Read the [MCP Tools Reference](mcp-tools-reference.md) for complete API documentation
- Check [Kettle Formats](kettle-formats.md) for XML structure details
- See [examples/](../examples/) for sample Kettle files
- Explore [GitHub Spec-Kit workflows](../.specify/) for development

## Troubleshooting

### "Execution is not allowed by environment variable"

Set `KETTLE_MCP_ALLOW_EXECUTION=1` before starting the MCP server.

### "Path is not allowed for execution"

The file path is outside `KETTLE_MCP_EXEC_ROOT`. Either move the file or update the root path.

### "File not found"

Check that the path is absolute or relative to the MCP server's working directory.

### "Validation failed"

Use `validate_kettle_transformation` or `validate_kettle_job` to see detailed error messages and fix the XML structure.

## Support

- Issues: [GitHub Issues](https://github.com/pradeepmouli/kettle-mcp/issues)
- Discussions: [GitHub Discussions](https://github.com/pradeepmouli/kettle-mcp/discussions)
- Documentation: [docs/](../docs/)
