---
name: mcp-server-dev
description: Model Context Protocol (MCP) server development with TypeScript, tool/resource implementation, and Claude Code integration
user-invocable: true
---

# MCP Server Development

Use this skill when building Model Context Protocol (MCP) servers to extend AI assistants with custom tools, resources, and prompts.

## Overview

MCP (Model Context Protocol) is an open protocol that enables AI assistants like Claude Code to interact with external tools and data sources. MCP servers expose:

- **Tools**: Functions the AI can call (e.g., query a database, execute ETL)
- **Resources**: Data the AI can read (e.g., files, API endpoints)
- **Prompts**: Pre-defined prompt templates

## Project Setup

### 1. Initialize Project

```bash
mkdir my-mcp-server
cd my-mcp-server
pnpm init
pnpm add @modelcontextprotocol/sdk zod
pnpm add -D typescript @types/node vitest
```

### 2. Package.json Configuration

```json
{
  "name": "@scope/my-mcp-server",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "my-mcp-server": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node dist/index.js",
    "test": "vitest",
    "inspector": "npx @anthropic-ai/inspector my-mcp-server"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/node": "^22.0.0",
    "vitest": "^2.0.0"
  }
}
```

### 3. TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Basic Server Structure

### Entry Point (src/index.ts)

```typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import tool handlers
import { tools, handleToolCall } from './tools/index.js';
import { resources, handleResourceRead } from './resources/index.js';

const server = new Server(
  {
    name: 'my-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  return handleToolCall(request.params.name, request.params.arguments ?? {});
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources,
}));

// Read resources
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  return handleResourceRead(request.params.uri);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP server running on stdio');
}

main().catch(console.error);
```

## Implementing Tools

### Tool Definition Pattern (src/tools/index.ts)

```typescript
import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

// Define tool schemas with Zod
const QueryDatabaseSchema = z.object({
  query: z.string().describe('SQL query to execute'),
  database: z.string().optional().describe('Database name'),
});

const TransformDataSchema = z.object({
  input: z.string().describe('Input file path'),
  output: z.string().describe('Output file path'),
  format: z.enum(['json', 'csv', 'xml']).describe('Output format'),
});

// Export tool definitions
export const tools: Tool[] = [
  {
    name: 'query_database',
    description: 'Execute a SQL query against the database',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'SQL query to execute' },
        database: { type: 'string', description: 'Database name' },
      },
      required: ['query'],
    },
  },
  {
    name: 'transform_data',
    description: 'Transform data from one format to another',
    inputSchema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Input file path' },
        output: { type: 'string', description: 'Output file path' },
        format: {
          type: 'string',
          enum: ['json', 'csv', 'xml'],
          description: 'Output format',
        },
      },
      required: ['input', 'output', 'format'],
    },
  },
];

// Tool handlers
export async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: { type: string; text: string }[] }> {
  switch (name) {
    case 'query_database': {
      const { query, database } = QueryDatabaseSchema.parse(args);
      const result = await executeQuery(query, database);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }

    case 'transform_data': {
      const { input, output, format } = TransformDataSchema.parse(args);
      await transformData(input, output, format);
      return {
        content: [{ type: 'text', text: `Transformed ${input} to ${output}` }],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Tool implementations
async function executeQuery(query: string, database?: string) {
  // Implement database query logic
  return { rows: [], rowCount: 0 };
}

async function transformData(input: string, output: string, format: string) {
  // Implement data transformation logic
}
```

## Implementing Resources

### Resource Definition Pattern (src/resources/index.ts)

```typescript
import type { Resource } from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'fs/promises';

// Export resource definitions
export const resources: Resource[] = [
  {
    uri: 'config://settings',
    name: 'Server Settings',
    description: 'Current server configuration',
    mimeType: 'application/json',
  },
  {
    uri: 'file://schema.json',
    name: 'Database Schema',
    description: 'Database schema definition',
    mimeType: 'application/json',
  },
];

// Resource handlers
export async function handleResourceRead(
  uri: string
): Promise<{ contents: { uri: string; mimeType: string; text: string }[] }> {
  if (uri === 'config://settings') {
    const settings = await loadSettings();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(settings, null, 2),
        },
      ],
    };
  }

  if (uri.startsWith('file://')) {
    const filePath = uri.replace('file://', '');
    const content = await readFile(filePath, 'utf-8');
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: content,
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
}

async function loadSettings() {
  // Load settings from config file or environment
  return {
    version: '0.1.0',
    environment: process.env.NODE_ENV ?? 'development',
  };
}
```

## Error Handling

### Structured Error Responses

```typescript
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export async function handleToolCall(name: string, args: Record<string, unknown>) {
  try {
    // Tool implementation
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid parameters: ${error.errors.map(e => e.message).join(', ')}`
      );
    }

    if (error instanceof Error) {
      throw new McpError(ErrorCode.InternalError, error.message);
    }

    throw new McpError(ErrorCode.InternalError, 'Unknown error occurred');
  }
}
```

## Testing MCP Servers

### Unit Tests with Vitest

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { handleToolCall } from '../src/tools/index.js';

describe('Tool: query_database', () => {
  it('should execute valid SQL query', async () => {
    const result = await handleToolCall('query_database', {
      query: 'SELECT * FROM users LIMIT 10',
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
  });

  it('should throw on invalid parameters', async () => {
    await expect(
      handleToolCall('query_database', { query: 123 })
    ).rejects.toThrow();
  });
});
```

### Integration Testing with MCP Inspector

```bash
# Install inspector
npm install -g @anthropic-ai/inspector

# Run inspector against your server
npx @anthropic-ai/inspector ./dist/index.js
```

## Claude Code Integration

### Register in Claude Code Settings

Add to `~/.claude/settings.json` or project `.claude/settings.local.json`:

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://localhost:5432/mydb"
      }
    }
  }
}
```

### Alternative: NPX Installation

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "npx",
      "args": ["-y", "@scope/my-mcp-server"]
    }
  }
}
```

## Advanced Patterns

### Streaming Results

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

// For long-running operations, implement progress reporting
server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
  const { name, arguments: args } = request.params;

  if (name === 'long_operation') {
    // Report progress (if supported by transport)
    for (let i = 0; i < 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      // Progress reporting would go here
    }

    return {
      content: [{ type: 'text', text: 'Operation completed' }],
    };
  }
});
```

### Dynamic Tool Registration

```typescript
// Discover tools at runtime
async function discoverTools(): Promise<Tool[]> {
  const modules = await loadPluginModules();
  return modules.flatMap(mod => mod.tools);
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: await discoverTools(),
}));
```

### Authentication

```typescript
// Environment-based authentication
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error('API_KEY environment variable required');
  process.exit(1);
}

// Use in tool implementations
async function callExternalApi(endpoint: string) {
  return fetch(endpoint, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}
```

## Publishing MCP Servers

### NPM Publishing

```bash
# Build and publish
pnpm build
npm publish --access public
```

### Docker Deployment

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist ./dist
ENTRYPOINT ["node", "dist/index.js"]
```

## Debugging Tips

### Enable Debug Logging

```typescript
const DEBUG = process.env.DEBUG === 'true';

function log(...args: unknown[]) {
  if (DEBUG) {
    console.error('[MCP]', ...args);
  }
}
```

### Stdio Transport Debugging

```bash
# Test server manually with JSON-RPC
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js
```

## Resources

- **MCP Specification**: https://modelcontextprotocol.io
- **MCP SDK**: https://github.com/modelcontextprotocol/typescript-sdk
- **MCP Inspector**: https://github.com/anthropics/inspector
- **Claude Code MCP Docs**: https://docs.anthropic.com/claude-code/mcp

## Quick Reference

| Task | Command |
|------|---------|
| Create project | `pnpm init && pnpm add @modelcontextprotocol/sdk zod` |
| Build | `pnpm build` |
| Test | `pnpm test` |
| Inspect | `npx @anthropic-ai/inspector ./dist/index.js` |
| Register | Add to `~/.claude/settings.json` under `mcpServers` |
