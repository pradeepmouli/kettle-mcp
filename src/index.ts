#!/usr/bin/env node

/**
 * Kettle-MCP Server
 *
 * An MCP (Model Context Protocol) server that exposes tools for reading,
 * creating, and updating Pentaho Kettle jobs and transformations.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './server.js';

/**
 * Main entry point for the Kettle-MCP server.
 *
 * @remarks
 * Starts an MCP stdio server that exposes tools for reading, creating,
 * modifying, validating, and executing Pentaho Kettle transformations and jobs.
 *
 * @useWhen You need to run kettle-mcp as a standalone MCP server process (e.g., from Claude Desktop config).
 * @avoidWhen You want to embed kettle-mcp tools inside another MCP server — import {@link registerTools} directly instead.
 * @pitfalls NEVER run this inside an existing stdio MCP server process BECAUSE two servers sharing stdio will corrupt the transport framing.
 *
 * @example
 * ```bash
 * node dist/index.js
 * # or via npx
 * npx kettle-mcp
 * ```
 *
 * @category Server
 */
async function main(): Promise<void> {
	// Create MCP server instance
	const server = new Server(
		{
			name: 'kettle-mcp',
			version: '0.1.0',
		},
		{
			capabilities: {
				tools: {},
			},
		}
	);

	// Register all MCP tools
	registerTools(server);

	// Set up error handling
	server.onerror = (error): void => {
		console.error('[MCP Error]', error);
	};

	process.on('SIGINT', (): void => {
		void server.close();
		process.exit(0);
	});

	// Start the server using stdio transport
	const transport = new StdioServerTransport();
	await server.connect(transport);

	console.error('Kettle-MCP server running on stdio');
}

// Run the server
main().catch((error): void => {
	console.error('Fatal error in main():', error);
	process.exit(1);
});
