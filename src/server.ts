/**
 * MCP Server implementation for Kettle-MCP
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * Available MCP tools for Kettle operations
 */
const KETTLE_TOOLS: Tool[] = [
  {
    name: 'read_kettle_job',
    description: 'Read and parse a Pentaho Kettle job file (.kjb)',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the Kettle job file (.kjb)',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'read_kettle_transformation',
    description: 'Read and parse a Pentaho Kettle transformation file (.ktr)',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the Kettle transformation file (.ktr)',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'list_kettle_steps',
    description: 'List available Kettle step types for transformations',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_kettle_job_entries',
    description: 'List available Kettle job entry types',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

/**
 * Register all Kettle MCP tools with the server
 */
export function registerTools(server: Server): void {
  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: KETTLE_TOOLS,
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'read_kettle_job':
        // TODO: Implement read_kettle_job
        return {
          content: [
            {
              type: 'text',
              text: `Reading Kettle job from: ${(args as { path: string }).path}`,
            },
          ],
        };

      case 'read_kettle_transformation':
        // TODO: Implement read_kettle_transformation
        return {
          content: [
            {
              type: 'text',
              text: `Reading Kettle transformation from: ${
                (args as { path: string }).path
              }`,
            },
          ],
        };

      case 'list_kettle_steps':
        // TODO: Implement list_kettle_steps
        return {
          content: [
            {
              type: 'text',
              text: 'Available Kettle step types: (to be implemented)',
            },
          ],
        };

      case 'list_kettle_job_entries':
        // TODO: Implement list_kettle_job_entries
        return {
          content: [
            {
              type: 'text',
              text: 'Available Kettle job entry types: (to be implemented)',
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
}
